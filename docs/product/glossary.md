# 术语表

| 术语 | 英文 | 定义 |
|------|------|------|
| Marketing Autopilot | — | 面向客户的营销自动化 SaaS；UI + 多项目 + Cursor Automations |
| Intake | — | 用户在 UI 填写的营销需求；产出项目内 `intake/active.json` |
| 租户 | Tenant | 注册用户；拥有多个 Project |
| 项目 | Project | 用户下的独立营销工作区；含 intake、策略、脚本、ops |
| 工作区 | Workspace | `tenants/{userId}/projects/{projectId}/` 逻辑根目录 |
| Product UI | — | 客户使用的 Web/App，非 Git 仓库；样式见 ui-design-system.md |
| Obligation | 待处理阻塞 | 合并 open user obligation；UI 收件箱 `/obligations`，非营销 todo |
| Provisioning | — | 新建项目时复制模板、初始化目录 |
| Vault | — | 按 projectId 隔离的密钥存储 |
| Automation 总指挥 | Automation Commander | **全平台契约**：每个 Project 由 Automation 分阶段写代码、run-phase、更新 progress；用户只看进度 |
| phases.json | — | 本项目阶段链：currentPhase、taskIds、successCriteria、nextPhase |
| progress.json | — | `ops/progress.json`：用户仪表盘唯一真相源（每项目独立） |
| pendingUserActions | — | progress 中需用户提供的字段（如 WAITLIST_FORM_URL）；**唯一**「待办」类提示来源之一 |
| run-phase | — | Orchestrator 命令：顺序执行当前 phase 全部 enabled tasks |
| Phase Loop | — | currentPhase → run-phase → progress 更新 → nextPhase 的循环 |
| Strategy Planner | — | 根据 intake 生成 `strategy/active-plan.md`、**phases.json**、registry、campaigns 的 Automation |
| Execution Runner | — | 按 projectId 定时 `run-phase`；更新 **本项目** `ops/progress.json` |
| Weekly Review | — | 周度复盘 Automation，调整 **本项目** strategy / phases / plan |
| 策略层 | Strategy layer | Cursor Cloud/Automation：改文档、registry、plan |
| 执行层 | Execution layer | EC2/本机/Cloud 脚本：发 DM、浏览器、webhook |
| Orchestrator | — | `runtime/orchestrator/`：registry + director CLI |
| Registry | — | `registry.json`：已注册可执行任务列表 |
| Plan | — | `plan.json`：当前优先级与 deprioritize 列表 |
| Pack | — | v0.2 计划：可插拔渠道脚本包（Telegram Pack 等） |
| Catalog | 手段目录 | `runtime/marketing-methods-catalog.json` |
| geographyRegions | 目标区域 | intake 字段；对应 `regions-catalog.json`；**同时驱动定价 Scope** |
| Identity Gate | 身份门禁 | Phase 1 完成后、Growth 前：域名邮箱、测量 OAuth、社媒绑定；见 greenfield-identity-gate.md |
| infra.* | 基础设施动作 | action-catalog：domain_dns、email_setup、measurement_connect、cta_hosting |
| L1 / L2 / L3 | 监控层级 | 执行 / 渠道 / 共创目标缺口 |
| productData | 产品数据 | 只读 DB 或 Metrics API；kpiMappings |
| included runs | — | 套餐内 Automation 运行配额 |
| Channel Pack | — | 可选加购渠道模块（Meta、SEO depth 等） |
| methodId | 营销手段 ID | 如 `social_organic`, `search_ads` |
| methodFeasibility | 手段可行性 | extracted.json 中按 region+method 评分 |
| existing-marketing.json | — | Analysis 输出的现有营销盘点（扫描 + 用户声明 + 缺口） |
| Continue / Fix / Add | — | 增量策略姿态：优化现有 / 修复缺口 / 新增手段 |
| passive site scan | — | 无凭证扫描官网：SEO 标签、GA4/Pixel、社交链接 |
| extracted.json | 资料洞察 | 从多模态材料提取的结构化字段 + existingMarketingBaseline |
| userConfirmedAnalysis | 用户确认分析 | intake 字段；true 后才生成完整策略与脚本 |
| verification_required | — | 账户需用户完成短信/CAPTCHA 等验证 |
| Human-in-the-loop | 人机协同 | 脚本暂停 + 通知用户 + 待办待验证 |
| activity log | 活动时间线 | `ops/activity/events.jsonl` — **用户 + Automation 全量**（分析、定计划、写代码、建 FB、发帖…） |
| action log | 动作明细 | `ops/actions/*.jsonl` — 单次 marketing action 细粒度记录 |
| pending-human | — | `ops/pending-human.json` 待用户处理项（含 notification 催促字段） |
| activity log | 活动日志 | user/project events.jsonl；从注册起逐步记录 |
| Notification scheduler | 通知调度 | Platform Cron：扫描 open obligation 并按节奏发信 |
| Cursor Secrets | — | Automation 环境变量，不进 git |
| Prefill | — | `automations/prefill/*.json`，导入 Automation 编辑器 |
| ops | — | `ops/daily`、`ops/weekly`、`ops/state` 运行记录 |
| realistic 时间 | — | 策略中基于渠道类型的保守达成预期，非承诺 |
| Worker | — | 长驻进程机器：EC2 PM2 或 Windows self-hosted |
| dry-run | — | 不真正 outbound，仅模拟或日志 |
| ICP | Ideal Customer Profile | 理想客户画像 — 一句话描述最想卖给谁；Intake Step 2 可自动建议、用户可改 |
| automation-policy | Platform automation policy | `runtime/automation-policy.json` — 管理员配置的全局合规与禁止动作 |
| infer-audience | — | `runtime/analysis/infer-audience.mjs` — 从产品/网站文案推断 ICP 与痛点 |
| KPI | Key Performance Indicator | 关键绩效指标 |

---

## 缩写

| 缩写 | 全称 |
|------|------|
| PRD | Product Requirements Document |
| MVP | Minimum Viable Product |
| GA4 | Google Analytics 4 |
| SMTP | Simple Mail Transfer Protocol |
| PM2 | Node.js process manager |
| ToS | Terms of Service |
