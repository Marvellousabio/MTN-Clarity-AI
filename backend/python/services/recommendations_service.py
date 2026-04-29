"""Recommendation and savings logic."""

from __future__ import annotations

import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

from .plans_service import PlanService

logger = logging.getLogger(__name__)

WEIGHT_DATA_FIT = 0.35
WEIGHT_COST_EFFICIENCY = 0.30
WEIGHT_CATEGORY_MATCH = 0.20
WEIGHT_FEATURE_FIT = 0.15


@dataclass(slots=True)
class ScoredPlan:
    """Internal scoring result used to rank recommendations."""

    plan: dict[str, Any]
    score: float
    reasons: list[str]
    breakdown: dict[str, float]


class RecommendationService:
    """Generate ranked plan recommendations from live catalog data."""

    def __init__(self, plan_service: PlanService | None = None) -> None:
        self.plan_service = plan_service or PlanService()

    def recommend_plan(
        self,
        monthly_data_gb: float,
        monthly_call_minutes: int,
        monthly_budget_naira: float,
        user_segment: str = "individual",
        number_of_lines: int = 1,
        usage_pattern: str = "work",
    ) -> dict[str, Any]:
        """Return the top ranked plans for the supplied usage profile."""

        plans = self.plan_service.list_plans("all")
        scored = [
            self._score_plan(plan, monthly_data_gb, monthly_call_minutes, monthly_budget_naira, user_segment, usage_pattern)
            for plan in plans
        ]
        scored.sort(key=lambda item: item.score, reverse=True)
        top = scored[:3]

        logger.info(
            "Computed recommendation profile data_gb=%s call_minutes=%s budget=%s segment=%s lines=%s pattern=%s",
            monthly_data_gb,
            monthly_call_minutes,
            monthly_budget_naira,
            user_segment,
            number_of_lines,
            usage_pattern,
        )

        return {
            "user_profile": {
                "monthly_data_gb": monthly_data_gb,
                "monthly_call_minutes": monthly_call_minutes,
                "monthly_budget_naira": monthly_budget_naira,
                "user_segment": user_segment,
                "number_of_lines": number_of_lines,
                "usage_pattern": usage_pattern,
            },
            "top_recommendations": [
                {
                    "plan_name": item.plan.get("name", ""),
                    "plan_id": item.plan.get("id", ""),
                    "total_score": round(item.score, 3),
                    "monthly_price": item.plan.get("monthlyPrice", 0),
                    "data_gb": item.plan.get("dataGB", 0),
                    "call_minutes": item.plan.get("callMinutes", 0),
                    "activation_code": item.plan.get("activationCode", ""),
                    "score_breakdown": item.breakdown,
                    "why_recommended": item.reasons,
                }
                for item in top
            ],
        }

    def calculate_savings(self, current_plan_id: str, target_plan_id: str) -> dict[str, Any]:
        """Calculate monthly and annual savings for a plan switch."""

        current = self.plan_service.get_plan(current_plan_id)
        target = self.plan_service.get_plan(target_plan_id)
        now = datetime.now(timezone.utc)

        if not current or not target:
            return {
                "monthlySavings": 0,
                "annualSavings": 0,
                "dataChange": 0,
                "callChange": 0,
                "smsChange": 0,
                "breakEvenDate": now.isoformat(),
            }

        monthly = round(float(current.get("monthlyPrice", 0)) - float(target.get("monthlyPrice", 0)), 2)
        annual = round(monthly * 12, 2)
        break_even = now + timedelta(days=30)

        return {
            "monthlySavings": monthly,
            "annualSavings": annual,
            "dataChange": round(float(target.get("dataGB", 0)) - float(current.get("dataGB", 0)), 2),
            "callChange": int(target.get("callMinutes", 0) - current.get("callMinutes", 0)),
            "smsChange": int(target.get("smsCount", 0) - current.get("smsCount", 0)),
            "breakEvenDate": break_even.isoformat(),
        }

    def _score_plan(
        self,
        plan: dict[str, Any],
        monthly_data_gb: float,
        monthly_call_minutes: int,
        monthly_budget_naira: float,
        user_segment: str,
        usage_pattern: str,
    ) -> ScoredPlan:
        data_score = self._calculate_data_score(plan, monthly_data_gb)
        cost_score = self._calculate_cost_score(plan, monthly_budget_naira, monthly_data_gb)
        category_score = self._calculate_category_score(plan, user_segment)
        feature_score = self._calculate_feature_score(plan, usage_pattern)

        score = (
            data_score * WEIGHT_DATA_FIT
            + cost_score * WEIGHT_COST_EFFICIENCY
            + category_score * WEIGHT_CATEGORY_MATCH
            + feature_score * WEIGHT_FEATURE_FIT
        )

        reasons = self._build_reasons(plan, monthly_data_gb, monthly_call_minutes, monthly_budget_naira, data_score)
        return ScoredPlan(
            plan=plan,
            score=score,
            reasons=reasons,
            breakdown={
                "data_fit": data_score,
                "cost_efficiency": cost_score,
                "category_match": category_score,
                "feature_fit": feature_score,
            },
        )

    @staticmethod
    def _calculate_data_score(plan: dict[str, Any], data_gb: float) -> float:
        if float(plan.get("dataGB", 0)) <= 0:
            return 0.0
        ratio = min(data_gb / float(plan.get("dataGB", 0)), 1.0)
        return max(0.0, ratio)

    @staticmethod
    def _calculate_cost_score(plan: dict[str, Any], budget: float, data_gb: float) -> float:
        price = float(plan.get("monthlyPrice", 0))
        if price <= 0:
            return 0.0
        if price > budget and budget > 0:
            return max(0.0, 1.0 - ((price - budget) / max(budget, price)))
        price_per_gb = price / max(float(plan.get("dataGB", 0.01)), 0.01)
        ideal_ppg = budget / max(data_gb, 0.01)
        return 1.0 if price_per_gb <= ideal_ppg else max(0.0, ideal_ppg / price_per_gb)

    @staticmethod
    def _calculate_category_score(plan: dict[str, Any], segment: str) -> float:
        return 1.0 if str(plan.get("category", "")).lower() == segment.lower() else 0.5

    @staticmethod
    def _calculate_feature_score(plan: dict[str, Any], usage_pattern: str) -> float:
        features = " ".join(plan.get("features", [])).lower()
        if usage_pattern == "streaming" and "stream" in features:
            return 1.0
        if usage_pattern == "social_media" and any(key in features for key in ("social", "whatsapp", "facebook", "twitter", "tiktok")):
            return 1.0
        if usage_pattern == "calls" and int(plan.get("callMinutes", 0)) > 200:
            return 0.9
        return 0.5

    @staticmethod
    def _build_reasons(
        plan: dict[str, Any],
        data_gb: float,
        call_mins: int,
        budget: float,
        data_score: float,
    ) -> list[str]:
        reasons: list[str] = []
        if float(plan.get("monthlyPrice", 0)) <= budget:
            reasons.append("Within your budget")
        if float(plan.get("dataGB", 0)) >= data_gb:
            reasons.append("Provides enough data")
        if int(plan.get("callMinutes", 0)) >= call_mins:
            reasons.append("Provides enough call minutes")
        if data_score >= 0.9:
            reasons.append("Great data fit")
        if any("rollover" in str(feature).lower() for feature in plan.get("features", [])):
            reasons.append("Has data rollover feature")
        return reasons
