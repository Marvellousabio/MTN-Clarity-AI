from fastapi import APIRouter
from pydantic import BaseModel
from typing import List

router = APIRouter()


class UsageByCategory(BaseModel):
    category: str
    percentage: float
    color: str


class CurrentUsage(BaseModel):
    totalDataUsed: float
    totalCallMinutes: int
    totalSmsSent: int
    usageByCategory: List[UsageByCategory]
    dataBurnRate: str
    projectedOverage: dict


@router.get("/current", response_model=CurrentUsage)
def current_usage():
    return CurrentUsage(
        totalDataUsed=6.2,
        totalCallMinutes=120,
        totalSmsSent=10,
        usageByCategory=[UsageByCategory(category="Social", percentage=62, color="#FF5733")],
        dataBurnRate="High",
        projectedOverage={"data": 1.5, "cost": 200},
    )


@router.get("/history")
def history(period: str = "month", limit: int = 6):
    # stubbed history
    return [
        {"period": "2026-03", "dataUsed": 5.0, "callMinutes": 90, "smsSent": 5, "totalCost": 2300, "planId": "plan-1"}
    ]
