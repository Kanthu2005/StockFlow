"""Health check schemas."""

from pydantic import BaseModel
from typing import Optional


class HealthResponse(BaseModel):
    status: str
    app_name: str
    version: str
    environment: str
    database: Optional[str] = "configured"
