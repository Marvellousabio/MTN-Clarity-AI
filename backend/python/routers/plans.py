from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional

from ..plugins.plan_plugin import PlanPlugin

router = APIRouter()

# Initialize plugin (loads plan-catalog.json from frontend or Data)
plan_plugin = PlanPlugin()


class CompareIn(BaseModel):
    planNames: List[str]


@router.get("/")
def list_plans(category: str = Query("all", description="individual|business|youth|all")):
    return plan_plugin.list_plans_by_category(category)


@router.get("/details/{plan_name}")
def get_plan(plan_name: str):
    details = plan_plugin.get_plan_details(plan_name)
    if not details:
        raise HTTPException(status_code=404, detail="Plan not found")
    return details


@router.post("/compare")
def compare(req: CompareIn):
    csv = ",".join(req.planNames)
    result = plan_plugin.compare_plans(csv)
    if not result:
        raise HTTPException(status_code=404, detail="No matching plans for comparison")
    return {"comparison": {"plans": result}}


@router.get("/activation/{plan_name}")
def activation(plan_name: str):
    code = plan_plugin.get_activation_code(plan_name)
    if not code:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"activation": code}


@router.get("/explain/pidgin/{plan_name}")
def explain_pidgin(plan_name: str):
    text = plan_plugin.explain_plan_in_pidgin(plan_name)
    if not text:
        raise HTTPException(status_code=404, detail="Plan not found")
    return {"pidgin_explanation": text}
