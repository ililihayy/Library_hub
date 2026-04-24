from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models import Loan
from app.schemas import LoanCreate, LoanResponse

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/loans", response_model=LoanResponse)
def create_loan(loan: LoanCreate, db: Session = Depends(get_db)):
    db_loan = Loan(**loan.dict())
    db.add(db_loan)
    db.commit()
    db.refresh(db_loan)
    return db_loan


@router.get("/loans/{loan_id}", response_model=LoanResponse)
def read_loan(loan_id: int, db: Session = Depends(get_db)):
    loan = db.query(Loan).filter(Loan.id == loan_id).first()
    if not loan:
        raise HTTPException(status_code=404, detail="Loan not found")
    return loan
