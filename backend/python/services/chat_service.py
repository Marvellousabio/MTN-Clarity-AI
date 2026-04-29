"""Azure OpenAI powered chat responses."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

from ..config import get_settings
from .azure_clients import get_azure_clients
from .plans_service import PlanService
from .recommendations_service import RecommendationService

logger = logging.getLogger(__name__)


class ChatService:
    """Generate assistant replies using Azure OpenAI and live application data."""

    def __init__(
        self,
        plan_service: PlanService | None = None,
        recommendation_service: RecommendationService | None = None,
    ) -> None:
        self.plan_service = plan_service or PlanService()
        self.recommendation_service = recommendation_service or RecommendationService(self.plan_service)

    def reply(self, message: str, language: str = "EN", context: dict[str, Any] | None = None) -> dict[str, Any]:
        """Return a chat completion enriched with live plan context."""

        user_profile = (context or {}).get("userProfile") or {}
        recent_messages = (context or {}).get("recentMessages") or []
        message_lower = message.lower().strip()
        evidence: dict[str, Any] = {"language": language, "message": message}

        if any(token in message_lower for token in ("recommend", "best plan", "which plan", "suggest")):
            if not user_profile.get("monthlySpend") and not user_profile.get("currentPlanId"):
                evidence["prompt_hint"] = "Ask for current plan and usage details."
            else:
                evidence["recommendation"] = self.recommendation_service.recommend_plan(
                    monthly_data_gb=float(
                        user_profile.get("monthlyDataGB")
                        or user_profile.get("monthly_data_gb")
                        or user_profile.get("dataGB")
                        or 0
                    ),
                    monthly_call_minutes=int(
                        user_profile.get("monthlyCallMinutes")
                        or user_profile.get("monthly_call_minutes")
                        or 0
                    ),
                    monthly_budget_naira=float(user_profile.get("monthlySpend") or user_profile.get("budgetNaira") or 0),
                    user_segment=str(user_profile.get("segment", "individual")),
                    usage_pattern=str(user_profile.get("usagePattern", "work")),
                )

        if any(token in message_lower for token in ("plan details", "tell me about", "what is")):
            plan_name = self._find_plan_name(message_lower)
            if plan_name:
                evidence["plan_details"] = self.plan_service.get_plan(plan_name)

        prompt = self._build_prompt(message, language, evidence, user_profile, recent_messages)
        content = self._call_azure_openai(prompt)
        return {
            "id": f"msg-{int(datetime.now(timezone.utc).timestamp())}",
            "role": "ai",
            "text": content,
            "timestamp": datetime.now(timezone.utc),
            "suggestions": ["Compare plans", "Show savings", "Explain in pidgin"],
            "actions": self._build_actions(evidence),
        }

    def _call_azure_openai(self, prompt: str) -> str:
        client = get_azure_clients().openai_client()
        response = client.chat.completions.create(
            model=get_settings().azure_openai_deployment,
            messages=[
                {"role": "system", "content": "You are ClarityAI, a concise MTN plan assistant. Answer using the provided live data only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
        )
        return response.choices[0].message.content or "I could not generate a response right now."

    @staticmethod
    def _find_plan_name(message_lower: str) -> str | None:
        for candidate in ("pulse flexi", "pulse plus", "xtravalue", "bizplus starter", "bizplus pro", "bizplus enterprise", "daily 5x5"):
            if candidate in message_lower:
                return candidate
        return None

    @staticmethod
    def _build_prompt(
        message: str,
        language: str,
        evidence: dict[str, Any],
        user_profile: dict[str, Any],
        recent_messages: list[dict[str, Any]],
    ) -> str:
        payload = {
            "language": language,
            "message": message,
            "userProfile": user_profile,
            "recentMessages": recent_messages[-5:],
            "liveEvidence": evidence,
        }
        return json.dumps(payload, ensure_ascii=False, default=str)

    @staticmethod
    def _build_actions(evidence: dict[str, Any]) -> list[dict[str, Any]]:
        actions: list[dict[str, Any]] = []
        if evidence.get("recommendation"):
            top = evidence["recommendation"].get("top_recommendations", [])
            if top:
                actions.append({"type": "recommendation", "plan_id": top[0].get("plan_id", "")})
        if evidence.get("plan_details"):
            actions.append({"type": "details", "plan_id": evidence["plan_details"].get("id", "")})
        return actions
