from datetime import datetime
from typing import Literal, Optional, Union

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

Role = Literal["librarian", "reader"]
LoanStatus = Literal["pending", "active", "overdue", "returned"]


class RegisterRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    full_name: str = Field(min_length=2, max_length=120, alias="fullName")
    email: EmailStr
    phone: str = Field(min_length=3, max_length=40)
    address: str = Field(min_length=3, max_length=200)
    role: Role = "reader"
    password: str = Field(min_length=8, max_length=128)
    confirm_password: str = Field(min_length=8, max_length=128, alias="confirmPassword")

    @model_validator(mode="after")
    def passwords_match(self) -> "RegisterRequest":
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class UserCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    full_name: str = Field(min_length=2, max_length=120, alias="fullName")
    email: EmailStr
    phone: str = Field(min_length=3, max_length=40)
    address: str = Field(min_length=3, max_length=200)
    role: Role = "reader"


class LoginRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    mfa_code: Optional[str] = Field(default=None, alias="mfaCode", max_length=10)


class LoginMfaCompleteRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    challenge_token: str = Field(min_length=10, alias="challengeToken")
    mfa_code: str = Field(min_length=6, max_length=10, alias="mfaCode")


class MfaSetupRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class MfaSetupResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    otpauth_uri: str = Field(serialization_alias="otpauthUri")
    secret: str
    email_sent: bool = Field(default=True, serialization_alias="emailSent")


class MfaConfirmRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    mfa_code: str = Field(min_length=6, max_length=10, alias="mfaCode")
    email_code: str = Field(min_length=6, max_length=10, alias="emailCode")


class MfaDisableRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)
    mfa_code: str = Field(min_length=6, max_length=10, alias="mfaCode")


class UserUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    full_name: Optional[str] = Field(default=None, min_length=2, max_length=120, alias="fullName")
    phone: Optional[str] = Field(default=None, min_length=3, max_length=40)
    address: Optional[str] = Field(default=None, min_length=3, max_length=200)
    role: Optional[Role] = None
    blacklisted: Optional[bool] = None


class UserResponse(BaseModel):
    """ORM: snake_case attributes; JSON: camelCase."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str = Field(serialization_alias="fullName")
    email: EmailStr
    phone: str
    address: str
    role: Role
    blacklisted: bool
    joined_at: datetime = Field(serialization_alias="joinedAt")
    mfa_enabled: bool = Field(default=False, serialization_alias="mfaEnabled")


class LoginCompleteResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    step: Literal["complete"] = "complete"
    user: UserResponse


class LoginMfaRequiredResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    step: Literal["mfa"] = "mfa"
    challenge_token: str = Field(serialization_alias="challengeToken")


LoginResponse = Union[LoginCompleteResponse, LoginMfaRequiredResponse]


class BookCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    title: str = Field(min_length=1, max_length=200)
    author: str = Field(min_length=1, max_length=120)
    genre: str = Field(min_length=1, max_length=80)
    description: str = Field(min_length=1)
    isbn: str = Field(min_length=8, max_length=32)
    total_copies: int = Field(ge=1, le=1000, alias="totalCopies")
    cover_url: str = Field(min_length=1, max_length=500, alias="coverUrl")


class BookUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True, str_strip_whitespace=True)

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    author: Optional[str] = Field(default=None, min_length=1, max_length=120)
    genre: Optional[str] = Field(default=None, min_length=1, max_length=80)
    description: Optional[str] = None
    isbn: Optional[str] = Field(default=None, min_length=8, max_length=32)
    total_copies: Optional[int] = Field(default=None, ge=1, le=1000, alias="totalCopies")
    cover_url: Optional[str] = Field(default=None, min_length=1, max_length=500, alias="coverUrl")


class BookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    author: str
    genre: str
    description: str
    isbn: str
    total_copies: int = Field(serialization_alias="totalCopies")
    cover_url: str = Field(serialization_alias="coverUrl")
    available_copies: int = Field(serialization_alias="availableCopies")


class LoanCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: int = Field(alias="userId")
    book_id: int = Field(alias="bookId")
    due_date: Optional[datetime] = Field(default=None, alias="dueDate")


class LoanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int = Field(serialization_alias="userId")
    book_id: int = Field(serialization_alias="bookId")
    start_date: datetime = Field(serialization_alias="startDate")
    due_date: datetime = Field(serialization_alias="dueDate")
    returned_at: Optional[datetime] = Field(default=None, serialization_alias="returnedAt")
    status: LoanStatus


class DashboardStats(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    books_in_catalog: int = Field(serialization_alias="booksInCatalog")
    total_copies: int = Field(serialization_alias="totalCopies")
    registered_readers: int = Field(serialization_alias="registeredReaders")
    blacklisted_readers: int = Field(serialization_alias="blacklistedReaders")
    active_loans: int = Field(serialization_alias="activeLoans")
    pending_loans: int = Field(serialization_alias="pendingLoans")
    overdue_loans: int = Field(serialization_alias="overdueLoans")
