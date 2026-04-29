"""Cosmos DB repositories used by the backend services."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from functools import cached_property
from typing import Any, Iterable

from azure.cosmos import PartitionKey

from ..config import get_settings
from .azure_clients import get_azure_clients

logger = logging.getLogger(__name__)


class CosmosRepository:
    """Base class for Cosmos DB repositories.

    The repository assumes documents use ``id`` as the partition key. This keeps
    reads and writes simple and works well for the low-to-moderate document sizes
    used by this application.
    """

    def __init__(self, container_name: str) -> None:
        self.settings = get_settings()
        self.container_name = container_name

    @cached_property
    def container(self):
        """Create or reuse the backing Cosmos container."""

        client = get_azure_clients().cosmos_client()
        database = client.create_database_if_not_exists(self.settings.cosmos_database)
        return database.create_container_if_not_exists(
            id=self.container_name,
            partition_key=PartitionKey(path="/id"),
        )

    @staticmethod
    def utc_now() -> str:
        """Return an ISO 8601 UTC timestamp."""

        return datetime.now(timezone.utc).isoformat()

    def upsert(self, document: dict[str, Any]) -> dict[str, Any]:
        """Insert or update a Cosmos document."""

        return self.container.upsert_item(document)

    def read(self, item_id: str) -> dict[str, Any] | None:
        """Read a document by its ``id`` field."""

        try:
            return self.container.read_item(item=item_id, partition_key=item_id)
        except Exception:
            return None

    def query(self, query: str, parameters: Iterable[dict[str, Any]] | None = None) -> list[dict[str, Any]]:
        """Run a Cosmos SQL query and return all matching documents."""

        items = self.container.query_items(query=query, parameters=list(parameters or []), enable_cross_partition_query=True)
        return list(items)


class PlanRepository(CosmosRepository):
    """Read plan catalog data from Cosmos DB."""

    def __init__(self) -> None:
        super().__init__(get_settings().cosmos_plans_container)

    def list_plans(self, category: str = "all") -> list[dict[str, Any]]:
        if category.lower() == "all":
            return self.query("SELECT * FROM c")
        return self.query(
            "SELECT * FROM c WHERE LOWER(c.category) = @category",
            [{"name": "@category", "value": category.lower()}],
        )

    def get_plan(self, identifier: str) -> dict[str, Any] | None:
        identifier = (identifier or "").strip()
        if not identifier:
            return None

        exact = self.read(identifier)
        if exact:
            return exact

        matches = self.query(
            "SELECT * FROM c WHERE LOWER(c.id) = @identifier OR LOWER(c.name) = @identifier",
            [{"name": "@identifier", "value": identifier.lower()}],
        )
        return matches[0] if matches else None


class ProfileRepository(CosmosRepository):
    """Persist user profile documents."""

    def __init__(self) -> None:
        super().__init__(get_settings().cosmos_profiles_container)

    def get_profile(self, profile_id: str) -> dict[str, Any] | None:
        return self.read(profile_id)

    def save_profile(self, profile: dict[str, Any]) -> dict[str, Any]:
        profile.setdefault("id", profile.get("userId") or profile.get("sessionId"))
        profile.setdefault("updatedAt", self.utc_now())
        profile.setdefault("createdAt", profile["updatedAt"])
        return self.upsert(profile)


class UsageRepository(CosmosRepository):
    """Read usage snapshots from Cosmos DB."""

    def __init__(self) -> None:
        super().__init__(get_settings().cosmos_usage_container)

    def latest_usage(self, user_id: str) -> dict[str, Any] | None:
        results = self.query(
            "SELECT * FROM c WHERE c.userId = @user_id ORDER BY c.timestamp DESC",
            [{"name": "@user_id", "value": user_id}],
        )
        return results[0] if results else None

    def usage_history(self, user_id: str, period: str = "month", limit: int = 6) -> list[dict[str, Any]]:
        results = self.query(
            "SELECT * FROM c WHERE c.userId = @user_id AND c.periodType = @period ORDER BY c.timestamp DESC",
            [
                {"name": "@user_id", "value": user_id},
                {"name": "@period", "value": period},
            ],
        )
        return results[:limit]


class AuthRepository(CosmosRepository):
    """Persist authenticated user accounts and refresh-token state."""

    def __init__(self) -> None:
        super().__init__(get_settings().cosmos_auth_container)

    def find_user(self, identifier: str) -> dict[str, Any] | None:
        identifier = identifier.strip().lower()
        if not identifier:
            return None
        results = self.query(
            "SELECT * FROM c WHERE LOWER(c.email) = @identifier OR LOWER(c.phoneNumber) = @identifier OR LOWER(c.username) = @identifier",
            [{"name": "@identifier", "value": identifier}],
        )
        return results[0] if results else None
