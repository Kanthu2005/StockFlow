"""Health check endpoint and schemas."""

from fastapi import APIRouter
from pydantic import BaseModel
from app.core.config import settings

router = APIRouter(tags=["Health"])


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str


@router.get("/health", response_model=HealthResponse)
def get_health():
    """Return health status of the application."""
    return HealthResponse(
        status="healthy",
        service="StockFlow API",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
    )
