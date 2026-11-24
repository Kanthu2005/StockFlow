"""Product inventory API routes: CRUD and search endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductListResponse,
    ProductResponse,
    ProductUpdate,
)
from app.services import product_service

router = APIRouter(tags=["Products"])


@router.post(
    "",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Creates a product strictly isolated to the authenticated user's organization.",
)
def create_product(
    data: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProductResponse:
    """Create a new product in the user's organization."""
    return product_service.create_product(
        db=db,
        organization_id=current_user.organization_id,
        org_default_threshold=current_user.organization.default_low_stock_threshold,
        data=data,
    )


@router.get(
    "",
    response_model=ProductListResponse,
    status_code=status.HTTP_200_OK,
    summary="List organization products",
    description="Retrieve paginated products for the user's organization with optional name/SKU search.",
)
def list_products(
    search: Optional[str] = Query(None, description="Search by product name or SKU"),
    page: int = Query(1, ge=1, description="Page number (defaults to 1)"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page (defaults to 20, max 100)"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProductListResponse:
    """List products with pagination and search."""
    return product_service.list_products(
        db=db,
        organization_id=current_user.organization_id,
        org_default_threshold=current_user.organization.default_low_stock_threshold,
        search=search,
        page=page,
        page_size=page_size,
    )


@router.get(
    "/{id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Get product details",
    description="Fetch a product by ID. Returns 404 if not found or outside user's organization.",
)
def get_product(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProductResponse:
    """Get a single product by ID."""
    return product_service.get_product(
        db=db,
        organization_id=current_user.organization_id,
        org_default_threshold=current_user.organization.default_low_stock_threshold,
        product_id=id,
    )


@router.put(
    "/{id}",
    response_model=ProductResponse,
    status_code=status.HTTP_200_OK,
    summary="Update product",
    description="Update an existing product. Returns 404 if outside organization, 409 if duplicate SKU.",
)
def update_product(
    id: int,
    data: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ProductResponse:
    """Update product information."""
    return product_service.update_product(
        db=db,
        organization_id=current_user.organization_id,
        org_default_threshold=current_user.organization.default_low_stock_threshold,
        product_id=id,
        data=data,
    )


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete product",
    description="Delete a product. Returns 404 if not found or outside user's organization.",
)
def delete_product(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete a product from the database."""
    product_service.delete_product(
        db=db,
        organization_id=current_user.organization_id,
        product_id=id,
    )
