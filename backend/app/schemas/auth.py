"""Pydantic schemas for authentication and user management."""

from datetime import datetime
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class UserRegisterRequest(BaseModel):
    """Registration request payload."""

    email: EmailStr = Field(..., description="Valid user email address")
    password: str = Field(
        ...,
        min_length=8,
        description="Password must contain at least 8 characters",
    )
    organization_name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Name of the organization or company",
    )

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v

    @field_validator("organization_name")
    @classmethod
    def validate_organization_name(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Organization name cannot be empty or blank")
        return stripped


class UserLoginRequest(BaseModel):
    """Login credentials payload."""

    email: EmailStr = Field(..., description="Registered user email address")
    password: str = Field(..., min_length=1, description="Account password")

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        if isinstance(v, str):
            return v.strip().lower()
        return v


class UserResponse(BaseModel):
    """User profile response (safe, no password hashes or sensitive fields)."""

    id: int
    email: str
    organization_id: int
    organization_name: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TokenResponse(BaseModel):
    """Authentication token response returned on successful register and login."""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenPayload(BaseModel):
    """Decoded JWT claims."""

    sub: str
    exp: int
    iat: int
