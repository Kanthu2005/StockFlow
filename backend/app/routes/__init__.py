from app.routes.api import api_router
from app.routes.health import router as health_router
from app.routes.items import router as items_router

__all__ = ["api_router", "health_router", "items_router"]
