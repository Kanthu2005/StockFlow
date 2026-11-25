"""Centralized application configuration using Pydantic Settings."""

from typing import List, Union, Optional
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
import json


class Settings(BaseSettings):
    """Application settings loaded securely from environment variables."""

    # Project metadata
    PROJECT_NAME: str = "StockFlow - Inventory Management System"
    VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Security
    SECRET_KEY: str = "temporary-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # PostgreSQL Database URL (Psycopg 3)
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/stockflow_db"

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_database_url(cls, v: Optional[str]) -> str:
        default_url = "postgresql+psycopg://postgres:postgres@localhost:5432/stockflow_db"
        if not v or not isinstance(v, str):
            return default_url

        # Strip whitespace and any quotes (single or double) from environment variable value
        cleaned = v.strip().strip("'\"").strip()

        if not cleaned:
            return default_url

        # Render / Heroku compatibility: convert legacy postgres:// to postgresql+psycopg://
        if cleaned.startswith("postgres://"):
            cleaned = cleaned.replace("postgres://", "postgresql+psycopg://", 1)
        # Ensure psycopg driver is explicitly specified if plain postgresql:// is provided
        elif cleaned.startswith("postgresql://") and not cleaned.startswith("postgresql+psycopg://"):
            cleaned = cleaned.replace("postgresql://", "postgresql+psycopg://", 1)

        return cleaned

    # Connection pooling configuration
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_POOL_RECYCLE: int = 1800

    # CORS Configuration
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["http://localhost:5173", "http://127.0.0.1:5173"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
