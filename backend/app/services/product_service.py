"""Product service implementing business logic and strict tenant isolation."""

import math
from datetime import datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)


def compute_product_response(product: Product, org_default_threshold: int) -> ProductResponse:
    """Compute effective low-stock status and return sanitized ProductResponse."""
    effective_threshold = (
        product.low_stock_threshold
        if product.low_stock_threshold is not None
        else org_default_threshold
    )
    is_low_stock = product.quantity_on_hand <= effective_threshold

    return ProductResponse(
        id=product.id,
        organization_id=product.organization_id,
        name=product.name,
        sku=product.sku,
        description=product.description,
        quantity_on_hand=product.quantity_on_hand,
        cost_price=product.cost_price,
        selling_price=product.selling_price,
        low_stock_threshold=product.low_stock_threshold,
        effective_low_stock_threshold=effective_threshold,
        is_low_stock=is_low_stock,
        created_at=product.created_at,
        updated_at=product.updated_at,
    )


def create_product(
    db: Session,
    organization_id: int,
    org_default_threshold: int,
    data: ProductCreate,
) -> ProductResponse:
    """
    Create a new product within the authenticated user's organization.
    Enforces SKU uniqueness within the organization.
    """
    # Check for duplicate SKU within this organization
    existing = db.execute(
        select(Product).where(
            Product.organization_id == organization_id,
            Product.sku == data.sku,
        )
    ).scalars().first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A product with SKU '{data.sku}' already exists in your organization.",
        )

    product = Product(
        organization_id=organization_id,
        name=data.name,
        sku=data.sku,
        description=data.description,
        quantity_on_hand=data.quantity_on_hand,
        cost_price=data.cost_price,
        selling_price=data.selling_price,
        low_stock_threshold=data.low_stock_threshold,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    return compute_product_response(product, org_default_threshold)


def list_products(
    db: Session,
    organization_id: int,
    org_default_threshold: int,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> ProductListResponse:
    """
    List paginated products belonging strictly to the user's organization.
    Supports case-insensitive search by product name or SKU.
    Sorts by most recently updated first.
    """
    base_query = select(Product).where(Product.organization_id == organization_id)

    if search and search.strip():
        term = f"%{search.strip()}%"
        base_query = base_query.where(
            or_(
                Product.name.ilike(term),
                Product.sku.ilike(term),
            )
        )

    # Total matching records count
    count_query = select(func.count()).select_from(base_query.subquery())
    total = db.scalar(count_query) or 0

    # Paginated and sorted query (most recently updated first)
    query = (
        base_query
        .order_by(Product.updated_at.desc(), Product.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    products = db.execute(query).scalars().all()

    total_pages = math.ceil(total / page_size) if total > 0 else 0
    items = [compute_product_response(p, org_default_threshold) for p in products]

    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


def get_product(
    db: Session,
    organization_id: int,
    org_default_threshold: int,
    product_id: int,
) -> ProductResponse:
    """
    Retrieve a single product by ID.
    Strictly scoped to the authenticated organization (returns 404 for other tenants).
    """
    product = db.execute(
        select(Product).where(
            Product.id == product_id,
            Product.organization_id == organization_id,
        )
    ).scalars().first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    return compute_product_response(product, org_default_threshold)


def update_product(
    db: Session,
    organization_id: int,
    org_default_threshold: int,
    product_id: int,
    data: ProductUpdate,
) -> ProductResponse:
    """
    Update an existing product's fields.
    Guarantees organization isolation and prevents duplicate SKUs.
    """
    product = db.execute(
        select(Product).where(
            Product.id == product_id,
            Product.organization_id == organization_id,
        )
    ).scalars().first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    # Check for duplicate SKU against other products in the same organization
    duplicate_sku = db.execute(
        select(Product).where(
            Product.organization_id == organization_id,
            Product.sku == data.sku,
            Product.id != product_id,
        )
    ).scalars().first()

    if duplicate_sku:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A product with SKU '{data.sku}' already exists in your organization.",
        )

    # Apply updates
    product.name = data.name
    product.sku = data.sku
    product.description = data.description
    product.quantity_on_hand = data.quantity_on_hand
    product.cost_price = data.cost_price
    product.selling_price = data.selling_price
    product.low_stock_threshold = data.low_stock_threshold
    product.updated_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(product)

    return compute_product_response(product, org_default_threshold)


def delete_product(
    db: Session,
    organization_id: int,
    product_id: int,
) -> None:
    """
    Delete a product from the database.
    Strictly scoped to the authenticated organization (returns 404 for other tenants).
    """
    product = db.execute(
        select(Product).where(
            Product.id == product_id,
            Product.organization_id == organization_id,
        )
    ).scalars().first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    db.delete(product)
    db.commit()
