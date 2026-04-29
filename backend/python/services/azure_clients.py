"""Azure client factories.

Clients are cached and reused across requests. The backend is intentionally
small and keeps client construction in one place so the routers stay thin.
"""

from __future__ import annotations

import logging
from functools import lru_cache

from azure.cosmos import CosmosClient
from openai import AzureOpenAI

from ..config import get_settings

logger = logging.getLogger(__name__)


class AzureClientFactory:
    """Create Azure SDK clients from the current runtime settings."""

    def __init__(self) -> None:
        self.settings = get_settings()

    def cosmos_client(self) -> CosmosClient:
        """Return a Cosmos DB client.

        Raises:
            ValueError: if Cosmos DB configuration is incomplete.
        """

        if not self.settings.cosmos_endpoint or not self.settings.cosmos_key:
            raise ValueError("Cosmos DB endpoint and key must be configured.")
        return CosmosClient(self.settings.cosmos_endpoint, credential=self.settings.cosmos_key)

    def openai_client(self) -> AzureOpenAI:
        """Return an Azure OpenAI client.

        Raises:
            ValueError: if Azure OpenAI configuration is incomplete.
        """

        if not self.settings.azure_openai_endpoint or not self.settings.azure_openai_key:
            raise ValueError("Azure OpenAI endpoint and key must be configured.")
        return AzureOpenAI(
            azure_endpoint=self.settings.azure_openai_endpoint,
            api_key=self.settings.azure_openai_key,
            api_version=self.settings.azure_openai_api_version,
        )

    def semantic_kernel(self):
        """Return a Semantic Kernel instance with Azure OpenAI service.

        Lazy-imports SK to avoid hard dependency if not used.

        Raises:
            ValueError: if Azure OpenAI configuration is incomplete.
            ImportError: if semantic-kernel is not installed.
        """
        try:
            from semantic_kernel import Kernel
            from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
        except ImportError as e:
            raise ImportError("semantic-kernel package is required for SK integration") from e

        if not self.settings.azure_openai_endpoint or not self.settings.azure_openai_key:
            raise ValueError("Azure OpenAI endpoint and key must be configured.")

        kernel = Kernel()
        service_id = "clarity-ai-service"
        kernel.add_service(
            AzureChatCompletion(
                service_id=service_id,
                deployment_name=self.settings.azure_openai_deployment,
                endpoint=self.settings.azure_openai_endpoint,
                api_key=self.settings.azure_openai_key,
                api_version=self.settings.azure_openai_api_version,
            )
        )
        return kernel


@lru_cache(maxsize=1)
def get_azure_clients() -> AzureClientFactory:
    """Cached factory instance."""

    return AzureClientFactory()
