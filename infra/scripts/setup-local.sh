#!/bin/bash
# Local dev bootstrap (macOS / Linux)
set -euo pipefail
cd "$(dirname "$0")/../.."
npm install
cp -n .env.example .env.local 2>/dev/null || true
echo "Run: npm run marketing:validate (after filling intake/active.json)"
