"""Semantic Kernel orchestration for AI-powered function calling.

This service manages SK kernel initialization, plugin registration, and
invocation of AI-selected tools. It provides a bridge between the traditional
service layer (plans, recommendations) and advanced SK-based orchestration.
"""

from __future__ import annotations

import json
import logging
from typing import Any, Callable

from ..config import get_settings
from .azure_clients import get_azure_clients
from .plans_service import PlanService
from .recommendations_service import RecommendationService

logger = logging.getLogger(__name__)


class KernelService:
    """Manage Semantic Kernel initialization and plugin orchestration."""

    def __init__(
        self,
        plan_service: PlanService | None = None,
        recommendation_service: RecommendationService | None = None,
    ) -> None:
        """Initialize kernel service with dependencies."""
        self.settings = get_settings()
        self.plan_service = plan_service or PlanService()
        self.recommendation_service = recommendation_service or RecommendationService(self.plan_service)
        self._kernel = None
        self._plugins_registered = False

    @property
    def kernel(self):
        """Lazy-load and cache the Semantic Kernel instance."""
        if self._kernel is None:
            try:
                self._kernel = get_azure_clients().semantic_kernel()
                self._register_plugins()
            except ImportError as e:
                logger.warning(f"SK not available, function calling disabled: {e}")
                self._kernel = None
            except Exception as e:
                logger.error(f"Failed to initialize SK kernel: {e}")
                self._kernel = None
        return self._kernel

    def _register_plugins(self) -> None:
        """Register plugin functions as SK native functions."""
        if self._plugins_registered or self._kernel is None:
            return

        try:
            # Register plan-related functions
            self._register_function(
                plugin_name="plan",
                function_name="find_plan",
                description="Retrieve detailed information about a specific MTN plan by name",
                parameters=[
                    {"name": "plan_name", "description": "Name of the plan (e.g., 'Pulse Flexi', 'Pulse Plus')", "required": True}
                ],
                handler=self._plan_find_handler,
            )

            self._register_function(
                plugin_name="plan",
                function_name="list_plans",
                description="List all available MTN plans, optionally filtered by category",
                parameters=[{"name": "category", "description": "Category filter (e.g., 'all', 'individual', 'business')", "required": False}],
                handler=self._plan_list_handler,
            )

            self._register_function(
                plugin_name="plan",
                function_name="compare_plans",
                description="Compare multiple plans side-by-side",
                parameters=[
                    {
                        "name": "plan_names",
                        "description": "Comma-separated list of plan names to compare",
                        "required": True,
                    }
                ],
                handler=self._plan_compare_handler,
            )

            # Register recommendation functions
            self._register_function(
                plugin_name="recommendation",
                function_name="recommend_plan",
                description="Get plan recommendations based on user usage and budget",
                parameters=[
                    {"name": "monthly_data_gb", "description": "Expected monthly data usage in GB", "required": True},
                    {"name": "monthly_call_minutes", "description": "Expected monthly call minutes", "required": True},
                    {"name": "monthly_budget_naira", "description": "Monthly budget in Nigerian Naira", "required": True},
                    {"name": "user_segment", "description": "User segment: 'individual' or 'business'", "required": False},
                    {"name": "usage_pattern", "description": "Usage pattern: 'work', 'personal', or 'mixed'", "required": False},
                ],
                handler=self._recommendation_recommend_handler,
            )

            self._register_function(
                plugin_name="recommendation",
                function_name="analyze_overspend",
                description="Analyze current plan usage and identify overspend situations",
                parameters=[
                    {"name": "current_plan_name", "description": "Name of the user's current plan", "required": True},
                    {"name": "actual_data_used_gb", "description": "Actual data used in GB", "required": True},
                    {"name": "actual_call_minutes_used", "description": "Actual call minutes used", "required": True},
                ],
                handler=self._recommendation_analyze_handler,
            )

            self._plugins_registered = True
            logger.info("SK plugins registered successfully")

        except Exception as e:
            logger.error(f"Failed to register SK plugins: {e}")

    def _register_function(
        self,
        plugin_name: str,
        function_name: str,
        description: str,
        parameters: list[dict[str, Any]],
        handler: Callable,
    ) -> None:
        """Register a native function with the kernel.

        Args:
            plugin_name: Logical plugin namespace
            function_name: Function identifier
            description: Human-readable function description
            parameters: List of parameter specs with name, description, required
            handler: Async or sync callable to invoke
        """
        if self._kernel is None:
            return

        try:
            from semantic_kernel.functions import kernel_function

            # Wrap handler as a kernel function
            # Note: SK natively handles both sync and async handlers
            func = kernel_function(
                description=description,
                name=function_name,
            )(handler)

            # Add to kernel - SK manages plugin namespacing
            self._kernel.add_function(plugin_name=plugin_name, function=func)
            logger.debug(f"Registered {plugin_name}.{function_name}")

        except Exception as e:
            logger.error(f"Failed to register {plugin_name}.{function_name}: {e}")

    # ─────────────────────────────────────────────────────────────────
    # Plan Plugin Handlers
    # ─────────────────────────────────────────────────────────────────

    def _plan_find_handler(self, plan_name: str) -> str:
        """Handler for plan.find_plan."""
        try:
            result = self.plan_service.get_plan(plan_name)
            return json.dumps(result or {"error": f"Plan '{plan_name}' not found"})
        except Exception as e:
            return json.dumps({"error": str(e)})

    def _plan_list_handler(self, category: str = "all") -> str:
        """Handler for plan.list_plans."""
        try:
            result = self.plan_service.list_plans(category)
            return json.dumps(result)
        except Exception as e:
            return json.dumps({"error": str(e)})

    def _plan_compare_handler(self, plan_names: str) -> str:
        """Handler for plan.compare_plans."""
        try:
            names = [n.strip() for n in plan_names.split(",") if n.strip()]
            result = self.plan_service.compare_plans(names)
            return json.dumps(result)
        except Exception as e:
            return json.dumps({"error": str(e)})

    # ─────────────────────────────────────────────────────────────────
    # Recommendation Plugin Handlers
    # ─────────────────────────────────────────────────────────────────

    def _recommendation_recommend_handler(
        self,
        monthly_data_gb: str,
        monthly_call_minutes: str,
        monthly_budget_naira: str,
        user_segment: str = "individual",
        usage_pattern: str = "work",
    ) -> str:
        """Handler for recommendation.recommend_plan."""
        try:
            result = self.recommendation_service.recommend_plan(
                monthly_data_gb=float(monthly_data_gb),
                monthly_call_minutes=int(monthly_call_minutes),
                monthly_budget_naira=float(monthly_budget_naira),
                user_segment=user_segment,
                usage_pattern=usage_pattern,
            )
            return json.dumps(result)
        except Exception as e:
            return json.dumps({"error": str(e)})

    def _recommendation_analyze_handler(
        self,
        current_plan_name: str,
        actual_data_used_gb: str,
        actual_call_minutes_used: str,
    ) -> str:
        """Handler for recommendation.analyze_overspend."""
        try:
            plan = self.plan_service.get_plan(current_plan_name)
            if not plan:
                return json.dumps({"error": f"Plan '{current_plan_name}' not found"})

            data_gb = float(actual_data_used_gb)
            call_min = int(actual_call_minutes_used)
            data_limit = float(plan.get("dataGB", 1))
            call_limit = float(plan.get("callMinutes", 1))

            result = {
                "current_plan": plan,
                "data_utilization_percent": round((data_gb / max(data_limit, 0.01)) * 100, 1),
                "call_utilization_percent": round((call_min / max(call_limit, 0.01)) * 100, 1),
                "overspend_alert": data_gb > data_limit or call_min > call_limit,
            }
            return json.dumps(result)
        except Exception as e:
            return json.dumps({"error": str(e)})

    def is_enabled(self) -> bool:
        """Check if SK is available and enabled."""
        return self.settings.semantic_kernel_enabled and self.kernel is not None
