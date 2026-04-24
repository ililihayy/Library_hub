from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    is_blacklisted = Column(Boolean, default=False)
    role = Column(String, default="reader")

    loans = relationship("Loan", back_populates="user")


class Book(Base):
    __tablename__ = "books"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String, index=True)
    total_copies = Column(Integer)
    reserved_copies = Column(Integer, default=0)
    loaned_copies = Column(Integer, default=0)

    @property
    def available_copies(self):
        return self.total_copies - (self.reserved_copies + self.loaned_copies)


class Loan(Base):
    __tablename__ = "loans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    book_id = Column(Integer, ForeignKey("books.id"))
    loan_date = Column(DateTime)
    return_date = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="loans")
    book = relationship("Book")
