# 功能规格与验收标准

本文档将 PRD 功能拆为可验收条目。

---

## F0 — 平台与多租户（v0.2 核心）

### F0.1 账号与项目

| ID | 描述 | 验收标准 |
|----|------|----------|
| F0.1.1 | 用户注册登录 | 独立 userId |
| F0.1.2 | 创建项目 | 生成 projectId + provisioning 工作区 |
| F0.1.3 | 项目列表 | 用户可 CRUD 多个项目 |
| F0.1.4 | 项目隔离 | A 的 intake 对 B 不可见（API 403） |

### F0.2 Product UI

| ID | 描述 | 验收标准 |
|----|------|----------|
| F0.2.1 | 需求表单 | 分步保存到本项目 intake/active.json |
| F0.2.2 | 策略预览 | 渲染本项目 active-plan.md |
| F0.2.3 | 凭证页 | 按 schema 引导；存入 Vault |
| F0.2.4 | 运行仪表盘 | 渲染 **本项目** `ops/progress.json`（阶段、task 摘要、pendingUserActions） |
| F0.2.5 | 无 CLI 要求 | 客户路径不出现 git clone / npm |

### F0.3 Provisioning

| ID | 描述 | 验收标准 |
|----|------|----------|
| F0.3.1 | 模板复制 | 新建项目复制 intake/strategy/runtime/ops 模板（含 progress、phases 结构） |
| F0.3.2 | 路径规范 | `tenants/{userId}/projects/{projectId}/` |
| F0.3.3 | Automation 上下文 | webhook payload 含 userId + projectId |

### F0.4 执行隔离

| ID | 描述 | 验收标准 |
|----|------|----------|
| F0.4.1 | registry | 每项目独立 registry.json |
| F0.4.2 | campaigns | 每项目独立 campaigns/ |
| F0.4.3 | Execution | Runner 只读写指定 projectId |
| F0.4.4 | Secrets | Vault 命名空间含 projectId |

---

## F1 — Intake 模块

### F1.1 结构化存储

| ID | 描述 | 验收标准 |
|----|------|----------|
| F1.1.1 | intake 模板 | `intake/template.json` 含 product/audience/goals/marketing/assets/runtime |
| F1.1.2 | 活动 intake | Agent 可创建/更新 `intake/active.json` |
| F1.1.3 | 时间戳 | `updatedAt` 为 ISO 8601 |

### F1.2 校验

| ID | 描述 | 验收标准 |
|----|------|----------|
| F1.2.1 | CLI validate | `npm run marketing:validate` 缺字段时 exit 1 并列出 missing |
| F1.2.2 | 渠道非空 | `channelsPreferred.length >= 1` |
| F1.2.3 | 不编造 | Agent 不得填充用户未提供的 KPI 数值 |

### F1.3 Onboarding Automation

| ID | 描述 | 验收标准 |
|----|------|----------|
| F1.3.1 | 预填稿 | `automations/prefill/01-intake-onboarding.json` 可导入 |
| F1.3.2 | 指令 | `automations/instructions/01-intake-onboarding.txt` 与 prefill 一致 |
| F1.3.3 | Webhook | 触发器类型 webhook（URL 在编辑器保存后获取） |

### F1.4 多类型资料与分析

| ID | 描述 | 验收标准 |
|----|------|----------|
| F1.4.1 | materials schema | `intake/materials.schema.json` 定义 type 与限制 |
| F1.4.2 | 上传类型 | 支持 text/url/image/video/audio/document |
| F1.4.3 | 项目隔离 | 材料存 `materials/{id}/`，不跨 project |
| F1.4.4 | 分析输出 | 生成 feasibility.md + extracted.json |
| F1.4.5 | 用户反馈 | UI 展示可行性报告 |
| F1.4.6 | 确认门控 | userConfirmedAnalysis 后才跑完整 Planner |
| F1.4.7 | 单条摘要 | material-notes/{id}.md 或 analysisSummary |

### F1.5 Intake Analysis Automation

| ID | 描述 | 验收标准 |
|----|------|----------|
| F1.5.1 | 预填稿 | `automations/prefill/05-intake-analysis.json` |
| F1.5.2 | URL 抓取 | url 类型材料可提取正文/meta |
| F1.5.3 | 图片 | image 类型有 vision 摘要 |
| F1.5.4 | 通知 | 分析完成可通知用户查看报告 |

### F1.6 现有营销盘点（Existing marketing）

| ID | 描述 | 验收标准 |
|----|------|----------|
| F1.6.1 | intake 字段 | `existingMarketing` 在 template.json；schema 见 existing-marketing.schema.json |
| F1.6.2 | channels catalog | `runtime/existing-marketing-channels-catalog.json` 定义渠道与发现方式 |
| F1.6.3 | 用户问卷 | UI 收集 hasActiveMarketing、渠道 status、GA/Facebook/广告 ID 或 URL |
| F1.6.4 | 被动扫描 | Analysis 扫描 product.url：SEO 基础、GA4/GTM/Pixel、社交链接 → existing-marketing.json |
| F1.6.5 | 合并输出 | feasibility.md §2 现有营销基线；extracted.existingMarketingBaseline |
| F1.6.6 | 缺口列表 | assetsNeededFromUser[]；UI 可补全 |
| F1.6.7 | 增量 posture | extracted 含 continue/fix/add；Planner 不重复创建已有主页/GA |
| F1.6.8 | API 可选 | 有 google_analytics / meta / GSC 凭证时可读只读摘要；无凭证不阻塞分析 |
| F1.6.9 | 文档 | existing-marketing-discovery.md |

---

## F2 — Strategy 模块

### F2.1 策略文档

| ID | 描述 | 验收标准 |
|----|------|----------|
| F2.1.1 | 模板 | `strategy/template.md` 定义章节结构 |
| F2.1.2 | 生成 | Planner 产出 `strategy/active-plan.md` |
| F2.1.3 | 时间预期 | 文档含「预期达成周期」段落，非空 |
| F2.1.4 | Automation 表 | 含名称、Schedule、Runtime、职责四列 |

### F2.2 任务注册

| ID | 描述 | 验收标准 |
|----|------|----------|
| F2.2.1 | registry | 每个计划任务在 **本项目** `registry.json` 有 id/name/command |
| F2.2.2 | phases | Planner 产出 **本项目** `phases.json`（currentPhase、taskIds、nextPhase） |
| F2.2.3 | plan | `plan.json` priorities 与策略渠道顺序一致 |
| F2.2.4 | campaign 生成 | 每 task 有 `campaigns/{slug}/run.mjs`（Automation 生成，非用户手写） |
| F2.2.5 | progress 初始化 | 创建 `ops/progress.json`，tasks 与 registry 对齐 |

### F2.3 Strategy Planner Automation

| ID | 描述 | 验收标准 |
|----|------|----------|
| F2.3.1 | 预填稿 | `02-strategy-planner.json` |
| F2.3.2 | 门禁 | userConfirmedAnalysis + **userConfirmedGoals** 均为 true |
| F2.3.3 | KPI 表 | active-plan KPI target 来自 goals.confirmed，非编造 |

---

## F3 — Credentials 模块

### F3.1 Schema

| ID | 描述 | 验收标准 |
|----|------|----------|
| F3.1.1 | 渠道定义 | schema.json 含 aws/stripe/telegram/smtp 等 |
| F3.1.2 | when 字段 | 每个渠道说明何时需要 |
| F3.1.3 | storeIn | 标明 cursor_secrets / never_git |

### F3.2 Intake 追踪

| ID | 描述 | 验收标准 |
|----|------|----------|
| F3.2.1 | requested | intake.credentialsRequested 数组 |
| F3.2.2 | provided | intake.credentialsProvided 仅存渠道 key 名 |
| F3.2.3 | gitignore | `.env.local`、`intake/active.json` 可配置忽略 |

---

## F4 — Execution 模块

### F4.1 Orchestrator

| ID | 描述 | 验收标准 |
|----|------|----------|
| F4.1.1 | status | `marketing:status` 输出 JSON（含 currentPhase、phaseProgress） |
| F4.1.2 | context | `marketing:context` 写入 ops/state/agent-context.md |
| F4.1.3 | execute | `marketing:execute -- <id>` 跑 registry 中 command |
| F4.1.4 | run-phase | `marketing:phase` 跑 **本项目** `phases.json` 当前阶段全部 enabled tasks |
| F4.1.5 | PROJECT_ROOT | Worker 必须设置 `PROJECT_ROOT=tenants/.../projects/{id}` |
| F4.1.6 | 未知 task | 未知 id 时 exit 1 |

### F4.2 内置任务

| ID | task id | 验收标准 |
|----|---------|----------|
| F4.2.1 | validate-intake | enabled，command 可跑 |
| F4.2.2 | context-export | enabled，command 可跑 |

### F4.3 Execution Automation

| ID | 描述 | 验收标准 |
|----|------|----------|
| F4.3.1 | Cron | `0 */4 * * *` |
| F4.3.2 | 凭证门禁 | pending 时写 daily 且不跑 outbound |
| F4.3.3 | metrics | 更新 ops/state/metrics.json |

---

## F5 — Review 模块

| ID | 描述 | 验收标准 |
|----|------|----------|
| F5.1 | 周报路径 | `ops/weekly/YYYY-Www-report.md` |
| F5.2 | Cron | 周一 `0 9 * * 1` |
| F5.3 | 数据诚实 | 无数据时写「未追踪」，不编造 KPI |
| F5.4 | plan 更新 | 可修改 plan.json priorities |

---

## F6 — 基础设施

| ID | 描述 | 验收标准 |
|----|------|----------|
| F6.1 | EC2 bootstrap | `infra/ec2/user-data.sh` 可执行，装 Node+PM2 |
| F6.2 | Local setup | `infra/scripts/setup-local.sh` npm install |
| F6.3 | AGENTS.md | Agent 合约与 PRD 一致 |
| F6.4 | Cursor rule | `.cursor/rules/marketing-director.mdc` |
| F6.5 | Skill | `.cursor/skills/marketing-director/SKILL.md` |

---

## F8 — 营销执行、汇报与人工验证

### F8.1 动作目录与脚本生成

| ID | 描述 | 验收标准 |
|----|------|----------|
| F8.1.1 | action-catalog | `runtime/action-catalog.json` 定义渠道与动作 |
| F8.1.2 | Planner 选动作 | strategy 仅包含 intake 所选渠道的动作 |
| F8.1.3 | campaigns 生成 | 每动作组合有 `campaigns/{slug}/` + registry 条目 |
| F8.1.4 | 高风险批准 | account.create、cold DM、mass connect 默认 disabled |

### F8.2 社媒账户（每项目）

| ID | 描述 | 验收标准 |
|----|------|----------|
| F8.2.1 | accounts/registry | 每项目独立账户列表与状态机 |
| F8.2.2 | session 隔离 | session 目录 gitignore，不跨 project |
| F8.2.3 | 创建/绑定 | 支持 create 新号或 login 已有号 |

### F8.3 营销动作执行

| ID | 描述 | 验收标准 |
|----|------|----------|
| F8.3.1 | 发帖 | content.post 写 action log |
| F8.3.2 | 获客 | search_groups / search_profiles 可配置 |
| F8.3.3 | 关系 | follow / connect / dm 受 rate limit + 批准门 |
| F8.3.4 | 环境路由 | requiresDesktop 任务不在 Cloud 静默失败 |

### F8.4 用户汇报

| ID | 描述 | 验收标准 |
|----|------|----------|
| F8.4.1 | action log | `ops/actions/YYYY-MM-DD.jsonl` 含 accountId、action、summary |
| F8.4.2 | 日报 | daily summary 含账户状态、动作清单、待办 |
| F8.4.3 | 仪表盘 | UI 展示今日计数与最近动作（v0.2+） |
| F8.4.4 | 事件通知 | verification_required 触发通知（可配置） |

### F8.5 人工验证（Human-in-the-Loop）

| ID | 描述 | 验收标准 |
|----|------|----------|
| F8.5.1 | 检测暂停 | 验证码/checkpoint 时 status=verification_required |
| F8.5.2 | pending-human | 写入 `ops/pending-human.json` + UI 待办 |
| F8.5.3 | 停止后续动作 | 该 account 在验证完成前不继续 outbound |
| F8.5.4 | 恢复 | 用户确认后 Runner 可继续 |
| F8.5.5 | 超时提醒 | 24h/72h 规则 documented 且可配置 |

---

## F9 — 营销手段与区域目录

| ID | 描述 | 验收标准 |
|----|------|----------|
| F9.1 | methods catalog | `runtime/marketing-methods-catalog.json` ≥6 类手段 |
| F9.2 | regions catalog | `runtime/regions-catalog.json` 含 US/CN/EU/SEA 等 |
| F9.3 | intake 字段 | geographyRegions, methodsPreferred |
| F9.4 | feasibility 评分 | extracted.methodFeasibility[] 按 region+method |
| F9.5 | Planner 映射 | 从 method.linkedActions 生成 registry |
| F9.6 | 区域禁止 | CN 项目 feasibility 不推荐 avoidChannelIds |
| F9.7 | 文档 | integration-marketing-catalog.md 描述全链路 |
| F9.8 | UI API（v0.2） | GET /catalog/recommendations?regions= |

---

## F10 — Automation 总指挥（全用户 · 全项目）

> 契约全文：[automation-commander.md](./automation-commander.md)

### F10.1 通用流程

| ID | 描述 | 验收标准 |
|----|------|----------|
| F10.1.1 | 无例外 | 任意 userId + projectId 走相同 Intake → Feasibility → Planner → Phase Loop |
| F10.1.2 | 禁止手工 todo | 产品 UI / 策略文档 **不得** 向用户展示「本周请手动完成…」营销清单 |
| F10.1.3 | 用户角色 | 用户仅：intake、确认可行性、Vault、pending-human、看 progress |
| F10.1.4 | Dogfood 同构 | `projects/marketing-autopilot-launch/` 与 `tenants/.../projects/.../` 目录与流程一致 |

### F10.2 Planner 产出（每项目）

| ID | 描述 | 验收标准 |
|----|------|----------|
| F10.2.1 | phases.json | 含 currentPhase、≥1 phase、taskIds、successCriteria、nextPhase |
| F10.2.2 | campaigns | 每个 phase task 有可执行 `campaigns/{slug}/run.mjs` |
| F10.2.3 | 动态阶段 | 不同 intake 生成不同 phase 划分（非全员固定 week_1） |
| F10.2.4 | progress 初始化 | `ops/progress.json` 含 projectId、tasks[]、phaseProgress |

### F10.3 Execution（每项目）

| ID | 描述 | 验收标准 |
|----|------|----------|
| F10.3.1 | run-phase | `PROJECT_ROOT=... npm run marketing:phase` 顺序执行当前 phase tasks |
| F10.3.2 | progress 更新 | 每个 task 完成后更新 tasks[].status 与 summary（描述 artifact，非用户指令） |
| F10.3.3 | 阻塞 | 缺 user-inputs / 凭证时写 pendingUserActions，暂停 outbound |
| F10.3.4 | 阶段推进 | successCriteria 满足后 currentPhase := nextPhase |
| F10.3.5 | 隔离 | Project A 的 run-phase **不得** 读写 Project B 的 registry/phases |

### F10.4 用户界面

| ID | 描述 | 验收标准 |
|----|------|----------|
| F10.4.1 | 仪表盘真相源 | UI 只读 **本项目** `ops/progress.json` |
| F10.4.2 | 待办来源 | 用户待办 **仅** 来自 pendingUserActions + pending-human |
| F10.4.3 | 多项目切换 | 切换 projectId 切换 progress 视图，数据不串 |

---

## F12 — 用户活动日志与催促通知

> 详述：[user-activity-and-notifications.md](./user-activity-and-notifications.md)

### F12.1 活动日志（用户 + Automation）

| ID | 描述 | 验收标准 |
|----|------|----------|
| F12.1.1 | 用户级 | 注册/登录/建 Project → `tenants/{userId}/activity/events.jsonl` |
| F12.1.2 | 项目级时间线 | `ops/activity/events.jsonl` 含 **用户 + Automation** 全部里程碑 |
| F12.1.3 | 事件目录 | type/category 来自 user-activity-events-catalog.json |
| F12.1.4 | Automation 分析 | analysis.* 事件（扫站、可行性、existing-marketing） |
| F12.1.5 | Automation 策略 | strategy.*（plan、phases、registry、progress） |
| F12.1.6 | Automation 代码 | code.*（campaign 创建/更新、artifact 路径） |
| F12.1.7 | Automation 执行 | execution.* + automation.run_* |
| F12.1.8 | Automation 营销 | marketing.action.executed、account.created、content.posted 等 |
| F12.1.9 | summary 必填 | 每条 activity 有用户可读 summary |
| F12.1.10 | 双写 | logAction → actions jsonl + activity 事件（actionLogRef） |
| F12.1.11 | 无密钥 | payload 不含 secret/session 明文 |
| F12.1.12 | UI 时间线 | 可按 category 筛选；用户/Automation 图标区分 |

### F12.2 催促通知

| ID | 描述 | 验收标准 |
|----|------|----------|
| F12.2.1 | Obligation 扫描 | Cron 合并 intake 缺项、未确认 feasibility、pending-human、pendingUserActions、缺凭证 |
| F12.2.2 | 默认节奏 | 0h / 24h / 48h / 72h / 每周 |
| F12.2.3 | 完成即停 | 用户提交后不再发该 obligation 的 reminder |
| F12.2.4 | Snooze | 24h / 72h / 7d；写 notification.snoozed |
| F12.2.5 | Quiet hours | 可配置；Push/SMS 遵守 |
| F12.2.6 | 投递日志 | delivery.jsonl + notification.sent 事件 |
| F12.2.7 | pending-human | 每项含 notification.remindCount / nextRemindAt |

---

## F13 — Goal Workshop（目标共创）

> 详述：[goal-workshop.md](./goal-workshop.md)

| ID | 描述 | 验收标准 |
|----|------|----------|
| F13.1 | 流程位置 | Analysis 后、Planner 前独立 UI 步骤 |
| F13.2 | 双门禁 | Planner 需 userConfirmedAnalysis + userConfirmedGoals |
| F13.3 | KPI 枚举 | primaryKpi 含 signups/traffic/waitlist/revenue/active_users 等 |
| F13.4 | measurement | goals.measurement 指定 source（ga4/product_db/metrics_api…） |
| F13.5 | 禁止编造 | Automation 不得写入未确认的 targetValue |
| F13.6 | baseline | unknown 时 Phase 1 含 establish-baseline task |
| F13.7 | 催促 | goals_unconfirmed obligation + 定期通知 |
| F13.8 | schema | intake/goals.schema.json + template 字段 |

---

## F14 — 手段集成、监控与产品数据

> 详述：[marketing-integration-and-metrics.md](./marketing-integration-and-metrics.md) · [product-data-connectors.md](./product-data-connectors.md)

| ID | 描述 | 验收标准 |
|----|------|----------|
| F14.1 | 手段集成 | Planner 按 Foundation/Growth/Amplify 分 phase；Fix 先于 Add |
| F14.2 | UTM | runtime/marketing/utm.json 或等价；campaign 链接带 UTM |
| F14.3 | L1/L2/L3 | metrics.json 结构；仪表盘分三层 |
| F14.4 | metrics catalog | runtime/metrics-sources-catalog.json |
| F14.5 | 有站无 SEO | foundation phase 含 audit/GA/sitemap 路径 documented |
| F14.6 | productData intake | product-data.schema.json + template |
| F14.7 | 只读凭证 | credentials schema product_db_readonly / metrics_api_readonly |
| F14.8 | collect task | registry 含 metrics-collect-*（v0.3+ 实现） |
| F14.9 | Review 闭环 | Weekly Review 读 L3 目标缺口调整 plan |

---

## F15 — Greenfield Identity Gate

> 详述：[greenfield-identity-gate.md](./greenfield-identity-gate.md)

| ID | 描述 | 验收标准 |
|----|------|----------|
| F15.1 | 文档 | greenfield-identity-gate.md 定义 Identity Stack + Phase 关系 |
| F15.2 | intake.identity | template.json + identity.schema.json |
| F15.3 | infra actions | action-catalog `infrastructure` + infra.domain_dns / email_setup / measurement_connect / cta_hosting |
| F15.4 | Phase 顺序 | greenfield：Phase 1 不含 bulk account.create；Growth 前 Identity Gate |
| F15.5 | 半自动邮箱 | infra.email_setup 文档化 SES/Resend/Workspace；禁止 disposable 批量 Gmail |
| F15.6 | Obligation | identity_domain_missing / identity_dns_pending / identity_measurement_missing 类型 documented |
| F15.7 | 与 accountStrategy | useExistingAccounts 优先 login；create 需 actionsApproved.accountCreate |
| F15.8 | UI copy | 禁止「请手动注册 Gmail」；验证用 verification_required + pending-human |

---

## F16 — Product UI 样式与设计

> 详述：[ui-design-system.md](./ui-design-system.md)

| ID | 描述 | 验收标准 |
|----|------|----------|
| F16.1 | 设计文档 | ui-design-system.md 含 tokens、IA、分屏、组件 |
| F16.2 | 心智模型 | Dashboard / Activity / Obligations 职责分离 documented |
| F16.3 | 禁止 todo UI | 无 weekly marketing checklist；task 只读无 checkbox |
| F16.4 | Obligations | Inbox 样式、排序、Snooze、无手动勾选完成 |
| F16.5 | Dark theme | Control Tower Dark tokens 与 og.svg 一致 |
| F16.6 | App Shell | 顶栏 project switch + obligation badge + 侧栏 nav |
| F16.7 | Onboarding | Stepper Intake→Analysis→Goals→Strategy→Running |
| F16.8 | Pattern 组件 | PhasePipeline、KpiHero、ActivityFeed、ObligationCard 等 listed |
| F16.9 | Credentials UI | 无明文；Connected 状态展示 |
| F16.10 | a11y | WCAG 2.1 AA 目标与 focus 环 documented |
| F16.11 | MVP 范围 | P0–P2 屏幕优先级 listed |
| F16.12 | 实现路径 | platform/web + Tailwind/shadcn 建议 |

---

## F11 — 商业化与定价（v1.0）

> 详述：[pricing.md](./pricing.md)

| ID | 描述 | 验收标准 |
|----|------|----------|
| F11.1 | 全球统一价 | 仅 USD 标价；无按客户注册地拆 SKU |
| F11.2 | Scope 系数 | intake.geographyRegions → Focused / Multi / Global；账单可复算 |
| F11.3 | Quote API | `GET /billing/quote` 返回 plan + scope + projects 月费 |
| F11.4 | Free 边界 | Free 无 run-phase；Analysis 有月度上限 |
| F11.5 | Runs 计量 | phase_run 等写入 billing 事件；超配额可通知/软暂停 |
| F11.6 | Pack 加购 | Channel Pack 与 region catalog avoid 规则一致 |
| F11.7 | UI 预览 | Intake 选 region 时显示 Scope 等级与预估价 |

---

## F7 — 文档

| ID | 描述 | 验收标准 |
|----|------|----------|
| F7.1 | PRD | docs/product/PRD.md |
| F7.2 | 用户旅程 | docs/product/user-journey.md |
| F7.3 | 功能规格 | 本文档 |
| F7.4 | README 链接 | 根 README 指向 docs/product |
| F7.5 | 手段与区域 | marketing-methods.md + channels-by-region.md |
| F7.6 | 集成说明 | integration-marketing-catalog.md |
| F7.7 | Automation 总指挥 | automation-commander.md（全用户 · 全项目契约） |
| F7.8 | 现有营销盘点 | existing-marketing-discovery.md |
| F7.9 | 定价 | pricing.md |
| F7.10 | 活动与通知 | user-activity-and-notifications.md |
| F7.11 | 手段与监控 | marketing-integration-and-metrics.md |
| F7.12 | 目标共创 | goal-workshop.md |
| F7.13 | 产品数据 | product-data-connectors.md |
| F7.14 | 实现技术 | implementation.md |
| F7.15 | 身份门禁 | greenfield-identity-gate.md |
| F7.16 | UI 样式 | ui-design-system.md |

---

## 非功能需求

| 类别 | 要求 |
|------|------|
| 安全 | 密钥不进 git；schema rules  enforced |
| 可维护 | intake 字段变更同步 template + user-intake-guide |
| 可 fork | 无硬编码客户产品名（预填 repo 可改为 fork 地址） |
| 节点 | Node ≥ 18 |

---

## 测试清单（手动）

```bash
# 1. 无 intake 时 validate 失败
npm run marketing:validate   # expect exit 1

# 2. 复制 template 填必填项后 validate 通过
cp intake/template.json intake/active.json
# 编辑后：
npm run marketing:validate   # expect exit 0

# 3. context 生成
npm run marketing:context
test -f ops/state/agent-context.md

# 4. execute 内置任务
npm run marketing:execute -- validate-intake
```
