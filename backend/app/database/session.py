"""Database engine and session management."""

from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings

# Database URL normalization (ensure psycopg2 is used if postgresql:// is provided)
db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

# Engine created with pool_pre_ping to check connection health
engine = create_engine(
    db_url,
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a database session and ensures closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
