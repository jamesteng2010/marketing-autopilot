# Project #1 — Marketing Autopilot Launch

**Dogfood：** 创始人 = 第一个用户；本目录 = 第一个项目。

## 用户你要做什么？

**几乎 nothing。** 看 `ops/progress.json`，必要时在 `runtime/user-inputs.json` 补信息（如 Waitlist 表单 URL）。

## Automation 总指挥 — 跑 Week 1

```bash
cd marketing-autopilot   # 仓库根
npm run marketing:dogfood:phase
npm run marketing:dogfood:status
```

Automation 会自动：

| 产出 | 路径 |
|------|------|
| Waitlist 落地页 | [campaigns/week1-waitlist/output/index.html](./campaigns/week1-waitlist/output/index.html) |
| OG 图 | [assets/og.svg](./assets/og.svg) |
| EN thread | [campaigns/launch-content-en/output/thread.md](./campaigns/launch-content-en/output/thread.md) |
| 中文长文 | [campaigns/launch-content-cn/output/article.md](./campaigns/launch-content-cn/output/article.md) |
| 进度 | [ops/progress.json](./ops/progress.json) |
| 指标 | [ops/state/metrics.json](./ops/state/metrics.json) |

## 文档

| 文件 | 内容 |
|------|------|
| [strategy/active-plan.md](./strategy/active-plan.md) | 90 天策略 |
| [intake/analysis/feasibility.md](./intake/analysis/feasibility.md) | 可行性分析 |
| [runtime/orchestrator/phases.json](./runtime/orchestrator/phases.json) | 阶段任务链 |

产品原则：[docs/product/automation-commander.md](../../docs/product/automation-commander.md)
