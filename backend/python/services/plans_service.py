"""Plan catalog services."""

from __future__ import annotations

import logging
from typing import Any

from .repositories import PlanRepository

logger = logging.getLogger(__name__)


class PlanService:
    """Provide access to the dynamic MTN plan catalog."""

    def __init__(self, repository: PlanRepository | None = None) -> None:
        self.repository = repository or PlanRepository()

    def list_plans(self, category: str = "all") -> list[dict[str, Any]]:
        """Return plan documents as-is from Cosmos DB."""

        plans = self.repository.list_plans(category)
        logger.info("Loaded %d plans for category=%s", len(plans), category)
        return plans

    def get_plan(self, plan_name_or_id: str) -> dict[str, Any] | None:
        """Resolve a plan by ID or human-readable name."""

        return self.repository.get_plan(plan_name_or_id)

    def compare_plans(self, plan_ids: list[str]) -> list[dict[str, Any]]:
        """Return a filtered list of plans suitable for comparison views."""

        matched: list[dict[str, Any]] = []
        for plan_id in plan_ids:
            plan = self.get_plan(plan_id)
            if plan:
                matched.append(plan)
        return matched

    def activation_message(self, plan_name_or_id: str) -> str | None:
        """Return the activation code in a user-friendly sentence."""

        plan = self.get_plan(plan_name_or_id)
        if not plan:
            return None
        return f"To activate {plan['name']}, dial {plan.get('activationCode', '')} on your MTN line."

    def pidgin_explanation(self, plan_name_or_id: str) -> str | None:
        """Build a dynamic pidgin-friendly summary from live plan data."""

        plan = self.get_plan(plan_name_or_id)
        if not plan:
            return None

        features = "; ".join(plan.get("features", [])) or "No extra features listed."
        return (
            f"{plan['name']} na {plan.get('summary', 'plan info no dey available')}. "
            f"E cost ₦{int(plan.get('monthlyPrice', 0))} for month, e get {plan.get('dataGB', 0)}GB data, "
            f"{plan.get('callMinutes', 0)} minutes, and {plan.get('smsCount', 0)} SMS. "
            f"Best for: {plan.get('bestFor', '')}. Features: {features}. "
            f"Limitations: {plan.get('limitations', '')}. Activation: {plan.get('activationCode', '')}."
        )
