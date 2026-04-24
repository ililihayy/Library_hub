from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, index=True)  # Clerk ID
    email = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    role = Column(String, nullable=False)  # 'admin' or 'reader'
    is_blacklisted = Column(Boolean, default=False)

    loans = relationship("Loan", back_populates="user")


class Book(Base):
    __tablename__ = 'books'

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    author = Column(String, nullable=False)
    genre = Column(String, nullable=False)
    description = Column(String, nullable=True)
    isbn = Column(String, unique=True, nullable=False)
    total_copies = Column(Integer, nullable=False)
    reserved_copies = Column(Integer, default=0)
    loaned_copies = Column(Integer, default=0)
    cover_url = Column(String, nullable=True)

    loans = relationship("Loan", back_populates="book")


class Loan(Base):
    __tablename__ = 'loans'

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey('books.id'), nullable=False)
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    # 'pending', 'active', 'overdue', 'returned'
    status = Column(String, nullable=False)
    borrowed_at = Column(DateTime, nullable=False)
    due_date = Column(DateTime, nullable=False)
    returned_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="loans")
    book = relationship("Book", back_populates="loans")
