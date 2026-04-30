"""Authentication routes"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Header, status, Depends
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel, Field

try:
    from ..config import get_settings
    from ..services.auth_service import AuthService
except Exception:  # pragma: no cover - local execution fallback
    from config import get_settings
    from services.auth_service import AuthService
import jwt

router = APIRouter()
logger = logging.getLogger(__name__)
auth_service = AuthService()
settings = get_settings()


def get_current_user_id(authorization: str = Header(...)) -> str:
    """Extract user ID from JWT bearer token."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header format")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
        if payload.get("typ") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        return payload["sub"]
    except InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from exc


class LoginIn(BaseModel):
    """Login request with identifier and password."""

    identifier: str = Field(min_length=1)
    password: str = Field(min_length=1)


class RegisterIn(BaseModel):
    """User registration request."""

    phoneNumber: str = Field(min_length=8)
    password: str = Field(min_length=8)
    name: str = Field(min_length=1)
    email: str | None = None


class RefreshIn(BaseModel):
    """Token refresh request."""

    refreshToken: str = Field(min_length=1)


class TokenOut(BaseModel):
    """Authentication response with tokens and user profile."""

    accessToken: str
    refreshToken: str
    user: dict


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn) -> TokenOut:
    """Authenticate a user and return fresh JWTs."""

    try:
        return TokenOut(**auth_service.login(payload.identifier, payload.password))
    except ValueError as exc:
        logger.warning("Login failed for identifier=%s: %s", payload.identifier, exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn) -> TokenOut:
    """Register a user account."""

    try:
        return TokenOut(**auth_service.register(payload.name, payload.phoneNumber, payload.password, payload.email))
    except ValueError as exc:
        logger.warning("Registration failed for phoneNumber=%s: %s", payload.phoneNumber, exc)
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/refresh", response_model=TokenOut)
def refresh(payload: RefreshIn) -> TokenOut:
    """Rotate tokens using a valid refresh token."""

    try:
        return TokenOut(**auth_service.refresh(payload.refreshToken))
    except ValueError as exc:
        logger.warning("Token refresh failed: %s", exc)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.get("/me", response_model=dict)
def get_me(authorization: str | None = Header(default=None)) -> dict:
    """Return the current authenticated profile."""

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required.")
    token = authorization.removeprefix("Bearer ").strip()
    try:
        return auth_service.me(token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


@router.post("/logout")
def logout(authorization: str | None = Header(default=None)) -> dict[str, str]:
    """Invalidate the active refresh token state."""

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bearer token required.")
    auth_service.logout(authorization.removeprefix("Bearer ").strip())
    return {"message": "Logged out successfully"}
