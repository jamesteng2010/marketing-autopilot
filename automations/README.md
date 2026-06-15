# Cursor Automations

Import prefill JSON into **Cursor → Automations → New automation**.

**Full product spec:** [docs/product/automations.md](../docs/product/automations.md) — triggers, Platform Worker split, webhook payload.

## Recommended order

1. **01-intake-onboarding** — Webhook or manual. Form + materials → `intake/active.json`. *(optional)*
2. **05-intake-analysis** — After materials uploaded. Produces `feasibility.md` → **user reviews in UI**.
3. **02-strategy-planner** — After dual gate (`userConfirmedAnalysis` + `userConfirmedGoals`).
4. **03-execution-runner** — Cron `0 */4 * * *`. *(SaaS: prefer Platform Worker `run-phase`)*
5. **04-weekly-review** — Cron `0 9 * * 1`.

## Automation 05 two-phase flow

| Phase | Runner | Command |
|-------|--------|---------|
| **A — Prepare** | Platform / Node | `npm run marketing:analyze:prepare` or `POST .../intake/analyze` |
| **B — LLM + feasibility** | **OpenAI on EC2** (preferred) or **Cursor Automation 05** webhook |

**Setup guide:** [infra/automations/SETUP.md](../infra/automations/SETUP.md)

Phase A: validate intake → passive site scan → `existing-marketing.json` → activity log → optional webhook.

## Settings checklist

| Setting | Value |
|---------|--------|
| Repository | Your fork of `marketing-autopilot` |
| Branch | `main` |
| Git push | Enable if agent should commit ops + strategy |
| Environment variables | `PROJECT_ROOT`, `USER_ID`, `PROJECT_ID`, `CORRELATION_ID` from webhook |
| Cloud vs worker | Strategy/review → Cloud; Playwright social → local worker |

## Webhook payload (Platform → Cursor)

```json
{
  "userId": "usr_xxx",
  "projectId": "prj_yyy",
  "workspaceRoot": "/path/to/project",
  "correlationId": "run_xxx",
  "env": {
    "PROJECT_ROOT": "/path/to/project",
    "USER_ID": "usr_xxx",
    "PROJECT_ID": "prj_yyy",
    "CORRELATION_ID": "run_xxx"
  }
}
```

## Instructions source of truth

Plain-text prompts: `automations/instructions/*.txt`  
Prefill bundles: `automations/prefill/*.json`

When editing, keep both in sync.
