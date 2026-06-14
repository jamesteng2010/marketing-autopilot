# 产品数据连接（Database / Metrics API）

可选能力：客户 **自有产品数据库或内部 Metrics API** 以 **只读** 方式接入本项目，供 Automation **写代码拉取真实 KPI**、建立 baseline、做渠道效果与 cohort 分析，而不仅依赖 GA 页面流量。

> 目标字段映射：[goal-workshop.md](./goal-workshop.md) · 监控 L2/L3：[marketing-integration-and-metrics.md](./marketing-integration-and-metrics.md)

---

## 1. 为什么需要

| 仅 GA / 社媒 | + 产品 DB / Metrics API |
|--------------|-------------------------|
| 看见访问、点击 | 看见 **真实注册、激活、付费、留存** |
| 渠道对比偏流量 | 可对比 **哪渠道来的用户更激活** |
| baseline 常 unknown | 可算过去 28 天 signup/MRR **真实基线** |
| Review 只能猜 | Review 可调 onboarding 邮件 vs 盲目加广告 |

---

## 2. Intake / Goal Workshop 收集什么

**不要** 在 intake 粘贴生产库连接串；使用 Vault + 结构化声明。

`intake/productData`（见 [intake/template.json](../../intake/template.json)）：

| 字段 | 说明 |
|------|------|
| `hasProductDatabase` | true / false / unknown |
| `connectionType` | `postgres` \| `mysql` \| `supabase` \| `mongodb_readonly` \| `metrics_api` \| `none` |
| `metricsApiBaseUrl` | 只读 REST 根 URL（若有） |
| `schemaSummaryUri` | ER 图 / 表说明 PDF 或 markdown 材料 id |
| `privacy.noPiiExport` | 必须 true — 禁止 bulk 导出 email/phone |
| `privacy.allowedAggregations` | count, group_by_date, group_by_utm_source 等 |
| `kpiMappings[]` | 见 §3 |

凭证：`runtime/credentials/schema.json` → `product_db_readonly` / `metrics_api_readonly`（Vault 存连接串或 API key，**不进 git**）。

---

## 3. KPI 映射（用户与系统一起定）

`productData.kpiMappings[]` 示例：

```json
{
  "id": "signup_count",
  "label": "New signups",
  "goalKpi": "signups",
  "type": "sql_aggregate",
  "definition": "COUNT(*) FROM users WHERE created_at >= :from",
  "parameters": ["from", "to"],
  "notes": "Exclude internal test accounts if flagged"
}
```

或 Metrics API：

```json
{
  "id": "active_users_7d",
  "label": "WAU",
  "goalKpi": "active_users",
  "type": "api_endpoint",
  "path": "/v1/metrics/wau",
  "method": "GET"
}
```

Goal Workshop 中 `goals.measurement.primary.dbMappingId` 指向此处。

---

## 4. Automation 可以做什么 / 不可以做什么

### 4.1 允许（只读）

- 定时 SQL 聚合 → 写入 `ops/state/metrics.json` 的 `sources.productDb`  
- 调用客户 Metrics API GET  
- 生成 **weekly 报告段落**（「本周 signup +32，active +5%」）  
- 根据激活率建议 **改 phase**（traffic 涨但 active 不涨 → onboarding 优先）  
- 脱敏 aggregate 用于内容灵感（「多数用户完成 step X」— 无 PII）

### 4.2 禁止（默认）

- INSERT/UPDATE/DELETE  
- 导出 PII 做 cold email  
- 无 schema 时全库扫描  
- 跨 projectId 连接  

---

## 5. 实现：Campaign / Registry

| task id | 说明 |
|---------|------|
| `metrics-collect-product-db` | 读 kpiMappings，更新 metrics.json |
| `metrics-establish-baseline` | 首次跑 28d 历史 → 写 `goals.measurement.baseline` |
| `analytics-activation-report` | 可选：按 utm_source cohort（若 DB 存 source） |

Execution 环境：**Platform Worker** 或客户允许 IP 的 EC2；连接串来自 Vault。

活动日志：`metrics.collected`（summary 含 metric id + value）。

---

## 6. 与「手段集成」的关系

```
Goal：90 天 active_users 5000，测量 = product_db.active_users_7d
    ↓
Phase 1：GA（流量）+ product_db baseline
    ↓
Phase 2：SEO + 内容 + 有机（UTM → users.source 若存在）
    ↓
L3 仪表盘：active_users vs 5000
    ↓
Review：traffic ↑ active flat → 改 plan 为 email/onboarding，非加 FB Ads
```

---

## 7. 安全与合规

- 只读 DB 用户、最小权限、网络隔离  
- 材料与 schema 摘要按 project 隔离  
- Enterprise：SOC2/合同 DPA  
- 用户可随时 **撤销连接** → 删除 Vault ref，metrics 标 stale  

---

## 8. 版本规划

| 版本 | 能力 |
|------|------|
| v0.2 | Intake 字段 + Goal Workshop 映射；无 live 查询 |
| v0.3 | `metrics_api_readonly` + 单 endpoint collect |
| v0.4 | Postgres 只读 + `metrics-collect-product-db` campaign |

---

## 9. 验收标准

见 [features.md](./features.md) § F14。

---

## 10. 相关文档

- [goal-workshop.md](./goal-workshop.md)  
- [marketing-integration-and-metrics.md](./marketing-integration-and-metrics.md)  
- [intake/product-data.schema.json](../../intake/product-data.schema.json)
