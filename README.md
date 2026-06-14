# Marketing Autopilot

**面向客户的营销自动化 SaaS 平台** — 通过 UI 收集需求；**每一个用户、每一个项目** 独立走 Automation 总指挥流程：分阶段生成策略与代码、自动执行、汇报进度。

> **客户** 使用 Web 界面，**不** 需要 clone 本仓库。  
> **Automation 总指挥** 适用于全平台所有 Project，无例外。见 [docs/product/automation-commander.md](docs/product/automation-commander.md)

**产品文档：** [docs/product/PRD.md](docs/product/PRD.md) · [docs/product/multi-tenant-model.md](docs/product/multi-tenant-model.md)

---

## 产品是什么

| 能力 | 说明 |
|------|------|
| **Product UI** | 表单 + **多类型资料上传**（文本/URL/图/音视频） |
| **可行性分析** | 分析资料 + 盘点现有营销 + **Goal Workshop 定目标** |
| **多项目** | 每个用户可创建多个互相独立的项目 |
| **项目隔离** | 每项目独立的 intake、策略文档、营销脚本、运行日志、凭证 |
| **Automation 总指挥** | **每个 User 的每个 Project**：分阶段 → 自动生成代码 → `run-phase` → 用户只看 `ops/progress.json` |
| **Human-in-the-loop** | 验证/checkpoint 时通知用户，暂停后等待完成 |
| **活动与催促** | 统一 **activity 时间线**（含 Automation 全量工作）+ 需输入时定期通知 |
| **凭证门控** | 按项目、按渠道在 UI 中安全收集 API Key |

```
User
 ├── Project A  →  intake / strategy / campaigns / ops  （独立）
 └── Project B  →  intake / strategy / campaigns / ops  （独立）
```

---

## 客户怎么用（目标体验）

1. 注册 / 登录  
2. **新建项目**（Provisioning 复制模板，与其他用户/项目隔离）  
3. 在 UI **填写需求并上传资料**  
4. 查看 **可行性分析报告**，确认后 Automation 生成本项目 **策略 + 阶段计划 + campaigns 代码**  
5. 在 **项目仪表盘** 看 `ops/progress.json`（阶段进度、已完成 artifact 摘要）  
6. **仅当** 系统提示 pending-human / 凭证时，在 UI 补充信息  
7. Automation 自动推进各阶段；用户 **不** 收到手工营销 todo 清单  

详见 [docs/product/user-journey.md](docs/product/user-journey.md) · [docs/product/automation-commander.md](docs/product/automation-commander.md)

---

## 开发者 / 平台实现

本仓库根目录结构是 **单个项目的模板**（provisioning 时复制到每个 `projectId`）：

```
marketing-autopilot/          ← 平台工程仓库
├── intake/template.json      ← 复制到新项目
├── strategy/template.md
├── runtime/orchestrator/
├── automations/prefill/      ← Cursor Automation 模板（需 projectId 参数化）
├── docs/product/             ← 产品定义
└── platform/                 ← v0.2 计划：api + web UI
```

本地验证模板（开发者 only）：

```bash
git clone https://github.com/jamesteng2010/marketing-autopilot.git
cd marketing-autopilot
npm install
cp intake/template.json intake/active.json   # 模拟单个项目工作区
npm run marketing:validate
```

---

## npm scripts（项目工作区内）

平台 Worker 在 **某 project 的工作区根** 调用：

```bash
PROJECT_ROOT=tenants/{userId}/projects/{projectId} npm run marketing:phase
npm run marketing:dogfood:phase   # Dogfood 示例（同构于任意 tenant project）
npm run marketing:dogfood:status
```

---

## 相关文档

- [docs/product/implementation.md](docs/product/implementation.md) — **产品实现技术文档**（Platform API / UI / Worker）
- [docs/product/automations.md](docs/product/automations.md) — Cursor Automations（5 个、trigger）
- [docs/product/ui-design-system.md](docs/product/ui-design-system.md) — 产品 UI 样式与设计规范
- [docs/product/greenfield-identity-gate.md](docs/product/greenfield-identity-gate.md) — 零营销客户身份门禁（Phase 1→2）
- [docs/product/pricing.md](docs/product/pricing.md) — 全球定价
- [docs/product/marketing-integration-and-metrics.md](docs/product/marketing-integration-and-metrics.md) — 手段集成与效果监控
- [docs/product/goal-workshop.md](docs/product/goal-workshop.md) — 分析后目标共创
- [docs/product/product-data-connectors.md](docs/product/product-data-connectors.md) — 产品 DB/API 只读
- [docs/product/user-activity-and-notifications.md](docs/product/user-activity-and-notifications.md) — 活动日志与催促通知
- [docs/product/automation-commander.md](docs/product/automation-commander.md) — **Automation 总指挥模型**
- [projects/marketing-autopilot-launch/](projects/marketing-autopilot-launch/) — Dogfood Project #1（`npm run marketing:dogfood:phase`）
- [docs/product/PRD.md](docs/product/PRD.md) — 产品需求
- [docs/product/multi-tenant-model.md](docs/product/multi-tenant-model.md) — 用户 / 多项目 / 隔离
- [docs/product/features.md](docs/product/features.md) — 验收标准
- [docs/product/roadmap.md](docs/product/roadmap.md) — v0.2 UI + 多租户
- [docs/product/integration-marketing-catalog.md](docs/product/integration-marketing-catalog.md) — 手段/区域如何接入产品
- [docs/product/marketing-methods.md](docs/product/marketing-methods.md) — 营销手段全集
- [AGENTS.md](AGENTS.md) — Agent 合约
