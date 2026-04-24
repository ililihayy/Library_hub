from pydantic import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./library_hub.db"
    API_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Library Hub API"
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:8080", "http://127.0.0.1:8080"]

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
