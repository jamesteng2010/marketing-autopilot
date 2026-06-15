# Platform API（v0.2）

REST API skeleton. 规格：[../docs/product/implementation.md](../docs/product/implementation.md) §5 · Automations：[../docs/product/automations.md](../docs/product/automations.md)

## Run

```bash
cd platform/api && cp .env.example .env   # set DB + JWT_SECRET
npm install && npm run dev
# GET  http://localhost:3001/health
# UI   http://localhost:3001/auth
```

## Auth (v0.2)

| Method | Path | Body |
|--------|------|------|
| POST | `/api/auth/register` | `{ "email", "password", "displayName?" }` |
| POST | `/api/auth/login` | `{ "email", "password" }` |
| GET | `/api/auth/me` | Header: `Authorization: Bearer <token>` |

Dev UI: `/auth` · Production: https://myreceipt.website/auth

## Automation 05 — Request analysis

```bash
curl -X POST http://localhost:3001/api/projects/marketing-autopilot-launch/intake/analyze \
  -H 'Content-Type: application/json' \
  -d '{"userId":"dev-user"}'
```

Runs `runtime/analysis/prepare-analysis.mjs` on the project workspace (site scan + activity).  
Set `CURSOR_AUTOMATION_05_WEBHOOK_URL` to invoke Cursor Agent phase B.

## Env

| Variable | Default | Purpose |
|----------|---------|---------|
| `PORT` | 3001 | HTTP port |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASS` | — | MySQL Platform DB |
| `JWT_SECRET` | — | Required for auth (min 32 chars recommended) |
| `JWT_EXPIRES_IN` | 7d | Token lifetime |
| `WORKSPACE_ROOT` | — | Multi-tenant root; else uses `{repo}/projects/{id}` |
| `CURSOR_AUTOMATION_05_WEBHOOK_URL` | — | Cursor Automation 05 webhook |

## Local prepare (no API)

```bash
PROJECT_ROOT=projects/marketing-autopilot-launch npm run marketing:analyze:prepare
```
