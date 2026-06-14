# User Intake Guide

Fill `intake/active.json` (copy from `intake/template.json`). The onboarding automation can do this via conversation.

## Product

| Field | Description |
|-------|-------------|
| `product.name` | Brand or product name |
| `product.url` | Landing page or app URL |
| `product.oneLiner` | Elevator pitch (≤ 120 chars) |
| `product.description` | Full value proposition, features, pricing |
| `product.pricingModel` | free / freemium / subscription / one-time / marketplace |

## Audience

| Field | Description |
|-------|-------------|
| `audience.primary` | Who buys or signs up first |
| `audience.geography` | Countries or regions |
| `audience.languages` | e.g. `["en", "zh-CN"]` |
| `audience.painPoints` | Problems your product solves |

## Goals

| Field | Description |
|-------|-------------|
| `goals.primaryKpi` | e.g. signups, MRR, qualified leads |
| `goals.targetValue` | Number to hit |
| `goals.deadline` | ISO date |
| `goals.secondary` | Optional secondary KPIs |

## Marketing

| Field | Description |
|-------|-------------|
| `marketing.channelsPreferred` | Ordered list: telegram, instagram, email, seo, … |
| `marketing.channelsAvoid` | Channels to skip |
| `marketing.budgetMonthlyUsd` | 0 for organic-only |
| `marketing.brandTone` | professional / friendly / bold / … |
| `marketing.complianceNotes` | GDPR, industry rules, no cold call, etc. |

## Assets

| Field | Description |
|-------|-------------|
| `assets.analyticsId` | GA4 measurement ID |
| `assets.existingSocial` | Handles per platform |
| `assets.crm` | HubSpot, Notion, spreadsheet, none |

## Runtime preference

| Field | Description |
|-------|-------------|
| `runtime.preferred` | cloud / ec2 / local / hybrid |
| `runtime.region` | e.g. ap-southeast-2 for EC2 |

After save, run:

```bash
npm run marketing:validate
```

Fix any `missing` or `invalid` fields before starting Strategy Planner automation.
