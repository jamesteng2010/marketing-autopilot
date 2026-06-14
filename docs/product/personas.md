# 目标用户画像

---

## Persona A — 独立开发者 Leo

| 维度 | 描述 |
|------|------|
| 背景 | 全栈独立开发，刚上线 SaaS，月活 <500 |
| 目标 | 3 个月内 1000 注册，预算 <$200/月 |
| 痛点 | 不懂投放，没时间写内容矩阵，怕封号 |
| 渠道偏好 | SEO、Twitter/X、Product Hunt、邮件 |
| Runtime | 主要 Cloud，偶尔本机 |
| 成功标准 | 能看懂「每周 Automation 做什么」，有 ops 日志可查 |

**典型 intake：**

- product: 开发者工具 / API 产品
- goals: signups, 1000, 90 天
- marketing.channelsPreferred: ["seo", "email", "twitter"]

**产品如何服务 Leo：**

- Strategy Planner 给出 90 天 organic 路线图，不逼立刻买 ads
- Credential gate 只在开邮件/SMTP 时才要 Key
- Weekly Review 用真实日志调整，避免空承诺

---

## Persona B — 小团队创始人 Mia

| 维度 | 描述 |
|------|------|
| 背景 | 2–5 人团队，B2C 或创作者经济产品 |
| 目标 | 获客 + 社区增长，有 Telegram/IG 运营需求 |
| 痛点 | 策略和执行两人负责，易脱节；密钥散落 Notion |
| 渠道偏好 | Telegram、Instagram、Facebook 群 |
| Runtime | hybrid — Cloud 策略 + EC2 Telegram + Windows Playwright |
| 成功标准 | Git 里策略与执行一致，团队可 code review 营销变更 |

**典型 intake：**

- audience: 创作者、自由职业者
- marketing.channelsPreferred: ["telegram", "instagram"]
- runtime.preferred: hybrid

**产品如何服务 Mia：**

- 架构文档明确 Cloud vs EC2 vs 本机分工
- registry.json 让「任务」像 code 一样版本管理
- ops/weekly 成为团队周会材料

---

## Persona C — Cursor 重度用户 Sam

| 维度 | 描述 |
|------|------|
| 背景 | 已用 Cursor Automations 做 CI/PR，想扩展到营销 |
| 目标 | 复用 Automations + GitHub，少写胶水代码 |
| 痛点 | 每次营销项目从零写 prompt 和目录结构 |
| 渠道偏好 | 视项目而定，重框架不重固定渠道 |
| Runtime | Cloud 为主 |
| 成功标准 | fork 仓库 → 改 intake → 导入 4 个 prefill → 跑通 |

**典型 intake：**

- runtime.preferred: cloud
- 快速填完，依赖 Agent 生成 campaigns/

**产品如何服务 Sam：**

- `automations/prefill/*.json` 开箱即用
- AGENTS.md + skill 统一 Agent 行为
- orchestrator 可扩展 registry

---

## Persona D — 代理/顾问（次要，v0.2+）

| 维度 | 描述 |
|------|------|
| 背景 | 帮客户做增长，一次管多个产品 |
| 目标 | 每个客户独立 fork + intake |
| 痛点 | 交付不可复制 |
| 需求 | 多 tenant、白标报告（roadmap v0.2） |

v0.1 仅通过 **每客户一 fork** 支持，不做多 tenant。

---

## 用户优先级（v0.1）

```
P0: Persona C（框架用户）— 确保 clone 即可用
P0: Persona A（ indie）— intake → 策略可读
P1: Persona B（ hybrid 部署）— EC2 + local 文档完整
P2: Persona D — 后续版本
```

---

## 反 persona（不优先服务）

- 需要全自动百万级投放的企业市场团队（缺 enterprise 合规与审批流）
- 不愿使用 GitHub / Cursor 的用户
- 期望「零配置、零审核」大规模 cold email 的用户
