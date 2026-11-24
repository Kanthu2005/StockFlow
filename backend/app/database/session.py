"""SQLAlchemy 2.x database engine, session management, and connectivity helpers."""

import logging
import time
from typing import Generator, Tuple, Optional
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings

logger = logging.getLogger("stockflow.database")

# SQLAlchemy 2.x Engine with connection pooling and health checks
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

# Session factory for scoped database sessions
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding a managed database session with guaranteed closure."""
    db: Session = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_database_connection() -> Tuple[bool, Optional[float], Optional[str]]:
    """
    Test direct database connectivity by executing SELECT 1.
    Returns:
        (is_connected, latency_ms, safe_error_message)
    Never exposes passwords, connection URLs, or internal tracebacks.
    """
    start_time = time.perf_counter()
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        latency_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return True, latency_ms, None
    except SQLAlchemyError as err:
        logger.error("Database connection failure encountered during health check.")
        # Classify safe failure category without exposing credentials
        error_name = err.__class__.__name__
        return False, None, f"Database connectivity failure ({error_name})."
    except Exception:
        logger.error("Unexpected error connecting to database.")
        return False, None, "Database service is unreachable."
