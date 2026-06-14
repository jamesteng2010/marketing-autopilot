# 产品路线图

---

## 版本概览

| 版本 | 主题 | 状态 | 目标 |
|------|------|------|------|
| **v0.1** | 单项目技术模板 | ✅ 已完成 | Orchestrator + Automation 预填 + 文档骨架 |
| **v0.2** | **Product UI + 多租户 + Automation 总指挥** | 🎯 当前目标 | 每项目 phases/progress；用户只看仪表盘 |
| **v0.3** | 渠道 Pack + 仪表盘 | 计划 | Telegram/SEO 等可插拔脚本 |
| **v1.0** | 商业化 SaaS | 愿景 | 全球定价 Scope + runs + Pack |

---

## v0.1 — 技术模板（已完成，非客户产品形态）

**说明：** v0.1 交付的是 **平台实现参考**，不是客户使用路径。客户不应 clone 仓库填 intake。

| 交付物 | 状态 |
|--------|------|
| 单项目目录模板（intake/strategy/runtime/ops） | ✅ |
| orchestrator director.js | ✅ |
| 4× Automation prefill | ✅ |
| credentials/schema.json | ✅ |
| docs/product 产品文档 | ✅ |

**缺口（v0.2 补齐）：** Product UI、用户账号、多项目、租户隔离 API

---

## v0.2 — Product UI + 多租户（当前目标）

**目标：** 客户通过界面使用；每用户多项目；数据与脚本完全隔离。

| 功能 | 说明 |
|------|------|
| 账号系统 | 注册、登录、JWT/session |
| 项目 CRUD | 新建 / 列表 / 归档 |
| Provisioning API | 创建项目 → 复制模板（含 phases 结构、空 progress.json） |
| **Automation 总指挥** | Planner 每项目生成 phases + campaigns；Execution run-phase；UI 读 progress |
| 策略预览 UI | 展示 active-plan + **阶段计划**（非手工 todo） |
| 运行仪表盘 | **只读** 本项目 `ops/progress.json` + pendingUserActions |
| **需求填写 UI** | 分步表单 + 资料库 + **现有营销问卷**（SEO/GA/Facebook/广告） |
| **Goal Workshop UI** | 分析后共创 KPI + measurement + userConfirmedGoals |
| **手段集成 / 监控** | phases Foundation→Growth；L1/L2/L3 metrics — 见 marketing-integration-and-metrics |
| **productData intake** | 可选 DB/API 声明 + kpiMappings（v0.3 collect） |
| **Catalog API** | 读 methods + regions；Intake 推荐 |
| **methods/regions JSON** | marketing-methods-catalog + regions-catalog |
| 凭证 UI | 项目级 Vault + refs.json |
| Automation 状态 | 最近 run-phase / Cron 状态（平台侧） |
| Automation 参数化 | prompt / webhook 带 userId + projectId + workspaceRoot |
| 隔离测试 | 跨项目读写必须失败 |
| **活动日志** | 注册起 user/project events.jsonl |
| **催促通知** | Obligation scanner + 0/24/48/72h + 每周 reminder |

**目录（计划新增）：**

```
platform/
├── api/          # 用户、项目、intake CRUD
├── web/          # 客户 UI
└── worker/       # provisioning + validate 封装
```

**成功标准：** 任意用户创建 2 个项目，各自 intake 不同 → Planner 生成不同 phases/campaigns → 用户仅看各自 progress，互不串数据；**无** 手工营销 todo UI

---

## v0.3 — 渠道 Pack + 可观测 + **营销动作**

| 功能 | 说明 |
|------|------|
| **Action 实现** | FB/IG/X：account.create、post、search_groups、connect、dm |
| action-catalog | Planner 自动组合 campaigns |
| **Reporting UI** | 仪表盘 + 日报 + action log |
| **Human-in-the-loop** | verification_required + **全 obligation 定期催促** |
| Telegram Pack | recruiter + reply-watcher |
| 审批门 | 首批 outbound 需 UI 确认 |

---

## v1.0 — 商业化

| 功能 | 说明 |
|------|------|
| **全球定价** | USD；Plan + **Scope（geographyRegions）** + runs + Pack — 见 [pricing.md](./pricing.md) |
| Stripe 订阅 | Free / Starter / Growth / Scale |
| Scope 预览 | Intake 选目标 region → UI 实时 quote |
| runs 计量 | ops 写入 billing 事件 |
| 团队 Seat | 同 Project 多成员 |
| 模板市场 | 共享 campaign 模板（安装到指定项目） |

---

## 与 sparkconnect 的关系

| 仓库 | 定位 |
|------|------|
| **marketing-autopilot** | 多租户平台 + 项目模板 |
| **sparkconnect** | 可作为 **一个 Project** 的实例数据与成熟 channel 脚本来源 |

sparkconnect 的脚本可打包为 v0.3 **Channel Pack**，安装到用户创建的某个 projectId 下，而非全局共享。

---

## 里程碑

### M1 — 技术模板 ✅

- [x] GitHub repo
- [x] PRD + 多租户产品定义
- [x] 单项目 orchestrator

### M2 — 可用的客户产品（v0.2）

- [ ] Product UI 需求表单
- [ ] 多项目 provisioning
- [ ] 项目隔离 E2E 测试
- [ ] Automation 带 projectId 跑通 Strategy Planner

### M3 — 生产 campaign（v0.3）

- [ ] 至少 1 个 Pack 在项目内端到端
- [ ] 仪表盘真实 metrics
