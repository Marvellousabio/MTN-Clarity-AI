"""API route modules for the MTN ClarityAI backend.

Each router handles a specific domain:
- auth: User registration, login, and token management
- user: User profile access and updates
- plans: Plan catalog queries and comparisons
- chat: Chat assistant and session profile management
- usage: Usage analytics and history
- recommendations: Plan recommendations and savings calculations
"""

from . import auth, user, plans, chat, usage, recommendations

__all__ = ["auth", "user", "plans", "chat", "usage", "recommendations"]
