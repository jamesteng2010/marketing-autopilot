# Automation 总指挥模型

> **产品级通用契约：** 以下流程适用于 **每一个注册用户、每一个 projectId**，无例外。  
> Dogfood（`projects/marketing-autopilot-launch/`）仅是第一个实例，不是特殊模式。

Marketing Autopilot 的核心原则：**用户是信息源与观众，Automation 是指挥官与执行者。**

---

## 1. 适用范围（必读）

| 维度 | 规则 |
|------|------|
| **每个 User** | 名下所有 Project 均走同一套 Automation 总指挥流程 |
| **每个 Project** | 独立 `phases.json`、`registry.json`、`campaigns/`、`ops/progress.json` |
| **Project A vs B** | 流程相同，**数据与脚本不共享** |
| **平台实现** | Provisioning 时复制模板；Strategy Planner **按 intake 生成** 阶段与 task，非写死 Week 1 |
| **禁止** | 给用户发「本周手工 todo」；要求用户 clone 仓库、手搓 landing、自己跑 npm |

**用户永远在做的事：** 提供信息 → 看进度 → 按通知补凭证/验证/可选批准。  
**Automation 永远在做的事：** 定阶段 → 写代码 → 运行 → 汇报 → 推进下一阶段。

---

## 2. 每个项目的标准生命周期

```
Provisioning（创建 projectId）
        ↓
Intake + Materials（用户输入）
        ↓
Feasibility Analysis（Automation → 用户确认）
        ↓
Strategy Planner → active-plan.md + phases.json + registry + campaigns 骨架
        ↓
┌───────────────────────────────────────────┐
│  Phase Loop（每个项目独立重复）              │
│  currentPhase → run-phase → progress.json  │
│  缺信息 → pending-human → 用户补充 → 续跑   │
│  阶段完成 → nextPhase                      │
└───────────────────────────────────────────┘
        ↓
Weekly Review → 调整 plan / phases / registry
        ↺
```

与 [user-journey.md](./user-journey.md)、[multi-tenant-model.md](./multi-tenant-model.md) 一致。

---

## 3. 角色定义（全平台统一）

| 角色 | 做什么 | 不做什么 |
|------|--------|----------|
| **用户** | 填 intake、传资料、看 **本项目** 仪表盘、补 Vault/验证 | 不写 campaign 代码、不手动执行营销 task |
| **Automation 总指挥** | 为本项目：分阶段 → 生成/更新 `campaigns/*.mjs` → `run-phase` → 汇报 | 不跨 projectId；不编造 secret |
| **Platform** | 隔离存储、触发 Automation、渲染 `ops/progress.json` | 不在项目间共享 registry/phases |

---

## 4. 每个 Project 必备产物（Provisioning + Planner）

创建 `tenants/{userId}/projects/{projectId}/` 时 **必须** 初始化：

| 路径 | 用途 |
|------|------|
| `intake/active.json` | 来自 UI |
| `intake/analysis/` | feasibility、extracted |
| `strategy/active-plan.md` | Planner 生成 |
| `runtime/orchestrator/phases.json` | **阶段链（每项目不同）** |
| `runtime/orchestrator/registry.json` | **本项目 task 列表** |
| `runtime/orchestrator/plan.json` | 优先级 |
| `runtime/user-inputs.json` | 用户可选输入（表单 URL 等） |
| `campaigns/{slug}/` | **Automation 生成的可执行脚本** |
| `ops/progress.json` | **用户唯一进度视图** |
| `ops/pending-human.json` | 仅需用户介入的项 |
| `ops/actions/` | 结构化动作日志 |

Strategy Planner 根据 **该项目的** intake、feasibility、methods-catalog、regions-catalog **动态生成** phases 与 campaigns，不是全员共用同一 `week_1` 列表。

---

## 5. 阶段式指挥（Phase Command）

每个项目在自己的 `phases.json` 中维护：

```json
{
  "currentPhase": "phase_01_foundation",
  "phases": {
    "phase_01_foundation": {
      "label": "…由 Planner 根据 strategy 填写…",
      "taskIds": ["…本项目 registry 中的 id…"],
      "successCriteria": { "artifactsExist": ["…"] },
      "nextPhase": "phase_02_content"
    }
  }
}
```

执行链（Execution Runner / Cron）：

```
读 PROJECT_ROOT + projectId
        ↓
phases.json → currentPhase
        ↓
director run-phase [phaseId]
        ↓
按序执行 registry 中 enabled tasks
        ↓
每个 task 运行 campaigns/<slug>/run.mjs（Automation 生成或更新）
        ↓
更新 ops/progress.json、ops/actions/
        ↓
缺 user-inputs / 凭证 → pending-human → 暂停，通知用户
        ↓
successCriteria 满足 → currentPhase := nextPhase
```

**CLI（平台内部）：**

```bash
PROJECT_ROOT=tenants/{userId}/projects/{projectId} npm run marketing:phase
```

---

## 6. 用户唯一交互类型（全项目通用）

| 类型 | 示例 | UI 表现 |
|------|------|---------|
| **Intake / 资料** | 产品信息、PDF、官网 | 表单 + 资料库 |
| **确认可行性** | userConfirmedAnalysis | 「确认并生成计划」按钮 |
| **凭证** | SMTP、OpenAI、社媒 token | 项目凭证页 → Vault |
| **User inputs** | WAITLIST_FORM_URL、embed HTML | pending-human 卡片 |
| **人工验证** | CAPTCHA、短信 | verification_required 通知 |
| **批准（可选）** | 冷 DM、发帖终稿 | 策略开关；可配置 auto-approve |
| **看进度** | 默认状态 | 读 `ops/progress.json` + 活动时间线 |

**产品 UI 不得展示：**「请手动完成 marketing todo 清单」。

**活动与催促：** 从注册起每步写入 activity log；上表任一「等用户」状态 → open obligation → **定期通知**（0/24/48/72h + 每周，可 Snooze）。见 [user-activity-and-notifications.md](./user-activity-and-notifications.md)。

---

## 7. `ops/progress.json` — 每个项目的用户界面真相源

所有项目的仪表盘 **只读** 本项目 `ops/progress.json`：

```json
{
  "projectId": "prj_xxx",
  "userId": "usr_xxx",
  "currentPhase": "phase_01_foundation",
  "phaseProgress": 0.6,
  "phaseLabel": "…",
  "tasks": [
    { "id": "…", "status": "done|running|failed|blocked", "summary": "…" }
  ],
  "pendingUserActions": [
    { "type": "user_input", "field": "WAITLIST_FORM_URL", "reason": "…" }
  ],
  "metrics": {}
}
```

- `tasks[].summary` 由 Automation 写入，描述 **已生成的 artifact**，不是给用户的指令。  
- `pendingUserActions` **唯一** 允许出现「需要用户提供 X」。

---

## 8. Strategy Planner 职责（每个项目确认 feasibility 后）

对 **当前 projectId** 必须：

1. 写 `strategy/active-plan.md`（含分阶段 roadmap）  
2. 写 `runtime/orchestrator/phases.json`（阶段 id、taskIds、successCriteria、nextPhase）  
3. 写/更新 `runtime/orchestrator/registry.json`（task → command）  
4. **生成** `campaigns/{slug}/run.mjs`（或首次 run 时由 Execution Agent 生成）  
5. 初始化 `ops/progress.json`  

阶段划分因项目而异：SaaS 可能是 foundation → content → launch；电商可能是 catalog → ads → retention。**不由运营手工配置，而由 Planner 根据 intake 产出。**

---

## 9. Execution Runner 职责（每个项目 cron）

参数：**必须** 带 `userId` + `projectId`（或 `PROJECT_ROOT`）。

1. 若 `pendingUserActions` 非空且阻塞 → 暂停，不跑 outbound  
2. 否则 `run-phase` 当前阶段  
3. 写 `ops/daily/`、更新 metrics  
4. 阶段完成 → 可选通知用户「进入下一阶段」  
5. **禁止** 向用户发送手工 task 列表  

---

## 10. 多项目并行

| 用户 | Project A | Project B |
|------|-----------|-----------|
| phases | `phase_02_content` | `phase_01_foundation` |
| progress | 各自 `ops/progress.json` | 独立 |
| Automation run | `PROJECT_ROOT=A` | `PROJECT_ROOT=B` |
| 用户 UI | 切换项目即切换进度视图 | 同 |

同一用户可同时有两个项目处于不同阶段；Automation 每次 run **只处理一个 projectId**。

---

## 11. 与模板仓库 / Dogfood 的关系

| 层级 | 说明 |
|------|------|
| **本 GitHub 仓库** | 平台工程 + **Provisioning 模板**（phases.template.json、registry 结构） |
| **每个客户 Project** | Provisioning 复制模板后，由 Planner **重写** phases/registry/campaigns |
| **`projects/marketing-autopilot-launch/`** | 官方 Dogfood **示例项目**，演示全流程；逻辑与任意 `tenants/.../projects/.../` 相同 |

---

## 12. 验收标准（产品）

见 [features.md](./features.md) § F10。核心：**任意新建 Project** 在只提供 intake 的情况下，Automation 能生成 phases、跑通至少一个 phase、用户仅通过 progress 与 pending-human 交互。

---

## 13. 相关文档

- [multi-tenant-model.md](./multi-tenant-model.md)
- [user-journey.md](./user-journey.md)
- [execution-and-actions.md](./execution-and-actions.md)
- [integration-marketing-catalog.md](./integration-marketing-catalog.md)
- [PRD.md](./PRD.md) §5.0、§5.10
