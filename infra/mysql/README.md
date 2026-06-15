# MySQL — Marketing Autopilot Platform DB

开发环境：**Kids Guard Prod EC2** 上已有的 Docker MySQL（`kids-guard-mysql-prod`），**新增独立库**，不修改 Kids Guard 配置与数据。

完整说明：[docs/infrastructure/database.md](../../docs/infrastructure/database.md)

## 隔离原则

| 项 | Kids Guard（勿动） | Marketing Autopilot（新增） |
|----|-------------------|----------------------------|
| 数据库 | `kids-guard-prod` | `marketing-autopilot-dev` |
| 用户 | `kids-guards` | `marketing-autopilot` |
| Docker compose | `kids-guard/infra/docker/docker-compose.prod.yml` | **不修改** |
| 密码文件 | `/opt/kids-guard/infra/docker/.env.prod` | `marketing-autopilot/secrets.local.env` |

## 首次建库（一次性）

```bash
export MARKETING_AUTOPILOT_DB_PASS='your-strong-password'
chmod +x infra/mysql/provision-on-kids-guard-prod.sh
./infra/mysql/provision-on-kids-guard-prod.sh
```

脚本仅执行 `CREATE DATABASE IF NOT EXISTS` 与专用用户 GRANT；**不会** DROP、迁移或写入 `kids-guard-prod`。

## 验证

SSH 到 EC2 后：

```bash
cd /opt/kids-guard/infra/docker && source .env.prod
sudo docker exec -it kids-guard-mysql-prod mysql -u marketing-autopilot -p marketing-autopilot-dev -e "SELECT 1;"
```
