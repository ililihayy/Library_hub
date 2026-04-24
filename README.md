# Library Hub

Library Hub is a full-stack library management project with:

- `frontend/`: React + Vite + TypeScript UI
- `backend/`: FastAPI + SQLAlchemy API

## Architecture

### Frontend

- UI pages for readers and librarians
- State/store and domain types in `frontend/src/lib`
- Without `VITE_API_URL`, the app uses a local demo store. With `VITE_API_URL=http://localhost:8000/api/v1`, sign-up and sign-in use the backend (bcrypt passwords + optional TOTP MFA).

### Backend

- Layered structure:
  - `app/api/v1`: HTTP routers
  - `app/services`: business logic (loan workflows, validations, stats)
  - `app/models.py`: SQLAlchemy models
  - `app/schemas.py`: Pydantic request/response contracts
  - `app/db`: session/base
  - `app/core`: config and shared setup

## Quick Start (Docker, recommended)

Prerequisites:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

Run everything:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:8000`
- Backend docs: `http://localhost:8000/docs`

Stop:

```bash
docker compose down
```

Stop and delete database volume:

```bash
docker compose down -v
```

## Local Development (without Docker)

See:

- `backend/README.md`
- `frontend/README.md`

## Backend API overview

Base path: `/api/v1`

### Auth (passwords + MFA)

- `POST /auth/register` — self-registration; body includes `password` and `confirmPassword` (must match); password stored as bcrypt hash.
- `POST /auth/login` — email + password; if MFA is enabled, returns `{ "step": "mfa", "challengeToken": "..." }` unless `mfaCode` is included.
- `POST /auth/login/mfa` — complete login with `challengeToken` + `mfaCode`.
- `POST /auth/mfa/setup` — after verifying email + password, sends a **6-digit code by email**, then returns TOTP `otpauthUri` and `secret` (configure `SMTP_*`, or `MFA_EMAIL_LOG_CODE_IN_DEV=true` for dev).
- `POST /auth/mfa/confirm` — body: `emailCode` (from email) + `mfaCode` (from authenticator) + email + password; then MFA is enabled.
- `POST /auth/mfa/disable` — turn off MFA (requires password + current TOTP code).

Set `SECRET_KEY` in the environment for production (JWT used for MFA challenge tokens).

Create a librarian account from the shell: see **`backend/README.md`** → *Create an admin (librarian) user* (`python scripts/create_admin.py`).

### Other

- `POST /users`
- `GET /users`
- `PATCH /users/{user_id}`
- `PATCH /users/{user_id}/toggle-blacklist`
- `DELETE /users/{user_id}`
- `POST /books`
- `GET /books`
- `PATCH /books/{book_id}`
- `DELETE /books/{book_id}`
- `POST /loans`
- `GET /loans`
- `PATCH /loans/{loan_id}/activate`
- `PATCH /loans/{loan_id}/return`
- `GET /dashboard/stats`

## Notes

- Backend default DB is SQLite.
- In Docker, DB is persisted in the `backend_data` volume.