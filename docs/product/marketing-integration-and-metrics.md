# 营销手段集成与效果监控

定义 Marketing Autopilot **帮客户 Project 做市场** 时：可采用哪些手段、如何集成、如何分层监控；以及 **有官网但缺 SEO/测量** 时的标准帮助路径。

> 手段目录：`runtime/marketing-methods-catalog.json` · 区域：`regions-catalog.json` · 动作：`action-catalog.json`  
> 接入链路：[integration-marketing-catalog.md](./integration-marketing-catalog.md)  
> 目标共创：[goal-workshop.md](./goal-workshop.md) · 产品数据：[product-data-connectors.md](./product-data-connectors.md)

---

## 1. 可采用哪些营销手段（按族）

Planner **不为每个项目启用全部手段**，而是从 catalog 中按 **区域 + 可行性 + 共创目标 + 现有栈** 选子集。

| 族 | methodId 示例 | Automation 典型能力 |
|----|---------------|---------------------|
| **官网与可见性** | `website_seo`, `freemium_plg` | 落地页、sitemap/meta、waitlist、技术 SEO |
| **测量与归因** | （跨手段） | GA4/GSC/Pixel、UTM 规范、事件定义 |
| **有机社交** | `social_organic` | 发帖、排期、主页运营 |
| **内容** | `content_marketing` | 博客/FAQ 草稿、Newsletter |
| **付费** | `search_ads`, `social_ads_meta` | 只读监控；创建 campaign 需预算批准 |
| **Outbound** | `cold_email`, `linkedin_outreach` | 高风控；默认 disabled + 批准 |
| **Launch** | `product_launch_platforms` | PH/HN/目录站素材与提交 |
| **社区** | `community_outreach` | Telegram/Discord/群 |
| **PLG / 产品内** | `freemium_plg` | 依赖 [product-data-connectors.md](./product-data-connectors.md) 读真实 signup/激活 |

**区域约束：** `regions-catalog.json` 决定某 region 下 recommend / avoid（如 CN vs US 渠道差异）。见 [channels-by-region.md](./channels-by-region.md)。

---

## 2. 手段如何「集成」（不是堆渠道）

### 2.1 三层栈（每 Project 编排）

```
Layer A — Foundation（几乎必有）
  可测量 + 基础 SEO + 单一主 CTA / 注册入口 + 品牌 OG

Layer B — Growth（intake 选 2–4 个主手段）
  内容 + 1–2 有机渠道 / 邮件 / 社区

Layer C — Amplify（可选，需预算与批准）
  付费广告、outbound、放大 PLG
```

对应 `phases.json` 常见命名：`phase_01_foundation` → **`phase_01b_identity`（Identity Gate，greenfield 推荐）** → `phase_02_growth` → `phase_03_amplify`。

> Phase 1 **执行**可很快（一次 run-phase）；Identity Gate **停留**取决于 DNS/OAuth/验证。见 [greenfield-identity-gate.md](./greenfield-identity-gate.md)。

### 2.2 集成的「连接件」

| 连接件 | 作用 |
|--------|------|
| **单一主 CTA URL** | 所有渠道引流到同一点，效果可对比 |
| **UTM 规范** | `utm_source` / `utm_medium` / `utm_campaign` 统一，写入 campaign config |
| **GA4（或同类）事件** | 如 `signup_click`, `waitlist_submit`, `purchase` — 对齐 [goal-workshop.md](./goal-workshop.md) |
| **Pixel / Ads 只读** | 付费与再营销；无测量不做 paid |
| **`accounts/registry` + `ops/actions`** | 知道哪个社媒号做了什么 |
| **`ops/activity/events.jsonl`** | 用户可见 Automation 全量工作 |
| **`ops/state/metrics.json`** | 聚合 L2/L3 指标（见 §3） |
| **产品 DB / Metrics API**（可选） | 真实 signup/MRR/激活 — 见 product-data-connectors |

### 2.3 Planner 规则（与 existing-marketing 联动）

1. **Fix 先于 Add** — 有站无 GA → Phase 1 接测量 + 技术 SEO，而非先开 Instagram  
2. **Continue** — 已有 FB 主页 → `content.post`，非 `account.create`  
3. **手段数量上限** — 建议 Phase 1 活跃 method ≤ 4，避免 registry 爆炸  
4. **共享 artifact** — 同一 landing、OG、内容模板跨渠道复用  

---

## 3. 效果监控（三层模型）

### 3.1 L1 — 执行层（Automation 有没有在跑）

| 数据源 | 内容 |
|--------|------|
| `ops/activity/events.jsonl` | 分析、定计划、写代码、发帖、建号… |
| `ops/progress.json` | phase 进度、task summary |
| `ops/actions/*.jsonl` | 单次 marketing action 明细 |

**受众：** 客户 — 「系统在帮我做什么」。

### 3.2 L2 — 渠道层（各手段有没有「动」）

| 手段 | 数据源 | 典型指标 |
|------|--------|----------|
| SEO | GSC API + 技术 audit | 展示/点击/查询词、索引、sitemap |
| 官网流量 | GA4 / Plausible | sessions、来源、landing、bounce |
| 转化事件 | GA4 事件 | CTA 点击、表单、注册（若未接 DB） |
| 有机社媒 | Meta/X/LinkedIn API 或 actions | 发帖数、互动、粉丝 |
| 付费 | Google/Meta Ads 只读 | spend、impressions、CTR、CPA |
| 邮件 | ESP API | 订阅数、open/click |
| Outbound | actions 日志 | 发送、回复、verification 暂停 |
| **产品 KPI** | DB 只读 / Metrics API | signup、active users、MRR — 见 product-data-connectors |

写入：`ops/state/metrics.json`（按 `{ collectedAt, sources: { ga4, gsc, productDb, ... } }` 结构）。

Campaign 任务：`metrics.collect_ga4`、`metrics.collect_gsc`、`metrics.collect_product_db` 等（registry 注册）。

**受众：** 客户 + Weekly Review — 「哪个渠道有信号」。

### 3.3 L3 — 业务目标层（离 **共创目标** 还有多远）

- 目标来自 **`goals.confirmed`**（Goal Workshop），非 Automation 编造  
- 对比：`current` vs `target` vs `deadline`，可算 weekly run-rate  
- 示例：「90 天 waitlist 200，当前 47，需每周 +4.3」  

**受众：** 客户仪表盘主 widget + 周报结论。

### 3.4 监控与 Review 闭环

```
metrics.collect_* (cron)
    ↓
ops/state/metrics.json 更新
    ↓
UI 仪表盘（L1+L2+L3）
    ↓
Weekly Review Automation 读 metrics + actions
    ↓
调整 plan.json / phases / 下一 phase 手段
```

缺数据源 → `assetsNeededFromUser` + obligation 催促（见 [user-activity-and-notifications.md](./user-activity-and-notifications.md)）。

---

## 4. 有官网、缺 SEO / 测量 — 标准帮助路径

典型：`product.url` 存在，`existingMarketing` 显示无 GSC、无 sitemap、无 GA4 或仅有空站。

### Phase：Foundation（Fix 为主）

| 步骤 | Automation 产出 | 监控 |
|------|-----------------|------|
| 站点 audit | `analysis.site_scan_completed` + 问题列表 | activity |
| 安装/配置 GA4 + 事件 | gtag 片段或部署 PR + 事件名对齐 goals | L2 GA4 |
| GSC 验证引导 | 只读 API 连接 task | L2 GSC |
| 技术 SEO 最小集 | `sitemap.xml`, `robots.txt`, title/meta 模板 | GSC 索引 |
| On-page 最小集 | H1、单 CTA、OG；可选 `/pricing` 或 blog 壳 | GA4 landing |
| 内容 seed | 2–4 篇 pillar/FAQ 草稿 + 内链 | GSC 查询逐步出现 |

**原则：** 无测量 → 不上 paid；无 sitemap/title → 不大规模内容战役。

### 后续 Phase

- **Growth：** 内容 + 1–2 有机渠道（UTM 回 GA4）  
- **Amplify：** Pixel + 小预算测试（需 `goals.confirmed` + 预算 + 批准）  

---

## 5. UTM 与归因约定（实现）

每 Project 在 `runtime/marketing/utm.json`（Planner 生成）：

```json
{
  "campaignPrefix": "ma_{projectId}",
  "mediumMap": {
    "facebook": "social",
    "newsletter": "email",
    "blog": "organic"
  }
}
```

campaign 脚本发帖/邮件链接 **必须** 带 UTM，便于 GA4 渠道对比。

---

## 6. 机器可读监控映射

`runtime/metrics-sources-catalog.json` — 每个 methodId 默认 L2 数据源与 metric keys。

---

## 7. 相关文档

- [goal-workshop.md](./goal-workshop.md)  
- [product-data-connectors.md](./product-data-connectors.md)  
- [execution-and-actions.md](./execution-and-actions.md) §5  
- [features.md](./features.md) § F13、F14  
