"""Compatibility wrapper for plan-related behavior.

The production routers use the service layer directly. This wrapper exists so
older imports keep working while still sourcing data from the live Azure-backed
services.
"""

from __future__ import annotations

from typing import Any

from ..services.plans_service import PlanService


class PlanPlugin:
    """Backward-compatible facade over :class:`PlanService`."""

    def __init__(self) -> None:
        self._service = PlanService()

    def find_plan(self, name: str) -> dict[str, Any] | None:
        return self._service.get_plan(name)

    def get_plan_details(self, plan_name: str) -> dict[str, Any] | None:
        return self._service.get_plan(plan_name)

    def list_plans_by_category(self, category: str = "all") -> list[dict[str, Any]]:
        return self._service.list_plans(category)

    def compare_plans(self, plan_names_csv: str) -> list[dict[str, Any]]:
        names = [n.strip() for n in plan_names_csv.split(",") if n.strip()]
        return self._service.compare_plans(names)

    def get_activation_code(self, plan_name: str) -> str | None:
        return self._service.activation_message(plan_name)

    def explain_plan_in_pidgin(self, plan_name: str) -> str | None:
        return self._service.pidgin_explanation(plan_name)
