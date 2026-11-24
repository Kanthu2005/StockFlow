"""Inventory item Pydantic schemas."""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field


class ItemBase(BaseModel):
    sku: str = Field(..., max_length=50, examples=["SKU-1001"])
    name: str = Field(..., max_length=200, examples=["Wireless Barcode Scanner"])
    description: Optional[str] = Field(None, examples=["High performance laser scanner"])
    category: str = Field("General", max_length=100, examples=["Electronics"])
    quantity: int = Field(0, ge=0, examples=[45])
    unit_price: float = Field(0.0, ge=0.0, examples=[79.99])
    reorder_level: int = Field(10, ge=0, examples=[15])


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    quantity: Optional[int] = None
    unit_price: Optional[float] = None
    reorder_level: Optional[int] = None


class ItemResponse(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
