# MTN ClarityAI Backend

Python Backend Service for MTN ClarityAI

## Architecture

The codebase is intentionally lightweight:

- Routers are thin HTTP adapters.
- Services contain business logic.
- Cosmos DB stores dynamic app data such as plans, profiles, usage history, and auth state.
- Azure OpenAI powers chat responses.
- Infrastructure lives only in `infra/` as Bicep files.

## Required Azure resources

- Azure Cosmos DB
- Azure OpenAI
- Azure Application Insights

## Configuration

Supply the following environment variables:

- `CLARITY_COSMOS_ENDPOINT`
- `CLARITY_COSMOS_KEY`
- `CLARITY_COSMOS_DATABASE`
- `CLARITY_COSMOS_PLANS_CONTAINER`
- `CLARITY_COSMOS_PROFILES_CONTAINER`
- `CLARITY_COSMOS_USAGE_CONTAINER`
- `CLARITY_COSMOS_AUTH_CONTAINER`
- `CLARITY_COSMOS_CHAT_CONTAINER`
- `CLARITY_AZURE_OPENAI_ENDPOINT`
- `CLARITY_AZURE_OPENAI_KEY`
- `CLARITY_AZURE_OPENAI_DEPLOYMENT`
- `CLARITY_JWT_SECRET`

## Quick start

1. Create a virtual environment and install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Run the server from the repository root:

```powershell
uvicorn backend.python.app:app --reload --port 8000
```

3. Open `http://localhost:8000/docs` for the OpenAPI UI.

## Routers

- `auth`: login, register, refresh, logout, current profile
- `user`: profile lookup
- `plans`: dynamic catalog, details, compare, activation, pidgin explanation
- `chat`: Azure OpenAI chat, session profiles, recommendations, overspend analysis
- `usage`: current usage and history from Cosmos DB
- `recommendations`: ranked plan recommendations and savings calculations

## Notes

- There is no in-memory demo path in request handling.
- If Cosmos DB or Azure OpenAI is not configured, the corresponding routes return explicit failures.
- The legacy local JSON catalog remains only as a migration artifact.
