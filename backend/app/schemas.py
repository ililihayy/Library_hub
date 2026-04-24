from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime


Role = Literal["librarian", "reader"]
LoanStatus = Literal["pending", "active", "overdue", "returned"]


class UserCreate(BaseModel):
    full_name: str = Field(alias="fullName", min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(min_length=3, max_length=40)
    address: str = Field(min_length=3, max_length=200)
    role: Role = "reader"

    class Config:
        allow_population_by_field_name = True


class LoginRequest(BaseModel):
    email: EmailStr


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, alias="fullName", min_length=2, max_length=120)
    phone: Optional[str] = Field(default=None, min_length=3, max_length=40)
    address: Optional[str] = Field(default=None, min_length=3, max_length=200)
    role: Optional[Role] = None
    blacklisted: Optional[bool] = None

    class Config:
        allow_population_by_field_name = True


class UserResponse(BaseModel):
    id: int
    full_name: str = Field(alias="fullName")
    email: EmailStr
    phone: str
    address: str
    role: Role
    blacklisted: bool
    joined_at: datetime = Field(alias="joinedAt")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class BookCreate(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1, max_length=120)
    genre: str = Field(min_length=1, max_length=80)
    description: str = Field(min_length=1)
    isbn: str = Field(min_length=8, max_length=32)
    total_copies: int = Field(alias="totalCopies", ge=1, le=1000)
    cover_url: str = Field(alias="coverUrl", min_length=1, max_length=500)

    class Config:
        allow_population_by_field_name = True


class BookUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    author: Optional[str] = Field(default=None, min_length=1, max_length=120)
    genre: Optional[str] = Field(default=None, min_length=1, max_length=80)
    description: Optional[str] = None
    isbn: Optional[str] = Field(default=None, min_length=8, max_length=32)
    total_copies: Optional[int] = Field(default=None, alias="totalCopies", ge=1, le=1000)
    cover_url: Optional[str] = Field(default=None, alias="coverUrl", min_length=1, max_length=500)

    class Config:
        allow_population_by_field_name = True


class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    genre: str
    description: str
    isbn: str
    total_copies: int = Field(alias="totalCopies")
    cover_url: str = Field(alias="coverUrl")
    available_copies: int = Field(alias="availableCopies")

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class LoanCreate(BaseModel):
    user_id: int = Field(alias="userId")
    book_id: int = Field(alias="bookId")
    due_date: Optional[datetime] = Field(default=None, alias="dueDate")

    class Config:
        allow_population_by_field_name = True


class LoanResponse(BaseModel):
    id: int
    user_id: int = Field(alias="userId")
    book_id: int = Field(alias="bookId")
    start_date: datetime = Field(alias="startDate")
    due_date: datetime = Field(alias="dueDate")
    returned_at: Optional[datetime] = Field(alias="returnedAt")
    status: LoanStatus

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class DashboardStats(BaseModel):
    books_in_catalog: int = Field(alias="booksInCatalog")
    total_copies: int = Field(alias="totalCopies")
    registered_readers: int = Field(alias="registeredReaders")
    blacklisted_readers: int = Field(alias="blacklistedReaders")
    active_loans: int = Field(alias="activeLoans")
    pending_loans: int = Field(alias="pendingLoans")
    overdue_loans: int = Field(alias="overdueLoans")

    class Config:
        allow_population_by_field_name = True
