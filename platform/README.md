# Platform（v0.2 实现）

面向客户的 **Product Layer** 实现代码。规格见 **[../docs/product/implementation.md](../docs/product/implementation.md)**；UI 样式见 **[../docs/product/ui-design-system.md](../docs/product/ui-design-system.md)**。

## 目录规划

```
platform/
├── api/                 # REST：auth、projects、intake、goals、progress、obligations
├── web/                 # Next.js：Intake → Analysis → Goal Workshop → Dashboard
└── worker/              # provisioning、run-phase cron、obligation/notification
```

## 职责对照

| 模块 | 职责 | 产品文档 |
|------|------|----------|
| **api** | 多租户隔离；Provisioning；触发 Automation webhook | implementation §5 |
| **web** | 客户入口；无 git/npm | user-journey §8 |
| **worker** | `PROJECT_ROOT=... npm run marketing:phase` | implementation §6.4 |

## 状态

**尚未实现。** v0.1 已交付根目录 orchestrator + 模板 + 产品文档。

## 本地开发（实现后）

```bash
# API
cd platform/api && npm install && npm run dev

# Web
cd platform/web && npm install && npm run dev

# Worker（需配置 WORKSPACE_ROOT、Vault）
cd platform/worker && npm run cron:run-phase
```

Dogfood 无 Platform 时，仍可用：

```bash
PROJECT_ROOT=projects/marketing-autopilot-launch npm run marketing:dogfood:phase
```

## 验收

[../docs/product/features.md](../docs/product/features.md) § F0、F10–F14；E2E 见 implementation §14。
