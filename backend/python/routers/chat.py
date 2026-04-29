from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()


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
    # simple echo-style response stub
    now = datetime.utcnow()
    resp = ChatOut(
        id="msg-1",
        role="ai",
        text=f"Received: {req.message}",
        timestamp=now,
        suggestions=["Tell me about savings", "How do I switch plans"],
        actions=[],
    )
    return resp
