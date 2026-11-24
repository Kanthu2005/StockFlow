"""Product database model."""

from datetime import datetime
from decimal import Decimal
from typing import Optional, TYPE_CHECKING
from sqlalchemy import (
    Integer,
    String,
    Text,
    Numeric,
    DateTime,
    ForeignKey,
    CheckConstraint,
    UniqueConstraint,
    Index,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base

if TYPE_CHECKING:
    from app.models.organization import Organization


class Product(Base):
    """Inventory product item entity model."""

    __tablename__ = "products"

    __table_args__ = (
        # Product SKU must be unique within an organization
        UniqueConstraint(
            "organization_id",
            "sku",
            name="uq_products_organization_id_sku",
        ),
        # Quantity must never be negative
        CheckConstraint(
            "quantity_on_hand >= 0",
            name="ck_products_quantity_non_negative",
        ),
        # Cost price must never be negative (can be NULL)
        CheckConstraint(
            "cost_price IS NULL OR cost_price >= 0",
            name="ck_products_cost_price_non_negative",
        ),
        # Selling price must never be negative (can be NULL)
        CheckConstraint(
            "selling_price IS NULL OR selling_price >= 0",
            name="ck_products_selling_price_non_negative",
        ),
        # Low stock threshold must be non-negative (can be NULL)
        CheckConstraint(
            "low_stock_threshold IS NULL OR low_stock_threshold >= 0",
            name="ck_products_threshold_non_negative",
        ),
        # Composite index for search by name within an organization
        Index("ix_products_organization_name", "organization_id", "name"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    organization_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    sku: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    quantity_on_hand: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        server_default="0",
    )
    cost_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )
    selling_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2),
        nullable=True,
    )
    low_stock_threshold: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    organization: Mapped["Organization"] = relationship(
        "Organization",
        back_populates="products",
    )

    def __repr__(self) -> str:
        return f"<Product(id={self.id}, sku='{self.sku}', name='{self.name}', organization_id={self.organization_id})>"
