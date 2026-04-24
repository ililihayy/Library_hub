# Backend (FastAPI)

## Requirements

- Python 3.11+
- pip

## Run locally

From `backend/`:

```bash
python -m venv .venv
```

Activate venv:

- Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

- Linux/macOS:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Open docs:

- Swagger: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment variables

Optional `.env` keys:

- `DATABASE_URL` (default: `sqlite:///./library_hub.db`)
- `API_PREFIX` (default: `/api/v1`)
- `PROJECT_NAME` (default: `Library Hub API`)

## Docker

Build:

```bash
docker build -t library-hub-backend .
```

Run:

```bash
docker run --rm -p 8000:8000 library-hub-backend
```
