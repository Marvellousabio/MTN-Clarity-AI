import json
import logging
from pathlib import Path
from typing import List, Dict

try:
    from ..models import MtnPlan
except Exception:
    from models import MtnPlan

logger = logging.getLogger("recommendation_plugin")

# Tunable weights
WEIGHT_DATA_FIT = 0.35
WEIGHT_COST_EFFICIENCY = 0.30
WEIGHT_CATEGORY_MATCH = 0.20
WEIGHT_FEATURE_FIT = 0.15


class PlanScore:
    def __init__(self, plan: MtnPlan, total: float, breakdown: Dict[str, float], reasons: List[str]):
        self.plan = plan
        self.total = total
        self.breakdown = breakdown
        self.reasons = reasons


class RecommendationPlugin:
    def __init__(self, catalog_path: Path | None = None):
        if catalog_path is None:
            base = Path(__file__).resolve()
            candidates = [
                base.parents[3] / "frontend" / "plan-catalog.json",
                base.parents[1] / "data" / "plan-catalog.json",
                base.parents[1] / "Data" / "plan-catalog.json",
            ]
            catalog_path = next((c for c in candidates if c.exists()), candidates[1])

        raw = Path(catalog_path).read_text(encoding="utf-8")
        self._plans: List[MtnPlan] = [MtnPlan(**p) for p in json.loads(raw)]
        logger.info("RecommendationPlugin loaded %d plans", len(self._plans))

    def get_plan(self, plan_id_or_name: str) -> MtnPlan | None:
        target = (plan_id_or_name or "").strip().lower()
        if not target:
            return None
        for plan in self._plans:
            if target == plan.id.lower() or target in plan.name.lower():
                return plan
        return None

    def recommend_plan(self, monthly_data_gb: float, monthly_call_minutes: int, monthly_budget_naira: float,
                       user_segment: str = "individual", number_of_lines: int = 1,
                       usage_pattern: str = "work") -> dict:
        scores: List[PlanScore] = []
        for p in self._plans:
            data_score = self._calculate_data_score(p, monthly_data_gb)
            cost_score = self._calculate_cost_score(p, monthly_budget_naira, monthly_data_gb)
            category_score = self._calculate_category_score(p, user_segment)
            feature_score = self._calculate_feature_score(p, usage_pattern)

            total = (
                data_score * WEIGHT_DATA_FIT
                + cost_score * WEIGHT_COST_EFFICIENCY
                + category_score * WEIGHT_CATEGORY_MATCH
                + feature_score * WEIGHT_FEATURE_FIT
            )

            reasons = self._build_reasons(p, monthly_data_gb, monthly_call_minutes, monthly_budget_naira,
                                          data_score, cost_score)

            scores.append(PlanScore(p, total, {
                "data_fit": data_score,
                "cost_efficiency": cost_score,
                "category_match": category_score,
                "feature_fit": feature_score,
            }, reasons))

        scores.sort(key=lambda s: s.total, reverse=True)
        top = scores[:3]
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
                    "plan_name": s.plan.name,
                    "plan_id": s.plan.id,
                    "total_score": round(s.total, 3),
                    "monthly_price": s.plan.monthly_price,
                    "data_gb": s.plan.data_gb,
                    "call_minutes": s.plan.call_minutes,
                    "activation_code": s.plan.activation_code,
                    "score_breakdown": s.breakdown,
                    "why_recommended": s.reasons,
                }
                for s in top
            ],
        }

    def analyze_overspend(self, current_plan_name: str, actual_data_used_gb: float, actual_call_minutes_used: int) -> dict:
        current = self.get_plan(current_plan_name)
        if not current:
            return {"error": "Plan not found"}

        better = [p for p in self._plans if p.data_gb >= actual_data_used_gb and p.call_minutes >= actual_call_minutes_used and p.monthly_price < current.monthly_price]
        options = sorted(better, key=lambda p: p.monthly_price)[:2]
        return {
            "current_plan": current.model_dump(by_alias=True),
            "alternatives": [
                {
                    "name": p.name,
                    "monthly_price": p.monthly_price,
                    "monthly_saving": round(current.monthly_price - p.monthly_price, 2),
                    "annual_saving": round((current.monthly_price - p.monthly_price) * 12, 2),
                    "activation_code": p.activation_code,
                }
                for p in options
            ],
            "data_utilization_percent": round((actual_data_used_gb / current.data_gb) * 100, 1) if current.data_gb > 0 else None,
            "call_utilization_percent": round((actual_call_minutes_used / current.call_minutes) * 100, 1) if current.call_minutes > 0 else None,
        }

    # ----------------- helpers -----------------
    @staticmethod
    def _calculate_data_score(plan: MtnPlan, data_gb: float) -> float:
        if plan.data_gb <= 0:
            return 0.0
        ratio = min(data_gb / plan.data_gb, 1.0)
        return max(0.0, ratio)

    @staticmethod
    def _calculate_cost_score(plan: MtnPlan, budget: float, data_gb: float) -> float:
        if plan.monthly_price <= 0:
            return 0.0
        if plan.monthly_price > budget and budget > 0:
            return max(0.0, 1.0 - ((plan.monthly_price - budget) / max(budget, plan.monthly_price)))
        # reward lower price per GB
        price_per_gb = plan.monthly_price / max(plan.data_gb, 0.01)
        ideal_ppg = budget / max(data_gb, 0.01)
        return 1.0 if price_per_gb <= ideal_ppg else max(0.0, ideal_ppg / price_per_gb)

    @staticmethod
    def _calculate_category_score(plan: MtnPlan, segment: str) -> float:
        return 1.0 if plan.category.lower() == segment.lower() else 0.5

    @staticmethod
    def _calculate_feature_score(plan: MtnPlan, usage_pattern: str) -> float:
        features = " ".join(plan.features).lower()
        if usage_pattern == "streaming" and "stream" in features:
            return 1.0
        if usage_pattern == "social_media" and any(k in features for k in ("social", "whatsapp", "facebook", "twitter", "tiktok")):
            return 1.0
        if usage_pattern == "calls" and plan.call_minutes > 200:
            return 0.9
        return 0.5

    @staticmethod
    def _build_reasons(plan: MtnPlan, data_gb: float, call_mins: int, budget: float, data_score: float, cost_score: float) -> List[str]:
        reasons = []
        if plan.monthly_price <= budget:
            reasons.append("Within your budget")
        if plan.data_gb >= data_gb:
            reasons.append("Provides enough data")
        if plan.call_minutes >= call_mins:
            reasons.append("Provides enough call minutes")
        if data_score >= 0.9:
            reasons.append("Great data fit")
        if any("rollover" in f.lower() for f in plan.features):
            reasons.append("Has data rollover feature")
        return reasons
