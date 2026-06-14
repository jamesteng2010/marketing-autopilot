# Deploy (Automation generated)

Host `campaigns/week1-waitlist/output/` on:
- GitHub Pages (branch gh-pages or /docs)
- Cloudflare Pages / Vercel static
- S3 + CloudFront

Set `runtime/user-inputs.json`:
```json
{ "WAITLIST_FORM_URL": "https://tally.so/r/xxxxx" }
```
Then re-run: `npm run marketing:phase -- week1-waitlist`
