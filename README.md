# Library Hub

Library Hub is a full-stack library management project with:

- `frontend/`: React + Vite + TypeScript UI
- `backend/`: FastAPI + SQLAlchemy API

## Architecture

### Frontend

- UI pages for readers and librarians
- State/store and domain types in `frontend/src/lib`
- Currently uses local store behavior for demo interactions

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

- `POST /users`
- `POST /auth/login`
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