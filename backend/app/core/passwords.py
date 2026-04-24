from passlib.context import CryptContext

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain: str) -> str:
    # Bcrypt truncates at 72 bytes; passlib handles encoding
    return _pwd_context.hash(plain)


def verify_password(plain: str, hashed: str | None) -> bool:
    if not hashed:
        return False
    return _pwd_context.verify(plain, hashed)
