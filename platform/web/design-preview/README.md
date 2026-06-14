# Product UI — Design Preview

Interactive **full-screen mockups** for all Product UI routes defined in [docs/product/ui-design-system.md](../../docs/product/ui-design-system.md).

## Open locally

```bash
open platform/web/design-preview/all-screens.html
```

Or serve from repo root:

```bash
npx --yes serve platform/web/design-preview -p 3456
# → http://localhost:3456/all-screens.html
```

## Screens included (12)

| # | Screen | Route |
|---|--------|-------|
| 1 | Login | `/login` |
| 2 | Register | `/register` |
| 3 | Project list | `/projects` |
| 4 | Overview (Dashboard) | `/projects/:id` |
| 5 | Intake | `/projects/:id/intake` |
| 6 | Analysis | `/projects/:id/analysis` |
| 7 | Goals | `/projects/:id/goals` |
| 8 | Strategy | `/projects/:id/strategy` |
| 9 | Activity | `/projects/:id/activity` |
| 10 | Obligations | `/projects/:id/obligations` |
| 11 | Credentials | `/projects/:id/credentials` |
| 12 | Settings | `/projects/:id/settings` |

Use the **left sidebar** in the HTML file to switch screens.

## Theme

Control Tower Dark tokens from ui-design-system.md §4 (`#0f172a`, `#22d3ee`, etc.).

## Next step

Implement `platform/web/` App Router routes against this layout; replace static content with API data from `ops/progress.json`, `events.jsonl`, obligations API.
