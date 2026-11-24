"""SQLAlchemy Item model for inventory management."""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Text
from app.database.base import Base


class Item(Base):
    """Inventory item database model."""

    __tablename__ = "items"

    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String(50), unique=True, index=True, nullable=False)
    name = Column(String(200), index=True, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), index=True, nullable=False, default="General")
    quantity = Column(Integer, default=0, nullable=False)
    unit_price = Column(Float, default=0.0, nullable=False)
    reorder_level = Column(Integer, default=10, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
