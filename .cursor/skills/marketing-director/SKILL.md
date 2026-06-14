---
name: marketing-director
description: Onboard users, plan marketing strategy, orchestrate campaigns, and weekly review for Marketing Autopilot repos.
---

# Marketing Director Skill

Use when operating inside a **marketing-autopilot** repository.

## Workflow

1. **Intake** — Fill `intake/active.json` from `intake/template.json`.
2. **Validate** — `npm run marketing:validate`
3. **Strategy** — Write `strategy/active-plan.md` from `strategy/template.md`.
4. **Register tasks** — Edit `runtime/orchestrator/registry.json`.
5. **Execute** — `npm run marketing:execute -- <taskId>` on appropriate runtime.
6. **Review** — Weekly updates to `ops/weekly/` and plan.json.

## Credential asks

Only request keys listed in `runtime/credentials/schema.json` for channels in `marketing.channelsPreferred`. Record names in intake `credentialsProvided`, never values in git.

## Timelines (set expectations)

| Channel | Typical first signal |
|---------|---------------------|
| Organic social | 2–4 weeks |
| SEO content | 8–12 weeks |
| Paid ads | 1–2 weeks (with budget) |
| Email list cold | 1–3 weeks (with compliant list) |
| Telegram outreach | 1–2 weeks |

Adjust per intake budget and audience size.
