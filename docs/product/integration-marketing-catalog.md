# 营销手段目录 — 产品集成说明

说明 **marketing-methods-catalog**、**regions-catalog**、**action-catalog** 如何有机接入 Intake → 分析 → 策略 → **分阶段执行（run-phase）** → 汇报全链路。

> **全用户 · 全项目：** Planner 根据 catalog 为 **每个 projectId** 生成独立的 `phases.json`、`registry.json`、`campaigns/`；Execution 更新 **本项目** `ops/progress.json`。见 [automation-commander.md](./automation-commander.md)。

---

## 1. 三套目录的分工

```
┌─────────────────────────────────────────────────────────────┐
│  marketing-methods-catalog.json   「做什么营销」              │
│  26+ 手段：SEO、Meta 广告、社媒有机、冷邮件、KOL…            │
└──────────────────────────┬──────────────────────────────────┘
                           │ linkedActions / linkedChannelIds
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  action-catalog.json              「怎么自动做」              │
│  account.create, content.post, social.dm…                     │
└──────────────────────────┬──────────────────────────────────┘
                           │ registry + campaigns/ + phases.json
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  Execution Runner (run-phase)     「跑当前阶段脚本」          │
│  → ops/progress.json（用户仪表盘）                           │
└─────────────────────────────────────────────────────────────┘

        ┌──────────────────────────────────────┐
        │  regions-catalog.json  「在哪做」     │
        │  US / CN / EU / SEA … 推荐与禁止      │
        └──────────────────────────────────────┘
              ↑ intake.audience.geography
              用于 feasibility 评分
```

| 文件 | 回答问题 | 主要消费者 |
|------|----------|------------|
| `marketing-methods-catalog.json` | 有哪些营销手段？ | UI 多选、Planner |
| `regions-catalog.json` | 该国适合哪些手段/渠道？ | Intake Analysis |
| `action-catalog.json` | 哪些能写成脚本？ | Strategy Planner、Execution |
| `credentials/schema.json` | 要什么密钥？ | 凭证 UI |

---

## 2. 接入 Intake（UI + active.json）

### 2.1 表单字段扩展

`intake/active.json`：

```json
{
  "audience": {
    "geography": ["US", "CN"],
    "geographyRegions": ["US", "CN"],
    "languages": ["en", "zh-CN"]
  },
  "marketing": {
    "channelsPreferred": ["instagram", "wechat"],
    "methodsPreferred": ["social_organic", "community_outreach"],
    "methodsAvoid": ["cold_email"],
    "budgetMonthlyUsd": 500
  }
}
```

| UI 组件 | 数据源 | 行为 |
|---------|--------|------|
| **目标国家/区域** | `regions-catalog.json` keys | 多选 → `geographyRegions` |
| **营销手段** | `marketing-methods-catalog` categories | 多选 → `methodsPreferred`；可按 region 过滤推荐 |
| **渠道偏好** | `action-catalog.channels` + region 推荐 | `channelsPreferred` |
| **预算** | 数字 | 过滤 `requiresPaidBudget: true` 手段 |

### 2.2 UI 智能推荐（v0.2）

```
用户选 geographyRegions: ["CN"]
  → UI 高亮 catalog 中 CN recommendedMethodIds
  → 灰显 avoidChannelIds: facebook, instagram, google_ads
  → 提示「建议考虑：微信、抖音、小红书」
```

实现：`GET /api/catalog/recommendations?regions=CN`

---

## 3. 接入 Intake Analysis（feasibility + 现有营销）

Analysis Automation 除 methodFeasibility 外，必须：

1. 读 `existingMarketing` + `existing-marketing-channels-catalog.json`  
2. 被动扫描站点 → `existing-marketing.json`  
3. 写 `extracted.existingMarketingBaseline.continue|fix|add`  
4. feasibility §2 **现有营销基线**  

Planner 用 **add** 列表映射新方法；**continue/fix** 映射 audit、metrics、content 类 action，避免重复 `account.create`。

---

Automation **05-intake-analysis** 必读：

1. `intake/active.json`
2. `runtime/marketing-methods-catalog.json`
3. `runtime/regions-catalog.json`
4. `intake/analysis/extracted.json`（来自资料）

### 3.1 评分算法（产品逻辑）

对每个 `methodId` × 每个 `geographyRegion`：

| 结果 | 条件 |
|------|------|
| **高** | method ∈ region.recommendedMethodIds 且不在 avoid |
| **中** | 可用但非首选，或 automationSupport=partial |
| **低** | ∈ weakOrAvoidMethodIds |
| **不可行** | 依赖 avoidChannelIds 且无替代 |

写入 `intake/analysis/feasibility.md` §3 表格 + `extracted.json`：

```json
{
  "methodFeasibility": [
    {
      "methodId": "social_organic",
      "region": "CN",
      "fit": "medium",
      "rationale": "建议抖音/小红书而非 Instagram",
      "suggestedChannelIds": ["douyin", "xiaohongshu"]
    }
  ]
}
```

### 3.2 用户反馈内容

feasibility 必须包含：

- 按 **国家/区域** 分表的渠道可行性  
- 按 **手段类型** 分的建议优先级 Top 3–5  
- 哪些可 **Automation 执行** vs 仅 **人工/规划**  
- 合规提示（来自 region.compliance）

---

## 4. 接入 Strategy Planner

用户 `userConfirmedAnalysis: true` 后，Planner：

```
methodsPreferred + methodFeasibility (高/中)
        ↓
筛选 automationSupport != none
        ↓
展开 linkedActions + linkedChannelIds
        ↓
写入 strategy/active-plan.md（手段 + 渠道 + 频率）
        ↓
生成 registry.json tasks + campaigns/{slug}/
        ↓
高风险 (humanApprovalUsuallyRequired) → enabled: false
```

### 4.1 输出示例（strategy 片段）

| 手段 | 区域 | 渠道 | 自动化 task | 周期 |
|------|------|------|-------------|------|
| social_organic | US | instagram | ig-content-post | 每日 1 帖 |
| community_outreach | US | telegram | tg-group-scan | 每 4h |

### 4.2 暂不可自动的手段

`offline_ads`、`events` → 仅出现在 plan 的「人工/外部」章节，**不** 进 registry。

---

## 5. 接入 Execution & 汇报

| 手段 | 执行 | 汇报 metric |
|------|------|-------------|
| social_organic | content.post | posts_count, engagement |
| community_outreach | lead.search_groups | groups_found |
| social_dm | social.dm | dm_sent, replies |
| search_ads | 无 auto | 人工录入或 Ads API（v0.3+） |

`ops/actions/*.jsonl` 增加可选字段：

```json
{
  "methodId": "social_organic",
  "region": "US",
  "channelId": "instagram"
}
```

仪表盘按 **手段** / **国家** 聚合（v0.2 UI）。

---

## 6. 平台 API 建议（v0.2）

| 端点 | 用途 |
|------|------|
| `GET /catalog/methods` | 手段列表（含 category） |
| `GET /catalog/regions` | 区域画像 |
| `GET /catalog/recommendations?regions=` | Intake UI 推荐 |
| `GET /catalog/methods/{id}` | 单手段详情 + linkedActions |

Catalog 版本与 `catalog.version` 字段绑定，便于 migration。

---

## 7. Automation Prompt 片段（统一引用）

所有 Planner / Analysis Agent 指令应包含：

```
Read runtime/marketing-methods-catalog.json and runtime/regions-catalog.json.
Score methods against intake.audience.geographyRegions.
Do not recommend avoidChannelIds for that region unless user explicitly targets cross-border audience.
Map approved methods to action-catalog linkedActions when generating registry.
```

已更新：

- `automations/instructions/05-intake-analysis.txt`
- `automations/instructions/02-strategy-planner.txt`

---

## 8. 版本与扩展

| 版本 | Catalog 扩展 |
|------|--------------|
| v0.1 | methods + regions JSON 骨架 |
| v0.2 | UI 推荐 API、feasibility 评分 |
| v0.3 | CN Pack（wechat/douyin actions）、Ads API metrics |
| v0.4 | 行业模板（SaaS / 电商 / 本地服务）预设 methodsPreferred |

新增手段流程：

1. 编辑 `marketing-methods-catalog.json`  
2. 更新 `marketing-methods.md`  
3. 若可自动化 → 扩展 `action-catalog.json`  
4. 若区域相关 → 更新 `regions-catalog.json`  
5. 更新 `features.md` 验收项  

---

## 10. 手段集成与效果监控

Planner 从 catalog 选 **手段子集**（非 26 个全开），通过 UTM、GA4 事件、单一 CTA、可选 product_db 串联；监控分 **L1 执行 / L2 渠道 / L3 共创目标**。

- 有站无 SEO：`Fix` foundation phase — 见 [marketing-integration-and-metrics.md](./marketing-integration-and-metrics.md) §4  
- 机器可读 L2 映射：`runtime/metrics-sources-catalog.json`

---

## 11. Goal Workshop 与产品数据

| 步骤 | 文档 |
|------|------|
| 分析后共创 KPI | [goal-workshop.md](./goal-workshop.md) |
| 只读 DB / Metrics API | [product-data-connectors.md](./product-data-connectors.md) |

Planner 门禁：`userConfirmedAnalysis` **且** `userConfirmedGoals`。

**Greenfield：** Phase 1 后 **Identity Gate**（`infra.*`）再 Growth — [greenfield-identity-gate.md](./greenfield-identity-gate.md)。

---

## 12. 文档索引

| 文档 | 内容 |
|------|------|
| [marketing-integration-and-metrics.md](./marketing-integration-and-metrics.md) | 手段集成 + 三层监控 |
| [goal-workshop.md](./goal-workshop.md) | 目标共创 |
| [product-data-connectors.md](./product-data-connectors.md) | 产品数据只读 |
| [marketing-methods.md](./marketing-methods.md) | 手段全集（人类） |
| [channels-by-region.md](./channels-by-region.md) | 区域差异 |
| [intake-and-materials.md](./intake-and-materials.md) | 资料 + 可行性 |
| [execution-and-actions.md](./execution-and-actions.md) | 脚本执行 |
| [PRD.md](./PRD.md) | 需求总览 |
