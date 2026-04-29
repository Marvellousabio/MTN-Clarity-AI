from pydantic import BaseModel, Field
from typing import List, Optional


class ChatMessage(BaseModel):
    role: str = "user"  # "user" | "assistant"
    content: str = ""


class ChatRequest(BaseModel):
    session_id: str = Field(default_factory=lambda: "")
    message: str = ""
    history: List[ChatMessage] = []


class ChatResponse(BaseModel):
    session_id: str = ""
    message: str = ""
    success: bool = True
    error: Optional[str] = None


class MtnPlan(BaseModel):
    id: str = ""
    name: str = ""
    category: str = ""  # individual | business | youth
    monthly_price: float = 0.0
    data_gb: float = 0.0
    call_minutes: int = 0
    sms_count: int = 0
    validity_days: int = 0
    activation_code: str = ""
    summary: str = ""
    features: List[str] = []
    best_for: str = ""
    limitations: str = ""
    competitors: List[str] = []
    upsell_to: Optional[str] = None
