# Platform 数据库（MySQL）

Marketing Autopilot **Platform DB** 存 SaaS 元数据（用户、项目、obligation、计费状态等）。  
**不存**策略正文、campaign 源码、凭证明文 —  those 在项目工作区或 Vault。

> 客户业务库（Intake `productData`）仍可以是 postgres/mysql/supabase 等，与 Platform DB **无关**。

---

## 开发环境（当前方案）

| 项 | 值 |
|----|-----|
| 引擎 | MySQL 8.x（与 Kids Guard 相同 Docker 镜像） |
| 主机 EC2 | **Kids Guard Prod** `i-0cda17e7581e268d1` |
| 弹性 IP | `54.206.252.93` |
| MySQL 容器 | `kids-guard-mysql-prod` |
| 监听 | **`127.0.0.1:3306`**（仅 EC2 本机，不对外暴露） |
| 库名 | **`marketing-autopilot-dev`** |
| 用户 | **`marketing-autopilot`** |
| 密码 | `MARKETING_AUTOPILOT_DB_PASS` → `secrets.local.env`（勿提交 git） |
| Kids Guard 库 | **`kids-guard-prod`** — **禁止** Marketing Autopilot 连接或迁移 |

### 与 Kids Guard 共存

```text
Kids Guard Prod EC2 (54.206.252.93)
├── Docker kids-guard-mysql-prod :3306 (localhost only)
│   ├── kids-guard-prod          ← Kids Guard API（勿动）
│   └── marketing-autopilot-dev  ← Marketing Autopilot Platform（新增）
├── PM2 kids-guard-api :3001     ← 勿改
└── /opt/marketing-autopilot     ← 可选：MA 代码 + Worker（API 建议 :3002）
```

**硬性规则：**

1. 不修改 `docker-compose.prod.yml`、`.env.prod`、Kids Guard PM2/nginx  
2. 不 `DROP` / `TRUNCATE` / 迁移 `kids-guard-prod`  
3. 仅对 `marketing-autopilot-dev` 建表；专用 DB 用户无其他库权限  
4. 备份 Kids Guard 时仍用现有 [mysql-backup-restore](https://github.com/jamesteng2010/kids-guard) runbook；MA 库可单独 `mysqldump marketing-autopilot-dev`

建库脚本：`infra/mysql/provision-on-kids-guard-prod.sh`

---

## 从本机连接（SSH 隧道）

MySQL 不暴露公网，本地开发需隧道：

```bash
ssh -i ~/.ssh/kids-guard-prod.pem -L 13306:127.0.0.1:3306 ubuntu@54.206.252.93 -N
```

`.env.local`：

```bash
DB_HOST=127.0.0.1
DB_PORT=13306
DB_NAME=marketing-autopilot-dev
DB_USER=marketing-autopilot
DB_PASS=<from secrets.local.env>
DATABASE_URL=mysql://marketing-autopilot:<PASS>@127.0.0.1:13306/marketing-autopilot-dev
```

---

## 概念表结构（v0.2）

实现 migration 时写入 **`marketing-autopilot-dev` only**：

| 表 | 用途 |
|----|------|
| `users` | user_id, email, created_at, notifications_json |
| `projects` | project_id, user_id, name, status, workspace_uri, … |
| `project_members` | project_id, user_id, role（v1.0 seat） |
| `automation_runs` | run_id, project_id, automation_name, status, correlation_id, … |
| `obligations` | obligation_id, project_id, type, status, next_remind_at, payload_json, … |
| `billing_subscriptions` | user_id, plan, scope_multiplier, stripe_sub_id |

详细字段见 [implementation.md §4.1](../product/implementation.md#41-platform-db元数据)。

---

## 环境变量

| 变量 | 说明 |
|------|------|
| `DATABASE_URL` | `mysql://user:pass@host:port/marketing-autopilot-dev` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASS` | 分项配置（ORM 可选） |
| `MARKETING_AUTOPILOT_DB_PASS` | 仅用于 `provision-on-kids-guard-prod.sh` |

---

## 生产（后续）

开发共用 Kids Guard EC2 **仅用于 v0.2 dogfood**。生产建议：

- 独立 EC2 或 RDS MySQL  
- 库名如 `marketing-autopilot-prod`  
- 与 Kids Guard 完全分实例  

---

## 相关文档

- [aws-dev-environment.md](./aws-dev-environment.md) — EC2 清单与架构  
- [../product/implementation.md](../product/implementation.md) — Platform 数据模型  
- Kids Guard MySQL 运维：`kids-guard/docs/operations/database.md`（**只读参考**，勿在 KG 文档写 MA 密码）
