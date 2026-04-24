from datetime import datetime
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app import models, schemas
from app.api.deps import get_db
from app.services import library

router = APIRouter()


@router.post("/loans", response_model=schemas.LoanResponse, status_code=201)
def create_loan(loan: schemas.LoanCreate, db: Session = Depends(get_db)):
    return library.create_loan(db, loan)


@router.get("/loans", response_model=list[schemas.LoanResponse])
def list_loans(
    status: schemas.LoanStatus | None = Query(default=None),
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    library.mark_overdue_loans(db)
    query = db.query(models.Loan)
    if status:
        query = query.filter(models.Loan.status == status)
    if user_id:
        query = query.filter(models.Loan.user_id == user_id)
    return query.order_by(models.Loan.start_date.desc()).all()


@router.get("/loans/{loan_id}", response_model=schemas.LoanResponse)
def read_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = library._get_loan_or_404(db, loan_id)
    if loan.status in ("pending", "active") and loan.due_date < datetime.utcnow():
        loan.status = "overdue"
        db.commit()
        db.refresh(loan)
    return loan


@router.patch("/loans/{loan_id}/activate", response_model=schemas.LoanResponse)
def activate_loan(loan_id: int, db: Session = Depends(get_db)):
    return library.activate_loan(db, loan_id)


@router.patch("/loans/{loan_id}/return", response_model=schemas.LoanResponse)
def return_loan(loan_id: int, db: Session = Depends(get_db)):
    return library.return_loan(db, loan_id)


@router.get("/dashboard/stats", response_model=schemas.DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db)):
    library.mark_overdue_loans(db)
    return library.dashboard_stats(db)
