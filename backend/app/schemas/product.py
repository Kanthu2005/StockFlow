"""Pydantic schemas for product management and inventory operations."""

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductBase(BaseModel):
    """Base fields shared across product request schemas."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Product display name",
    )
    sku: str = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Unique stock keeping unit code within organization",
    )
    description: Optional[str] = Field(
        None,
        max_length=2000,
        description="Optional detailed product description",
    )
    quantity_on_hand: int = Field(
        default=0,
        ge=0,
        description="Available stock units (must be non-negative)",
    )
    cost_price: Optional[Decimal] = Field(
        None,
        ge=0,
        decimal_places=2,
        description="Unit cost price (must be non-negative)",
    )
    selling_price: Optional[Decimal] = Field(
        None,
        ge=0,
        decimal_places=2,
        description="Unit selling price (must be non-negative)",
    )
    low_stock_threshold: Optional[int] = Field(
        None,
        ge=0,
        description="Custom threshold for low-stock alert (must be non-negative)",
    )

    @field_validator("name", "sku", mode="before")
    @classmethod
    def trim_required_strings(cls, v: str) -> str:
        if isinstance(v, str):
            stripped = v.strip()
            if not stripped:
                raise ValueError("Field cannot be empty or whitespace only")
            return stripped
        return v

    @field_validator("description", mode="before")
    @classmethod
    def trim_optional_description(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            stripped = v.strip()
            return stripped if stripped else None
        return v


class ProductCreate(ProductBase):
    """Payload for creating a new product."""
    pass


class ProductUpdate(ProductBase):
    """Payload for updating an existing product."""
    pass


class ProductResponse(BaseModel):
    """Product representation returned to clients with tenant isolation."""

    id: int
    organization_id: int
    name: str
    sku: str
    description: Optional[str] = None
    quantity_on_hand: int
    cost_price: Optional[Decimal] = None
    selling_price: Optional[Decimal] = None
    low_stock_threshold: Optional[int] = None
    effective_low_stock_threshold: int
    is_low_stock: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProductListResponse(BaseModel):
    """Paginated list of product records."""

    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
