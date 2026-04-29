from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional

router = APIRouter()


class Plan(BaseModel):
    id: str
    name: str
    category: str
    monthlyCost: float
    dataGB: float
    callMinutes: int
    smsCount: int
    validityDays: int
    activationCode: str
    summary: str
    features: List[str]
    bestFor: Optional[str]
    limitations: Optional[str]
    competitors: List[str]
    upsellTo: Optional[str]
    matchScore: float


PLANS = [
    Plan(
        id="plan-1",
        name="Pulse Plus",
        category="pulse",
        monthlyCost=3000.0,
        dataGB=10.0,
        callMinutes=300,
        smsCount=50,
        validityDays=30,
        activationCode="*123#",
        summary="Balanced plan for social users",
        features=["Social bundles", "Discounts"],
        bestFor="Social apps",
        limitations=None,
        competitors=["Competitor A"],
        upsellTo=None,
        matchScore=0.8,
    )
]


@router.get("/", response_model=List[Plan])
def list_plans():
    return PLANS


@router.get("/{plan_id}", response_model=Plan)
def get_plan(plan_id: str):
    for p in PLANS:
        if p.id == plan_id:
            return p
    raise HTTPException(status_code=404, detail="Plan not found")


class CompareIn(BaseModel):
    planIds: List[str]


@router.post("/compare")
def compare(req: CompareIn):
    selected = [p for p in PLANS if p.id in req.planIds]
    return {"comparison": {"features": ["dataGB", "monthlyCost"], "plans": [p.dict() for p in selected], "highlightedDifferences": [], "recommendation": {"recommendedPlanId": selected[0].id if selected else None, "reason": "Best match", "savings": 0}}}
