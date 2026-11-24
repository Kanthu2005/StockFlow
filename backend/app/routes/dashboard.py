"""Dashboard API routes for organization inventory metrics and low-stock queries."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    LowStockListResponse,
)
from app.services import dashboard_service

router = APIRouter(tags=["Dashboard"])


@router.get(
    "/summary",
    response_model=DashboardSummaryResponse,
    status_code=status.HTTP_200_OK,
    summary="Get organization inventory summary metrics",
    description="Returns total products, total stock quantity, and low-stock count strictly for the authenticated tenant.",
)
def get_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardSummaryResponse:
    """Return aggregated dashboard metrics for current organization."""
    return dashboard_service.get_dashboard_summary(
        db=db,
        organization_id=current_user.organization_id,
        org_default_threshold=current_user.organization.default_low_stock_threshold,
    )


@router.get(
    "/low-stock",
    response_model=LowStockListResponse,
    status_code=status.HTTP_200_OK,
    summary="Get low-stock products list",
    description="Returns products whose available quantity is at or below their effective low-stock threshold.",
)
def get_low_stock(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> LowStockListResponse:
    """Return list of low-stock items for current organization."""
    return dashboard_service.get_low_stock_products(
        db=db,
        organization_id=current_user.organization_id,
        org_default_threshold=current_user.organization.default_low_stock_threshold,
    )
