# GoDaddy 域名

> AWS 账号 `013623161586` · 凭证：`secrets.local.env` → `GODADDY_API_*`

## Marketing Autopilot 开发域（临时）

| 项 | 值 |
|----|-----|
| **主域** | **`myreceipt.website`** |
| **API 子域** | **`api.myreceipt.website`** |
| **DNS A 记录** | `@` → `54.206.252.93`，`api` → `54.206.252.93` |
| **www** | CNAME → `@` |
| **EC2** | Kids Guard Prod `i-0cda17e7581e268d1`（与 Kids Guard **共用机器**，独立 nginx + PM2） |
| **HTTPS** | Let's Encrypt（certbot），到期 **2026-09-12** 自动续期 |

### URL

| 用途 | URL |
|------|-----|
| 健康检查 | https://myreceipt.website/health |
| **注册 / 登录 UI** | **https://api.myreceipt.website/auth** |
| **产品 UI（Intake）** | **https://api.myreceipt.website/app** |
| Platform API | https://api.myreceipt.website/ |
| POST register | `POST /api/auth/register` — 创建账号，**不发 JWT**；需邮件验证 |
| POST login | `POST /api/auth/login` — 仅 **已验证** 账号可登录 |
| GET verify | `GET /api/auth/verify-email?token=…` 或 UI `/auth/verify?token=…` |
| POST resend | `POST /api/auth/resend-verification` `{ email }` — **同一账号 5 分钟内最多 1 封** |
| POST forgot | `POST /api/auth/forgot-password` `{ email }` |
| POST reset | `POST /api/auth/reset-password` `{ token, password }` |
| GET me | `GET /api/auth/me` + `Authorization: Bearer …` |

**验证邮件防滥用：** 注册与 resend 共用冷却（5 分钟/账号）。Deploy 冒烟测试设 `SKIP_EMAIL_TESTS=1`，不向真实邮箱注册发信。

**平台 Automation 策略（管理员）：**

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/admin/automation-policy` | 需 `X-Admin-Token` |
| PUT | `/api/admin/automation-policy` | 更新 `runtime/automation-policy.json` |

见 [product/automation-policy.md](../product/automation-policy.md)。

**邮件**：AWS SES（`ap-southeast-2`），发件人 `noreply@getkidsguard.xyz`。SES 沙箱期间只能向 **已验证收件人** 发信；生产前需在 AWS 控制台申请 **Production access**，并验证 `myreceipt.website` 域名与 DKIM。

### EC2 进程（勿与 Kids Guard 混淆）

| 服务 | 端口 | PM2 名 |
|------|------|--------|
| Kids Guard API | 3001 | `kids-guard-api` |
| Marketing Autopilot API | **3002** | `marketing-autopilot-api` |

nginx：`/etc/nginx/sites-enabled/marketing-autopilot.conf`（源：`infra/ec2/nginx/marketing-autopilot.conf`）

---

## 账号内全部域名

脚本：`./infra/godaddy/list-domains.sh`

### ACTIVE（2026-06-14）

| 域名 | 用途 |
|------|------|
| getkidsguard.xyz | Kids Guard 生产 |
| myreceipt.website | **Marketing Autopilot 开发（临时）** |
| happyholiday.world | 空闲 |
| hostmate.site | 空闲 |
| peninsulalaundro.com.au | 历史业务 |
| sparkconnect.site | SparkConnect |

其余为 `CANCELLED`，见 API 输出。

---

## 运维命令

```bash
# 列出域名
source secrets.local.env && ./infra/godaddy/list-domains.sh

# 改 A 记录
./infra/godaddy/set-dns-a.sh myreceipt.website 54.206.252.93 @ api

# 部署 EC2（不碰 Kids Guard）
./infra/ec2/deploy-dev.sh
./infra/ec2/deploy-dev.sh --certbot   # 首次 HTTPS

# 验证 DNS（权威 NS）
dig @ns25.domaincontrol.com +short myreceipt.website A

# 验证 HTTPS
curl -sf https://api.myreceipt.website/health
```

---

## 隔离原则

- **不修改** `kids-guard.conf`、Kids Guard PM2、MySQL
- Marketing Autopilot 仅新增 `marketing-autopilot.conf` + PM2 `marketing-autopilot-api`
- 换正式产品域时：新 DNS + 新 nginx `server_name`，可保留 `myreceipt.website` 作 redirect
