from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app import schemas
from app.api.deps import get_db
from app.services import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=schemas.UserResponse, status_code=201)
def register(payload: schemas.RegisterRequest, db: Session = Depends(get_db)):
    return auth_service.register_user(db, payload)


@router.post("/login", response_model=schemas.LoginResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    return auth_service.login(db, payload)


@router.post("/login/mfa", response_model=schemas.LoginCompleteResponse)
def login_complete_mfa(payload: schemas.LoginMfaCompleteRequest, db: Session = Depends(get_db)):
    return auth_service.complete_mfa_login(db, payload)


@router.post("/mfa/setup", response_model=schemas.MfaSetupResponse)
def mfa_setup(payload: schemas.MfaSetupRequest, db: Session = Depends(get_db)):
    return auth_service.mfa_setup(db, payload)


@router.post("/mfa/confirm", response_model=schemas.UserResponse)
def mfa_confirm(payload: schemas.MfaConfirmRequest, db: Session = Depends(get_db)):
    return auth_service.mfa_confirm_enrollment(db, payload)


@router.post("/mfa/disable", response_model=schemas.UserResponse)
def mfa_disable(payload: schemas.MfaDisableRequest, db: Session = Depends(get_db)):
    return auth_service.mfa_disable(db, payload)
