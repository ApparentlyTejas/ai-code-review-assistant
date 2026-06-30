# AI Code Review Assistant

A full-stack web application that connects to a GitHub repository, selects an open pull request, and runs the diff through an LLM to produce structured, severity-ranked code review findings — stored with full history per project.

**Live demo:** _coming soon_

---

## Features

- **GitHub PR integration** — connect any repo via a personal access token; lists open PRs and fetches diffs in real time
- **LLM-powered review** — structured findings via Groq's Llama 3.3 70B using tool-calling (not free-form text parsing)
- **Severity ranking** — every finding is categorised as bug / security / style / suggestion and ranked critical → low
- **Full review history** — every review run is persisted; browse all past findings per project
- **Dashboard overview** — stat cards (projects, reviews, findings) and a recent-activity feed on login
- **Secure by default** — GitHub PATs encrypted at rest with Fernet; bcrypt password hashing; JWT auth; rate limiting on auth and review endpoints
- **Multi-user** — each user sees only their own projects and reviews

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router v6, TanStack Query, Framer Motion |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2, Alembic, Pydantic v2 |
| Database | PostgreSQL (Neon on prod, local on dev) |
| LLM | Groq API — `llama-3.3-70b-versatile` with structured tool-calling |
| Auth | JWT (python-jose, HS256) + bcrypt (passlib) |
| Security | Fernet encryption for PATs, slowapi rate limiting |
| CI | GitHub Actions — pytest + frontend build on every push |
| Deploy | Render (API) · Neon (Postgres) · Vercel (frontend) |

---

## Architecture

```
browser ──► Vercel (React SPA)
               │  axios + JWT
               ▼
           Render (FastAPI)
               │
       ┌───────┼───────┐
       ▼       ▼       ▼
   Neon DB  GitHub   Groq API
  (Postgres)  API    (Llama 3.3)
```

1. User connects a repo (PAT encrypted with Fernet before storing).
2. App fetches open PRs from GitHub REST API.
3. User picks a PR → backend fetches the raw unified diff.
4. Diff is sent to Groq with a tool-call schema enforcing structured JSON output.
5. Findings are validated with Pydantic and persisted to Postgres.
6. Frontend renders findings grouped by severity.

---

## Local setup

### Prerequisites

- Python 3.12+ (recommend using [uv](https://docs.astral.sh/uv/))
- Node.js 20+
- PostgreSQL running locally

### 1. Clone and create the database

```bash
git clone https://github.com/ApparentlyTejas/ai-code-review-assistant.git
cd ai-code-review-assistant
createdb ai_code_review
```

### 2. Backend

```bash
cd backend

# create venv and install deps
uv venv --python 3.12 .venv
source .venv/bin/activate
uv pip install -r requirements.txt

# copy env and fill in your values
cp .env.example .env

# run migrations
alembic upgrade head

# start the API
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install

# point the frontend at the local API (default is already localhost:8000)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (`postgresql+psycopg2://...`) |
| `JWT_SECRET_KEY` | Random hex string — generate with `python3 -c "import secrets; print(secrets.token_hex(32))"` |
| `JWT_ALGORITHM` | `HS256` |
| `JWT_EXPIRE_MINUTES` | `1440` (24 hours) |
| `PAT_ENCRYPTION_KEY` | Fernet key — generate with `python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `GROQ_API_KEY` | From [console.groq.com](https://console.groq.com) — free tier is sufficient |
| `CORS_ORIGINS` | Comma-separated allowed origins, e.g. `http://localhost:5173,https://your-app.vercel.app` |

---

## Running tests

```bash
cd backend
source .venv/bin/activate
pytest
```

31 tests covering auth flows, project authorization, GitHub service (mocked), LLM service (mocked), and the dashboard endpoint.

---

## Deployment

The repo includes ready-to-use config for a zero-cost production stack.

### Neon (Postgres)
1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the connection string — use it as `DATABASE_URL` on Render.

### Render (API)
1. Create a new **Web Service** from this repo at [render.com](https://render.com).
2. Set **Root Directory** to `backend`.
3. Add env vars: `DATABASE_URL`, `JWT_SECRET_KEY`, `PAT_ENCRYPTION_KEY`, `GROQ_API_KEY`, `CORS_ORIGINS` (set to your Vercel URL after deploying the frontend).
4. `render.yaml` handles the build command, start command, and Alembic migrations automatically.

### Vercel (Frontend)
1. Import the repo at [vercel.com](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add env var `VITE_API_BASE_URL` pointing to your Render service URL.
4. Deploy — `frontend/vercel.json` handles SPA routing.

---

Built by [@ApparentlyTejas](https://github.com/ApparentlyTejas)
