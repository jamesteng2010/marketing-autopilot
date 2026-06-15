#!/usr/bin/env bash
# Set GoDaddy A record(s) for a domain (Production API).
# Usage: source secrets.local.env && ./infra/godaddy/set-dns-a.sh myreceipt.website 54.206.252.93 @ api

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
[[ -f "$ROOT/secrets.local.env" ]] && { set -a; source "$ROOT/secrets.local.env"; set +a; }

DOMAIN="${1:?domain}"
IP="${2:?ip}"
shift 2
NAMES=("${@:-@}")

if [[ -z "${GODADDY_API_KEY:-}" || -z "${GODADDY_API_SECRET:-}" ]]; then
  echo "Missing GODADDY_API_KEY / GODADDY_API_SECRET" >&2
  exit 1
fi

AUTH="Authorization: sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}"

for name in "${NAMES[@]}"; do
  echo "Setting A ${name}.${DOMAIN} -> ${IP}"
  curl -sS -X PUT \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    "https://api.godaddy.com/v1/domains/${DOMAIN}/records/A/${name}" \
    -d "[{\"data\":\"${IP}\",\"ttl\":600}]"
  echo
done

echo "Done. Verify: dig +short ${DOMAIN}"
