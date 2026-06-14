# Marketing Feasibility Analysis

**Project:** Marketing Autopilot 公测获客  
**Product:** Marketing Autopilot  
**Analysis date:** 2026-06-14  
**User confirmed:** yes

---

## 1. What we understood

### Product & offer

Marketing Autopilot 是面向 **独立开发者与小团队** 的营销自动化平台：用户在 UI 提交需求与资料（文本、网站、图片、音视频），系统按 **目标国家** 做可行性分析，生成营销策略与可执行脚本，由 Cursor Automations 执行社媒动作并汇报；遇到平台验证则通知用户介入。

**当前阶段：** 开源框架 + 完整产品文档已就绪；Product UI（v0.2）开发中。对外叙事应诚实标注 **「引擎已开源，UI 即将推出」**，用 GitHub + Waitlist 承接转化。

### Target audience

| 分层 | 画像 |
|------|------|
| **Primary** | 已上线产品、不会营销的开发者；Cursor / AI 工具用户 |
| **Secondary** | 小团队创始人；需同时跑 2+ 产品项目 |
| **Geo** | 中国（中文内容）+ 全球英语开发者（US/GLOBAL_EN）+ 东南亚英语社群 |

### Brand & creative

- 调性：**专业、builder-first、不夸大 AI 效果**
- 差异化：**按国家选渠道 + 可行性报告 + 执行闭环**，不是又一个「写文案工具」
- 素材缺口：无 Logo、无 demo 视频；**文档与架构图是现阶段最强资产**

### Assets inventory

| Type | Count | Quality notes |
|------|-------|---------------|
| URLs | 2 | GitHub README + PRD — 强 |
| Documents | 12+ | docs/product/* — 可拆成内容系列 |
| Images | 0 | 需补：架构图 PNG、OG 图 |
| Videos | 0 | 4 周内录 90s demo 强烈建议 |

---

## 2. Feasibility by channel & region

### By target region

| Region | Recommended methods | Fit high | Fit low / avoid | Compliance note |
|--------|---------------------|----------|-----------------|-----------------|
| **GLOBAL_EN** | content, social_organic, PH, community | content, social, PLG | cold_email, social_dm | 诚实 beta 披露 |
| **US** | + product_launch_platforms | Product Hunt | search_ads（预算小） | FTC if testimonials |
| **CN** | content, 知乎/掘金/公众号 | 长文教程 | Meta/IG 作为主渠道 | 广告法、避免绝对化 |
| **SEA** | Telegram 社群、Twitter EN | community | 暂不做 paid | 英语即可触达 |

### By marketing method

| Method | Region | Fit | Automatable? | Rationale |
|--------|--------|-----|--------------|-----------|
| content_marketing | GLOBAL_EN | **H** | 部分 | 文档拆 thread / 文章 |
| content_marketing | CN | **H** | 部分 | 中文实践案例 |
| social_organic | GLOBAL_EN | **H** | 高 | X + LinkedIn 创始人叙事 |
| product_launch_platforms | US | **H** | 部分 | PH 需准备日 |
| community_outreach | GLOBAL_EN | **M** | 部分 | IH、Cursor 社群 |
| freemium_plg | GLOBAL_EN | **M** | 部分 | 开源 repo + waitlist |
| social_organic | CN | **M** | 低 | 缺短视频；先文字平台 |
| search_ads | US | **L** | 低 | 品牌未立，预算 $200 |
| social_dm | * | **L** | 高 | 未批准，品牌期不做 |

---

## 3. Goal vs reality check

| Your goal | Assessment | Realistic first signal |
|-----------|------------|------------------------|
| **200 waitlist** in 90 days | **可达**（有机为主） | 4–6 周：首批 30–50 signups（PH + 内容） |
| **150 GitHub stars** | **可达** | 2–3 周：50 stars（dev Twitter 线程） |
| **30 beta projects** | **偏紧** | 需 UI MVP 或 guided onboarding；8 周后开始起量 |
| Budget **$200/mo** | 足够 **轻量 boosted post**，不够搜索竞价 | 前 60 天建议 $0 paid |

---

## 4. Recommended direction (summary)

### Top channels（优先级）

1. **内容 + 创始人社媒（EN）** — X thread、LinkedIn、GitHub Discussions  
2. **中文开发者社区** — 掘金/知乎/V2EX 技术长文（「我用 Cursor 做营销自动化」）  
3. **Product Hunt** — 集中在一个 launch 日（需 demo + OG 图）  
4. **Waitlist / Star PLG** — README CTA → 简单 landing（Notion/Carrd 即可）  

### Phase 1 focus（weeks 1–4）

- 补 **OG 图 + 架构一图流 + 90s 屏幕录制**  
- 发布 **「Dogfood 系列」**：本文档即第一个项目案例  
- 每周 2 篇 EN thread + 1 篇中文长文  
- 不投广告、不 cold DM  

### Actions we suggest automating（产品就绪后）

- `content.schedule` — 定时发已审核 thread  
- `content.post` — LinkedIn/X 同步（Local Worker + 已有号）  
- `metrics.collect` — stars、waitlist、referrer  

### Actions we do NOT recommend yet

- 自动创建 FB/IG 新号  
- 冷 DM /  mass connect  
- Google 搜索竞价（第 3 月再评估）  

---

## 5. Gaps & questions for you

- [ ] Waitlist 落地页 URL？（建议 1 周内上线 Carrd/Framer）  
- [ ] 创始人 X / LinkedIn 账号是否统一品牌名？  
- [ ] Product Hunt launch 目标日期？（建议内容预热 3 周后）  
- [ ] 是否接受首批 **design partner** 手动 onboarding（10 人）换案例？  

---

## 6. Next step

**User confirmed:** yes — proceed to `strategy/active-plan.md` and campaign registry.
