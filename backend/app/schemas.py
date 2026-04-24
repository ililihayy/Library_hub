from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: bool
    is_blacklisted: bool
    role: str


class UserCreate(UserBase):
    password: str


class UserResponse(UserBase):
    id: int

    class Config:
        orm_mode = True


class BookBase(BaseModel):
    title: str
    author: str
    total_copies: int
    reserved_copies: int
    loaned_copies: int


class BookCreate(BookBase):
    pass


class BookResponse(BookBase):
    id: int
    available_copies: int

    class Config:
        orm_mode = True


class LoanBase(BaseModel):
    user_id: int
    book_id: int
    loan_date: datetime
    return_date: Optional[datetime]


class LoanCreate(LoanBase):
    pass


class LoanResponse(LoanBase):
    id: int

    class Config:
        orm_mode = True
