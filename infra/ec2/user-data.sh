#!/bin/bash
# EC2 user-data — Ubuntu 22.04 marketing worker bootstrap
set -euo pipefail

apt-get update -y
apt-get install -y git curl build-essential

curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

npm install -g pm2

MARKETING_REPO="${MARKETING_REPO:-https://github.com/jamesteng2010/marketing-autopilot.git}"
APP_DIR="/opt/marketing-autopilot"

git clone "$MARKETING_REPO" "$APP_DIR" || (cd "$APP_DIR" && git pull)
cd "$APP_DIR"
npm install

echo "Clone complete. Copy .env.local to $APP_DIR and start PM2 manually."
echo "Example: GIT_AUTO_SYNC=1 pm2 start npm --name marketing-exec -- run marketing:execute -- <taskId>"
