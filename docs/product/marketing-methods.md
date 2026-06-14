# 市场营销手段全集（产品参考）

本文档为 **人类可读** 的营销手段说明。机器可读版本：`runtime/marketing-methods-catalog.json`  
区域差异：`channels-by-region.md` · `runtime/regions-catalog.json`  
**如何接入产品：** `integration-marketing-catalog.md`

---

## 1. 自有渠道（Owned）

| ID | 手段 | 说明 | 自动化程度 | 典型见效 |
|----|------|------|------------|----------|
| `website_seo` | 官网与 SEO | 落地页、关键词内容、技术 SEO | 部分（内容/草稿） | 8–12 周 |
| `email_marketing` | 邮件营销 | 订阅、培育、促销 | 高（序列） | 2–4 周 |
| `app_store_aso` | 应用商店 ASO | 标题、截图、关键词 | 低 | 4–8 周 |
| `owned_community` | 自有社群 | Discord、Telegram 频道 | 部分 | 4–8 周 |
| `content_marketing` | 内容营销 | 博客、白皮书、案例 | 部分 | 6–12 周 |

---

## 2. 付费渠道（Paid）

| ID | 手段 | 说明 | 自动化程度 | 预算 |
|----|------|------|------------|------|
| `search_ads` | 搜索广告 | Google、Bing、百度 | 低（需人工批预算） | 必需 |
| `social_ads_meta` | Meta 广告 | FB/IG 信息流、再营销 | 低 | 必需 |
| `video_ads` | 视频广告 | TikTok、YouTube、抖音 | 低 | 必需 |
| `linkedin_ads` | LinkedIn 广告 | B2B Lead Gen | 低 | 必需 |
| `affiliate` | 联盟推广 | CPS、Affiliate | 部分 | 通常需要 |
| `offline_ads` | 线下广告 | 电视、地铁、广播 | 无（仅规划） | 必需 |

---

## 3. 口碑与社交有机（Earned & Social）

| ID | 手段 | 说明 | 自动化程度 |
|----|------|------|------------|
| `social_organic` | 社媒有机运营 | 日常发帖、互动 | **高**（本产品核心） |
| `influencer_kol` | KOL / 网红 | 测评、种草 | 低 |
| `pr_media` | PR / 媒体 | 新闻稿、采访 | 部分 |
| `product_launch_platforms` | 发布平台 | Product Hunt、HN | 部分 |
| `referral` | 推荐计划 | 老带新 | 部分 |

---

## 4. 外联与关系（Outbound）

| ID | 手段 | 说明 | 自动化程度 | 风险 |
|----|------|------|------------|------|
| `cold_email` | 冷邮件 | B2B 序列 | 高 | 合规 |
| `linkedin_outreach` | LinkedIn 外联 | 连接、InMail | 部分 | 中 |
| `community_outreach` | 社群营销 | 目标群、论坛 | **高** | 中 |
| `social_dm` | 社媒私信 | IG/FB/TG 1v1 | **高** | 高 |
| `whatsapp_sales` | WhatsApp 销售 | 跟进转化 | 部分 | 中 |
| `events` | 展会活动 | 线下 | 无 | — |

---

## 5. 合作（Partnership）

| ID | 手段 | 说明 |
|----|------|------|
| `channel_reseller` | 渠道分销 | 代理商 |
| `integration_partnership` | 集成合作 | API、marketplace |
| `marketplace` | 电商平台 | 淘宝、Shopee、App Store |

---

## 6. 产品驱动（Product-led）

| ID | 手段 | 说明 |
|----|------|------|
| `freemium_plg` | Freemium / 试用 | 产品拉新 |
| `viral_loops` | 病毒机制 | 邀请奖励 |
| `cro` | 落地页 CRO | A/B 测试 |

---

## 7. 与可执行动作的关系

每种手段通过 `linkedActions` / `linkedChannelIds` 映射到：

- `runtime/action-catalog.json` — 可脚本化动作（发帖、DM、搜群…）
- `runtime/credentials/schema.json` — 所需 API/账号

**无法全自动的手段**（如线下广告、展会）仍出现在 feasibility 与计划中，但 `automationSupport: none`，不生成 execution task。

---

## 8. 产品内展示名称

UI Intake「营销手段」多选应展示 **label**（中文），存储 **methodId**（英文 id），便于 Planner 与 catalog 对齐。
