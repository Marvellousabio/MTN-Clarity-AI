"""Plan catalog routes backed by Cosmos DB."""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, Query, status, Depends
from pydantic import BaseModel, Field

try:
    from ..services.plans_service import PlanService
    from ..services.repositories import ProfileRepository, AuthRepository, CosmosRepository
    from ..services.auth_service import AuthService
    from ..routers.auth import get_current_user_id
except Exception:  # pragma: no cover - local execution fallback
    from services.plans_service import PlanService
    from services.repositories import ProfileRepository, AuthRepository, CosmosRepository
    from services.auth_service import AuthService
    from routers.auth import get_current_user_id

router = APIRouter()
logger = logging.getLogger(__name__)
plan_service = PlanService()
profile_repository = ProfileRepository()
auth_repository = AuthRepository()


class CompareIn(BaseModel):
    """Plan comparison request."""

    planIds: list[str] = Field(min_length=1)


class SwitchIn(BaseModel):
    """Plan switch request."""

    planId: str = Field(min_length=1)


class SwitchOut(BaseModel):
    """Plan switch response."""

    user: dict
    message: str


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


@router.post("/switch", response_model=SwitchOut)
def switch_plan(payload: SwitchIn, user_id: str = Depends(get_current_user_id)) -> SwitchOut:
    """Switch the authenticated user's active plan."""

    # Validate plan exists
    plan = plan_service.get_plan(payload.planId)
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")

    # Update auth user record
    auth_user = auth_repository.read(user_id)
    if not auth_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    auth_user["currentPlanId"] = payload.planId
    auth_user["updatedAt"] = CosmosRepository.utc_now()
    auth_repository.upsert(auth_user)

    # Update profile record if exists
    profile = profile_repository.get_profile(user_id)
    if profile:
        profile["currentPlanId"] = payload.planId
        profile["updatedAt"] = CosmosRepository.utc_now()
        profile_repository.upsert(profile)

    logger.info("User %s switched to plan %s", user_id, payload.planId)

    # Return updated public profile
    public_user = AuthService._public_profile(auth_user)
    return SwitchOut(user=public_user, message=f"Successfully switched to {plan.get('name', payload.planId)}")
