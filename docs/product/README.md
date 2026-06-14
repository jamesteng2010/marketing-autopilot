# 产品文档索引

Marketing Autopilot 官方产品文档目录。技术实现见 [`../architecture.md`](../architecture.md)，部署见 [`../deployment-guide.md`](../deployment-guide.md)。

| 文档 | 说明 | 读者 |
|------|------|------|
| [implementation.md](./implementation.md) | **产品实现技术文档**（架构、API、模块、分阶段） |
| [PRD.md](./PRD.md) | 产品需求文档（主文档） | 产品、研发、运营 |
| [automation-commander.md](./automation-commander.md) | **全用户 · 全项目** Automation 总指挥契约（phases / run-phase / progress） |
| [marketing-methods.md](./marketing-methods.md) | 市场营销手段全集 |
| [channels-by-region.md](./channels-by-region.md) | 国家/区域差异与合规 |
| [existing-marketing-discovery.md](./existing-marketing-discovery.md) | **现有营销盘点**：SEO/GA/Facebook 等发现 + 增量策略 |
| [intake-and-materials.md](./intake-and-materials.md) | 多类型资料 + 可行性分析 |
| [execution-and-actions.md](./execution-and-actions.md) | 脚本、社媒动作、汇报、人工验证 |
| [multi-tenant-model.md](./multi-tenant-model.md) | 用户 / 多项目 / 隔离 |
| [user-journey.md](./user-journey.md) | 客户 UI 旅程 | 产品、设计 |
| [features.md](./features.md) | 功能规格与验收标准 | 研发、测试 |
| [personas.md](./personas.md) | 目标用户与使用场景 | 产品、市场 |
| [automations.md](./automations.md) | **Cursor Automations**（5 个、trigger、Worker 分工） |
| [ui-design-system.md](./ui-design-system.md) | **产品 UI 样式与设计规范**（tokens、页面、组件、Obligations） |
| [greenfield-identity-gate.md](./greenfield-identity-gate.md) | **零营销客户身份门禁**（Phase 1→2、infra.*、品牌邮箱） |
| [goal-workshop.md](./goal-workshop.md) | 分析后 **目标共创**（KPI + 测量源） |
| [marketing-integration-and-metrics.md](./marketing-integration-and-metrics.md) | **手段集成** + **L1/L2/L3 监控** + 有站无 SEO |
| [product-data-connectors.md](./product-data-connectors.md) | 产品 DB / Metrics API 只读 |
| [pricing.md](./pricing.md) | **全球定价**：Plan + 营销 Scope + runs + Pack |
| [roadmap.md](./roadmap.md) | 版本规划与里程碑 | 全员 |
| [glossary.md](./glossary.md) | 术语表 | 新成员 |

## 文档关系

```
PRD（为什么做、做什么）
  ├── implementation（怎么做 — 技术实现）
  ├── ui-design-system（客户端样式与组件规范）
  ├── automations（5 个 Automation · trigger · Worker）
  ├── automation-commander（全用户 · 全项目执行契约）
  ├── existing-marketing-discovery（现有 SEO/GA/社媒盘点 → 增量营销）
  ├── goal-workshop（分析后 KPI 共创）
  ├── greenfield-identity-gate（Phase 1→2 身份门禁 · infra.*）
  ├── marketing-integration-and-metrics（手段集成 + 三层监控）
  ├── product-data-connectors（产品 DB/API 只读）
  ├── marketing-methods + channels-by-region（手段与区域）
  ├── integration-marketing-catalog（如何接入实现）
  ├── personas（为谁做）
  ├── user-journey（怎么用）
  ├── features（做到什么程度）
  ├── pricing（Plan + Scope + runs）
  └── roadmap（何时做）

Runtime JSON（机器可读）
  marketing-methods-catalog.json ←→ regions-catalog.json ←→ action-catalog.json
```

## 维护约定

- 产品决策变更 → 先更新 PRD，再同步 features / roadmap
- 新增营销手段 → 更新 `runtime/marketing-methods-catalog.json` + `marketing-methods.md` + 区域表
- 版本号与 roadmap 保持一致
