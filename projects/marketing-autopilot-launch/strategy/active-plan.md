# Marketing Autopilot — 公测获客策略（Project #1）

> **项目：** 第一个用户（创始人）的第一个项目  
> **周期：** 2026-06-14 → 2026-09-14（90 天）  
> **主 KPI：** 200 waitlist 注册 · 150 GitHub stars · 30 beta 活跃项目  

---

## Executive summary

Marketing Autopilot 卖的是 **「会按国家帮你想策略、还能自动执行并汇报的营销 co-pilot」**，不是文案生成器。

**90 天定位：** 以 **创始人叙事 + 开源可信度 + Dogfood 案例** 获取早期 waitlist 与设计合作伙伴；中国区用 **中文技术长文**，全球用 **X/LinkedIn/Product Hunt**。在 Product UI 上线前，诚实宣传 **「引擎开源，UI 即将推出」**。

**Automation 总指挥原则：** 用户 **只看进度、只补信息**；阶段计划、写代码、运行均由 Automation 完成。

**Automation 已为本项目执行（Week 1 示例）：**

```bash
npm run marketing:dogfood:phase   # 一键跑通 Week 1 全阶段
```

| 任务 | 用户动手？ | Automation 产出 |
|------|------------|-----------------|
| Waitlist 落地页 | 仅可选提供 `WAITLIST_FORM_URL` | `campaigns/week1-waitlist/output/index.html` |
| 架构 OG 图 | 否 | `assets/og.svg` |
| EN thread 草稿 | 否 | `campaigns/launch-content-en/output/thread.md` |
| 中文长文 | 否 | `campaigns/launch-content-cn/output/article.md` |
| 每日指标 | 否 | `ops/state/metrics.json` + `ops/progress.json` |

**Week 2+：** 发帖、PH 等由 Automation 继续生成脚本并调度；仅凭证/验证/可选批准时通知用户。

---

## Channel mix

| 优先级 | 手段 | 区域 | 理由 | Automation / 负责人 |
|--------|------|------|------|---------------------|
| 1 | content_marketing | GLOBAL_EN + CN | 文档即弹药 | **Automation 生成** content scripts |
| 2 | social_organic | GLOBAL_EN | X/LinkedIn | Automation 发帖（凭证就绪后） |
| 3 | product_launch_platforms | US | PH 单次爆发 | 人工 launch 日 |
| 4 | community_outreach | GLOBAL_EN | IH、V2EX、Cursor 社群 | 人工发帖 + 模板 |
| 5 | freemium_plg | GLOBAL | 开源 + waitlist | README CTA、metrics |

**暂不投入：** 搜索广告、Meta 付费、冷邮件、自动私信。

---

## 90-day roadmap

| 周 | 焦点 | 交付物 | 成功信号 |
|----|------|--------|----------|
| **1** | **Week 1 基建（Automation 执行）** | 见 `npm run marketing:dogfood:phase` | `ops/progress.json` phaseProgress=1 |
| **2** | 内容引擎 | EN thread×2、中文长文×1、架构图 | 500+ 文章阅读 |
| **3** | 社群种子 | IH/V2EX/掘金帖、GitHub Discussions | 30 stars |
| **4** | Demo 视频 | 90s 录屏：intake→feasibility→plan | 50 stars |
| **5–6** | 预热 PH | Ship list、maker 评论、邮件列表 | 80 waitlist |
| **7** | **Product Hunt Launch** | PH 页 + 全天互动 | PH Top 5 当日品类 |
| **8** | 设计合作伙伴 | 10 人手动 onboarding | 10 beta projects |
| **9–10** | 案例反哺 | 公开 project #1 结果 | 2 篇 case study |
| **11–12** | 轻量 paid（可选） | $200 boost 最佳帖子 | CPA 可测算 |

---

## Automations & scripts

| Name | Schedule | Runtime | What it does |
|------|----------|---------|--------------|
| Content pack generator | 每周一 09:00 | Cloud | 读 docs/product → 生成本周 thread/长文提纲 |
| Social publish (X/LI) | 周二/四 10:00 | Local Worker | 发 **已批准** 帖子 |
| Metrics collector | 每日 08:00 | Cloud | stars、waitlist、traffic → metrics.json |
| Weekly launch review | 周一 09:00 | Cloud | 调整 plan.json、写周报 |

**Campaign 目录（计划）：**

- `campaigns/launch-content-en/` — EN thread 模板  
- `campaigns/launch-content-cn/` — 中文长文模板  
- `campaigns/metrics-github/` — star/fork 采集  

---

## Social accounts (this project)

| Platform | Account | Status | Planned actions |
|----------|---------|--------|-----------------|
| GitHub | jamesteng2010/marketing-autopilot | **active** | README CTA、Discussions |
| X (Twitter) | 创始人账号 | active | thread、build in public |
| LinkedIn | 创始人 | active | 长帖、文档链接 |
| 掘金/知乎 | 待注册或已有 | planned | 中文长文 |
| Product Hunt | maker 账号 | planned | Week 7 launch |

---

## Marketing actions enabled

| Action | Channel | Frequency cap | Requires approval |
|--------|---------|---------------|-------------------|
| content.post | X, LinkedIn | 3/week | **是**（终稿） |
| content.schedule | 同上 | 草稿无限 | 是 |
| metrics.collect | GitHub | daily | 否 |
| social.dm | — | 0 | **禁止**（品牌期） |

---

## KPIs

| Metric | Baseline (2026-06-14) | Target | By date | Source |
|--------|------------------------|--------|---------|--------|
| Waitlist signups | 0 | 200 | 2026-09-14 | landing form |
| GitHub stars | ~0 | 150 | 2026-09-14 | GitHub API |
| Beta active projects | 0 | 30 | 2026-09-14 | 手动/onboarding |
| Content published | 0 | 40 | 2026-09-14 | ops/daily |
| PH launch rank | — | Top 5 category | Week 7 | PH |

---

## Messaging pillars（对外话术）

1. **Problem：** 开发者会造产品，不会造市场；agency 太贵，ChatGPT 只给空话。  
2. **Solution：** 上传资料 → 按国家出 **可行性报告** → 确认后自动执行并汇报。  
3. **Proof：** 开源框架 + **Project #1 就是营销自己**（Dogfood）。  
4. **CTA：** Star repo · Join waitlist · 成为 design partner。  
5. **Honesty：** UI 在 build；今天就能 fork 引擎，明天跟我们一起长 UI。

---

## -credentials still needed

- [ ] Waitlist 表单（Tally/Notion/自建）  
- [ ] GA4 或 Plausible（可选）  
- [ ] OPENAI_API_KEY（内容 Automation）  
- [ ] SMTP（周报邮件，可选）  

---

## Risks & compliance

| 风险 | 缓解 |
|------|------|
| 过度承诺 AI 全自动 | 话术强调 human-in-the-loop、批准门 |
| UI 未就绪导致流失 | waitlist + 开源先行；design partner 深度服务 |
| 中文绝对化用语 | 合规 review；用「辅助」非「保证获客」 |
| PH 失败 | 不 all-in；内容资产长期有效 |

---

## User reporting

| Report | Channel | Contents |
|--------|---------|----------|
| Daily | ops/daily | 发帖数、star 增量、waitlist 增量 |
| Weekly | ops/weekly | KPI vs 目标、下周内容日历 |
| Dashboard | UI（v0.2） | 同上可视化 |

---

## Human-in-the-loop pending

| Item | 触发条件 | 用户只需 |
|------|----------|----------|
| WAITLIST_FORM_URL | 要使用真实表单收集 email | 填入 `runtime/user-inputs.json` 后 Automation 重跑 waitlist task |
| 社媒 API 凭证 | Week 2 自动发帖 | 在 UI/Vault 提供 X/LI token |
| 平台验证 | checkpoint | 按通知完成验证 |

**不是用户 todo：** 写 HTML、做 OG 图、写 thread、记 star 数 — 均已 Automation 生成。

---

## Next review

2026-06-21（Weekly Review Automation）
