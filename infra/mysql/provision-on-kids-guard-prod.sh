#!/usr/bin/env bash
# Provision marketing-autopilot-dev MySQL database on Kids Guard Prod EC2.
# Does NOT modify Kids Guard compose, .env.prod, PM2, nginx, or kids-guard-prod data.
#
#   export MARKETING_AUTOPILOT_DB_PASS='your-strong-password'
#   ./infra/mysql/provision-on-kids-guard-prod.sh
#
# On EC2 (repo already at /opt/marketing-autopilot):
#   MARKETING_AUTOPILOT_DB_PASS='...' ./infra/mysql/provision-on-kids-guard-prod.sh --local

set -euo pipefail

KIDS_GUARD_DOCKER_DIR="/opt/kids-guard/infra/docker"
MYSQL_CONTAINER="kids-guard-mysql-prod"
SSH_HOST="${KIDS_GUARD_SSH:-ubuntu@54.206.252.93}"
SSH_KEY="${KIDS_GUARD_SSH_KEY:-$HOME/.ssh/kids-guard-prod.pem}"

if [[ -z "${MARKETING_AUTOPILOT_DB_PASS:-}" ]]; then
  echo "Set MARKETING_AUTOPILOT_DB_PASS before running." >&2
  exit 1
fi

run_provision() {
  local pass_escaped="${MARKETING_AUTOPILOT_DB_PASS//\'/\'\'}"
  cd "$KIDS_GUARD_DOCKER_DIR"
  test -f .env.prod || { echo "Missing .env.prod at $KIDS_GUARD_DOCKER_DIR" >&2; exit 1; }
  set -a && source .env.prod && set +a
  sudo docker ps --filter "name=${MYSQL_CONTAINER}" --format '{{.Names}}' | grep -q "$MYSQL_CONTAINER" \
    || { echo "Container ${MYSQL_CONTAINER} not running" >&2; exit 1; }

  sudo docker exec -i "$MYSQL_CONTAINER" mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE DATABASE IF NOT EXISTS \`marketing-autopilot-dev\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'marketing-autopilot'@'%' IDENTIFIED BY '${pass_escaped}';
GRANT ALL PRIVILEGES ON \`marketing-autopilot-dev\`.* TO 'marketing-autopilot'@'%';
FLUSH PRIVILEGES;
SQL

  echo "OK: marketing-autopilot-dev provisioned (Kids Guard databases untouched)."
  sudo docker exec "$MYSQL_CONTAINER" mysql -u root -p"${MYSQL_ROOT_PASSWORD}" \
    -e "SHOW DATABASES LIKE 'marketing-autopilot-dev'; SHOW GRANTS FOR 'marketing-autopilot'@'%';"
}

if [[ "${1:-}" == "--local" ]]; then
  run_provision
else
  ssh -i "$SSH_KEY" -o StrictHostKeyChecking=accept-new "$SSH_HOST" \
    "MARKETING_AUTOPILOT_DB_PASS=$(printf '%q' "$MARKETING_AUTOPILOT_DB_PASS") bash -s -- --local" <<'REMOTE'
set -euo pipefail
KIDS_GUARD_DOCKER_DIR="/opt/kids-guard/infra/docker"
MYSQL_CONTAINER="kids-guard-mysql-prod"
pass_escaped="${MARKETING_AUTOPILOT_DB_PASS//\'/\'\'}"
cd "$KIDS_GUARD_DOCKER_DIR"
test -f .env.prod || { echo "Missing .env.prod" >&2; exit 1; }
set -a && source .env.prod && set +a
sudo docker ps --filter "name=${MYSQL_CONTAINER}" --format '{{.Names}}' | grep -q "$MYSQL_CONTAINER" \
  || { echo "Container ${MYSQL_CONTAINER} not running" >&2; exit 1; }
sudo docker exec -i "$MYSQL_CONTAINER" mysql -u root -p"${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE DATABASE IF NOT EXISTS \`marketing-autopilot-dev\`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'marketing-autopilot'@'%' IDENTIFIED BY '${pass_escaped}';
GRANT ALL PRIVILEGES ON \`marketing-autopilot-dev\`.* TO 'marketing-autopilot'@'%';
FLUSH PRIVILEGES;
SQL
echo "OK: marketing-autopilot-dev provisioned (Kids Guard databases untouched)."
sudo docker exec "$MYSQL_CONTAINER" mysql -u root -p"${MYSQL_ROOT_PASSWORD}" \
  -e "SHOW DATABASES LIKE 'marketing-autopilot-dev'; SHOW GRANTS FOR 'marketing-autopilot'@'%';"
REMOTE
fi
