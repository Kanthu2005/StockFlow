"""FastAPI application entry point."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.base import Base
from app.database.session import engine
import app.models  # Ensure models are registered for table creation
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.products import router as products_router
from app.routes.dashboard import router as dashboard_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-initialize database tables on deployment startup if they do not exist
    try:
        Base.metadata.create_all(bind=engine)
    except Exception:
        pass
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="StockFlow - Inventory Management System API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS configuration supporting local development, Vercel deployments, and custom domains
cors_origins = [str(origin).rstrip("/") for origin in settings.CORS_ORIGINS]
allow_all = "*" in cors_origins

if allow_all:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=settings.CORS_ORIGIN_REGEX or r"^https:\/\/.*\.vercel\.app$",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Standard API routes under /api prefix
app.include_router(health_router, prefix="/api")
app.include_router(auth_router, prefix="/api/auth")
app.include_router(products_router, prefix="/api/products")
app.include_router(dashboard_router, prefix="/api/dashboard")

# Direct route aliases for backward-compatibility and resilient routing
app.include_router(health_router, include_in_schema=False)
app.include_router(auth_router, prefix="/auth", include_in_schema=False)
app.include_router(products_router, prefix="/products", include_in_schema=False)
app.include_router(dashboard_router, prefix="/dashboard", include_in_schema=False)


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
