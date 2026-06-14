# Platform API（v0.2）

REST API skeleton. 规格：[../docs/product/implementation.md](../docs/product/implementation.md) §5 · Automations：[../docs/product/automations.md](../docs/product/automations.md)

## Run

```bash
cd platform/api && npm run dev
# GET  http://localhost:3001/health
```

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
| `WORKSPACE_ROOT` | — | Multi-tenant root; else uses `{repo}/projects/{id}` |
| `CURSOR_AUTOMATION_05_WEBHOOK_URL` | — | Cursor Automation 05 webhook |

## Local prepare (no API)

```bash
PROJECT_ROOT=projects/marketing-autopilot-launch npm run marketing:analyze:prepare
```
