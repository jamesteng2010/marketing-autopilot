#!/usr/bin/env bash
# List GoDaddy domains via REST API (requires GODADDY_API_KEY + GODADDY_API_SECRET).
# Web login (GODADY_USER/PASS) cannot be used here — create keys at https://developer.godaddy.com/keys
#
#   source secrets.local.env
#   ./infra/godaddy/list-domains.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
if [[ -f "$ROOT/secrets.local.env" ]]; then
  set -a && source "$ROOT/secrets.local.env" && set +a
fi

if [[ -z "${GODADDY_API_KEY:-}" || -z "${GODADDY_API_SECRET:-}" ]]; then
  echo "Missing GODADDY_API_KEY / GODADDY_API_SECRET in secrets.local.env" >&2
  echo "Create Production keys: https://developer.godaddy.com/keys" >&2
  exit 1
fi

curl -sS -H "Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}" \
  -H "Accept: application/json" \
  "https://api.godaddy.com/v1/domains" \
  | python3 -c "
import json, sys
data = json.load(sys.stdin)
if isinstance(data, dict) and 'code' in data:
    print('API error:', data, file=sys.stderr)
    sys.exit(1)
for d in sorted(data, key=lambda x: x.get('domain', '')):
    name = d.get('domain', '?')
    status = d.get('status', '?')
    expires = d.get('expires', '?')
    print(f'{name}\t{status}\texpires:{expires}')
"
