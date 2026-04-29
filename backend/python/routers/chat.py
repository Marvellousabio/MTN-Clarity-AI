from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

try:
    from ..plugins.plan import PlanPlugin
    from ..plugins.recommendation import RecommendationPlugin
    from ..plugins.user_memory import UserMemoryPlugin
except Exception:
    from backend.python.plugins.plan import PlanPlugin
    from backend.python.plugins.recommendation import RecommendationPlugin
    from backend.python.plugins.user_memory import UserMemoryPlugin

router = APIRouter()

# initialize plugins
plan_plugin = PlanPlugin()
recommendation_plugin = RecommendationPlugin()
user_memory = UserMemoryPlugin()


class RecentMessage(BaseModel):
    role: str
    text: str
    timestamp: datetime


class ChatContext(BaseModel):
    userProfile: dict
    recentMessages: Optional[List[RecentMessage]] = None


class ChatIn(BaseModel):
    message: str
    language: str = "EN"
    context: Optional[ChatContext] = None


class ChatOut(BaseModel):
    id: str
    role: str
    text: str
    timestamp: datetime
    suggestions: Optional[List[str]] = None
    actions: Optional[List[dict]] = None


@router.post("/message", response_model=ChatOut)
def send_message(req: ChatIn):
    now = datetime.utcnow()
    msg = req.message.strip()

    # Try to load session/profile from context
    session_id = ""
    if req.context and isinstance(req.context.userProfile, dict):
        session_id = req.context.userProfile.get("session_id") or req.context.userProfile.get("id") or ""

    profile = user_memory.get_user_profile(session_id) if session_id else None

    # Intent: recommendation
    lower = msg.lower()
    if any(k in lower for k in ("recommend", "best plan", "which plan", "suggest")):
        # Check for required fields: current plan, monthly data, budget
        if profile and profile.get("monthly_data_gb") and profile.get("budget_naira"):
            rec = recommendation_plugin.recommend_plan(
                monthly_data_gb=profile.get("monthly_data_gb", 0),
                monthly_call_minutes=profile.get("monthly_call_minutes", 0),
                monthly_budget_naira=profile.get("budget_naira", 0),
                user_segment=profile.get("segment", "individual"),
            )
            top = rec.get("top_recommendations", [])
            if top:
                first = top[0]
                text = f"I recommend {first['plan_name']} — ₦{first['monthly_price']}/month for {first['data_gb']}GB. Dial {first['activation_code']} to activate."
                actions = [{"type": "recommendation", "plan_id": first["plan_id"]}]
                return ChatOut(id="msg-1", role="ai", text=text, timestamp=now, suggestions=["Compare plans", "Save this plan"], actions=actions)
        # not enough info
        return ChatOut(id="msg-1", role="ai", text="I can recommend a plan — can you tell me (1) your current plan, (2) monthly data used (GB) and (3) your monthly budget in Naira?", timestamp=now, suggestions=["My current plan is...", "I use 8GB/month", "My budget is ₦3500"])

    # Intent: plan details
    if any(k in lower for k in ("tell me about", "plan details", "what does", "what is")):
        # try to extract a plan id word
        # naive approach: check each known plan name in message
        for p in plan_plugin._plans:
            if p.name.lower() in lower or p.id.lower() in lower:
                details = plan_plugin.get_plan_details(p.name)
                text = f"{p.name}: {p.summary} Price: ₦{int(p.monthly_price)}/month, Data: {p.data_gb}GB, Calls: {p.call_minutes} mins. Dial {p.activation_code} to activate."
                return ChatOut(id="msg-1", role="ai", text=text, timestamp=now, suggestions=["Compare with another plan", "Explain in pidgin"], actions=[{"type": "details", "plan_id": p.id}])

    # Intent: activation code request
    if "activation" in lower or "activate" in lower or "dial" in lower:
        for p in plan_plugin._plans:
            if p.name.lower() in lower or p.id.lower() in lower:
                code = plan_plugin.get_activation_code(p.name)
                return ChatOut(id="msg-1", role="ai", text=code or "Not found", timestamp=now, suggestions=["Thanks"], actions=[])

    # fallback echo
    return ChatOut(id="msg-1", role="ai", text=f"Received: {req.message}", timestamp=now, suggestions=["Tell me about savings", "How do I switch plans"], actions=[])


# ----- Profile endpoints -----
class SaveProfileIn(BaseModel):
    session_id: str
    name: str
    current_plan: Optional[str] = ""
    monthly_data_gb: Optional[float] = 0.0
    monthly_call_minutes: Optional[int] = 0
    budget_naira: Optional[float] = 0.0
    segment: Optional[str] = "individual"


@router.post("/profile/save")
def save_profile(req: SaveProfileIn):
    msg = user_memory.save_user_profile(
        req.session_id,
        req.name,
        current_plan=req.current_plan or "",
        monthly_data_gb=req.monthly_data_gb or 0.0,
        monthly_call_minutes=req.monthly_call_minutes or 0,
        budget_naira=req.budget_naira or 0.0,
        segment=req.segment or "individual",
    )
    return {"message": msg}


@router.get("/profile/{session_id}")
def get_profile(session_id: str):
    p = user_memory.get_user_profile(session_id)
    if not p:
        return {"error": "NO_PROFILE_FOUND"}
    return p


# ----- Recommendation endpoints -----
class RecommendIn(BaseModel):
    monthly_data_gb: float
    monthly_call_minutes: int
    monthly_budget_naira: float
    user_segment: Optional[str] = "individual"
    number_of_lines: Optional[int] = 1
    usage_pattern: Optional[str] = "work"


@router.post("/recommend")
def recommend(req: RecommendIn):
    res = recommendation_plugin.recommend_plan(
        monthly_data_gb=req.monthly_data_gb,
        monthly_call_minutes=req.monthly_call_minutes,
        monthly_budget_naira=req.monthly_budget_naira,
        user_segment=req.user_segment or "individual",
        number_of_lines=req.number_of_lines or 1,
        usage_pattern=req.usage_pattern or "work",
    )
    return res


class AnalyzeIn(BaseModel):
    current_plan_name: str
    actual_data_used_gb: float
    actual_call_minutes_used: int


@router.post("/analyze_overspend")
def analyze_overspend(req: AnalyzeIn):
    res = recommendation_plugin.analyze_overspend(
        req.current_plan_name,
        req.actual_data_used_gb,
        req.actual_call_minutes_used,
    )
    return res
