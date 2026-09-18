#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT/uis/website"
if [ ! -d node_modules ]; then
  npm install
fi
npm run dev -- --host 0.0.0.0 --port 3000 &
WEBSITE_PID=$!
trap 'kill "$WEBSITE_PID" 2>/dev/null' EXIT

cd "$ROOT/services/api"
if [ ! -d .venv ]; then
  python3 -m venv .venv
fi
. .venv/bin/activate
pip install -r requirements.txt >/dev/null
pip install "pydantic[email]" pytest httpx >/dev/null
uvicorn app.main:app --host 0.0.0.0 --port 8000
