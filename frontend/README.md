# Frontend (React + Vite)

## Requirements

- Node.js 20+
- npm

## Run locally

From `frontend/`:

```bash
npm install
npm run dev
```

App will be available at:

- `http://localhost:5173` (default Vite port)

Build:

```bash
npm run build
npm run preview
```

## Environment

This project currently runs with local state and does not require mandatory env variables.

If you connect the frontend to backend API, use a Vite env variable pattern, e.g.:

- `VITE_API_URL=http://localhost:8000/api/v1`

## Docker

Build image:

```bash
docker build -t library-hub-frontend .
```

Run:

```bash
docker run --rm -p 8080:80 library-hub-frontend
```
