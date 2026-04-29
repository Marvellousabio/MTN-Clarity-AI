"""Usage analytics routes backed by Cosmos DB."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel

try:
    from ..services.usage_service import UsageService
except Exception:  # pragma: no cover - local execution fallback
    from services.usage_service import UsageService

router = APIRouter()
logger = logging.getLogger(__name__)
usage_service = UsageService()


class UsageByCategory(BaseModel):
    """Usage breakdown for a category."""

    category: str
    percentage: float
    color: str


class CurrentUsage(BaseModel):
    """Current month usage summary."""

    totalDataUsed: float
    totalCallMinutes: int
    totalSmsSent: int
    usageByCategory: list[UsageByCategory]
    dataBurnRate: str
    projectedOverage: dict


@router.get("/current", response_model=CurrentUsage)
def current_usage(userId: str = Query(..., min_length=1)) -> CurrentUsage:
    """Return the latest usage snapshot for a user."""

    try:
        return CurrentUsage(**usage_service.current_usage(userId))
    except LookupError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/history")
def history(userId: str = Query(..., min_length=1), period: str = Query(default="month"), limit: int = Query(default=6, ge=1, le=24)):
    """Return historical usage data for a user."""

    return usage_service.history(userId, period=period, limit=limit)
