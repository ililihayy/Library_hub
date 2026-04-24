from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app import models, schemas
from app.api.deps import get_db
from app.services import library

router = APIRouter()


@router.post("/users", response_model=schemas.UserResponse, status_code=201)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    return library.create_user(db, user)


@router.get("/users", response_model=list[schemas.UserResponse])
def list_users(
    role: str | None = Query(default=None),
    q: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            models.User.full_name.ilike(like) | models.User.email.ilike(like)
        )
    return query.order_by(models.User.joined_at.desc()).all()


@router.get("/users/{user_id}", response_model=schemas.UserResponse)
def read_user(user_id: int, db: Session = Depends(get_db)):
    return library._get_user_or_404(db, user_id)


@router.patch("/users/{user_id}", response_model=schemas.UserResponse)
def patch_user(user_id: int, payload: schemas.UserUpdate, db: Session = Depends(get_db)):
    return library.update_user(db, user_id, payload)


@router.patch("/users/{user_id}/toggle-blacklist", response_model=schemas.UserResponse)
def toggle_blacklist(user_id: int, db: Session = Depends(get_db)):
    user = library._get_user_or_404(db, user_id)
    user.blacklisted = not user.blacklisted
    db.commit()
    db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=204, response_class=Response)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = library._get_user_or_404(db, user_id)
    db.delete(user)
    db.commit()
