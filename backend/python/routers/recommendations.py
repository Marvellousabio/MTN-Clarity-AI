"""Recommendation routes"""

from __future__ import annotations

import logging
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

try:
    from ..services.recommendations_service import RecommendationService
except Exception:  # pragma: no cover - local execution fallback
    from services.recommendations_service import RecommendationService

router = APIRouter()
logger = logging.getLogger(__name__)
recommendation_service = RecommendationService()


class SavingsIn(BaseModel):
    """Savings calculation request."""

    currentPlanId: str = Field(min_length=1)
    targetPlanId: str = Field(min_length=1)


@router.get("/recommendations")
def get_recommendations(
    monthlyDataGB: float = Query(default=6.0, ge=0),
    monthlyCallMinutes: int = Query(default=120, ge=0),
    monthlyBudget: float = Query(default=3000.0, ge=0),
    userSegment: str = Query(default="individual"),
    currentPlanId: str | None = Query(default=None),
):
    """Return ranked recommendations and savings estimates."""

    profile = recommendation_service.recommend_plan(
        monthly_data_gb=monthlyDataGB,
        monthly_call_minutes=monthlyCallMinutes,
        monthly_budget_naira=monthlyBudget,
        user_segment=userSegment,
    )

    current_cost = monthlyBudget
    if currentPlanId:
        current_plan = recommendation_service.plan_service.get_plan(currentPlanId)
        if current_plan:
            current_cost = float(current_plan.get("monthlyPrice", monthlyBudget))

    results = []
    for item in profile.get("top_recommendations", []):
        estimated_cost = float(item.get("monthly_price", 0))
        estimated_savings = round(max(current_cost - estimated_cost, 0), 2)
        results.append(
            {
                "planId": item.get("plan_id"),
                "matchScore": item.get("total_score", 0),
                "estimatedMonthlyCost": estimated_cost,
                "estimatedSavings": estimated_savings,
                "reason": "; ".join(item.get("why_recommended", [])) or "Matches your usage profile.",
                "activationCode": item.get("activation_code", ""),
                "switchProcess": {
                    "steps": [
                        "Dial the activation code on your MTN line",
                        "Confirm the purchase prompt",
                        "Wait for activation SMS confirmation",
                    ],
                    "estimatedTime": "2-5 minutes",
                },
            }
        )

    return results


@router.post("/savings/calculate")
def calculate_savings(payload: SavingsIn):
    """Calculate savings for switching plans."""

    try:
        return recommendation_service.calculate_savings(payload.currentPlanId, payload.targetPlanId)
    except Exception as exc:  # pragma: no cover - defensive HTTP boundary
        logger.exception("Savings calculation failed")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to calculate savings") from exc
