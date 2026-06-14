# Campaign template

Copy this folder to `campaigns/<your-slug>/` when Strategy Planner registers a new campaign.

## Files to add

| File | Purpose |
|------|---------|
| `README.md` | Goal, channel, schedule |
| `run.mjs` | Entry script |
| `config.json` | Rate limits, copy variants |
| `data/` | Local state (gitignored) |

## Register task

Add to `runtime/orchestrator/registry.json`:

```json
{
  "id": "your-slug",
  "name": "Your campaign",
  "command": "node campaigns/your-slug/run.mjs",
  "type": "outreach",
  "enabled": false,
  "requiresDesktop": false,
  "channels": ["telegram"]
}
```

Enable only after `npm run marketing:validate` passes and credentials are in Cursor Secrets.
