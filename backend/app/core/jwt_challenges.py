from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt

from app.core.config import settings


def issue_mfa_challenge_token(user_id: int) -> str:
    expire_ts = int(
        (datetime.now(timezone.utc) + timedelta(minutes=settings.MFA_CHALLENGE_EXPIRE_MINUTES)).timestamp()
    )
    payload = {"sub": str(user_id), "typ": "mfa", "exp": expire_ts}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_mfa_challenge_token(token: str) -> int:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError as e:
        raise ValueError("invalid_challenge_token") from e
    if payload.get("typ") != "mfa":
        raise ValueError("invalid_challenge_type")
    sub = payload.get("sub")
    if not sub:
        raise ValueError("invalid_challenge_subject")
    return int(sub)
