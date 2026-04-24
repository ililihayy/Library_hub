from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    id: str
    email: EmailStr
    full_name: str
    phone: Optional[str]
    address: Optional[str]
    role: str
    is_blacklisted: bool


class UserCreate(UserBase):
    pass


class UserResponse(UserBase):
    class Config:
        orm_mode = True


class BookBase(BaseModel):
    id: int
    title: str
    author: str
    genre: str
    description: Optional[str]
    isbn: str
    total_copies: int
    reserved_copies: int
    loaned_copies: int
    cover_url: Optional[str]


class BookCreate(BookBase):
    pass


class BookResponse(BookBase):
    available_copies: int

    class Config:
        orm_mode = True


class LoanBase(BaseModel):
    id: int
    book_id: int
    user_id: str
    status: str
    borrowed_at: datetime
    due_date: datetime
    returned_at: Optional[datetime]


class LoanCreate(LoanBase):
    pass


class LoanResponse(LoanBase):
    class Config:
        orm_mode = True
