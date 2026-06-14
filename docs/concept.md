# Marketing Autopilot — Product Concept

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

Marketing Autopilot 是一个 **连接 GitHub 仓库的 Cursor 自动化营销系统**，把用户的营销需求变成 **可执行、可度量、可迭代的代码化 campaign**。

### 核心流程

1. **信息采集** — 用户提供产品描述、目标用户、营销目标、预算、渠道偏好等；Automation 写入 `intake/active.json`，缺项则追问。
2. **策略制定** — 根据信息输出 `strategy/active-plan.md`：渠道组合、90 天路线图、KPI、自动化会做什么、预计多久达成什么目标。
3. **代码与部署** — 生成 campaign 脚本，注册到 orchestrator；按需部署到 Cursor Cloud、EC2 或本机 Worker；缺少 AWS / Stripe / 手机号 / Telegram session 等时再向用户索取。
4. **复盘迭代** — 定时 Automation 读日志与指标，调整策略并提交 git。

### 设计原则

- **策略层 vs 执行层分离** — Cursor Automation 改策略和配置；浏览器登录、长连接监听等放在合适的基础设施上。
- **一切可追溯** — intake、strategy、ops 日志都在 git 里（密钥除外）。
- **保守启动** — 先小流量验证，再放大；内置 rate limit 和安全配置模板。
- **通用框架** — 本仓库不含具体产品；每个客户/项目复制仓库或 fork 后填 intake 即可。

---

## Out of scope (v1)

- Fully autonomous paid ad bidding without human budget approval
- Scraping or spam that violates platform ToS
- Storing PCI data in the repo
