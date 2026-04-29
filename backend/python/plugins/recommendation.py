"""Compatibility wrapper for recommendation behavior.

The live routers use the service layer directly. This module remains as a
compatibility facade for any older imports while avoiding static local stubs.
"""

from __future__ import annotations

from typing import Any

from ..services.recommendations_service import RecommendationService


class RecommendationPlugin:
    """Backward-compatible facade over :class:`RecommendationService`."""

    def __init__(self) -> None:
        self._service = RecommendationService()

    def get_plan(self, plan_id_or_name: str) -> dict[str, Any] | None:
        """Retrieve a plan by ID or name."""
        return self._service.plan_service.get_plan(plan_id_or_name)

    def recommend_plan(
        self,
        monthly_data_gb: float,
        monthly_call_minutes: int,
        monthly_budget_naira: float,
        user_segment: str = "individual",
        number_of_lines: int = 1,
        usage_pattern: str = "work",
    ) -> dict[str, Any]:
        """Generate ranked plan recommendations for the given usage profile."""
        return self._service.recommend_plan(
            monthly_data_gb=monthly_data_gb,
            monthly_call_minutes=monthly_call_minutes,
            monthly_budget_naira=monthly_budget_naira,
            user_segment=user_segment,
            number_of_lines=number_of_lines,
            usage_pattern=usage_pattern,
        )

    def analyze_overspend(self, current_plan_name: str, actual_data_used_gb: float, actual_call_minutes_used: int) -> dict[str, Any]:
        """Analyze usage against the current plan and identify overspend."""
        plan = self._service.plan_service.get_plan(current_plan_name)
        if not plan:
            return {"error": "Plan not found"}

        return {
            "current_plan": plan,
            "alternatives": [],
            "data_utilization_percent": round((actual_data_used_gb / max(float(plan.get("dataGB", 0)), 0.01)) * 100, 1),
            "call_utilization_percent": round((actual_call_minutes_used / max(float(plan.get("callMinutes", 0)), 0.01)) * 100, 1),
        }
