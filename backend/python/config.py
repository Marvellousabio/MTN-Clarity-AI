"""Application configuration for the MTN ClarityAI backend.

This module keeps runtime configuration lightweight.
"""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed settings loaded from environment variables.

    All values are prefixed with ``CLARITY_`` to avoid collisions with other
    services in shared deployment environments.
    """

    model_config = SettingsConfigDict(env_prefix="CLARITY_", env_file=".env", extra="ignore")

    app_name: str = "MTN ClarityAI API"
    app_version: str = "2.0.0"
    log_level: str = "INFO"
    cors_origins: str = "*"

    cosmos_endpoint: str = Field(default="", description="Azure Cosmos DB endpoint")
    cosmos_key: str = Field(default="", description="Azure Cosmos DB key")
    cosmos_database: str = "clarityai"
    cosmos_plans_container: str = "plans"
    cosmos_profiles_container: str = "profiles"
    cosmos_usage_container: str = "usage"
    cosmos_auth_container: str = "auth_users"
    cosmos_chat_container: str = "chat_sessions"

    azure_openai_endpoint: str = Field(default="", description="Azure OpenAI endpoint")
    azure_openai_key: str = Field(default="", description="Azure OpenAI API key")
    azure_openai_api_version: str = "2024-10-21"
    azure_openai_deployment: str = "clarity-chat"

    jwt_secret: str = Field(default="", description="JWT signing secret")
    jwt_algorithm: str = "HS256"
    access_token_minutes: int = 60
    refresh_token_days: int = 30


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached settings instance."""

    return Settings()
