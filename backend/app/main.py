from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import books, users, loans
from app.core.config import settings
from app.db.base import Base
from app.db.session import engine
from app import models  # noqa: F401

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(books.router, prefix=settings.API_PREFIX, tags=["Books"])
app.include_router(users.router, prefix=settings.API_PREFIX, tags=["Users"])
app.include_router(loans.router, prefix=settings.API_PREFIX, tags=["Loans"])


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/")
def root():
    return {"message": "Welcome to the Library Hub API!", "docs": "/docs"}
