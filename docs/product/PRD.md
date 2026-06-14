# Marketing Autopilot — 产品需求文档（PRD）

| 字段 | 内容 |
|------|------|
| 产品名称 | Marketing Autopilot |
| 版本 | v0.2 目标（多租户 + Product UI） |
| 状态 | 产品定义已更新；v0.1 为技术模板骨架 |
| 代码仓库 | [jamesteng2010/marketing-autopilot](https://github.com/jamesteng2010/marketing-autopilot) |
| 最后更新 | 2026-06-14 |

---

## 1. 背景与问题

### 1.1 背景

独立开发者、小团队和非专业市场人员往往有产品，但缺少：

- 可执行的营销策略（不只是「多发帖」）
- 把策略变成代码/自动化流水线的能力
- 在 Cloud、EC2、本机之间正确分工的运行环境知识
- 按数据迭代策略的闭环

Cursor Automations 已具备定时 Agent、GitHub 集成、Secrets 管理能力，但缺少一套**标准化的营销自动化产品形态**。

### 1.2 要解决的问题

| 痛点 | 本产品如何解决 |
|------|----------------|
| 需求表达模糊 | **UI 表单 + 多类型资料**（文本/网站/图/音视频）+ AI 分析 |
| 不懂能否做营销 | **可行性分析**（feasibility.md）反馈给用户后再定计划 |
| 策略不可执行 | 按 **项目** 生成策略文档、目录与脚本 |
| 多产品/多客户混在一起 | **用户 → 多项目**，数据与脚本完全隔离 |
| 执行与策略混在一起 | 策略层（Cloud）与执行层（EC2/本机）分离 |
| 密钥管理混乱 | 项目级 Vault + schema 按需索取 |
| 无法迭代 | 项目级 Weekly Review + ops 仪表盘 |
| 用户要自己执行营销 todo | **Automation 总指挥**：每项目分阶段写代码、运行、汇报 |

### 1.3 产品定位

**Marketing Autopilot** = 面向客户的 **营销自动化 SaaS 平台**。

- 客户提供 **Web/App 界面** 输入产品信息与营销目标  
- **每一个 projectId** 均走同一流程：intake → 可行性 → 策略 → **分阶段 Automation 执行**  
- 用户 **只看进度、只补信息**；阶段计划与 `campaigns/` 代码由 Automation 生成并运行  
- 底层用 Cursor Automations + 隔离存储；**客户无需 clone 仓库**  

GitHub 仓库是 **平台工程与 Provisioning 模板**，不是客户入口。

详见 [multi-tenant-model.md](./multi-tenant-model.md)、[automation-commander.md](./automation-commander.md)（**全用户全项目通用契约**）。

---

## 2. 目标与非目标

### 2.1 产品目标

**v0.2（产品形态）：**

1. 用户注册后可在 UI **创建多个独立项目**
2. 每个项目在 UI **30 分钟内** 完成 intake，得到策略预览页
3. 每个项目独立拥有：`intake`、`strategy`、`campaigns/`、`registry`、`ops/`（互不可见）
4. 策略页说明：**Automation 将分哪些阶段、每阶段自动做什么**（非用户手工 todo）
5. 每个项目具备 `phases.json` + `ops/progress.json`；用户仅通过 pending-human 补信息
6. 凭证与执行按 **projectId** 隔离；密钥不进 git

**v0.1（已交付骨架）：** 单项目目录模板 + Orchestrator CLI + 4 个 Automation 预填稿，供平台实现参考。

### 2.2 非目标（v0.1 不做）

- 全自动大额广告投放（无人工预算审批）
- 违反平台 ToS 的爬取/ spam
- 在 git 中存储 PCI/会话类敏感数据
- 替代 CRM 或全功能 MarTech 套件

---

## 3. 目标用户

详见 [personas.md](./personas.md)。核心三类：

1. **独立开发者 / Indie hacker** — 有产品，零市场团队
2. **小团队创始人** — 需要可复制的营销 SOP
3. **Cursor 重度用户** — 已用 Automations，希望营销场景开箱即用

---

## 4. 核心用户流程

```
① 注册 / 登录
       ↓
② 创建项目（projectId）
       ↓
③ UI 填写需求 + **上传资料**（文本/URL/图/音视频等）
       ↓
③b Automation **分析资料** → 可行性营销策略 → **反馈用户确认**
       ↓
④ 确认后 Automation 生成本项目 strategy + **phases.json** + registry + **campaigns 代码**
       ↓
⑤ 凭证/用户输入（仅当 pending-human 或 Vault 要求时）
       ↓
⑥ Automation **run-phase** 执行当前阶段 → 更新 ops/progress.json
       ↓
⑦ 用户看仪表盘；Weekly Review 调整下一阶段
       ↺ 回到 ④/⑥
```

**通用规则：** 上列流程对 **每个用户的每个 Project** 相同；仅 phases/task 内容因 intake 而异。

详细交互见 [user-journey.md](./user-journey.md)、[automation-commander.md](./automation-commander.md)。

---

## 5. 功能需求

### 5.0 平台与多租户（v0.2 新增）

**Automation 总指挥：** 用户仅提供 intake/资料/凭证/验证；阶段计划、生成 `campaigns/*.mjs`、执行 `run-phase`、更新 `ops/progress.json` 均由 Automation 完成。见 [automation-commander.md](./automation-commander.md)。

| 模块 | 需求 |
|------|------|
| **账号** | 注册、登录、会话 |
| **项目 CRUD** | 新建 / 重命名 / 归档；列表切换 |
| **Provisioning** | 新建项目时复制模板到 `tenants/{userId}/projects/{projectId}/` |
| **隔离** | API 与 Automation 强制带 `userId` + `projectId`，禁止跨项目读写 |
| **Product UI** | 需求表单、策略预览、凭证页、运行仪表盘、周报 |
| **Platform API** | 项目数据读写、Vault 凭证、触发 Automation |
| **营销执行** | 按需求生成脚本：账户、发帖、获客、汇报、人工验证通知 |

数据模型：[multi-tenant-model.md](./multi-tenant-model.md)  
执行动作详述：[execution-and-actions.md](./execution-and-actions.md)

### 5.1 Intake（信息采集 + 多类型资料）

**触发：** UI 表单保存；资料上传；可选 Onboarding Automation（Webhook，payload 含 `projectId`）

**输入：**

| 来源 | 内容 |
|------|------|
| 表单 | 产品、受众、目标、渠道、预算、**现有营销（SEO/GA/Facebook/广告等）** → `intake/active.json` |
| **资料库** | 文本、网站 URL、图片、音频、视频、PDF 等 → `materials.items[]` + 对象存储 |
| **被动发现** | Automation 扫描 `product.url`：技术 SEO、GA4/GTM/Pixel、社交链接 → `existing-marketing.json` |

**支持资料类型：** `text` | `url` | `image` | `video` | `audio` | `document` | `spreadsheet`  
规范见 [intake/materials.schema.json](../../intake/materials.schema.json)、[intake-and-materials.md](./intake-and-materials.md)

**输出（结构化）：** 该项目的 `intake/active.json`（非全局共享）

**输出（分析 — 给用户反馈）：**

| 文件 | 用途 |
|------|------|
| `intake/analysis/feasibility.md` | **可行性营销策略分析**（渠道匹配、风险、计划摘要） |
| `intake/analysis/extracted.json` | 从资料提取的卖点、受众、品牌、**existingMarketingBaseline** |
| `intake/analysis/existing-marketing.json` | **现有营销盘点**（用户声明 + 站点扫描 + API 摘要 + 待补信息） |
| `intake/analysis/material-notes/{id}.md` | 单条资料分析摘要 |

**行为：**

- UI 支持拖拽上传、URL、粘贴长文本；**现有营销问卷**（是否在跑、渠道、链接/ID）  
- 用户点击「开始分析」→ **Intake Analysis Automation**：多模态解析 + **站点被动扫描** + 合并现有营销基线  
- 分析完成后 UI 展示 feasibility 报告 **及** 已发现 GA/Pixel/SEO/社交等；列出 `assetsNeededFromUser`  
- 用户 **确认可行性** 后进入 **Goal Workshop**，**共同确认** KPI 与测量方式（`goals.userConfirmedGoals`）  
- **两者均确认后** Strategy Planner 按 Continue/Fix/Add + **已确认目标** 生成 phases/campaigns  
- 缺字段时 UI 标红；可选 Agent 对话补全（scope = 当前 projectId）

### 5.1b Goal Workshop（目标共创）

分析完成后、Planner 之前：与用户 **共同制定** 主 KPI、目标值、截止日期、测量数据源（GA4 / 产品 DB / Metrics API 等）。`goals.userConfirmedGoals` 为第二道门禁。  
详述：[goal-workshop.md](./goal-workshop.md)

### 5.1c 产品数据连接（可选）

只读 DB / Metrics API → 真实 signup/激活/MRR baseline、L3 监控、Review 调 phase。  
详述：[product-data-connectors.md](./product-data-connectors.md)

### 5.2 Strategy Planner（策略制定）

**输入：** `active.json` + `extracted.json` + `feasibility.md` + **`existing-marketing.json`** + **marketing-methods-catalog** + **regions-catalog** + action-catalog

**Catalog 集成：** 见 [integration-marketing-catalog.md](./integration-marketing-catalog.md)

- 仅采纳 feasibility 为 H/M 且用户确认的 **methodId**
- **现有渠道优先**：已 active 的 SEO/GA/社媒 → phase 1 以 audit/fix/optimize 为主；**add** 仅补充 catalog 推荐且用户未覆盖的手段
- 映射 `linkedActions` → registry；`automationSupport: none` 仅写进计划不生成 task
- 按 `geographyRegions` 拆分渠道建议

**触发：** `userConfirmedAnalysis === true` **且** `userConfirmedGoals === true`

**输出（均在本项目工作区内）：**

- `strategy/active-plan.md`（按 template 结构）
- 更新本项目的 `runtime/orchestrator/plan.json`
- 写 **本项目** `runtime/orchestrator/phases.json`（阶段 id、taskIds、successCriteria、nextPhase）
- 初始化 **本项目** `ops/progress.json`
- 按需生成本项目 `campaigns/{slug}/` **可执行脚本**（非仅 README）

**策略文档必须包含：**

1. Executive summary
2. 渠道优先级表
3. 90 天周路线图
4. Automation / 脚本清单（名称、频率、运行环境）
5. KPI 表（**baseline / target / deadline / source** — target 必须来自 `goals.confirmed`，禁止编造）
6. 凭证清单（仅 key 名称）
7. 风险与合规说明
8. **向用户说明：** 自动化会做什么、需人工批准的事项、** realistic 达成周期**
9. **§ Current marketing stack** 与 **§ Incremental plan (build on existing)** — 基于 `existing-marketing.json`
10. **动作清单：** 从 `runtime/action-catalog.json` 选取的本项目 actions（创建账户、发帖、找群、加好友等）

### 5.3 脚本与动作生成（Execution Design）

**触发：** Strategy Planner 在生成策略时同步完成（带 `projectId`）

**输入：** intake 渠道与目标 + [action-catalog.json](../../runtime/action-catalog.json)

**输出（本项目内）：**

| 产出 | 说明 |
|------|------|
| `campaigns/{slug}/` | 可执行脚本（run.mjs、config.json、safety 限额） |
| `registry.json` | 注册 task，绑定 channels、requiresDesktop、需批准动作 |
| `accounts/registry.json` | 计划创建/绑定的 FB、IG、X 等账户列表 |
| `strategy/active-plan.md` | 人类可读：每渠道动作、频率、预期线索 |

**Planner 规则：**

- 仅对用户选择的渠道生成脚本
- `account.create`、冷 DM、加好友等 **高风险动作** 默认 `enabled: false`，策略页需用户批准
- 创建账户类动作标记 `requiresDesktop: true`，部署到 Local Worker
- 每个 action 类型可在日报/仪表盘中单独统计

详见 [execution-and-actions.md](./execution-and-actions.md)。

### 5.4 Credential Gate（凭证门控）

**规则：**

- 映射表：`runtime/credentials/schema.json`
- 仅当 registry 中 task 的 `channels` 需要时才向用户索取
- 记录 `credentialsRequested` / `credentialsProvided`（**名称 only**）
- 存储：平台 Secret Vault（按 projectId 命名空间）；Automation 使用 `MA_{projectId}_*` Secrets

**支持渠道（v0.1 schema）：** AWS、Stripe、Telegram、SMTP、OpenAI、Meta Ads、Google Ads、Twilio SMS

### 5.5 Execution Runner（执行编排 — 每个 Project）

**触发：** 每项目独立 Cron；每次 run **必须** 绑定单一 `projectId` / `PROJECT_ROOT`

**行为（总指挥模式，全平台统一）：**

1. 读 **本项目** `runtime/orchestrator/phases.json` → `currentPhase`
2. 若 `ops/pending-human.json` 有阻塞项 → 暂停 phase，通知用户补信息
3. 否则执行 `director run-phase`（跑 registry 中该 phase 的 tasks）
4. 每个 task 运行 **本项目** `campaigns/<slug>/run.mjs`（由 Planner/Execution 生成）
5. 更新 **本项目** `ops/progress.json`（用户仪表盘唯一真相源）
6. 更新 `ops/actions/`、`ops/state/metrics.json`、`ops/daily/`
7. `successCriteria` 满足 → 推进 `currentPhase` 至 `nextPhase`

**禁止：** 向用户下发手工 marketing checklist；跨 projectId 读写。

**支持的营销动作类型（示例）：** 创建/登录 FB·IG·X、养号、发帖、搜群、加好友、私信 — 按 **本项目** 策略启用。

详见 [automation-commander.md](./automation-commander.md)。

### 5.6 用户汇报（Reporting）

**三层监控：** L1 执行（activity/progress）· L2 渠道（GA/GSC/Ads/DB）· L3 **共创目标** 缺口。见 [marketing-integration-and-metrics.md](./marketing-integration-and-metrics.md)。

| 层级 | 数据源 |
|------|--------|
| L1 | `ops/activity/events.jsonl`, `ops/progress.json` |
| L2 | `ops/state/metrics.json`（GA4、GSC、Ads、product_db…） |
| L3 | `goals` + metrics 对比 target/deadline |

**目标：** 用户无需读脚本即可了解「做了什么、结果如何、还要做什么」。

| 层级 | 形式 |
|------|------|
| 实时 | 项目仪表盘：今日动作、成功/失败、待办 |
| 事件通知 | 邮件 / Push / Telegram：验证待办、限流、线索发现 |
| 结构化日志 | `ops/actions/YYYY-MM-DD.jsonl`（按 accountId、action） |
| **活动时间线** | `ops/activity/events.jsonl` — **用户 + Automation 全部工作**（分析、计划、代码、营销） |
| 日报 | `ops/daily/YYYY-MM-DD-summary.md` |
| 周报 | Weekly Review → `ops/weekly/` |

日报 **必须包含：** 各账户状态、今日动作清单、潜在线索摘要、**待用户处理的验证/批准项**。

### 5.7 人工验证通知（Human-in-the-Loop）

当注册或营销过程中遇到 **短信码、CAPTCHA、checkpoint、新设备确认** 等：

1. 对应账户状态 → `verification_required`
2. **暂停** 该账户后续动作，避免风控升级
3. 写入 `ops/pending-human.json` + UI 待办卡片
4. **通知用户**（仪表盘 + 邮件/Push；**定期催促** 直至完成或 Snooze）  
5. 用户完成后标记「已验证」→ Worker 检测 session 恢复 → 继续执行  

**统一策略：** 不仅验证场景 — 凡 Intake 缺项、可行性未确认、`pendingUserActions`、缺凭证等 **所有需用户提供信息** 的情况，均走同一 obligation + 提醒队列。详见 [user-activity-and-notifications.md](./user-activity-and-notifications.md)。

超时未处理：默认 0h / 24h / 48h / 72h 提醒，之后每周一次。详见 [execution-and-actions.md](./execution-and-actions.md) §6。

### 5.8 Weekly Review（周度复盘）

**触发：** 每周一 09:00

**行为：**

1. 汇总过去 7 天 ops
2. 写 `ops/weekly/YYYY-Www-report.md`
3. 小步调整 `active-plan.md` 与 `plan.json`
4. Git commit `marketing: weekly review`

### 5.9 Automation 总指挥（全用户 · 全项目）

**产品级 invariant：** 任意 `userId` 下任意 `projectId` 均遵守 [automation-commander.md](./automation-commander.md)。

| 要求 | 说明 |
|------|------|
| Provisioning | 每项目复制 phases/progress/registry 模板结构 |
| Planner | 按 **该项目** intake 生成 phases 与 campaigns，非全局固定 week_1 |
| Execution | `PROJECT_ROOT=tenants/.../projects/{projectId}` + `run-phase` |
| UI | 只展示 `ops/progress.json` + `pendingUserActions` |
| 多项目 | 同一用户多项目并行，各自 currentPhase 独立 |

Dogfood 示例：`projects/marketing-autopilot-launch/` 与任意租户项目 **同构**。

### 5.10 Orchestrator CLI（平台内部 / 开发者）

平台 Worker 或 Automation 在项目工作区根目录调用（需 `PROJECT_ROOT` 环境变量）：

| 命令 | 用途 |
|------|------|
| `npm run marketing:status` | 本项目状态快照 |
| `npm run marketing:validate` | 本项目 intake + 凭证 |
| `npm run marketing:context` | 导出本项目 Agent 上下文 |
| `npm run marketing:phase` | 执行 **当前 PROJECT_ROOT** 的 currentPhase |
| `npm run marketing:execute -- <id>` | 执行 **本项目** 单个 registry task |

**客户不直接运行 CLI**；UI 与 API 封装上述能力。

### 5.11 用户活动日志与催促通知

**从注册起** 记录用户每一步活动；**任何时候** 需要用户提供信息时，按策略 **定期发通知催促**。

| 能力 | 说明 |
|------|------|
| **活动日志** | User + Project `events.jsonl`；含 **Automation 全量工作**（分析/计划/代码/营销/复盘） |
| **事件目录** | `runtime/user-activity-events-catalog.json` |
| **Open obligations** | Intake 缺项、可行性未确认、pendingUserActions、pending-human、缺凭证、批准门 |
| **提醒节奏** | 立即 → 24h → 48h → 72h → 每周；quiet hours；Snooze |
| **配置** | `tenants/{userId}/notifications.json` + 项目 `runtime/notifications.json` |
| **投递日志** | `notifications/delivery.jsonl` + activity `notification.sent` |

Platform **Notification scheduler** 统一发信；Automation 只写 pending 状态，不直接 spam 用户。

详述：[user-activity-and-notifications.md](./user-activity-and-notifications.md)

功能验收标准见 [features.md](./features.md)。

---

## 6. 商业化与定价

**全球市场：** 单一产品线、**USD** 标价；不按客户注册地分版。  
**Scope 定价：** 每个 Project 按 Intake 的 **`audience.geographyRegions[]`**（客户要营销到的区域）计 **Focused / Multi-market / Global** 系数，与 Plan、Project 数、Automation runs 组合计费。

| 维度 | 说明 |
|------|------|
| Plan | Free / Starter / Growth / Scale / Enterprise |
| Scope | 1 区域 ×1.0；2–3 区域 ×1.35；≥4 区域 ×1.75 |
| Runs | analysis / planner / phase / review 计入套餐配额 |
| Pack | Meta、SEO、Messaging、Worker 等可选加购 |

Free：Intake + 可行性 + 现有营销盘点；**不** 含 run-phase 执行。  
详述：[pricing.md](./pricing.md)

---

## 7. 架构原则

| 原则 | 说明 |
|------|------|
| **UI 优先** | 客户只用界面，不 clone 仓库 |
| **项目隔离** | 用户可多项目；每项目独立 intake / 策略 / 脚本 / ops |
| 策略 / 执行分离 | Cloud 改文档与 registry；浏览器登录在长驻 Worker |
| 存储可追溯 | 每项目工作区版本化（Git 子仓库或对象存储）；密钥不进库 |
| 保守启动 | 默认低频率、首批 outreach 需人工确认 |
| 按需索取密钥 | 按项目、按渠道索取，Vault 隔离 |

架构详图：[../architecture.md](../architecture.md) · [multi-tenant-model.md](./multi-tenant-model.md)

---

## 8. 成功指标（产品自身）

| 指标 | 目标 |
|------|------|
| 注册 → 首项目创建 | ≤3 分钟 |
| Intake 完成率 | 开始填写后 ≥80% 在 UI 通过完整校验 |
| 策略可读性 | 用户在 UI 5 分钟内读懂「本项目做什么、多久」 |
| 项目隔离 | 零跨项目数据泄漏（API + Automation 审计） |
| 多项目 | 单用户 ≥2 项目时互不影响 |

---

## 9. 风险与合规

| 风险 | 缓解 |
|------|------|
| 平台封号（社媒 DM） | rate limit；冷 DM/加好友需批准；ToS 声明 |
| 注册需人工验证 | verification_required + 通知 + 暂停后续动作 |
| Session 泄露 | 账户 session never git；Vault 隔离 |
| 过度承诺 KPI | 策略必须写 realistic 时间范围 |
| Cloud 无法跑桌面浏览器 | 执行层路由到 local worker |

---

## 10. 依赖与集成

| 依赖 | 用途 |
|------|------|
| Cursor Automations | 策略层定时 Agent |
| GitHub | 代码与状态存储 |
| Node.js ≥18 | Orchestrator CLI |
| Cursor Secrets | 生产密钥 |
| AWS S3（或等价） | 项目资料文件存储 |
| 语音/视觉 API（可选） | 音视频转写、图片分析 |
| 各渠道 API | 按 campaign 选配 |

---

## 11. 版本规划

见 [roadmap.md](./roadmap.md)。

---

## 12. 附录

- **产品实现技术文档**：[implementation.md](./implementation.md)
- **Greenfield Identity Gate**：[greenfield-identity-gate.md](./greenfield-identity-gate.md)
- Intake 字段说明：[../user-intake-guide.md](../user-intake-guide.md)
- 部署指南：[../deployment-guide.md](../deployment-guide.md)
- Agent 合约：[../../AGENTS.md](../../AGENTS.md)
- 手段与区域：[marketing-methods.md](./marketing-methods.md) · [channels-by-region.md](./channels-by-region.md)
- Catalog 集成：[integration-marketing-catalog.md](./integration-marketing-catalog.md)
- 多租户：[multi-tenant-model.md](./multi-tenant-model.md)
- 执行与汇报：[execution-and-actions.md](./execution-and-actions.md)
- 术语：[glossary.md](./glossary.md)
