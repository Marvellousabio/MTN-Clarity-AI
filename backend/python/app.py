"""FastAPI application entrypoint for MTN ClarityAI."""

from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .config import get_settings
    from .routers import auth, chat, plans, recommendations, usage, user
except Exception:  # pragma: no cover - local execution fallback
    from config import get_settings
    from routers import auth, chat, plans, recommendations, usage, user

settings = get_settings()
logging.basicConfig(level=getattr(logging, settings.log_level.upper(), logging.INFO))
logger = logging.getLogger(__name__)

app = FastAPI(title=settings.app_name, version=settings.app_version)

if settings.cors_origins == "*":
    allow_origins = ["*"]
else:
    allow_origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(user.router, prefix="/api/user", tags=["user"])
app.include_router(plans.router, prefix="/api/plans", tags=["plans"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(usage.router, prefix="/api/usage", tags=["usage"])
app.include_router(recommendations.router, prefix="/api", tags=["recommendations"])


@app.get("/healthz")
def healthz() -> dict[str, str]:
    """Return a minimal health check response."""

    return {"status": "ok"}
