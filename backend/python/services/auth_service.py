"""Authentication service."""

from __future__ import annotations

import hashlib
import hmac
import logging
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

import jwt

from ..config import get_settings
from .repositories import AuthRepository

logger = logging.getLogger(__name__)


class AuthService:
    """Create and validate user accounts using Cosmos DB documents."""

    def __init__(self, repository: AuthRepository | None = None) -> None:
        self.settings = get_settings()
        self.repository = repository or AuthRepository()

    def register(self, name: str, phone_number: str, password: str, email: str | None = None) -> dict[str, Any]:
        """Create a user account and return tokens plus the public profile."""

        if self.repository.find_user(phone_number) or (email and self.repository.find_user(email)):
            raise ValueError("An account with the same identifier already exists.")

        user_id = phone_number.strip()
        salt = secrets.token_hex(16)
        password_hash = self._hash_password(password, salt)
        profile = {
            "id": user_id,
            "username": phone_number,
            "phoneNumber": phone_number,
            "email": email or f"{phone_number}@mtn.ng",
            "name": name,
            "currentPlanId": "",
            "monthlySpend": 0,
            "dataBurnRate": "Low",
            "heavySocialUsage": False,
            "preferredLanguage": "EN",
            "passwordSalt": salt,
            "passwordHash": password_hash,
            "createdAt": self.repository.utc_now(),
            "updatedAt": self.repository.utc_now(),
            "refreshTokenHash": "",
            "refreshTokenExpiresAt": "",
        }
        self.repository.upsert(profile)
        logger.info("Registered user id=%s", user_id)
        return self._token_response(profile)

    def login(self, identifier: str, password: str) -> dict[str, Any]:
        """Authenticate a user with username, email, or phone number."""

        user = self.repository.find_user(identifier)
        if not user or not self._verify_password(password, user.get("passwordSalt", ""), user.get("passwordHash", "")):
            raise ValueError("Invalid credentials.")

        logger.info("Authenticated user id=%s", user.get("id"))
        return self._token_response(user)

    def refresh(self, refresh_token: str) -> dict[str, Any]:
        """Exchange a refresh token for a new token pair."""

        payload = self._decode_token(refresh_token)
        if payload.get("typ") != "refresh":
            raise ValueError("Invalid refresh token.")

        user = self.repository.read(payload["sub"])
        if not user:
            raise ValueError("User not found.")

        stored_hash = user.get("refreshTokenHash", "")
        if not stored_hash or not hmac.compare_digest(stored_hash, self._hash_token(refresh_token)):
            raise ValueError("Refresh token has been revoked.")

        return self._token_response(user)

    def me(self, access_token: str) -> dict[str, Any]:
        """Resolve the authenticated profile from a bearer token."""

        payload = self._decode_token(access_token)
        if payload.get("typ") != "access":
            raise ValueError("Invalid access token.")
        user = self.repository.read(payload["sub"])
        if not user:
            raise ValueError("User not found.")
        return self._public_profile(user)

    def logout(self, access_token: str) -> None:
        """Revoke the current refresh token state."""

        payload = self._decode_token(access_token)
        user = self.repository.read(payload["sub"])
        if not user:
            return
        user["refreshTokenHash"] = ""
        user["refreshTokenExpiresAt"] = ""
        user["updatedAt"] = self.repository.utc_now()
        self.repository.upsert(user)

    def _token_response(self, user: dict[str, Any]) -> dict[str, Any]:
        access_token, refresh_token = self._issue_tokens(user["id"])
        user["refreshTokenHash"] = self._hash_token(refresh_token)
        user["refreshTokenExpiresAt"] = (datetime.now(timezone.utc) + timedelta(days=self.settings.refresh_token_days)).isoformat()
        user["updatedAt"] = self.repository.utc_now()
        self.repository.upsert(user)
        return {"accessToken": access_token, "refreshToken": refresh_token, "user": self._public_profile(user)}

    def _issue_tokens(self, subject: str) -> tuple[str, str]:
        now = datetime.now(timezone.utc)
        access_payload = {
            "sub": subject,
            "typ": "access",
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(minutes=self.settings.access_token_minutes)).timestamp()),
        }
        refresh_payload = {
            "sub": subject,
            "typ": "refresh",
            "iat": int(now.timestamp()),
            "exp": int((now + timedelta(days=self.settings.refresh_token_days)).timestamp()),
        }
        return (
            jwt.encode(access_payload, self.settings.jwt_secret, algorithm=self.settings.jwt_algorithm),
            jwt.encode(refresh_payload, self.settings.jwt_secret, algorithm=self.settings.jwt_algorithm),
        )

    def _decode_token(self, token: str) -> dict[str, Any]:
        return jwt.decode(token, self.settings.jwt_secret, algorithms=[self.settings.jwt_algorithm])

    @staticmethod
    def _hash_token(token: str) -> str:
        return hashlib.sha256(token.encode("utf-8")).hexdigest()

    @staticmethod
    def _hash_password(password: str, salt: str) -> str:
        return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000).hex()

    def _verify_password(self, password: str, salt: str, expected_hash: str) -> bool:
        return hmac.compare_digest(self._hash_password(password, salt), expected_hash)

    @staticmethod
    def _public_profile(user: dict[str, Any]) -> dict[str, Any]:
        return {
            "id": user.get("id", ""),
            "name": user.get("name", ""),
            "phoneNumber": user.get("phoneNumber", ""),
            "email": user.get("email", ""),
            "currentPlanId": user.get("currentPlanId", ""),
            "monthlySpend": user.get("monthlySpend", 0),
            "dataBurnRate": user.get("dataBurnRate", "Low"),
            "heavySocialUsage": user.get("heavySocialUsage", False),
            "preferredLanguage": user.get("preferredLanguage", "EN"),
        }
