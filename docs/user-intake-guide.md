# User Intake Guide

Fill `intake/active.json` (copy from `intake/template.json`) or use **Product UI**.  
Multimodal materials: [product/intake-and-materials.md](./product/intake-and-materials.md)  
Existing marketing audit: [product/existing-marketing-discovery.md](./product/existing-marketing-discovery.md)

## Product

| Field | Description |
|-------|-------------|
| `product.name` | Brand or product name |
| `product.url` | Landing page or app URL |
| `product.oneLiner` | Elevator pitch (≤ 120 chars) |
| `product.description` | Full value proposition, features, pricing |
| `product.pricingModel` | free / freemium / subscription / one-time / marketplace |

## Audience

| Field | Description |
|-------|-------------|
| `audience.primary` | **ICP** — Ideal Customer Profile: who buys or signs up first (one plain sentence). **Auto-suggested** on website import or via **Suggest from product info**; user always edits in UI. |
| `audience.primarySource` | Optional: `website_inferred` \| `product_inferred` \| `ai_suggested` |
| `audience.primaryInference` | Optional: `{ method, confidence, suggestedAt }` from `infer-audience` |
| `audience.geography` | ISO 国家码列表，如 `["US","CN"]` |
| `audience.geographyRegions` | 区域画像 key，见 `runtime/regions-catalog.json`：US, CN, EU, SEA, JP, MENA, LATAM, GLOBAL_EN |
| `audience.languages` | e.g. `["en", "zh-CN"]` |
| `audience.painPoints` | Problems your product solves; may be auto-suggested with ICP |

**API:** `POST /api/projects/:id/intake/import-website` · `POST /api/projects/:id/intake/suggest-audience`

## Goals（初填 + Goal Workshop 确认）

Early intake may pre-fill rough ideas; **confirmed targets** come from Goal Workshop: [product/goal-workshop.md](./product/goal-workshop.md)

| Field | Description |
|-------|-------------|
| `goals.primaryKpi` | signups, active_users, waitlist, traffic, leads, revenue, paid_customers, brand_awareness |
| `goals.targetValue` | **User-confirmed** number (not Agent-invented) |
| `goals.deadline` | ISO date |
| `goals.measurement.primary.source` | ga4_event, product_db, metrics_api, stripe, gsc, manual |
| `goals.measurement.baseline` | known value or status unknown → baseline task in Phase 1 |
| `goals.userConfirmedGoals` | true unlocks Strategy Planner (with userConfirmedAnalysis) |
| `goals.confirmedSummary` | One-line goal for strategy + activity log |

## Product data（可选）

[product/product-data-connectors.md](./product/product-data-connectors.md)

| Field | Description |
|-------|-------------|
| `productData.hasProductDatabase` | Whether real product DB exists |
| `productData.connectionType` | postgres, mysql, supabase, metrics_api, none |
| `productData.kpiMappings[]` | Maps DB/API queries to goal KPIs |
| `productData.privacy.noPiiExport` | Must stay true |

Credentials: Vault `product_db_readonly` / `metrics_api_readonly` — never git.

## Marketing

| Field | Description |
|-------|-------------|
| `marketing.channelsPreferred` | Ordered list: telegram, instagram, email, seo, … |
| `marketing.methodsPreferred` | Method IDs from `runtime/marketing-methods-catalog.json` |
| `marketing.methodsAvoid` | Methods to exclude |
| `marketing.channelsAvoid` | Channels to skip |
| `marketing.budgetMonthlyUsd` | 0 for organic-only（Goals / 计费页，非 Intake UI） |
| `marketing.brandTone` | professional / friendly / … — **不在 Intake UI 展示**；默认来自 [automation-policy.md](./product/automation-policy.md) |
| `marketing.complianceNotes` | **不在 Intake UI 展示**；平台管理员在 `runtime/automation-policy.json` 配置；分析时注入项目 |
| `marketing.complianceSource` | `platform_policy` when injected from platform policy |
| `marketing.accountStrategy` | Auto-create vs existing social accounts（Intake Step 3 checkbox） |
| `marketing.actionsApproved` | High-risk actions user pre-approved（Strategy 批准门） |

## Assets (metadata)

| Field | Description |
|-------|-------------|
| `assets.analyticsId` | GA4 measurement ID（legacy；prefer `existingMarketing.analytics.ga4`) |
| `assets.existingSocial` | Handles per platform（legacy；prefer `existingMarketing.organicSocial`) |
| `assets.crm` | HubSpot, Notion, spreadsheet, none |

## Existing marketing（现有营销现状）

See [product/existing-marketing-discovery.md](./product/existing-marketing-discovery.md).

| Field | Description |
|-------|-------------|
| `existingMarketing.hasActiveMarketing` | Already running marketing campaigns? |
| `existingMarketing.userSummary` | What you do today (SEO, Facebook ads, GA, etc.) |
| `existingMarketing.channelsUserDeclared[]` | channelId + status + notes |
| `existingMarketing.analytics.ga4` | measurementId, propertyId |
| `existingMarketing.organicSocial.facebook` | pageUrl, pageId |
| `existingMarketing.paidAds.meta` / `googleAds` | ad account / customer IDs, spend |
| `existingMarketing.seo` | site URL, CMS, Search Console, keywords |
| `existingMarketing.assetsNeededFromUser[]` | Gaps filled by Analysis — complete in UI |

After Analysis: `intake/analysis/existing-marketing.json` + feasibility **§2 Current marketing baseline**.

## Materials（资料上传）

| Field | Description |
|-------|-------------|
| `materials.items[]` | List of uploaded/linked assets (see `materials.schema.json`) |
| `materials.items[].type` | `text`, `url`, `image`, `video`, `audio`, `document`, `spreadsheet` |
| `materials.items[].uri` | Storage path or public URL |
| `materials.items[].analysisStatus` | `pending` → `done` after Automation |
| `materials.analysisCompletedAt` | When feasibility analysis finished |
| `materials.userConfirmedAnalysis` | User approved feasibility report → unlock full strategy |

**Supported uploads (typical limits):**

| Type | Examples |
|------|----------|
| Text | Paste or `.txt` / `.md` |
| URL | Product site, docs, competitor pages |
| Image | Logo, screenshots, ads (jpg/png/webp) |
| Video | Demo, ads (mp4; or YouTube link as `url`) |
| Audio | Pitch recording, podcast clip (mp3/wav) |
| Document | PDF, Word, slides |

After materials are added, run **Intake Analysis** → review feasibility → **Goal Workshop** → confirm both → Strategy Planner.

See [product/marketing-integration-and-metrics.md](./product/marketing-integration-and-metrics.md) for how methods integrate and how L1/L2/L3 monitoring works.

## Runtime preference

| Field | Description |
|-------|-------------|
| `runtime.preferred` | cloud / ec2 / local / hybrid |
| `runtime.region` | e.g. ap-southeast-2 for EC2 |

## Validation

```bash
npm run marketing:validate
```

Fix `missing` fields before analysis. Full strategy generation requires `materials.userConfirmedAnalysis === true` (recommended gate).
