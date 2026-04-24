from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=False)
    role = Column(String, default="reader", nullable=False)
    blacklisted = Column(Boolean, default=False, nullable=False)
    joined_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    hashed_password = Column(String, nullable=True)
    mfa_secret = Column(String, nullable=True)
    mfa_enabled = Column(Boolean, default=False, nullable=False)
    # Email confirmation step before MFA is fully enabled (hashed 6-digit code)
    mfa_email_code_hash = Column(String, nullable=True)
    mfa_email_code_expires_at = Column(DateTime, nullable=True)

    loans = relationship("Loan", back_populates="user", cascade="all, delete-orphan")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    author = Column(String, index=True, nullable=False)
    genre = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    isbn = Column(String, unique=True, index=True, nullable=False)
    total_copies = Column(Integer, nullable=False)
    cover_url = Column(String, nullable=False)

    loans = relationship("Loan", back_populates="book")

    @property
    def available_copies(self):
        active_or_pending = [
            loan for loan in self.loans if loan.status in ("pending", "active", "overdue")
        ]
        return max(0, self.total_copies - len(active_or_pending))


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False, index=True)
    start_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_date = Column(DateTime, nullable=False)
    returned_at = Column(DateTime, nullable=True)
    status = Column(String, default="pending", nullable=False, index=True)

    user = relationship("User", back_populates="loans")
    book = relationship("Book", back_populates="loans")
