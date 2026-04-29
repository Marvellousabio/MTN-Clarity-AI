"""Azure OpenAI powered chat responses with optional Semantic Kernel orchestration."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any

from ..config import get_settings
from .azure_clients import get_azure_clients
from .kernel_service import KernelService
from .plans_service import PlanService
from .recommendations_service import RecommendationService
from .repositories import ChatSessionRepository

logger = logging.getLogger(__name__)


class ChatService:
    """Generate assistant replies using Azure OpenAI and live application data.
    
    When Semantic Kernel is enabled and available, uses SK for function calling
    orchestration with intelligent tool selection. Falls back to direct Azure OpenAI
    calls for safety and backward compatibility.
    """

    def __init__(
        self,
        plan_service: PlanService | None = None,
        recommendation_service: RecommendationService | None = None,
        kernel_service: KernelService | None = None,
    ) -> None:
        self.plan_service = plan_service or PlanService()
        self.recommendation_service = recommendation_service or RecommendationService(self.plan_service)
        self.kernel_service = kernel_service or KernelService(self.plan_service, self.recommendation_service)
        self.chat_sessions = ChatSessionRepository()

    def reply(self, message: str, language: str = "EN", context: dict[str, Any] | None = None, session_id: str = "") -> dict[str, Any]:
        """Return a chat completion enriched with live plan context.
        
        Args:
            message: User message
            language: Response language code (default EN)
            context: User profile and recent message context
            session_id: Optional session ID for memory persistence
            
        Returns:
            Chat response dict with id, role, text, timestamp, suggestions, actions
        """
        user_profile = (context or {}).get("userProfile") or {}
        recent_messages = (context or {}).get("recentMessages") or []
        message_lower = message.lower().strip()
        evidence: dict[str, Any] = {"language": language, "message": message}

        # Persist message to session if ID provided
        if session_id:
            self.chat_sessions.add_message(session_id, "user", message, user_id=user_profile.get("userId", ""))

        # Traditional heuristic routing for backward compatibility
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

        # Try SK-based orchestration if enabled, fall back to direct call
        try:
            if get_settings().semantic_kernel_enabled and self.kernel_service.is_enabled():
                logger.debug("Using SK function-calling orchestration")
                content = self._call_with_kernel(message, language, evidence, user_profile, recent_messages)
                sk_invoked = True
            else:
                logger.debug("SK disabled, using direct Azure OpenAI")
                content = self._call_azure_openai_direct(message, language, evidence, user_profile, recent_messages)
                sk_invoked = False
        except Exception as e:
            logger.warning(f"SK orchestration failed, falling back to direct call: {e}")
            content = self._call_azure_openai_direct(message, language, evidence, user_profile, recent_messages)
            sk_invoked = False

        response = {
            "id": f"msg-{int(datetime.now(timezone.utc).timestamp())}",
            "role": "ai",
            "text": content,
            "timestamp": datetime.now(timezone.utc),
            "suggestions": ["Compare plans", "Show savings", "Explain in pidgin"],
            "actions": self._build_actions(evidence),
            "_sk_invoked": sk_invoked,  # Observability: track which path was used
        }

        # Persist response to session
        if session_id:
            self.chat_sessions.add_message(session_id, "ai", content, user_id=user_profile.get("userId", ""))

        return response

    def _call_with_kernel(
        self,
        message: str,
        language: str,
        evidence: dict[str, Any],
        user_profile: dict[str, Any],
        recent_messages: list[dict[str, Any]],
    ) -> str:
        """Invoke SK kernel with function-calling orchestration.
        
        The kernel decides which tools to call and chains their outputs
        into a coherent assistant response.
        """
        try:
            kernel = self.kernel_service.kernel
            if not kernel:
                raise RuntimeError("Kernel not available")

            # Build context for the kernel's decision-making
            context_summary = self._build_context_summary(user_profile, recent_messages, evidence)
            
            # Prepare SK prompt that guides function selection
            sk_prompt = f"""
You are ClarityAI, an MTN plan assistant. Use the available functions to help the user.

User message: {message}
Language: {language}
Context: {context_summary}

Based on the user message, decide which functions to call (if any) to provide the best answer.
Always respond in the requested language. Use only live data from the functions.
Keep responses concise and helpful.
"""

            # Invoke kernel with auto function calling
            # SK's auto-invoke feature will call functions and include results
            from semantic_kernel.contents import ChatHistory

            chat_history = ChatHistory()
            chat_history.add_system_message("You are ClarityAI, an MTN plan assistant.")
            chat_history.add_user_message(sk_prompt)

            response = kernel.invoke_prompt(sk_prompt)
            
            # Extract content from response
            if hasattr(response, 'value'):
                return response.value or "I could not generate a response."
            elif isinstance(response, str):
                return response
            else:
                return str(response) or "I could not generate a response."

        except Exception as e:
            logger.error(f"SK invocation failed: {e}")
            raise

    def _call_azure_openai_direct(
        self,
        message: str,
        language: str,
        evidence: dict[str, Any],
        user_profile: dict[str, Any],
        recent_messages: list[dict[str, Any]],
    ) -> str:
        """Call Azure OpenAI directly without SK orchestration."""
        prompt = self._build_prompt(message, language, evidence, user_profile, recent_messages)
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
    def _build_context_summary(user_profile: dict[str, Any], recent_messages: list[dict[str, Any]], evidence: dict[str, Any]) -> str:
        """Build a concise context summary for SK's decision-making."""
        profile_keys = ["currentPlanId", "monthlyDataGB", "monthlyCallMinutes", "monthlySpend", "segment"]
        profile_summary = {k: user_profile.get(k) for k in profile_keys if k in user_profile}
        
        return json.dumps({
            "user_profile": profile_summary,
            "recent_message_count": len(recent_messages),
            "evidence": evidence,
        }, ensure_ascii=False, default=str)

    @staticmethod
    def _find_plan_name(message_lower: str) -> str | None:
        """Detect known plan names in a message."""
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
        """Construct the JSON prompt for Azure OpenAI."""
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
        """Build action suggestions based on detected evidence."""
        actions: list[dict[str, Any]] = []
        if evidence.get("recommendation"):
            top = evidence["recommendation"].get("top_recommendations", [])
            if top:
                actions.append({"type": "recommendation", "plan_id": top[0].get("plan_id", "")})
        if evidence.get("plan_details"):
            actions.append({"type": "details", "plan_id": evidence["plan_details"].get("id", "")})
        return actions
