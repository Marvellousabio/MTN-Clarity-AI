"""Legacy in-memory user memory helper.

This module is retained for compatibility only. Production routes use Cosmos DB
for persisted profile state.
"""

from __future__ import annotations

import threading
from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, List, Optional


@dataclass
class UserProfile:
    """Small in-memory profile used only by older integrations."""

    session_id: str = ""
    name: str = ""
    current_plan: str = ""
    monthly_data_gb: float = 0.0
    monthly_call_minutes: int = 0
    budget_naira: float = 0.0
    segment: str = "individual"
    last_seen: datetime = field(default_factory=datetime.utcnow)
    interested_plans: List[str] = field(default_factory=list)
    conversation_history: List[str] = field(default_factory=list)


class UserMemoryPlugin:
    """Compatibility-only in-memory session store."""

    _store: Dict[str, UserProfile] = {}
    _lock = threading.Lock()

    def save_user_profile(self, session_id: str, name: str, current_plan: str = "",
                          monthly_data_gb: float = 0.0, monthly_call_minutes: int = 0,
                          budget_naira: float = 0.0, segment: str = "individual") -> str:
        """Save or update a user profile in the session store."""
        with self._lock:
            profile = self._store.get(session_id) or UserProfile(session_id=session_id)
            profile.name = name
            profile.current_plan = current_plan or profile.current_plan
            profile.monthly_data_gb = monthly_data_gb or profile.monthly_data_gb
            profile.monthly_call_minutes = monthly_call_minutes or profile.monthly_call_minutes
            profile.budget_naira = budget_naira or profile.budget_naira
            profile.segment = segment or profile.segment
            profile.last_seen = datetime.utcnow()
            self._store[session_id] = profile
        return f"Profile saved for {name}."

    def get_user_profile(self, session_id: str) -> Optional[dict]:
        """Retrieve a user profile by session ID."""
        with self._lock:
            p = self._store.get(session_id)
            return None if p is None else p.__dict__.copy()

    def add_conversation_note(self, session_id: str, note: str) -> str:
        """Add a timestamped note to the conversation history (max 10)."""
        with self._lock:
            if session_id not in self._store:
                self._store[session_id] = UserProfile(session_id=session_id)
            entry = f"[{datetime.utcnow():%H:%M}] {note}"
            self._store[session_id].conversation_history.append(entry)
            if len(self._store[session_id].conversation_history) > 10:
                self._store[session_id].conversation_history.pop(0)
        return "Note added."

    def get_conversation_history(self, session_id: str) -> List[str]:
        """Retrieve the conversation history for a session."""
        with self._lock:
            p = self._store.get(session_id)
            return p.conversation_history.copy() if p and p.conversation_history else []

    def update_plan_interest(self, session_id: str, plan_name: str) -> str:
        """Record user interest in a plan."""
        with self._lock:
            p = self._store.get(session_id)
            if not p:
                return "Session not found. Call save_user_profile first."
            if plan_name not in p.interested_plans:
                p.interested_plans.append(plan_name)
        return f"Noted interest in {plan_name}."
