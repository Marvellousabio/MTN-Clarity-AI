from datetime import datetime, timedelta

from fastapi import APIRouter
from pydantic import BaseModel

try:
    from ..plugins.recommendation import RecommendationPlugin
except Exception:
    from backend.python.plugins.recommendation import RecommendationPlugin

router = APIRouter()
recommendation_plugin = RecommendationPlugin()


@router.get("/recommendations")
def get_recommendations(
    monthlyDataGB: float = 6.0,
    monthlyCallMinutes: int = 120,
    monthlyBudget: float = 3000.0,
    userSegment: str = "individual",
    currentPlanId: str | None = None,
):
    current_plan = recommendation_plugin.get_plan(currentPlanId or "") if currentPlanId else None
    current_cost = current_plan.monthly_price if current_plan else monthlyBudget

    rec = recommendation_plugin.recommend_plan(
        monthly_data_gb=monthlyDataGB,
        monthly_call_minutes=monthlyCallMinutes,
        monthly_budget_naira=monthlyBudget,
        user_segment=userSegment,
    )

    out = []
    for item in rec.get("top_recommendations", []):
        estimated_cost = float(item.get("monthly_price", 0))
        estimated_savings = round(max(current_cost - estimated_cost, 0), 2)
        out.append(
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

    return out


class SavingsIn(BaseModel):
    currentPlanId: str
    targetPlanId: str


@router.post("/savings/calculate")
def calculate_savings(payload: SavingsIn):
    current = recommendation_plugin.get_plan(payload.currentPlanId)
    target = recommendation_plugin.get_plan(payload.targetPlanId)

    if not current or not target:
        return {
            "monthlySavings": 0,
            "annualSavings": 0,
            "dataChange": 0,
            "callChange": 0,
            "smsChange": 0,
            "breakEvenDate": datetime.utcnow().isoformat() + "Z",
        }

    monthly = round(current.monthly_price - target.monthly_price, 2)
    annual = round(monthly * 12, 2)
    break_even = datetime.utcnow() + timedelta(days=30)

    return {
        "monthlySavings": monthly,
        "annualSavings": annual,
        "dataChange": round(target.data_gb - current.data_gb, 2),
        "callChange": int(target.call_minutes - current.call_minutes),
        "smsChange": int(target.sms_count - current.sms_count),
        "breakEvenDate": break_even.isoformat() + "Z",
    }
