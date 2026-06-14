# Intake

| File | Purpose |
|------|---------|
| `template.json` | Blank schema — copy to `active.json` |
| `goals.schema.json` | Goal Workshop 字段（KPI、measurement、userConfirmedGoals） |
| `product-data.schema.json` | 可选产品 DB / Metrics API 只读连接 |
| `materials.schema.json` | 资料类型、大小限制、MIME |
| `existing-marketing.schema.json` | 现有营销（SEO/GA/Facebook 等） |
| `analysis/feasibility.template.md` | 可行性分析（含现有营销基线 §2） |
| `analysis/extracted.template.json` | 提取结果 + existingMarketingBaseline |
| `active.json` | 当前项目需求（gitignored until filled） |

## Flow

1. Materials + existing marketing → **Analysis** → feasibility  
2. **Goal Workshop** → `goals.userConfirmedGoals` — [goal-workshop.md](../docs/product/goal-workshop.md)  
3. Both confirmed → Strategy Planner  

## Related product docs

- [intake-and-materials.md](../docs/product/intake-and-materials.md)  
- [marketing-integration-and-metrics.md](../docs/product/marketing-integration-and-metrics.md)  
- [product-data-connectors.md](../docs/product/product-data-connectors.md)
