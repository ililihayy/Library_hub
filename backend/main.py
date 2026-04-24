from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .models import Base
from .schemas import UserResponse, BookResponse, LoanResponse
import logging
import json
from datetime import datetime

# Database setup
DATABASE_URL = "postgresql://user:password@localhost/library_hub"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logger setup
logger = logging.getLogger("siem_logger")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
formatter = logging.Formatter('%(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


def log_event(event_type: str, user_id: str, role: str, action: str, status: str):
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "role": role,
        "action": action,
        "status": status
    }
    logger.info(json.dumps(log_entry))

# Dependency


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes


@app.get("/books", response_model=list[BookResponse])
def get_books(db: Session = Depends(get_db)):
    # Logic to fetch books and calculate availability
    pass


@app.post("/books/{id}/reserve")
def reserve_book(id: int, db: Session = Depends(get_db)):
    # Logic to reserve a book
    pass


@app.get("/my-loans", response_model=list[LoanResponse])
def get_my_loans(db: Session = Depends(get_db)):
    # Logic to fetch user loans
    pass


@app.post("/books")
def create_book():
    # Logic to create a book (Admin only)
    pass


@app.get("/admin/users", response_model=list[UserResponse])
def get_users():
    # Logic to fetch users (Admin only)
    pass


@app.patch("/admin/users/{id}/blacklist")
def blacklist_user(id: str):
    # Logic to blacklist a user (Admin + MFA mock)
    pass


@app.post("/admin/reminders/{user_id}")
def send_reminder(user_id: str):
    # Logic to send email reminders
    pass
