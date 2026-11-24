"""FastAPI application entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.products import router as products_router
from app.routes.dashboard import router as dashboard_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="StockFlow - Inventory Management System API",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration for local development
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Mount health check at /api/health
app.include_router(health_router, prefix="/api")

# Mount authentication endpoints at /api/auth
app.include_router(auth_router, prefix="/api/auth")

# Mount products inventory endpoints at /api/products
app.include_router(products_router, prefix="/api/products")

# Mount dashboard metrics endpoints at /api/dashboard
app.include_router(dashboard_router, prefix="/api/dashboard")


@app.get("/")
def root():
    """Root endpoint."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "health": "/api/health",
    }
