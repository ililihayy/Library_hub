from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app import models, schemas
from app.api.deps import get_db
from app.services import library

router = APIRouter()


@router.post("/books", response_model=schemas.BookResponse, status_code=201)
def create_book(book: schemas.BookCreate, db: Session = Depends(get_db)):
    return library.create_book(db, book)


@router.get("/books", response_model=list[schemas.BookResponse])
def list_books(
    q: str | None = Query(default=None),
    genre: str | None = Query(default=None),
    available_only: bool = Query(default=False),
    db: Session = Depends(get_db),
):
    query = db.query(models.Book)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(models.Book.title.ilike(like) | models.Book.author.ilike(like))
    if genre:
        query = query.filter(models.Book.genre == genre)
    books = query.order_by(models.Book.title.asc()).all()
    if available_only:
        return [book for book in books if book.available_copies > 0]
    return books


@router.get("/books/{book_id}", response_model=schemas.BookResponse)
def read_book(book_id: int, db: Session = Depends(get_db)):
    return library._get_book_or_404(db, book_id)


@router.patch("/books/{book_id}", response_model=schemas.BookResponse)
def patch_book(book_id: int, payload: schemas.BookUpdate, db: Session = Depends(get_db)):
    return library.update_book(db, book_id, payload)


@router.delete("/books/{book_id}", status_code=204, response_class=Response)
def remove_book(book_id: int, db: Session = Depends(get_db)):
    library.delete_book(db, book_id)
