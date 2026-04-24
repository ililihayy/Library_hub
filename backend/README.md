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
- `SECRET_KEY` (required in production; used to sign short-lived MFA challenge JWTs)

Copy `.env.example` to `.env` and adjust values.

## Create an admin (librarian) user

From `backend/` (with venv activated and `DATABASE_URL` pointing at the same DB as the API):

```bash
python scripts/create_admin.py --email admin@yourlibrary.org --password 'YourSecurePassword'
```

- Use `--force` to reset password and set `role=librarian` if the email already exists.
- You can omit `--password` and type it interactively (with confirmation).

Alternatively set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the environment and run without flags.

## MFA and email

Enabling MFA is a two-step process:

1. `POST /auth/mfa/setup` — verifies password, emails a **6-digit confirmation code** (bcrypt-hashed in the DB), returns the TOTP `otpauthUri` / `secret` for your authenticator app.
2. `POST /auth/mfa/confirm` — body must include **`emailCode`** (from the email) and **`mfaCode`** (from the app).

Configure **`SMTP_*`** variables to send mail. For local development without SMTP, set **`MFA_EMAIL_LOG_CODE_IN_DEV=true`**; the API will log the code and return `emailSent: false` in the setup response.

## Docker

Build:

```bash
docker build -t library-hub-backend .
```

Run:

```bash
docker run --rm -p 8000:8000 library-hub-backend
```
