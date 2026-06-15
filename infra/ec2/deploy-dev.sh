#!/usr/bin/env bash
# Deploy Marketing Autopilot dev stack to Kids Guard Prod EC2 (myreceipt.website).
# Does NOT modify Kids Guard PM2 / MySQL / kids-guard.conf.
#
#   ./infra/ec2/deploy-dev.sh
# Optional: CERTBOT_EMAIL=you@example.com ./infra/ec2/deploy-dev.sh --certbot

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
SSH_KEY="${KIDS_GUARD_SSH_KEY:-$HOME/.ssh/kids-guard-prod.pem}"
SSH_HOST="${KIDS_GUARD_SSH:-ubuntu@54.206.252.93}"
REMOTE_DIR="/opt/marketing-autopilot"
RUN_CERTBOT=false
[[ "${1:-}" == "--certbot" ]] && RUN_CERTBOT=true

if [[ -f "$ROOT/secrets.local.env" ]]; then
  set -a && source "$ROOT/secrets.local.env" && set +a
fi

DB_PASS="${DB_PASS:-${MARKETING_AUTOPILOT_DB_PASS:-}}"
if [[ -z "$DB_PASS" ]]; then
  echo "Missing DB_PASS or MARKETING_AUTOPILOT_DB_PASS in secrets.local.env" >&2
  exit 1
fi

EXISTING_JWT="$(ssh -i "$SSH_KEY" "$SSH_HOST" "grep -E '^JWT_SECRET=' ${REMOTE_DIR}/platform/api/.env 2>/dev/null | cut -d= -f2-" || true)"
JWT_SECRET="${JWT_SECRET:-${EXISTING_JWT:-$(openssl rand -hex 32)}}"

echo "==> Ensure ${REMOTE_DIR} on EC2"
ssh -i "$SSH_KEY" "$SSH_HOST" "sudo mkdir -p ${REMOTE_DIR} && sudo chown ubuntu:ubuntu ${REMOTE_DIR}"

echo "==> Sync repo to ${SSH_HOST}:${REMOTE_DIR}"
rsync -az --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .env.local \
  --exclude secrets.local.env \
  --exclude intake/active.json \
  -e "ssh -i ${SSH_KEY}" \
  "${ROOT}/" "${SSH_HOST}:${REMOTE_DIR}/"

echo "==> Write platform/api/.env on EC2"
ssh -i "$SSH_KEY" "$SSH_HOST" "cat > ${REMOTE_DIR}/platform/api/.env" <<EOF
PORT=3002
DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=marketing-autopilot-dev
DB_USER=marketing-autopilot
DB_PASS=${DB_PASS}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=7d
WORKSPACE_ROOT=${REMOTE_DIR}/projects
APP_PUBLIC_URL=https://api.myreceipt.website
MAIL_FROM=noreply@myreceipt.website
MAIL_FROM_NAME=Marketing Autopilot
MAIL_REPLY_TO=noreply@myreceipt.website
MAIL_PRODUCT_NAME=Marketing Autopilot
MAIL_DEV_LOG=false
MAIL_LOG_VERIFY_LINKS=true
AWS_REGION=${AWS_REGION:-ap-southeast-2}
AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID:-}
AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY:-}
ADMIN_API_TOKEN=${ADMIN_API_TOKEN:-}
OPENAI_API_KEY=${OPENAI_API_KEY:-}
OPENAI_MODEL=${OPENAI_MODEL:-gpt-4o-mini}
CURSOR_AUTOMATION_05_WEBHOOK_URL=${CURSOR_AUTOMATION_05_WEBHOOK_URL:-}
CURSOR_AUTOMATION_05_BEARER_TOKEN=${CURSOR_AUTOMATION_05_BEARER_TOKEN:-}
AUTOMATION_CALLBACK_TOKEN=${AUTOMATION_CALLBACK_TOKEN:-}
ANALYSIS_ENGINE=${ANALYSIS_ENGINE:-auto}
EOF

echo "==> Install deps + PM2 (port 3002)"
ssh -i "$SSH_KEY" "$SSH_HOST" bash -s <<'REMOTE'
set -euo pipefail
cd /opt/marketing-autopilot/platform/api
npm install --omit=dev
if pm2 describe marketing-autopilot-api >/dev/null 2>&1; then
  pm2 restart marketing-autopilot-api --update-env
else
  pm2 start src/server.mjs --name marketing-autopilot-api
fi
pm2 save
REMOTE

echo "==> nginx marketing-autopilot.conf"
ssh -i "$SSH_KEY" "$SSH_HOST" bash -s <<'REMOTE'
set -euo pipefail
sudo cp /opt/marketing-autopilot/infra/ec2/nginx/marketing-autopilot.conf \
  /etc/nginx/sites-available/marketing-autopilot.conf
sudo ln -sf /etc/nginx/sites-available/marketing-autopilot.conf \
  /etc/nginx/sites-enabled/marketing-autopilot.conf
sudo nginx -t
sudo systemctl reload nginx
REMOTE

echo "==> Restore HTTPS (certbot re-applies SSL after HTTP-only sync)"
ssh -i "$SSH_KEY" "$SSH_HOST" \
  "sudo certbot --nginx -d myreceipt.website -d www.myreceipt.website -d api.myreceipt.website \
    --non-interactive --agree-tos -m ${CERTBOT_EMAIL:-jamesteng2010@gmail.com} --redirect" \
  2>&1 | tail -5

echo "==> Health check on EC2"
ssh -i "$SSH_KEY" "$SSH_HOST" "curl -sf http://127.0.0.1:3002/health && echo"

echo "==> Auth smoke test (public HTTPS, no email sends)"
SKIP_EMAIL_TESTS=1 API_BASE="https://api.myreceipt.website" node "$ROOT/platform/api/test/auth.test.mjs"

echo "==> Intake smoke test (public HTTPS)"
API_BASE="https://api.myreceipt.website" TEST_EMAIL="${TEST_EMAIL:-jamesteng2010@gmail.com}" TEST_PASSWORD="${TEST_PASSWORD:-TestPass123!}" node "$ROOT/platform/api/test/intake.test.mjs"

echo "Deploy complete."
