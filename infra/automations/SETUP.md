# Automation 05 — Setup (Intake Analysis)

Connect **Request analysis** in the Product UI to a full feasibility report via **Cursor Automation 05** (recommended).

## Architecture

```
User: Request analysis
  → POST /api/projects/:id/intake/analyze
  → prepare-analysis.mjs (Phase A on EC2)
      → validate intake, site scan, existing-marketing.json, intakeBundle
      → POST Cursor webhook (Bearer token)
  → Cursor Automation 05 (cloud)
      → reads intakeBundle from webhook body
      → POST /api/internal/automation/callback (X-Automation-Token)
  → feasibility.md + extracted.json on EC2 tenant workspace
  → User opens /app/projects/:id/analysis → polls until ready → Confirm
```

Optional: set `ANALYSIS_ENGINE=openai` and `OPENAI_API_KEY` to run Phase B on EC2 instead of Cursor.

### Engine modes (`ANALYSIS_ENGINE`)

| Value | Behavior |
|-------|----------|
| **`auto`** (default) | Try Cursor webhook first; on failure (quota, 4xx, etc.) fall back to OpenAI on EC2 if `OPENAI_API_KEY` is set |
| `cursor` | Cursor webhook only — no fallback |
| `openai` | OpenAI on EC2 only — skip Cursor |

For production, configure **both** Cursor webhook credentials and `OPENAI_API_KEY`, with `ANALYSIS_ENGINE=auto`.

---

## Step 1 — Server secrets (`secrets.local.env`)

```bash
openssl rand -hex 32   # AUTOMATION_CALLBACK_TOKEN
```

Add to `secrets.local.env`:

```env
ANALYSIS_ENGINE=auto
AUTOMATION_CALLBACK_TOKEN=<hex-from-above>
CURSOR_AUTOMATION_05_BEARER_TOKEN=crsr_...    # from Cursor Automation webhook settings
CURSOR_AUTOMATION_05_WEBHOOK_URL=             # fill after Step 2
OPENAI_API_KEY=sk-...                         # fallback when Cursor quota/errors
```

Redeploy:

```bash
./infra/ec2/deploy-dev.sh
```

---

## Step 2 — Create Cursor Automation 05

1. Cursor → **Automations** → **New automation**
2. Import or paste from `automations/prefill/05-intake-analysis.json`
3. **Trigger:** Incoming webhook → copy **Webhook URL** and **Bearer token**
4. **Repository:** `jamesteng2010/marketing-autopilot` · branch `main`
5. **Secrets** (Automation settings):

   | Name | Value |
   |------|--------|
   | `AUTOMATION_CALLBACK_TOKEN` | Same hex as server `secrets.local.env` |

6. Put webhook URL + Bearer token into `secrets.local.env` → redeploy.

---

## Step 3 — Verify

1. Complete Intake → **Request analysis** (redirects to Analysis page)
2. Analysis page polls until `status: ready`
3. EC2 project folder should contain:
   - `intake/analysis/feasibility.md`
   - `intake/analysis/extracted.json`
   - `intake/active.json` → `materials.analysisCompletedAt`

API (authenticated):

```bash
curl -H "Authorization: Bearer $TOKEN" \
  https://api.myreceipt.website/api/projects/PRJ_ID/analysis/feasibility
```

Callback test (manual):

```bash
curl -X POST https://api.myreceipt.website/api/internal/automation/callback \
  -H "Content-Type: application/json" \
  -H "X-Automation-Token: $AUTOMATION_CALLBACK_TOKEN" \
  -d '{"userId":"...","projectId":"...","status":"completed","feasibilityMarkdown":"# Test\n\n## 1. What we understood\n\nTBD"}'
```

---

## Related

- Instructions: `automations/instructions/05-intake-analysis.txt`
- Product doc: `docs/product/automations.md` §3.2
- Callback: `POST /api/internal/automation/callback`
