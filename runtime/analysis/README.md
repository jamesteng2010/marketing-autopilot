# Intake Analysis (Automation 05)

Phase **A** — Node scripts (no Cursor):

| Script | npm | Purpose |
|--------|-----|---------|
| `validate-intake.mjs` | — | Minimum fields before analyze |
| `site-scan.mjs` | `marketing:analyze:scan` | Passive HTTP scan → `existing-marketing.json` |
| `prepare-analysis.mjs` | `marketing:analyze:prepare` | Validate + scan + activity + webhook |

Phase **B** — Cursor Automation 05: LLM material analysis + `feasibility.md` + `extracted.json`.

See [docs/product/automations.md](../../docs/product/automations.md).
