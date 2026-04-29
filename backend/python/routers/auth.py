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
