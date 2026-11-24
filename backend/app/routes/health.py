"""Health check endpoints for application and database."""

from typing import Optional
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from app.core.config import settings
from app.database.session import test_database_connection, engine

router = APIRouter(prefix="/health", tags=["Health"])


class AppHealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str


class DatabaseHealthResponse(BaseModel):
    status: str
    database: str
    dialect: str
    driver: str
    latency_ms: Optional[float] = None
    message: Optional[str] = None


@router.get("", response_model=AppHealthResponse)
def get_app_health():
    """Return general application service health."""
    return AppHealthResponse(
        status="healthy",
        service=settings.PROJECT_NAME,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
    )


@router.get("/database", response_model=DatabaseHealthResponse)
def get_database_health():
    """
    Execute SELECT 1 against PostgreSQL to verify connectivity.
    Returns HTTP 200 on success, HTTP 503 if unreachable.
    Never exposes database passwords or connection secrets.
    """
    is_connected, latency_ms, error_msg = test_database_connection()

    dialect_name = engine.dialect.name
    driver_name = engine.dialect.driver

    if not is_connected:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "unhealthy",
                "database": "disconnected",
                "dialect": dialect_name,
                "driver": driver_name,
                "message": error_msg or "Database service is unavailable.",
            },
        )

    return DatabaseHealthResponse(
        status="healthy",
        database="connected",
        dialect=dialect_name,
        driver=driver_name,
        latency_ms=latency_ms,
    )
