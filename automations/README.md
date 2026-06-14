# Cursor Automations

Import prefill JSON into **Cursor → Automations → New automation**.

## Recommended order

1. **01-intake-onboarding** — Webhook or manual. Form + materials → `intake/active.json`.
2. **05-intake-analysis** — After materials uploaded. Produces `feasibility.md` → **user reviews in UI**.
3. **02-strategy-planner** — After `userConfirmedAnalysis`. Full `active-plan.md` + scripts.
4. **03-execution-runner** — Cron `0 */4 * * *`. Runs orchestrator when credentials ready.
5. **04-weekly-review** — Cron `0 9 * * 1`. Adjusts strategy from ops logs.

## Settings checklist

| Setting | Value |
|---------|--------|
| Repository | Your fork of `marketing-autopilot` |
| Branch | `main` |
| Git push | Enable if agent should commit ops + strategy |
| Environment variables | Map keys from `runtime/credentials/schema.json` |
| Cloud vs worker | Strategy/review → Cloud; Playwright social → local worker |

## Webhook (onboarding)

After saving automation 01, copy the webhook URL from the editor. POST JSON or plain text with user requirements; the agent continues in thread.

## Instructions source of truth

Plain-text prompts: `automations/instructions/*.txt`  
Prefill bundles: `automations/prefill/*.json`

When editing, keep both in sync.
