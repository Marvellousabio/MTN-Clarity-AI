import json
import logging
from pathlib import Path
from typing import List, Optional

from ..models import MtnPlan

logger = logging.getLogger("plan_plugin")


class PlanPlugin:
    def __init__(self, catalog_path: Optional[Path] = None):
        # Locate frontend plan-catalog.json if no explicit path provided
        if catalog_path is None:
            base = Path(__file__).resolve().parents[1]
            candidate = base / "frontend" / "plan-catalog.json"
            if not candidate.exists():
                candidate = base / "Data" / "plan-catalog.json"
            catalog_path = candidate

        self._catalog_path = Path(catalog_path)
        if not self._catalog_path.exists():
            raise FileNotFoundError(f"Plan catalog not found at {self._catalog_path}")

        raw = self._catalog_path.read_text(encoding="utf-8")
        self._plans: List[MtnPlan] = [MtnPlan(**p) for p in json.loads(raw)]
        logger.info("Loaded %d plans from %s", len(self._plans), self._catalog_path)

    def find_plan(self, name: str) -> Optional[MtnPlan]:
        name = name.strip()
        if not name:
            return None
        for p in self._plans:
            if name.lower() in p.name.lower() or name.lower() == p.id.lower():
                return p
        return None

    def get_plan_details(self, plan_name: str) -> Optional[dict]:
        plan = self.find_plan(plan_name)
        return plan.dict() if plan else None

    def list_plans_by_category(self, category: str = "all") -> List[dict]:
        c = category.lower()
        if c == "all":
            filtered = self._plans
        else:
            filtered = [p for p in self._plans if p.category.lower() == c]

        return [
            {
                "id": p.id,
                "name": p.name,
                "category": p.category,
                "monthly_price": p.monthly_price,
                "data_gb": p.data_gb,
                "summary": p.summary,
                "activation_code": p.activation_code,
            }
            for p in filtered
        ]

    def compare_plans(self, plan_names_csv: str) -> List[dict]:
        names = [n.strip() for n in plan_names_csv.split(",") if n.strip()]
        matched = [p for p in self._plans if any(n.lower() in p.name.lower() or n.lower() == p.id.lower() for n in names)]
        return [p.dict() for p in matched]

    def get_activation_code(self, plan_name: str) -> Optional[str]:
        plan = self.find_plan(plan_name)
        if not plan:
            return None
        return f"To activate {plan.name}, dial {plan.activation_code} on your MTN line."

    def explain_plan_in_pidgin(self, plan_name: str) -> Optional[str]:
        plan = self.find_plan(plan_name)
        if not plan:
            return None
        # Return a compact structured string; presentation layer/LLM can rephrase
        return (
            f"PLAN_DATA_FOR_PIDGIN_EXPLANATION:\n"
            f"Name: {plan.name}\n"
            f"Price: ₦{int(plan.monthly_price)} per month\n"
            f"Data: {plan.data_gb}GB\n"
            f"Calls: {plan.call_minutes} minutes\n"
            f"SMS: {plan.sms_count}\n"
            f"Best for: {plan.best_for}\n"
            f"Key features: {'; '.join(plan.features)}\n"
            f"Limitations: {plan.limitations}\n"
            f"Activation: {plan.activation_code}\n"
        )
