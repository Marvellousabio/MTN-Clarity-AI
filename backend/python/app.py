from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

try:
    from .routers import auth, user, plans, chat, usage, recommendations
except Exception:
    from routers import auth, user, plans, chat, usage, recommendations

app = FastAPI(title="MTN ClarityAI API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
def healthz():
    return {"status": "ok"}
