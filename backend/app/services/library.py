from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app import models, schemas


def _get_user_or_404(db: Session, user_id: int) -> models.User:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def _get_book_or_404(db: Session, book_id: int) -> models.Book:
    book = db.query(models.Book).filter(models.Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return book


def _get_loan_or_404(db: Session, loan_id: int) -> models.Loan:
    loan = db.query(models.Loan).filter(models.Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return loan


def _ensure_book_available(book: models.Book) -> None:
    if book.available_copies <= 0:
        raise HTTPException(status_code=409, detail="No available copies")


def _ensure_not_blacklisted(user: models.User) -> None:
    if user.blacklisted:
        raise HTTPException(status_code=403, detail="User is blacklisted")


def create_user(db: Session, payload: schemas.UserCreate) -> models.User:
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = models.User(**payload.model_dump())
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user_id: int, payload: schemas.UserUpdate) -> models.User:
    user = _get_user_or_404(db, user_id)
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def create_book(db: Session, payload: schemas.BookCreate) -> models.Book:
    existing = db.query(models.Book).filter(models.Book.isbn == payload.isbn).first()
    if existing:
        raise HTTPException(status_code=409, detail="Book with this ISBN already exists")

    book = models.Book(**payload.model_dump())
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


def update_book(db: Session, book_id: int, payload: schemas.BookUpdate) -> models.Book:
    book = _get_book_or_404(db, book_id)
    updates = payload.model_dump(exclude_unset=True)

    if "isbn" in updates and updates["isbn"] != book.isbn:
        existing = db.query(models.Book).filter(models.Book.isbn == updates["isbn"]).first()
        if existing:
            raise HTTPException(status_code=409, detail="Book with this ISBN already exists")

    if "total_copies" in updates and updates["total_copies"] < (book.total_copies - book.available_copies):
        raise HTTPException(
            status_code=409,
            detail="total_copies cannot be less than currently loaned or reserved copies",
        )

    for field, value in updates.items():
        setattr(book, field, value)
    db.commit()
    db.refresh(book)
    return book


def delete_book(db: Session, book_id: int) -> None:
    book = _get_book_or_404(db, book_id)
    has_active = any(loan.status in ("pending", "active", "overdue") for loan in book.loans)
    if has_active:
        raise HTTPException(status_code=409, detail="Cannot delete book with active loans")
    db.delete(book)
    db.commit()


def create_loan(db: Session, payload: schemas.LoanCreate) -> models.Loan:
    user = _get_user_or_404(db, payload.user_id)
    book = _get_book_or_404(db, payload.book_id)
    _ensure_not_blacklisted(user)
    _ensure_book_available(book)

    start = datetime.utcnow()
    due = payload.due_date or (start + timedelta(days=7))
    loan = models.Loan(
        user_id=user.id,
        book_id=book.id,
        start_date=start,
        due_date=due,
        status="pending",
    )
    db.add(loan)
    db.commit()
    db.refresh(loan)
    return loan


def activate_loan(db: Session, loan_id: int) -> models.Loan:
    loan = _get_loan_or_404(db, loan_id)
    if loan.status != "pending":
        raise HTTPException(status_code=409, detail="Only pending loans can be activated")
    loan.status = "active"
    db.commit()
    db.refresh(loan)
    return loan


def return_loan(db: Session, loan_id: int) -> models.Loan:
    loan = _get_loan_or_404(db, loan_id)
    if loan.status == "returned":
        raise HTTPException(status_code=409, detail="Loan already returned")
    loan.status = "returned"
    loan.returned_at = datetime.utcnow()
    db.commit()
    db.refresh(loan)
    return loan


def mark_overdue_loans(db: Session) -> int:
    now = datetime.utcnow()
    updated = (
        db.query(models.Loan)
        .filter(models.Loan.status.in_(("pending", "active")), models.Loan.due_date < now)
        .update({"status": "overdue"}, synchronize_session=False)
    )
    db.commit()
    return updated


def dashboard_stats(db: Session) -> schemas.DashboardStats:
    books_in_catalog = db.query(func.count(models.Book.id)).scalar() or 0
    total_copies = db.query(func.coalesce(func.sum(models.Book.total_copies), 0)).scalar() or 0
    registered_readers = (
        db.query(func.count(models.User.id))
        .filter(models.User.role == "reader")
        .scalar()
        or 0
    )
    blacklisted_readers = (
        db.query(func.count(models.User.id))
        .filter(models.User.role == "reader", models.User.blacklisted.is_(True))
        .scalar()
        or 0
    )
    active_loans = (
        db.query(func.count(models.Loan.id))
        .filter(models.Loan.status == "active")
        .scalar()
        or 0
    )
    pending_loans = (
        db.query(func.count(models.Loan.id))
        .filter(models.Loan.status == "pending")
        .scalar()
        or 0
    )
    overdue_loans = (
        db.query(func.count(models.Loan.id))
        .filter(models.Loan.status == "overdue")
        .scalar()
        or 0
    )

    return schemas.DashboardStats(
        books_in_catalog=books_in_catalog,
        total_copies=total_copies,
        registered_readers=registered_readers,
        blacklisted_readers=blacklisted_readers,
        active_loans=active_loans,
        pending_loans=pending_loans,
        overdue_loans=overdue_loans,
    )
