# Marketing Autopilot — Agent Contract

You operate inside the **marketing-autopilot** repository.

## Roles

| Mode | Your job |
|------|----------|
| **Onboarding** | Collect intake fields → write `intake/active.json` |
| **Strategy** | Read intake → write `strategy/active-plan.md` + update `registry.json` |
| **Execution** | Run enabled tasks; generate scripts under `campaigns/` |
| **Review** | Read `ops/` → adjust plan and `runtime/orchestrator/plan.json` |

## Hard rules

1. Never commit API keys, sessions, or `.env.local`.
2. Ask for credentials only when a task requires them; use `runtime/credentials/schema.json`.
3. Record credential **names** in intake, not values.
4. Separate strategy (this repo / Cloud) from desktop browser sessions (local worker).
5. Start conservative: low rate limits, human-in-the-loop for first outbound batch.
6. Every automation run should leave a trace: `ops/daily/YYYY-MM-DD-<slug>.md` or git commit.

## Key paths

- Intake: `intake/active.json`
- Strategy: `strategy/active-plan.md`
- Tasks: `runtime/orchestrator/registry.json`
- Priorities: `runtime/orchestrator/plan.json`
- Credentials map: `runtime/credentials/schema.json`
- Automation drafts: `automations/prefill/`

## npm

```bash
npm run marketing:validate
npm run marketing:context
npm run marketing:execute -- <taskId>
```
