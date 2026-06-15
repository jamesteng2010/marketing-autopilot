# 平台 Automation 策略（合规与禁止动作）

> **不对 Intake 用户展示。** 由平台管理员维护，告诉 Strategy Planner / Execution 哪些能做、哪些不能做。  
> 实现：`runtime/automation-policy.json` · Admin API · 分析时快照到项目工作区。

---

## 1. 为什么从 Intake 移除

| 原 Intake 字段 | 处理方式 |
|----------------|----------|
| `marketing.brandTone` | **隐藏**；默认 `professional`，由平台 policy 的 `defaultBrandTone` 注入（用户不填） |
| `marketing.complianceNotes` | **隐藏**；改由 **平台级** `automation-policy.json` 统一管理 |

用户只需填产品、市场、现有营销等业务信息；**合规红线** 由运营/管理员统一配置，避免每个客户重复填写 GDPR、冷私信等相同规则。

Intake UI 仍保留 Step 3 **Brand & preferences**：Custom domain、Desired brand email、Use existing social accounts。

---

## 2. 配置文件

路径（仓库根）：`runtime/automation-policy.json`

```json
{
  "version": 1,
  "updatedAt": "2026-06-14T00:00:00.000Z",
  "description": "Platform-wide rules — not shown in user Intake UI",
  "complianceNotes": "No cold DMs without per-project approval. No false or fear-based claims. …",
  "forbiddenActions": ["social.dm", "social.mass_connect"],
  "contentRules": [
    "Do not promise guaranteed signups or revenue",
    "Child-safety products: no scare tactics"
  ],
  "defaultBrandTone": "professional",
  "requireUserApprovalFor": {
    "coldDm": true,
    "accountCreate": true,
    "massConnect": true
  }
}
```

| 字段 | 说明 |
|------|------|
| `complianceNotes` | 给 Automation / Planner 的自然语言合规说明（写入策略 § Risks & compliance） |
| `forbiddenActions` | `action-catalog` 级动作 ID，Execution **不得** 自动执行 |
| `contentRules` | 文案生成红线（帖子、邮件、落地页） |
| `defaultBrandTone` | 用户未指定时的默认语气 |
| `requireUserApprovalFor` | 与 `marketing.actionsApproved.*` 对齐；为 true 时需用户在 Strategy 批准门确认 |

区域法规（GDPR、PIPL、广告法等）仍来自 `runtime/regions-catalog.json` 各 region 的 `compliance[]`；本文件为 **平台 + 垂直行业** 叠加层。

---

## 3. 注入项目工作区

用户点击 **Request analysis**（`POST …/intake/analyze`）时，`prepare-analysis.mjs` 会：

1. 将平台 policy **快照** 到 `tenants/…/projects/{projectId}/runtime/automation-policy.json`
2. 若 `intake.marketing.complianceNotes` 为空，写入 `complianceNotes` 并标记 `complianceSource: platform_policy`
3. 若 `intake.marketing.brandTone` 为空，写入 `defaultBrandTone`

Strategy Planner / Intake Analysis Automation **必须阅读**：

- `runtime/automation-policy.json`（项目快照）
- `intake/active.json`
- `runtime/regions-catalog.json`（按 `audience.geographyRegions`）

---

## 4. Admin API

需环境变量 `ADMIN_API_TOKEN`。请求头：`X-Admin-Token: <token>` 或 `Authorization: Bearer <token>`。

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/automation-policy` | 读取当前平台 policy |
| PUT | `/api/admin/automation-policy` | 更新（合并 body，刷新 `updatedAt`） |

示例：

```bash
curl -H "X-Admin-Token: $ADMIN_API_TOKEN" \
  https://api.myreceipt.website/api/admin/automation-policy

curl -X PUT -H "X-Admin-Token: $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"complianceNotes":"Kids Guard: no fear-based ads; GDPR for EU parents."}' \
  https://api.myreceipt.website/api/admin/automation-policy
```

也可直接在 EC2 上编辑 `/opt/marketing-autopilot/runtime/automation-policy.json` 后无需重启 API（下次 analyze 快照即生效）。

`secrets.local.env` → `ADMIN_API_TOKEN`；deploy 脚本会写入 `platform/api/.env`。

---

## 5. 与用户侧 `actionsApproved` 的关系

| 层级 | 谁配置 | 作用 |
|------|--------|------|
| **平台 policy** | 管理员 | 全局禁止动作、默认合规、默认语气 |
| **`marketing.actionsApproved`** | 用户（Strategy 批准门） | 单项目是否允许冷 DM、自动建号等高风险动作 |
| **region.compliance** | catalog | 按目标国家的法律与平台规则 |

Execution 同时满足三层；平台 `forbiddenActions` **优先**（即使用户未显式拒绝也不可执行）。

---

## 6. 相关文档

- [intake-and-materials.md](./intake-and-materials.md) §8 UI  
- [ui-design-system.md](./ui-design-system.md) §8.4 Intake  
- [user-intake-guide.md](../user-intake-guide.md) — Marketing 字段说明  
- [execution-and-actions.md](./execution-and-actions.md) — 动作与批准门  
- [integration-marketing-catalog.md](./integration-marketing-catalog.md) — region.compliance
