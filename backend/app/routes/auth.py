"""Authentication API routes: register, login, and me endpoints."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)
from app.services import auth_service

router = APIRouter(tags=["Authentication"])


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new organization and administrator user",
    description="Validates credentials, creates a tenant organization and user account in a single transaction, and returns a JWT access token.",
)
def register(
    request: UserRegisterRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Handle new user registration."""
    return auth_service.register_user(db=db, request=request)


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate user and obtain access token",
    description="Validates email and Argon2 hashed password, returning a JWT bearer access token.",
)
def login(
    request: UserLoginRequest,
    db: Session = Depends(get_db),
) -> TokenResponse:
    """Handle user login."""
    return auth_service.authenticate_user(db=db, request=request)


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current authenticated user profile",
    description="Requires a valid Bearer token in the Authorization header. Returns user and organization details.",
)
def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    """Return profile of the currently authenticated user."""
    return auth_service.get_current_user_profile(user=current_user)
