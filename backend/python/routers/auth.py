from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class LoginIn(BaseModel):
    username: str
    password: str


class TokenOut(BaseModel):
    accessToken: str
    refreshToken: str
    user: dict


@router.post("/login", response_model=TokenOut)
def login(payload: LoginIn):
    # stub: accept any credentials and return a fake token
    user = {
        "id": "user-1",
        "name": payload.username,
        "phoneNumber": "08100000000",
        "email": "user@example.com",
        "currentPlanId": "plan-1",
        "monthlySpend": 2500,
        "dataBurnRate": "Medium",
        "heavySocialUsage": True,
        "preferredLanguage": "EN",
    }
    return TokenOut(accessToken="fake-jwt-token", refreshToken="fake-refresh", user=user)


class RegisterIn(BaseModel):
    phoneNumber: str
    password: str
    name: str


@router.post("/register", response_model=TokenOut)
def register(payload: RegisterIn):
    # stub: accept any input and return a fake token
    user = {
        "id": "user-new",
        "name": payload.name,
        "phoneNumber": payload.phoneNumber,
        "email": f"{payload.phoneNumber}@mtn.com",
        "currentPlanId": "plan-1",
        "monthlySpend": 0,
        "dataBurnRate": "Low",
        "heavySocialUsage": False,
        "preferredLanguage": "EN",
    }
    return TokenOut(accessToken="fake-jwt-token", refreshToken="fake-refresh", user=user)


class RefreshIn(BaseModel):
    refreshToken: str


@router.post("/refresh", response_model=TokenOut)
def refresh(payload: RefreshIn):
    # stub: accept any refresh token and return a new access token
    user = {
        "id": "user-1",
        "name": "Demo User",
        "phoneNumber": "08100000000",
        "email": "user@example.com",
        "currentPlanId": "plan-1",
        "monthlySpend": 2500,
        "dataBurnRate": "Medium",
        "heavySocialUsage": True,
        "preferredLanguage": "EN",
    }
    return TokenOut(accessToken="fake-jwt-token-refreshed", refreshToken="fake-refresh", user=user)


@router.get("/me", response_model=TokenOut)
def get_me():
    # stub: return current user (in production, extract from JWT)
    user = {
        "id": "user-1",
        "name": "Demo User",
        "phoneNumber": "08100000000",
        "email": "user@example.com",
        "currentPlanId": "plan-1",
        "monthlySpend": 2500,
        "dataBurnRate": "Medium",
        "heavySocialUsage": True,
        "preferredLanguage": "EN",
    }
    return TokenOut(accessToken="fake-jwt-token", refreshToken="fake-refresh", user=user)


@router.post("/logout")
def logout():
    # stub: just return success
    return {"message": "Logged out successfully"}
