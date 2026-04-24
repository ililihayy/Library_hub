from fastapi import FastAPI
from app.api.v1 import books, users, loans

app = FastAPI()

# Include routers
app.include_router(books.router, prefix="/api/v1", tags=["Books"])
app.include_router(users.router, prefix="/api/v1", tags=["Users"])
app.include_router(loans.router, prefix="/api/v1", tags=["Loans"])


@app.get("/")
def root():
    return {"message": "Welcome to the Library Hub API!"}
