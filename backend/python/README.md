# MTN ClarityAI Backend (stub)

This folder contains a minimal FastAPI backend scaffold that implements the API surface described in the frontend requirements as an in-memory stub for local development.

Quick start

1. Create a virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/Scripts/activate   # Windows PowerShell: .venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
```

2. Run the server:

```bash
uvicorn app:app --reload --port 8000
```

3. Open `http://localhost:8000/docs` for the OpenAPI UI.

This scaffold uses simple in-memory data and is intended as a starting point for connecting the frontend. Extend services, add persistence, authentication, and tests as needed.
