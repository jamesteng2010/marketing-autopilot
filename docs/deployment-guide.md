# Deployment Guide

**AWS 开发资源清单（EC2 / RDS / 环境变量）** → [infrastructure/aws-dev-environment.md](./infrastructure/aws-dev-environment.md)

## Cursor Cloud (default)

1. Push this repo to GitHub.
2. Create automations from `automations/prefill/*.json`.
3. Set **Repository** to your fork and **Branch** to `main`.
4. Add secrets in Automation → **Environment variables** (see `runtime/credentials/schema.json`).
5. Enable **git push** if the agent should commit ops logs and strategy updates.

First-run setup in automation environment:

```bash
npm install
```

## EC2 (long-running workers)

Use when you need 24/7 processes (Telegram reply watcher, webhooks).

1. Launch Ubuntu 22.04 instance (t3.small or larger).
2. Run `infra/ec2/user-data.sh` or paste as User Data on launch.
3. SSH in, clone repo, copy `.env.local` from secure channel.
4. PM2 example:

```bash
npm install
GIT_AUTO_SYNC=1 pm2 start npm --name marketing-worker -- run marketing:execute -- reply-watcher
pm2 save
```

5. Point cron Execution Runner at the same repo; EC2 handles realtime, Cloud handles scheduled scans.

**IAM:** Prefer instance role over long-lived access keys. If keys are required, store in Cursor Secrets only.

## Local Windows worker (Playwright social)

For Facebook/Instagram with persisted login:

1. Install Node, clone repo, `npm install`, run Playwright install script if added.
2. Manual login once per platform; session stored under `campaigns/<slug>/data/`.
3. Schedule `npm run marketing:execute -- social-auto` via Task Scheduler.
4. Strategy automations run in Cloud; execution stays on desktop.

## Stripe / payment testing

- Use Stripe **test mode** keys in Cursor Secrets.
- Never commit `sk_live_*` or webhook signing secrets.
- Agent generates checkout links only after `credentials.stripe.testMode` is confirmed in intake.

## Credential handoff checklist

Before enabling Execution Runner cron:

- [ ] `npm run marketing:validate` passes
- [ ] All `required` keys in schema satisfied in Cursor Secrets or `.env.local`
- [ ] GitHub App / token allows push if automation commits
- [ ] Rate limits configured in campaign safety config
