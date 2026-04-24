import logging
import secrets
from datetime import datetime, timedelta

import pyotp
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app import models, schemas
from app.core.config import settings
from app.core.email_smtp import send_plain_email, smtp_configured
from app.core.jwt_challenges import decode_mfa_challenge_token, issue_mfa_challenge_token
from app.core.passwords import hash_password, verify_password

logger = logging.getLogger(__name__)


def register_user(db: Session, payload: schemas.RegisterRequest) -> models.User:
    existing = db.query(models.User).filter(models.User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = models.User(
        full_name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        address=payload.address,
        role=payload.role,
        hashed_password=hash_password(payload.password),
        mfa_enabled=False,
        mfa_secret=None,
        mfa_email_code_hash=None,
        mfa_email_code_expires_at=None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def login(db: Session, payload: schemas.LoginRequest) -> schemas.LoginResponse:
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.blacklisted:
        raise HTTPException(status_code=403, detail="User is blacklisted")

    if user.mfa_enabled:
        if not user.mfa_secret:
            raise HTTPException(status_code=500, detail="MFA misconfigured for user")
        code = (payload.mfa_code or "").strip()
        if code:
            if len(code) < 6:
                raise HTTPException(status_code=401, detail="Invalid MFA code")
            totp = pyotp.TOTP(user.mfa_secret)
            if not totp.verify(code, valid_window=1):
                raise HTTPException(status_code=401, detail="Invalid MFA code")
            return schemas.LoginCompleteResponse(user=user)

        token = issue_mfa_challenge_token(user.id)
        return schemas.LoginMfaRequiredResponse(challenge_token=token)

    return schemas.LoginCompleteResponse(user=user)


def complete_mfa_login(db: Session, payload: schemas.LoginMfaCompleteRequest) -> schemas.LoginCompleteResponse:
    try:
        user_id = decode_mfa_challenge_token(payload.challenge_token)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid or expired challenge") from None

    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user or not user.mfa_enabled or not user.mfa_secret:
        raise HTTPException(status_code=401, detail="Invalid or expired challenge")

    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(payload.mfa_code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid MFA code")

    return schemas.LoginCompleteResponse(user=user)


def _generate_email_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def mfa_setup(db: Session, payload: schemas.MfaSetupRequest) -> schemas.MfaSetupResponse:
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if user.mfa_enabled:
        raise HTTPException(status_code=409, detail="MFA is already enabled")

    secret = pyotp.random_base32()
    email_plain = _generate_email_code()
    now = datetime.utcnow()
    expires = now + timedelta(minutes=settings.MFA_EMAIL_CODE_TTL_MINUTES)

    subject = f"{settings.PROJECT_NAME} — confirm MFA setup"
    body = (
        f"Hello,\n\n"
        f"Use this code to confirm two-factor authentication setup for {user.email}:\n\n"
        f"  {email_plain}\n\n"
        f"This code expires in {settings.MFA_EMAIL_CODE_TTL_MINUTES} minutes.\n\n"
        f"If you did not request this, ignore this email.\n"
    )

    email_sent = True
    if smtp_configured():
        try:
            send_plain_email(user.email, subject, body)
        except Exception as exc:  # noqa: BLE001
            logger.exception("SMTP send failed: %s", exc)
            raise HTTPException(
                status_code=502,
                detail="Could not send confirmation email. Check SMTP settings.",
            ) from exc
    elif settings.MFA_EMAIL_LOG_CODE_IN_DEV:
        logger.warning("MFA email code (dev, not sent): %s for %s", email_plain, user.email)
        email_sent = False
    else:
        raise HTTPException(
            status_code=503,
            detail="Email is not configured. Set SMTP_HOST and SMTP_FROM, or set MFA_EMAIL_LOG_CODE_IN_DEV=true for local development.",
        )

    user.mfa_secret = secret
    user.mfa_enabled = False
    user.mfa_email_code_hash = hash_password(email_plain)
    user.mfa_email_code_expires_at = expires
    db.commit()
    db.refresh(user)

    uri = pyotp.TOTP(secret).provisioning_uri(name=user.email, issuer_name="Library Hub")
    return schemas.MfaSetupResponse(otpauth_uri=uri, secret=secret, email_sent=email_sent)


def mfa_confirm_enrollment(db: Session, payload: schemas.MfaConfirmRequest) -> schemas.UserResponse:
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA setup not started")
    if user.mfa_enabled:
        raise HTTPException(status_code=409, detail="MFA is already enabled")

    if not user.mfa_email_code_hash or not user.mfa_email_code_expires_at:
        raise HTTPException(status_code=400, detail="Email confirmation missing; run MFA setup again")

    if user.mfa_email_code_expires_at < datetime.utcnow():
        raise HTTPException(status_code=401, detail="Email confirmation code has expired")

    if not verify_password(payload.email_code.strip(), user.mfa_email_code_hash):
        raise HTTPException(status_code=401, detail="Invalid email confirmation code")

    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(payload.mfa_code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid MFA code")

    user.mfa_enabled = True
    user.mfa_email_code_hash = None
    user.mfa_email_code_expires_at = None
    db.commit()
    db.refresh(user)
    return user


def mfa_disable(db: Session, payload: schemas.MfaDisableRequest) -> schemas.UserResponse:
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.mfa_enabled or not user.mfa_secret:
        raise HTTPException(status_code=400, detail="MFA is not enabled")

    totp = pyotp.TOTP(user.mfa_secret)
    if not totp.verify(payload.mfa_code, valid_window=1):
        raise HTTPException(status_code=401, detail="Invalid MFA code")

    user.mfa_secret = None
    user.mfa_enabled = False
    user.mfa_email_code_hash = None
    user.mfa_email_code_expires_at = None
    db.commit()
    db.refresh(user)
    return user
