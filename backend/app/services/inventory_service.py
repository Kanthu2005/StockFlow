"""Inventory business logic service."""

from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemUpdate


class InventoryService:
    """Service layer for inventory management operations."""

    def __init__(self, db: Optional[Session] = None):
        self.db = db

    def list_items(self, skip: int = 0, limit: int = 100) -> List[Item]:
        """Retrieve paginated list of items."""
        if not self.db:
            return []
        return self.db.query(Item).offset(skip).limit(limit).all()

    def get_item(self, item_id: int) -> Optional[Item]:
        """Retrieve a single item by id."""
        if not self.db:
            return None
        return self.db.query(Item).filter(Item.id == item_id).first()

    def create_item(self, item_in: ItemCreate) -> Item:
        """Create a new inventory item."""
        if not self.db:
            raise RuntimeError("Database session not available")
        db_item = Item(**item_in.model_dump())
        self.db.add(db_item)
        self.db.commit()
        self.db.refresh(db_item)
        return db_item


inventory_service = InventoryService()
