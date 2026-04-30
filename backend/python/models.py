"""Shared Pydantic models for compatibility and typed boundaries."""

from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ChatMessage(BaseModel):
    """One chat turn in a session transcript."""

    role: str = "user"  # "user" | "assistant"
    content: str = ""


class ChatRequest(BaseModel):
    """Request body for the legacy chat contract."""

    session_id: str = Field(default_factory=lambda: "")
    message: str = ""
    history: List[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    """Legacy chat response envelope."""

    session_id: str = ""
    message: str = ""
    success: bool = True
    error: Optional[str] = None


class MtnPlan(BaseModel):
    """Canonical MTN plan model used by compatibility layers."""

    model_config = ConfigDict(populate_by_name=True)

    id: str = ""
    name: str = ""
    category: str = ""  # individual | business | youth
    monthly_price: float = Field(default=0.0, alias="monthlyPrice")
    data_gb: float = Field(default=0.0, alias="dataGB")
    call_minutes: int = Field(default=0, alias="callMinutes")
    sms_count: int = Field(default=0, alias="smsCount")
    validity_days: int = Field(default=0, alias="validityDays")
    activation_code: str = Field(default="", alias="activationCode")
    summary: str = ""
    features: List[str] = Field(default_factory=list)
    best_for: str = Field(default="", alias="bestFor")
    limitations: str = ""
    competitors: List[str] = Field(default_factory=list)
    upsell_to: Optional[str] = Field(default=None, alias="upsellTo")
