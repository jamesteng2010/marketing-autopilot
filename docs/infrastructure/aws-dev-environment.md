# AWS 开发环境

Marketing Autopilot 开发与 **Kids Guard Prod** 共用同一 EC2 与同机 MySQL（**独立数据库**），区域 **ap-southeast-2**。

> **AWS 账号：`013623161586`**  
> **注意**：本机 `aws` default profile 为错误账号 `504451734104` — 操作 EC2 须用 `kids-guard/secrets.local.env` 凭证（§0）。  
> 最后更新：2026-06-14

---

## 0. 凭证与 CLI

| 项 | 值 |
|----|-----|
| 正确账号 ID | `013623161586` |
| 错误默认账号 | `504451734104`（勿用） |
| 区域 | `ap-southeast-2` |
| AWS 凭证 | `../kids-guard/secrets.local.env` 或 `marketing-autopilot/secrets.local.env` |
| SSH（Kids Guard Prod） | `ssh -i ~/.ssh/kids-guard-prod.pem ubuntu@54.206.252.93` |

```bash
set -a && source ../kids-guard/secrets.local.env && set +a
aws sts get-caller-identity   # Account = 013623161586
```

---

## 1. 开发主机：Kids Guard Prod EC2

Marketing Autopilot **v0.2 开发** 使用此实例（Worker、可选 Platform API、MySQL 隧道目标）。

| 项 | 值 |
|----|-----|
| Name | **Kids Guard Prod** |
| Instance ID | `i-0cda17e7581e268d1` |
| 类型 | t3.medium |
| 弹性 IP | **54.206.252.93** |
| 私网 IP | 172.31.8.120 |
| AZ | ap-southeast-2a |
| VPC | `vpc-05802bca2d1810478` |
| SSH Key | `kids-guard-prod` → `~/.ssh/kids-guard-prod.pem` |
| 安全组 | `kids-guard-prod-sg`（22, 80, 443） |

### 1.1 同机服务（Kids Guard — 勿破坏）

| 服务 | 端口 / 路径 | 说明 |
|------|-------------|------|
| nginx | 80 / 443 | Kids Guard 域名反代 |
| PM2 `kids-guard-api` | **3001** | NestJS API — **勿停、勿改端口** |
| Docker `kids-guard-mysql-prod` | **127.0.0.1:3306** | MySQL 8 — 见 [database.md](./database.md) |
| 代码 | `/opt/kids-guard` | rsync / `deploy-ec2.sh` 同步 |

### 1.2 Marketing Autopilot 在同机上的放置

| 项 | 建议 |
|----|------|
| 代码目录 | `/opt/marketing-autopilot`（git clone + `user-data.sh` 或手动） |
| Platform API | 本地 Mac 开发为主；若上 EC2 用 **`PORT=3002`**（避免与 Kids Guard 3001 冲突） |
| Worker / cron | PM2 独立进程名，如 `ma-worker` |
| MySQL | 库 **`marketing-autopilot-dev`** — 与 `kids-guard-prod` **隔离** |

**禁止：** 重装 EC2、改 Kids Guard Docker compose、删库、覆盖 `/opt/kids-guard/infra/docker/.env.prod`。

---

## 2. 同账号其他 EC2（非 MA 开发机）

| Name | Instance ID | 状态 | 公网 IP | 说明 |
|------|-------------|------|---------|------|
| DB Server | `i-0283a1fc1a1e6da3a` | running | 3.27.167.26 | 旧 MySQL `kids-guards` — **勿用** |
| New WebServer | `i-0dde2c8d96477199e` | running | 15.134.202.173 | 其他业务 |
| AI_ReservatonServer | `i-079fd7887aadc0058` | running | 13.239.183.66 | 其他业务 |
| **Auto Run - Linux With UI** | `i-0bcad8fa8613cbcd7` | **stopped** | — | 已按需停止（2026-06-14） |
| Site Server | `i-02e3da8bcb01e6eeb` | stopped | — | 闲置 |
| New Server which the old service dead | `i-05f64a6a1e6f1c18d` | stopped | — | 闲置 |

---

## 3. 数据库：MySQL（非 PostgreSQL）

| 项 | 值 |
|----|-----|
| 引擎 | MySQL 8.x |
| 实例 | Kids Guard Prod 上 Docker **`kids-guard-mysql-prod`** |
| Platform 库 | **`marketing-autopilot-dev`** |
| Platform 用户 | **`marketing-autopilot`** |
| Kids Guard 库 | **`kids-guard-prod`**（只读隔离，MA 不连接） |
| RDS | 本账号 **无 RDS** |

建库：`infra/mysql/provision-on-kids-guard-prod.sh`  
详情：[database.md](./database.md)

---

## 4. 开发架构

```mermaid
flowchart LR
  subgraph local [开发者 Mac]
    IDE[Cursor / API :3001]
    TUN[SSH tunnel :13306]
  end

  subgraph ec2 [Kids Guard Prod 54.206.252.93]
    MYSQL[(MySQL Docker :3306)]
    KGAPI[Kids Guard API :3001]
    MAAPP[/opt/marketing-autopilot]
    WORKER[PM2 ma-worker]
  end

  subgraph cloud [Cursor Cloud]
    AUTO[Automations 01–05]
  end

  IDE --> TUN --> MYSQL
  MAAPP --> MYSQL
  WORKER --> MAAPP
  AUTO -->|webhook + git| IDE
```

| 组件 | 开发 placement |
|------|----------------|
| Platform DB | MySQL `marketing-autopilot-dev` @ EC2 localhost |
| Platform API | 本地 + SSH 隧道连 DB；或 EC2 `:3002` |
| 项目工作区 | 本地 `projects/` 或 EC2 `/opt/marketing-autopilot/projects/` |
| Execution Worker | EC2 PM2（可选，v0.2 后期） |
| Strategy | Cursor Cloud |

---

## 5. 环境变量

复制 `.env.example` → `.env.local`，密码写入 `secrets.local.env`（gitignore）。

```bash
# 先开隧道: ssh -L 13306:127.0.0.1:3306 ubuntu@54.206.252.93 -N
PORT=3001
WORKSPACE_ROOT=projects
DB_HOST=127.0.0.1
DB_PORT=13306
DB_NAME=marketing-autopilot-dev
DB_USER=marketing-autopilot
DB_PASS=<secrets.local.env>
DATABASE_URL=mysql://marketing-autopilot:<PASS>@127.0.0.1:13306/marketing-autopilot-dev

USER_ID=dev-user-001
PROJECT_ID=marketing-autopilot-launch
PROJECT_ROOT=projects/marketing-autopilot-launch

AWS_REGION=ap-southeast-2
```

`secrets.local.env.example` 见仓库根目录。

---

## 6. 开发域名（临时）

| 项 | 值 |
|----|-----|
| 域名 | **`myreceipt.website`**（GoDaddy） |
| API | **https://api.myreceipt.website** |
| EC2 | 同 Kids Guard Prod `54.206.252.93` |
| 部署 | `./infra/ec2/deploy-dev.sh` |

详情：[domains-godaddy.md](./domains-godaddy.md)

---

## 7. 初始化 checklist

- [ ] `MARKETING_AUTOPILOT_DB_PASS` 写入 `secrets.local.env`
- [ ] 运行 `./infra/mysql/provision-on-kids-guard-prod.sh`（仅新建 MA 库）
- [ ] 验证 `kids-guard-prod` 与 Kids Guard API 仍正常
- [ ] 本地 SSH 隧道 + `platform/api` 连库
- [ ] （可选）EC2 克隆 `/opt/marketing-autopilot` + PM2 Worker

---

## 7. 附录：错误账号（勿引用）

账号 `504451734104` 的 knest / aihouse / ptw / knest-pg **不属于**本项目。
