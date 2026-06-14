# Marketing Autopilot — Product Concept

> 正式产品文档见 **[product/PRD.md](./product/PRD.md)**（PRD、用户旅程、功能规格、路线图）。

## Vision (English)

Marketing Autopilot is a **GitHub-backed Cursor Automation system** that turns vague marketing intent into a **repeatable, measurable, code-driven campaign**.

### User journey

```
┌──────────────┐    ┌─────────────────┐    ┌──────────────────┐
│ 1. Intake    │ →  │ 2. Strategy     │ →  │ 3. Execution     │
│ User answers │    │ Plan + timeline │    │ Code + deploy    │
│ questionnaire│    │ + what agent    │    │ EC2 / Cloud /    │
│              │    │   will do       │    │ local worker     │
└──────────────┘    └─────────────────┘    └──────────────────┘
        │                    │                       │
        └────────────────────┴───────────────────────┘
                              ↓
                    ┌──────────────────┐
                    │ 4. Review loop   │
                    │ Weekly metrics → │
                    │ adjust strategy  │
                    └──────────────────┘
```

### Phase 1 — Intake (Onboarding Automation)

The agent asks structured questions and writes `intake/active.json`:

| Category | Examples |
|----------|----------|
| **Product** | Name, URL, one-liner, full description, pricing model |
| **Audience** | ICP, geography, language, pain points |
| **Goals** | Primary KPI (signups, revenue, leads), target numbers, deadline |
| **Channels** | Email, SEO, paid ads, Telegram, Instagram, LinkedIn, etc. |
| **Constraints** | Budget, brand tone, compliance, regions to avoid |
| **Existing assets** | Logo, landing page, analytics ID, CRM |

If anything is missing, the agent **asks follow-ups in chat** before proceeding.

### Phase 2 — Strategy (Strategy Planner Automation)

Given intake, the agent produces `strategy/active-plan.md` containing:

1. **Executive summary** — what we are selling, to whom, and why now
2. **Channel mix** — ranked channels with rationale
3. **90-day roadmap** — week-by-week milestones
4. **Automation design** — which automations/scripts will run, on what schedule
5. **KPI table** — metric, baseline, target, measurement source, review date
6. **Credential checklist** — what the user must provide before execution (see schema)
7. **Risk & compliance** — rate limits, anti-spam, platform ToS notes

The agent **explains in plain language**:

- What it will do automatically
- What still requires human approval (e.g. ad spend, first cold DM batch)
- Expected outcomes and **realistic time ranges** (e.g. "first leads in 2–4 weeks for organic social")

### Phase 3 — Execution (Execution Runner)

The agent:

1. Registers tasks in `runtime/orchestrator/registry.json`
2. Generates campaign scripts under `campaigns/<slug>/`
3. Chooses runtime:
   - **Cursor Cloud** — cron + browser + git push (good for research, content, scheduled posts)
   - **EC2/VPS** — long-running watchers (Telegram reply bot, webhooks)
   - **Local worker** — Playwright with persisted login sessions (FB/IG)
4. Writes infra snippets (`infra/ec2/user-data.sh`, PM2 configs)
5. Asks user for secrets **only when needed**, mapped to `runtime/credentials/schema.json`

Example credential gates:

| Integration | When asked | Stored in |
|-------------|------------|-----------|
| AWS keys | EC2 deploy | Cursor Secrets / AWS IAM role |
| Stripe | Payment landing tests | Cursor Secrets |
| Telegram session | DM outreach | Cursor Secrets (never git) |
| SMTP | Email reports | Cursor Secrets |
| GA4 / Meta pixel | Analytics setup | intake or Secrets |

### Phase 4 — Review (Weekly Automation)

Every week the agent:

- Reads `ops/daily/`, `ops/state/metrics.json`, campaign logs
- Updates `strategy/active-plan.md` (adjust priorities, pause failing channels)
- Appends `ops/weekly/YYYY-Www-report.md`
- Commits with clear message: `marketing: weekly review YYYY-Www`

---

## 产品概念（中文）

Marketing Autopilot 是 **面向客户的营销自动化 SaaS 平台**（不是让客户 clone GitHub 仓库）。

### 核心流程（每个 User · 每个 Project 相同）

1. **注册 / 创建项目** — Provisioning 独立工作区；同一用户可有多个项目。  
2. **UI 信息采集** — Automation 写入 **本项目** intake；并收集 **现有营销**（SEO、GA、Facebook、广告等）。  
3. **可行性 + Goal Workshop** — 分析后 **与用户共创** KPI 与测量源；可选接产品 DB/API。  
4. **Strategy Planner** — 生成本项目 phases/campaigns；手段集成 + L1/L2/L3 监控。  
5. **Phase Loop** — Execution `run-phase`；用户只看 progress。  
6. **复盘迭代** — Weekly Review 调整 **本项目** phases/plan；与别的项目完全隔离。

### 设计原则

- **UI 优先** — 客户只用界面，不要求 git / npm。  
- **Automation 总指挥** — 全用户、全项目统一；禁止向用户发手工营销 todo。  
- **用户 → 多项目 → 完全隔离** — intake、phases、脚本、ops、凭证均按 projectId 分隔。  
- **策略层 vs 执行层分离** — Automation 改策略与代码；浏览器登录等在 Worker 上按项目运行。  
- **保守启动** — 小流量验证后再放大。

详见 [product/automation-commander.md](./product/automation-commander.md) · [product/multi-tenant-model.md](./product/multi-tenant-model.md)。

---

## Out of scope (v1)

- Fully autonomous paid ad bidding without human budget approval
- Scraping or spam that violates platform ToS
- Storing PCI data in the repo
