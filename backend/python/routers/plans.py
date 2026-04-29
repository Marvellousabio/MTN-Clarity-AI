"""Plan catalog routes backed by Cosmos DB."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, status
from pydantic import BaseModel, Field

try:
    from ..services.plans_service import PlanService
except Exception:  # pragma: no cover - local execution fallback
    from services.plans_service import PlanService

router = APIRouter()
logger = logging.getLogger(__name__)
plan_service = PlanService()


class CompareIn(BaseModel):
    """Plan comparison payload."""

    planIds: list[str] = Field(min_length=1)


@router.get("/")
def list_plans(category: str = Query("all", description="individual|business|youth|all")) -> list[dict]:
    """Return the live catalog of plans."""

    return plan_service.list_plans(category)


@router.get("/details/{plan_name}")
def get_plan(plan_name: str) -> dict:
    """Return a single plan document."""

    details = plan_service.get_plan(plan_name)
    if not details:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return details


@router.post("/compare")
def compare(req: CompareIn) -> dict:
    """Compare multiple plans side by side."""

    result = plan_service.compare_plans(req.planIds)
    if not result:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No matching plans for comparison")

    features = ["monthlyCost", "dataGB", "callMinutes", "smsCount", "validityDays"]
    plans_out = [
        {
            "planId": plan.get("id"),
            "values": [
                plan.get("monthlyPrice"),
                plan.get("dataGB"),
                plan.get("callMinutes"),
                plan.get("smsCount"),
                plan.get("validityDays"),
            ],
        }
        for plan in result
    ]
    recommended = max(result, key=lambda plan: (float(plan.get("dataGB", 0)), -float(plan.get("monthlyPrice", 0))))

    return {
        "comparison": {
            "features": features,
            "plans": plans_out,
            "highlightedDifferences": ["Price", "Data allowance", "Call minutes"],
            "recommendation": {
                "recommendedPlanId": recommended.get("id"),
                "reason": "Best balance of data value and included calls among selected plans.",
                "savings": 0,
            },
        }
    }


@router.get("/activation/{plan_name}")
def activation(plan_name: str) -> dict[str, str]:
    """Return the activation message for a plan."""

    code = plan_service.activation_message(plan_name)
    if not code:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return {"activation": code}


@router.get("/explain/pidgin/{plan_name}")
def explain_pidgin(plan_name: str) -> dict[str, str]:
    """Return a pidgin-friendly plan explanation."""

    text = plan_service.pidgin_explanation(plan_name)
    if not text:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return {"pidgin_explanation": text}
