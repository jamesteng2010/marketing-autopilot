# Marketing Autopilot — Agent Contract

You operate inside a **single Project workspace** (`PROJECT_ROOT` or `tenants/{userId}/projects/{projectId}/`).

> **Universal rule:** Every user, every project follows the [Automation Commander](./docs/product/automation-commander.md) model — you plan phases, generate code, run tasks, update `ops/progress.json`. Users watch progress; they do not execute marketing todos.

## Roles

| Mode | Your job |
|------|----------|
| **Onboarding** | Collect intake fields → write `intake/active.json` |
| **Analysis** | Materials → `intake/analysis/feasibility.md` + `extracted.json` |
| **Strategy** | Read intake → write `strategy/active-plan.md` + **`phases.json`** + `registry.json` + generate `campaigns/*/run.mjs` |
| **Execution** | `run-phase` enabled tasks; update **`ops/progress.json`** |
| **Review** | Read `ops/` → adjust plan, phases, and `plan.json` |

## Hard rules

1. Never commit API keys, sessions, or `.env.local`.
2. Ask for credentials only when a task requires them; use `runtime/credentials/schema.json`.
3. Record credential **names** in intake, not values.
4. Separate strategy (Cloud) from desktop browser sessions (local worker).
5. Start conservative: low rate limits, human-in-the-loop for first outbound batch.
6. Every automation run must append to **`ops/activity/events.jsonl`** (user-readable `summary` for every step: analysis, plan, code, execution, marketing). Also `ops/actions/` for action detail; use `logActivity()` / `logAction()` in helpers.mjs.
7. **Never** assign manual marketing todos to the user — only `pendingUserActions` / `pending-human.json`. Platform scheduler sends periodic reminders; append `notification.*` events.
8. **Never** read or write paths outside the current `userId` + `projectId`.

## Key paths

- Intake: `intake/active.json`
- Strategy: `strategy/active-plan.md`
- Phases: `runtime/orchestrator/phases.json`
- Tasks: `runtime/orchestrator/registry.json`
- Priorities: `runtime/orchestrator/plan.json`
- `ops/progress.json` — user-facing progress  
- `ops/pending-human.json` — user blockers (+ notification schedule)  
- `ops/activity/events.jsonl` — **统一时间线**：用户 + Automation 全部工作（分析/计划/代码/营销）  
- Event catalog: `runtime/user-activity-events-catalog.json`
- Platform logs `tenants/{userId}/activity/` — register, login, project CRUD  
- Credentials map: `runtime/credentials/schema.json`
- Catalogs: `runtime/marketing-methods-catalog.json`, `runtime/regions-catalog.json`, `runtime/action-catalog.json`, `runtime/existing-marketing-channels-catalog.json`
- Integration: `docs/product/integration-marketing-catalog.md`

## npm

```bash
npm run marketing:validate
npm run marketing:context
npm run marketing:execute -- <taskId>
PROJECT_ROOT=tenants/{userId}/projects/{projectId} npm run marketing:phase
```
