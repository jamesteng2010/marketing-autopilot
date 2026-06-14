# Marketing Autopilot

**Cursor Automation + GitHub repo framework for AI-driven marketing.**

Connect a GitHub repository to Cursor Automations. The agent collects your product and marketing goals, designs a strategy with timelines, generates runnable campaign code, deploys to cloud or local workers, and iterates from real performance data.

---

## What this repo provides

| Layer | Purpose |
|-------|---------|
| **Intake** | Structured questionnaire: product, audience, goals, budget, channels |
| **Strategy** | AI-generated plan: channels, KPIs, timeline, automation roadmap |
| **Execution** | Scripts + orchestrator registry; runs on Cursor Cloud, EC2, or local worker |
| **Credentials** | Schema-driven secret collection (AWS, Stripe, Telegram, SMTP, etc.) |
| **Review loop** | Weekly automation adjusts strategy from logs and metrics |

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/jamesteng2010/marketing-autopilot.git
cd marketing-autopilot
npm install
cp .env.example .env.local   # never commit secrets
```

### 2. Fill intake (first run)

Copy `intake/template.json` → `intake/active.json` and fill every field, or run the onboarding automation (see below).

### 3. Import Cursor Automations

Prefill drafts live in `automations/prefill/`. In Cursor → **Automations → New**, import or paste each JSON, then set **Environment variables** for your repo and secrets.

| # | Automation | Trigger | Role |
|---|------------|---------|------|
| 01 | Marketing Onboarding | Webhook / manual | Collect requirements, write `intake/active.json` |
| 02 | Strategy Planner | After intake or manual | Produce `strategy/active-plan.md` + execution roadmap |
| 03 | Execution Runner | Cron (e.g. every 4h) | Run registered tasks from `runtime/orchestrator/registry.json` |
| 04 | Weekly Review | Mon 09:00 | Adjust strategy from `ops/` logs and KPIs |

Full instructions: [docs/architecture.md](docs/architecture.md) · [automations/README.md](automations/README.md)

### 4. Deploy execution (optional)

- **Cursor Cloud Agent** — cron automations run in Cursor's cloud (browser, git push).
- **EC2 / VPS** — `infra/ec2/user-data.sh` + PM2 for 24/7 workers (e.g. reply watchers).
- **Local Windows worker** — Playwright social agents on a desktop with logged-in sessions.

See [docs/deployment-guide.md](docs/deployment-guide.md).

---

## Directory layout

```
marketing-autopilot/
├── intake/              # User requirements (active.json = current client)
├── strategy/            # Generated marketing plan + channel mix
├── runtime/
│   ├── orchestrator/    # Task registry + CLI director
│   └── credentials/     # Which secrets each channel needs
├── automations/
│   ├── prefill/         # Cursor Automation JSON drafts
│   └── instructions/    # Plain-text agent prompts
├── campaigns/           # Generated per-campaign scripts
├── ops/                 # Daily logs, weekly reports, state JSON
├── infra/               # EC2 user-data, local setup scripts
├── docs/                # Concept, architecture, guides
└── .cursor/             # Rules + skills for in-repo agents
```

---

## npm scripts

```bash
npm run marketing:status      # Snapshot of intake + strategy + ops state
npm run marketing:context     # Markdown bundle for Cursor agent context
npm run marketing:validate    # Check intake + credentials completeness
npm run marketing:execute -- <taskId>   # Run one orchestrator task
```

---

## Security

- Never commit `.env.local`, session strings, or API keys.
- Store production secrets in **Cursor Automation → Environment variables** or your cloud secret manager.
- See `runtime/credentials/schema.json` for required vs optional keys per channel.

---

## Related reading

- [docs/concept.md](docs/concept.md) — Full product vision (EN + 中文)
- [docs/user-intake-guide.md](docs/user-intake-guide.md) — Field-by-field intake help
- [AGENTS.md](AGENTS.md) — Agent behavior contract for this repo
