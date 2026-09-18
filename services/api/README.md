# `api` — Nexova centralized backend (FastAPI)

The one backend service for Nexova, per the monorepo's own convention (see
[`AGENTS.md`](../../AGENTS.md) § `services/` and
[`services/README.md`](../README.md)): a single FastAPI app with one router
module per domain, not a set of microservices.

The Hito 1 public site now submits the talent form to the real endpoint
at `POST /talent` (see
[`uis/website/README.md`](../../uis/website/README.md)). The API keeps the
same centralized structure, but it is no longer just a placeholder: it accepts
validated talent registrations and returns the success payload used by the
frontend.

## Structure

```
api/
├── requirements.txt
├── .env.example
├── tests/
│   └── test_talent_router.py
└── app/
    ├── main.py           # FastAPI() app, includes routers
    └── routers/
        ├── health.py     # GET /health
        └── talent.py     # POST /talent — real talent registration endpoint
```

Add a new domain router as `app/routers/<domain>.py` and `include_router`
it in `app/main.py` — e.g. `app/routers/candidates.py`,
`app/routers/vacancies.py`, `app/routers/talent.py`.

## Running it

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install "pydantic[email]" pytest httpx
uvicorn app.main:app --reload --port 8000
```

Use the same terminal to test the live flow:

```bash
curl -X POST http://127.0.0.1:8000/talent \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Ana García","email":"ana.garcia@empresa.com","phone":"+34 612 345 678","country":"España","yearsExperience":5,"sector":"Tecnología","englishLevel":"Avanzado","availability":"Inmediata","linkedin":"https://www.linkedin.com/in/ana-garcia","comments":"Me interesa trabajar con equipos de producto.","consent":true}'
```

- `GET /` → `{"service": "nexova-api", "status": "ok"}`
- `GET /health` → `{"status": "ok"}`
- `POST /talent` → accepted submission payload
- `GET /docs` → interactive Swagger UI (from FastAPI, no extra setup)

Self-contained like the `uis/` apps: its own `requirements.txt`, no shared
root-level Python tooling yet (see the tooling gaps in
`memory-bank/techContext.md`).

> _Estas instrucciones también están disponibles en [español](./README.es.md)._
