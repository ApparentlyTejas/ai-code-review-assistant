# ReviewLenzAI

> AI-powered GitHub pull request reviews — connect a repo, pick a PR, get structured findings ranked by severity.

**[reviewlenzai.vercel.app](https://reviewlenzai.vercel.app)**

![CI](https://github.com/ApparentlyTejas/ai-code-review-assistant/actions/workflows/tests.yml/badge.svg)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?logo=postgresql&logoColor=white)

---

## What it does

ReviewLenzAI hooks into any GitHub repository and runs LLM-powered code reviews on open pull requests. It fetches the raw diff, sends it through Groq's Llama 3.3 70B with a structured tool-call schema, and stores every finding — categorised, ranked, and persisted — so you can track review history across all your projects.

No free-form text. No hallucinated line numbers. Structured JSON output enforced by Pydantic at the boundary.

---

## How a review works

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant GitHub
    participant Groq

    User->>Frontend: Select open PR
    Frontend->>Backend: POST /reviews (pr_number)
    Backend->>GitHub: GET /repos/{owner}/{repo}/pulls/{n}
    GitHub-->>Backend: PR metadata + diff URL
    Backend->>GitHub: GET diff
    GitHub-->>Backend: Unified diff
    Backend->>Groq: diff + tool-call schema (Llama 3.3 70B)
    Groq-->>Backend: Structured findings JSON
    Backend->>Backend: Validate with Pydantic, persist to Postgres
    Backend-->>Frontend: Review object with findings[]
    Frontend->>User: Findings grouped by severity
```

---

## Architecture

```
reviewlenzai.vercel.app  (React + Vite)
         │
         │  /api/* proxied by Vercel
         ▼
ai-code-review-api.onrender.com  (FastAPI)
         │
    ┌────┼──────────┐
    ▼    ▼          ▼
 Neon  GitHub    Groq API
  DB    API    Llama 3.3 70B
```

The Vercel → Render proxy keeps auth cookies first-party and eliminates CORS entirely.

---

## Tech stack

| Layer | Choices |
|---|---|
| **Frontend** | React 19 · TypeScript · Vite · TanStack Query · Framer Motion · React Router v6 |
| **Backend** | FastAPI · SQLAlchemy 2 · Pydantic v2 · python-jose · passlib |
| **Database** | PostgreSQL via Neon (serverless, free tier) |
| **LLM** | Groq API — `llama-3.3-70b-versatile` with structured tool-calling |
| **Security** | HttpOnly cookies · Fernet-encrypted PATs · bcrypt · JWT · SlowAPI rate limiting · security headers middleware |
| **CI/CD** | GitHub Actions — pytest (31 tests) + Vite build on every push |
| **Deploy** | Vercel (frontend) · Render (API) · Neon (Postgres) |

---

## Features

- **GitHub integration** — connect any repo with a PAT; lists open PRs and fetches diffs live
- **Structured LLM output** — findings come back as typed JSON (file, line, severity, category, message, suggested fix), not paragraphs
- **Severity ranking** — critical → high → medium → low, rendered with visual indicators
- **Full history** — every review run is stored; browse all past findings per repo
- **Dashboard** — stat cards, severity breakdown bar, and an activity feed on the home screen
- **Multi-user** — users only see their own repos and reviews
- **Disposable email blocking** — 60+ temp-mail domains rejected at registration

---

## Running locally

**Prerequisites:** Python 3.12+, Node 20+, PostgreSQL

```bash
git clone https://github.com/ApparentlyTejas/ai-code-review-assistant.git
cd ai-code-review-assistant
```

**Backend**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your values
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

**Environment variables (backend `.env`)**

| Variable | How to get it |
|---|---|
| `DATABASE_URL` | `postgresql+psycopg2://user:pass@localhost/ai_code_review` |
| `JWT_SECRET_KEY` | `openssl rand -hex 32` |
| `PAT_ENCRYPTION_KEY` | `python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"` |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) — free tier works |
| `CORS_ORIGINS` | `http://localhost:5173` |

---

## Tests

```bash
cd backend && pytest
```

31 tests across auth flows, project ownership isolation, GitHub service (mocked), LLM service (mocked), and the dashboard endpoint.

---

## Deploy your own (free)

| Service | What for | Cost |
|---|---|---|
| [Neon](https://neon.tech) | Postgres database | Free forever |
| [Render](https://render.com) | FastAPI backend | Free (sleeps after 15 min idle) |
| [Vercel](https://vercel.com) | React frontend | Free forever |

`backend/render.yaml` and `frontend/vercel.json` are included — import the repo and set your env vars.

---

Built by [@ApparentlyTejas](https://github.com/ApparentlyTejas)
