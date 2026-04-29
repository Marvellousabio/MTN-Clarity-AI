"""Chat and session profile routes."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

try:
    from ..services.chat_service import ChatService
    from ..services.recommendations_service import RecommendationService
    from ..services.repositories import ProfileRepository
except Exception:  # pragma: no cover - local execution fallback
    from services.chat_service import ChatService
    from services.recommendations_service import RecommendationService
    from services.repositories import ProfileRepository

router = APIRouter()
logger = logging.getLogger(__name__)
chat_service = ChatService()
recommendation_service = RecommendationService()
profile_repository = ProfileRepository()


class RecentMessage(BaseModel):
    """Single chat message."""

    role: str
    text: str
    timestamp: datetime


class ChatContext(BaseModel):
    """User context for enriching chat responses."""

    userProfile: dict[str, Any]
    recentMessages: list[RecentMessage] | None = None


class ChatIn(BaseModel):
    """Chat message request."""

    message: str = Field(min_length=1)
    language: str = "EN"
    context: ChatContext | None = None


class ChatOut(BaseModel):
    """Assistant reply with metadata."""

    id: str
    role: str
    text: str
    timestamp: datetime
    suggestions: list[str] | None = None
    actions: list[dict[str, Any]] | None = None


class SaveProfileIn(BaseModel):
    """User profile for session persistence."""

    session_id: str = Field(min_length=1)
    name: str = Field(min_length=1)
    current_plan: str = ""
    monthly_data_gb: float = 0.0
    monthly_call_minutes: int = 0
    budget_naira: float = 0.0
    segment: str = "individual"


class RecommendIn(BaseModel):
    """Plan recommendation request."""

    monthly_data_gb: float
    monthly_call_minutes: int
    monthly_budget_naira: float
    user_segment: str = "individual"
    number_of_lines: int = 1
    usage_pattern: str = "work"


class AnalyzeIn(BaseModel):
    """Usage overspend analysis request."""

    current_plan_name: str
    actual_data_used_gb: float
    actual_call_minutes_used: int


@router.post("/message", response_model=ChatOut)
def send_message(req: ChatIn) -> ChatOut:
    """Send a user message to the assistant and return a generated reply."""

    try:
        response = chat_service.reply(req.message, req.language, req.context.model_dump() if req.context else None)
        return ChatOut(**response)
    except Exception as exc:
        logger.exception("Chat completion failed")
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Chat service is unavailable.") from exc


@router.post("/profile/save")
def save_profile(req: SaveProfileIn) -> dict[str, str]:
    """Save or update a session-scoped user profile."""

    document = {
        "id": req.session_id,
        "sessionId": req.session_id,
        "name": req.name,
        "currentPlanId": req.current_plan,
        "monthlyDataGB": req.monthly_data_gb,
        "monthlyCallMinutes": req.monthly_call_minutes,
        "budgetNaira": req.budget_naira,
        "segment": req.segment,
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "updatedAt": datetime.now(timezone.utc).isoformat(),
    }
    profile_repository.save_profile(document)
    return {"message": f"Profile saved for {req.name}."}


@router.get("/profile/{session_id}")
def get_profile(session_id: str):
    """Retrieve a stored session profile."""

    profile = profile_repository.get_profile(session_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="NO_PROFILE_FOUND")
    return profile


@router.post("/recommend")
def recommend(req: RecommendIn):
    """Return recommendations from the shared service layer."""

    return recommendation_service.recommend_plan(
        monthly_data_gb=req.monthly_data_gb,
        monthly_call_minutes=req.monthly_call_minutes,
        monthly_budget_naira=req.monthly_budget_naira,
        user_segment=req.user_segment,
        number_of_lines=req.number_of_lines,
        usage_pattern=req.usage_pattern,
    )


@router.post("/analyze_overspend")
def analyze_overspend(req: AnalyzeIn):
    """Return a structured overspend analysis."""

    plan = recommendation_service.plan_service.get_plan(req.current_plan_name)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return {
        "current_plan": plan,
        "analysis": {
            "data_utilization_percent": round((req.actual_data_used_gb / max(float(plan.get("dataGB", 0)), 0.01)) * 100, 1),
            "call_utilization_percent": round((req.actual_call_minutes_used / max(float(plan.get("callMinutes", 0)), 0.01)) * 100, 1),
        },
    }
