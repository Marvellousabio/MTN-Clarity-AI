"""User profile routes"""

from __future__ import annotations

import logging
from datetime import datetime

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

try:
    from ..services.repositories import ProfileRepository
except Exception:  # pragma: no cover - local execution fallback
    from services.repositories import ProfileRepository

router = APIRouter()
logger = logging.getLogger(__name__)
profile_repository = ProfileRepository()


class UserOut(BaseModel):
    """Public user profile model."""

    id: str
    name: str
    currentPlanId: str
    monthlySpend: float
    dataBurnRate: str
    heavySocialUsage: bool
    preferredLanguage: str
    createdAt: datetime | None = None
    updatedAt: datetime | None = None


@router.get("/profile", response_model=UserOut)
def profile(userId: str | None = Query(default=None)) -> UserOut:
    """Return the stored profile for a user."""

    if not userId:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="userId is required.")

    profile = profile_repository.get_profile(userId)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    logger.info("Loaded profile for userId=%s", userId)
    return UserOut(**profile)
