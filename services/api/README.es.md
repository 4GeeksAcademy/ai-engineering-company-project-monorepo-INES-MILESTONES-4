# `api` — Backend centralizado de Nexova (FastAPI)

El único servicio backend de Nexova, según la convención propia del
monorepo (ver [`AGENTS.md`](../../AGENTS.md) § `services/` y
[`services/README.md`](../README.md)): una sola app FastAPI con un módulo
de router por dominio, no un conjunto de microservicios.

El sitio público del Hito 1 ya envía el formulario de talento al endpoint real
`POST /talent` (ver [`uis/website/README.es.md`](../../uis/website/README.es.md)).
La API mantiene la misma estructura centralizada, pero ya no es solo un
esqueleto: acepta registros validados de talento y devuelve el payload de
éxito que usa el frontend.

## Estructura

```
api/
├── requirements.txt
├── .env.example
├── tests/
│   └── test_talent_router.py
└── app/
    ├── main.py           # app FastAPI(), incluye los routers
    └── routers/
        ├── health.py     # GET /health
        └── talent.py     # POST /talent — endpoint real de registro
```

Para añadir un router de dominio nuevo: `app/routers/<dominio>.py` y
`include_router` en `app/main.py` — por ejemplo `app/routers/candidates.py`,
`app/routers/vacancies.py`, `app/routers/talent.py`.

## Cómo ejecutarlo

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install "pydantic[email]" pytest httpx
uvicorn app.main:app --reload --port 8000
```

Usa la misma terminal para probar el flujo real:

```bash
curl -X POST http://127.0.0.1:8000/talent \
  -H 'Content-Type: application/json' \
  -d '{"fullName":"Ana García","email":"ana.garcia@empresa.com","phone":"+34 612 345 678","country":"España","yearsExperience":5,"sector":"Tecnología","englishLevel":"Avanzado","availability":"Inmediata","linkedin":"https://www.linkedin.com/in/ana-garcia","comments":"Me interesa trabajar con equipos de producto.","consent":true}'
```

- `GET /` → `{"service": "nexova-api", "status": "ok"}`
- `GET /health` → `{"status": "ok"}`
- `POST /talent` → payload de envío aceptado
- `GET /docs` → Swagger UI interactivo (viene gratis con FastAPI)

Autocontenido como las apps de `uis/`: su propio `requirements.txt`, sin
tooling de Python compartido en la raíz todavía (ver los huecos de tooling
en `memory-bank/techContext.md`).

> _These instructions are also available in [English](./README.md)._
