"""Inventory items API router."""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.item import ItemCreate, ItemResponse
from app.services.inventory_service import InventoryService

router = APIRouter(prefix="/items", tags=["Items"])


@router.get("", response_model=List[ItemResponse])
def get_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Retrieve list of inventory items."""
    service = InventoryService(db=db)
    return service.list_items(skip=skip, limit=limit)


@router.post("", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_item(item_in: ItemCreate, db: Session = Depends(get_db)):
    """Create a new inventory item."""
    service = InventoryService(db=db)
    return service.create_item(item_in=item_in)


@router.get("/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    """Get a single inventory item by ID."""
    service = InventoryService(db=db)
    item = service.get_item(item_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Item with ID {item_id} not found",
        )
    return item
