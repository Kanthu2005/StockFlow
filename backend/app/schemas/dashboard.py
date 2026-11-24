"""Pydantic schemas for dashboard metrics and low-stock inventory views."""

from typing import List
from pydantic import BaseModel, ConfigDict, Field


class DashboardSummaryResponse(BaseModel):
    """Aggregated organization inventory metrics."""

    total_products: int = Field(
        ...,
        description="Total distinct product records in organization",
    )
    total_quantity: int = Field(
        ...,
        description="Sum of quantity_on_hand across all organization products",
    )
    low_stock_count: int = Field(
        ...,
        description="Number of products whose quantity is at or below effective threshold",
    )

    model_config = ConfigDict(from_attributes=True)


class LowStockItemResponse(BaseModel):
    """Compact summary of a low-stock inventory item."""

    id: int
    name: str
    sku: str
    quantity_on_hand: int
    effective_threshold: int

    model_config = ConfigDict(from_attributes=True)


class LowStockListResponse(BaseModel):
    """List of currently low-stock items with count."""

    items: List[LowStockItemResponse]
    total: int

    model_config = ConfigDict(from_attributes=True)
