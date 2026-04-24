from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer
from jose import jwt, JWTError
from typing import List
from functools import wraps

# Clerk JWT verification
SECRET_KEY = "your-secret-key"  # Replace with your Clerk secret key
ALGORITHM = "HS256"


def verify_jwt(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Role-based access control (RBAC)


def require_role(roles: List[str]):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, token: str = Security(HTTPBearer()), **kwargs):
            payload = verify_jwt(token.credentials)
            user_role = payload.get("role")
            if user_role not in roles:
                raise HTTPException(status_code=403, detail="Access forbidden")
            return await func(*args, **kwargs)
        return wrapper
    return decorator

# MFA decorator


def require_mfa(func):
    @wraps(func)
    async def wrapper(*args, token: str = Security(HTTPBearer()), **kwargs):
        payload = verify_jwt(token.credentials)
        if not payload.get("mfa_verified"):
            raise HTTPException(status_code=403, detail="MFA required")
        return await func(*args, **kwargs)
    return wrapper
