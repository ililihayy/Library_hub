from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./library_hub.db"
    API_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Library Hub API"
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    # Used for MFA challenge JWTs; override in production via env
    SECRET_KEY: str = "change-me-in-production-use-openssl-rand-hex-32"
    JWT_ALGORITHM: str = "HS256"
    MFA_CHALLENGE_EXPIRE_MINUTES: int = 5
    MFA_EMAIL_CODE_TTL_MINUTES: int = 15
    # If true and SMTP is not configured, log the email code instead of sending (dev only)
    MFA_EMAIL_LOG_CODE_IN_DEV: bool = False

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = ""
    SMTP_USE_TLS: bool = True

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
