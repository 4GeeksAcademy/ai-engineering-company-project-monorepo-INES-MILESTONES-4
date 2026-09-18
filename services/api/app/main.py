from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import health, talent

# One centralized FastAPI app for the whole company — add new domain
# routers here (candidates, vacancies, talent-form submissions, tickets,
# ...) as they're built, rather than spinning up separate services. See
# AGENTS.md § "services/" and ../README.md.
app = FastAPI(title="Nexova API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.include_router(health.router)
app.include_router(talent.router)


@app.get("/")
def get_root() -> dict:
    return {"service": "nexova-api", "status": "ok"}
