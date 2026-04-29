from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class UserOut(BaseModel):
    id: str
    name: str
    currentPlanId: str
    monthlySpend: float
    dataBurnRate: str
    heavySocialUsage: bool
    preferredLanguage: str
    createdAt: datetime
    updatedAt: datetime


@router.get("/profile", response_model=UserOut)
def profile():
    now = datetime.utcnow()
    return UserOut(
        id="user-1",
        name="Demo User",
        currentPlanId="plan-1",
        monthlySpend=2500.0,
        dataBurnRate="Medium",
        heavySocialUsage=True,
        preferredLanguage="EN",
        createdAt=now,
        updatedAt=now,
    )
