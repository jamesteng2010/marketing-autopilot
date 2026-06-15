# Marketing Autopilot — 开发标准

本文档定义 **Marketing Autopilot** 平台与仓库内代码的开发约定。  
面向：Platform API、Product UI、Runtime 脚本、Automation 集成与部署。

相关文档：

- 产品 UI 样式：[product/ui-design-system.md](./product/ui-design-system.md)
- 技术实现：[product/implementation.md](./product/implementation.md)
- Agent 契约：[AGENTS.md](../AGENTS.md)
- 部署：[deployment-guide.md](./deployment-guide.md)

---

## 1. 适用范围

| 范围 | 说明 |
|------|------|
| **Product UI** | `platform/api/public/`（当前 SPA）、未来 `platform/web/` |
| **Platform API** | `platform/api/src/` |
| **Runtime / Analysis** | `runtime/` |
| **Automations** | `automations/`、`infra/automations/` |
| **基础设施** | `infra/` |

---

## 2. 核心原则

1. **用户不猜状态** — 任何会花超过 ~300ms 的操作，都必须让用户知道「正在发生什么、是否成功、失败时怎么办」。
2. **最小正确 diff** — 只改任务相关代码；匹配现有命名、结构与抽象。
3. **租户隔离** — 所有读写限定在 `userId` + `projectId` 工作区内。
4. **密钥不进 Git** — 凭证只进 Cursor Secrets、`secrets.local.env`（gitignore）或 EC2 `.env`。
5. **可观测** — 后台动作写入 `ops/activity/events.jsonl`（或 Platform 等价日志），便于 Activity 页与时间线排查。

---

## 3. 用户进度反馈（强制）

> **所有面向用户的动作都必须提供进度反馈。**  
> 这是 Product UI 的硬性要求，不是可选项。

### 3.1 什么算「动作」

以下任一情况 **必须** 有进度反馈：

| 类型 | 示例 |
|------|------|
| **用户点击触发** | Request analysis、Confirm analysis、上传资料、保存 Intake |
| **多步流程** | Intake 向导、Goals 共创、凭证提交 |
| **异步 / 长耗时** | 站点扫描、Webhook 调 Cursor、OpenAI 生成报告、文件上传 |
| **跨系统** | Platform → Cursor Automation → Callback 回写 |
| **可能失败** | 额度不足、网络错误、校验失败、fallback 切换 |

不算动作（可不做进度 UI，但仍需即时反馈）：

- 纯客户端切换 Tab、展开折叠
- 已在本地完成的即时校验（如必填项红框）

### 3.2 必须反馈的四件事

每个动作，用户应能回答：

1. **开始了没有？**（按钮 disabled / loading / 步骤条激活）
2. **进行到哪一步？**（当前步骤文案，而非静默等待）
3. **成功还是失败？**（明确终态，不能只有控制台日志）
4. **失败时是否在后台继续？**（必须写清楚：**在跑** 或 **已停止**）

**反例（禁止）：**

- 先显示「Saved ✓」，再弹出无关错误 — 用户会以为已成功
- 只显示 `Webhook 400: {...}` 原始 JSON
- 请求失败后不留状态，用户刷新页面不知道有没有分析在跑
- 长时间 spinner 无任何步骤说明

**正例（参考 Intake → Analysis）：**

```
① Saving intake…        ✓
② Running site scan…    ✓
③ Sending to Cursor…    …
```

失败时：

```
Analysis could not start. Nothing is running in the background.
Cursor usage limit reached.
OpenAI fallback is not configured — add OPENAI_API_KEY and redeploy.
[View Analysis status]
```

### 3.3 UI 实现规范

| 场景 | 要求 |
|------|------|
| **< 300ms** | 可选轻量反馈（按钮 active 态） |
| **300ms – 3s** | 按钮 loading + 单行状态文案 |
| **> 3s 或 多步** | 步骤进度条 / 阶段列表 + 禁止重复提交 |
| **> 30s 异步** | 跳转到状态页轮询，或 Dashboard/Analysis banner；告知「可离开页面」 |
| **成功** | 明确下一步（跳转、绿色摘要、或「报告已就绪」） |
| **失败** | 人话错误 + 是否可重试 + 链接到状态页（若有 partial state） |

**组件约定（`platform/api/public/`）：**

- 进行中：`.msg.show.info` + `#analysis-progress` 步骤行（`.active` / `.done` / `.failed`）
- 成功：`.msg.show.ok`
- 失败：`.msg.show.err`，**禁止**仅 `alert()` 或 console
- 长任务按钮：`.btn-loading` + 文案改为进行态（如 `Starting…`）
- 跨页状态：Analysis / Intake 顶部 **banner**（running / failed / ready）

### 3.4 API 与后台规范

| 规则 | 说明 |
|------|------|
| **结构化响应** | 长任务返回 `202` + `status` / `nextStep` / `engine` / `fallback`；失败返回 `error` + `code` + `userHint` |
| **可轮询状态** | 提供 `GET .../analysis/feasibility` 等 endpoint，含 `running` \| `ready` \| `failed` \| `confirmed` |
| **失败写回** | 异步失败时更新 `intake/active.json` 的 `materials.analysisFailedAt` / `analysisErrorSummary`，避免「假 running」 |
| **部分成功** | Webhook 已发出但 Cursor 失败 → 若有 fallback 走 OpenAI；若无 fallback → 标记 failed，**不要**留 indefinite running |
| **日志** | `logActivity()` 记录 `analysis.started`、`analysis.webhook_failed`、`analysis.completed` 等，供 Activity 时间线 |

### 3.5 验收清单（PR / 自测）

- [ ] 每个新增按钮/表单提交在 Network 慢速 3G 下仍有可见 loading
- [ ] 失败时用户能一句话看懂原因与下一步
- [ ] 用户能区分「进行中 / 已停止 / 已完成」
- [ ] 多步流程有 ≥2 个可见阶段（或明确单步说明）
- [ ] 刷新页面后状态仍可从 API 恢复（不依赖仅内存中的 UI 状态）
- [ ] 错误文案无 raw JSON、无内部路径泄露（开发环境日志除外）

---

## 4. 错误处理与文案

1. **用户可见错误用人话**；技术细节进 `ops/activity` 或服务器日志。
2. **区分错误类型**：校验错误（可修表单）、配置错误（找管理员）、外部依赖错误（Cursor/OpenAI 额度）、临时错误（可重试）。
3. **提供 `userHint`**：API 422 响应可带 `userHint` 字段，UI 原样展示。
4. **Fallback 必须可感知**：Cursor → OpenAI 切换时，UI 与 `analysisEngine: openai-fallback` 一致。

---

## 5. 代码与仓库

| 主题 | 标准 |
|------|------|
| **语言** | Product UI 默认英文；文档中英均可；用户-facing 文案走 i18n 预留（`T.*` 对象） |
| **模块** | API 路由薄；业务在 `services/`；长脚本在 `runtime/` |
| **配置** | 本地 `secrets.local.env`；EC2 `platform/api/.env`；通过 `deploy-dev.sh` 同步 |
| **测试** | 关键 API 有 `platform/api/test/` 冒烟；改 Intake/Analysis 流程需手测进度 UI |
| **提交** | 一句说清 why；不提交 `.env`、`secrets.local.env`、租户 `intake/active.json` |

---

## 6. 安全

1. Bearer / Callback token / DB 密码 **永不** 进 Git、不进聊天截图长期留存。
2. Admin 与 Automation callback 走独立 token（`X-Admin-Token`、`X-Automation-Token`）。
3. 上传资料校验 MIME/大小（见 `intake/materials.schema.json`）。
4. 多租户路径：`/opt/marketing-autopilot/projects/{userId}/projects/{projectId}/`。

---

## 7. Automation 与双链路

| 模式 | `ANALYSIS_ENGINE` | 行为 |
|------|-------------------|------|
| **推荐** | `auto` | Cursor Webhook 优先；失败则 OpenAI fallback（需 `OPENAI_API_KEY`） |
| Cursor only | `cursor` | 无 fallback |
| OpenAI only | `openai` | 跳过 Cursor |

配置说明：[infra/automations/SETUP.md](../infra/automations/SETUP.md)

无论哪条链路，**用户看到的进度与终态一致**：running 可轮询，ready 可确认，failed 可重试。

---

## 8. 文档维护

- 新增 **用户可见流程** → 同步 [user-journey.md](./product/user-journey.md) 与本节 §3 示例
- 新增 **API** → 同步 [implementation.md](./product/implementation.md)
- 变更 **进度 UI 组件** → 同步 [ui-design-system.md](./product/ui-design-system.md)

---

## 9. 参考实现

| 功能 | 文件 |
|------|------|
| Request analysis 三步进度 | `platform/api/public/app.js` — `requestAnalysis()`、`setAnalysisProgress()` |
| Analysis 轮询与 banner | `platform/api/public/app.js` — `renderAnalysis()`、`refreshAnalysisStatusBanner()` |
| 双链路 + fallback | `runtime/analysis/prepare-analysis.mjs` |
| 可行性状态 API | `platform/api/src/routes/intake.mjs` — `handleGetFeasibility()` |
| 样式 | `platform/api/public/app.css` — `.analysis-progress`、`.analysis-banner` |

---

*最后更新：2026-06-16*
