"""Dashboard service implementing high-performance SQL aggregate queries."""

from sqlalchemy import case, func, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    LowStockItemResponse,
    LowStockListResponse,
)


def get_dashboard_summary(
    db: Session,
    organization_id: int,
    org_default_threshold: int,
) -> DashboardSummaryResponse:
    """
    Calculate organization dashboard summary metrics in a single SQL query.
    Calculates total products, total stock quantity, and low-stock count
    without loading individual product records into Python memory.
    """
    # Effective threshold: product-specific if specified, otherwise organization default
    effective_threshold = func.coalesce(
        Product.low_stock_threshold,
        org_default_threshold,
    )

    stmt = (
        select(
            func.count(Product.id).label("total_products"),
            func.coalesce(func.sum(Product.quantity_on_hand), 0).label("total_quantity"),
            func.coalesce(
                func.sum(
                    case(
                        (Product.quantity_on_hand <= effective_threshold, 1),
                        else_=0,
                    )
                ),
                0,
            ).label("low_stock_count"),
        )
        .where(Product.organization_id == organization_id)
    )

    row = db.execute(stmt).one()

    return DashboardSummaryResponse(
        total_products=int(row.total_products or 0),
        total_quantity=int(row.total_quantity or 0),
        low_stock_count=int(row.low_stock_count or 0),
    )


def get_low_stock_products(
    db: Session,
    organization_id: int,
    org_default_threshold: int,
) -> LowStockListResponse:
    """
    Retrieve all low-stock products belonging strictly to the organization.
    Condition: quantity_on_hand <= effective_threshold
    Sorted by quantity_on_hand ascending, then name ascending.
    """
    effective_threshold_col = func.coalesce(
        Product.low_stock_threshold,
        org_default_threshold,
    )

    stmt = (
        select(
            Product.id,
            Product.name,
            Product.sku,
            Product.quantity_on_hand,
            effective_threshold_col.label("effective_threshold"),
        )
        .where(
            Product.organization_id == organization_id,
            Product.quantity_on_hand <= effective_threshold_col,
        )
        .order_by(Product.quantity_on_hand.asc(), Product.name.asc())
    )

    rows = db.execute(stmt).all()

    items = [
        LowStockItemResponse(
            id=row.id,
            name=row.name,
            sku=row.sku,
            quantity_on_hand=row.quantity_on_hand,
            effective_threshold=int(row.effective_threshold),
        )
        for row in rows
    ]

    return LowStockListResponse(
        items=items,
        total=len(items),
    )
