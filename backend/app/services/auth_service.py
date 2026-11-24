"""Authentication service implementing business logic for user management."""

import logging
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.organization import Organization
from app.models.user import User
from app.schemas.auth import (
    TokenResponse,
    UserLoginRequest,
    UserRegisterRequest,
    UserResponse,
)

logger = logging.getLogger("stockflow.auth")


def register_user(db: Session, request: UserRegisterRequest) -> TokenResponse:
    """
    Register a new user and organization in a single atomic transaction.
    Returns JWT access token along with user and organization details.
    """
    normalized_email = request.email.lower().strip()

    # Verify duplicate email
    existing_user = (
        db.execute(select(User).where(User.email == normalized_email))
        .scalars()
        .first()
    )
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists",
        )

    try:
        # Create organization
        organization = Organization(name=request.organization_name.strip())
        db.add(organization)
        db.flush()  # Generates organization.id for foreign key assignment

        # Hash password using Argon2
        hashed_password = get_password_hash(request.password)

        # Create user linked to organization
        user = User(
            organization_id=organization.id,
            email=normalized_email,
            hashed_password=hashed_password,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        db.refresh(organization)

    except Exception as exc:
        db.rollback()
        logger.error(f"Error during user registration transaction: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Registration failed due to an internal error. Please try again.",
        ) from exc

    # Generate JWT access token with user ID subject
    access_token = create_access_token(subject=user.id)

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        organization_id=organization.id,
        organization_name=organization.name,
        created_at=user.created_at,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
    )


def authenticate_user(db: Session, request: UserLoginRequest) -> TokenResponse:
    """
    Verify user credentials and issue an access token.
    Generic 401 error message protects against account enumeration.
    """
    normalized_email = request.email.lower().strip()

    query = (
        select(User)
        .options(joinedload(User.organization))
        .where(User.email == normalized_email)
    )
    user = db.execute(query).scalars().first()

    # Verify user exists and Argon2 password matches
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(subject=user.id)

    user_response = UserResponse(
        id=user.id,
        email=user.email,
        organization_id=user.organization.id,
        organization_name=user.organization.name,
        created_at=user.created_at,
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_response,
    )


def get_current_user_profile(user: User) -> UserResponse:
    """Return sanitized user profile without sensitive fields."""
    return UserResponse(
        id=user.id,
        email=user.email,
        organization_id=user.organization.id,
        organization_name=user.organization.name,
        created_at=user.created_at,
    )
