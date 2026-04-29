"""Usage analytics services"""

from __future__ import annotations

import logging
from typing import Any

from .repositories import UsageRepository

logger = logging.getLogger(__name__)


class UsageService:
    """Return usage data from the live analytics store."""

    def __init__(self, repository: UsageRepository | None = None) -> None:
        self.repository = repository or UsageRepository()

    def current_usage(self, user_id: str) -> dict[str, Any]:
        """Fetch the latest usage snapshot for a user."""

        usage = self.repository.latest_usage(user_id)
        if not usage:
            raise LookupError("No usage snapshot is available for this user.")
        return usage

    def history(self, user_id: str, period: str = "month", limit: int = 6) -> list[dict[str, Any]]:
        """Fetch historical usage entries."""

        return self.repository.usage_history(user_id=user_id, period=period, limit=limit)
