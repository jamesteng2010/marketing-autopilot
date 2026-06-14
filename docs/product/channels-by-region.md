# 国家 / 区域营销差异

机器可读：`runtime/regions-catalog.json`  
手段全集：`marketing-methods.md`

---

## 1. 为什么必须按国家/区域区分

| 维度 | 差异示例 |
|------|----------|
| 主流平台 | 中国：微信、抖音、小红书；美国：Google、Meta、LinkedIn |
| 搜索 | Google vs 百度 vs Yandex |
| 私域 | 中国企微/微信群 vs 欧美 Email |
| 支付 | Stripe vs 支付宝/微信 vs 本地钱包 |
| 法规 | GDPR、CAN-SPAM、中国广告法/PIPL |
| 语言与文化 | 多语言落地页、宗教与内容禁忌 |

**产品规则：** `intake.audience.geography` 驱动 feasibility 评分；**禁止** 向 CN 项目推荐 Facebook 有机冷启动为主策略，除非用户明确跨境受众。

---

## 2. 区域画像摘要

### 美国（US）

| 推荐 | 慎用/不适用 |
|------|-------------|
| Google SEO/Ads、Meta、Email、LinkedIn B2B、Product Hunt | 仅中文素材、微信群 |

合规：CAN-SPAM、FTC 披露、CCPA

---

### 欧盟（EU）

| 推荐 | 注意 |
|------|------|
| Google、Meta、Email（opt-in）、LinkedIn | 冷邮件/DM 需 GDPR 法律依据 |

合规：GDPR、ePrivacy

---

### 中国大陆（CN）

| 推荐 | 避免 |
|------|------|
| 微信生态、抖音、小红书、百度 SEO/竞价、KOL | Facebook、Instagram、Google Ads 作为主渠道 |

私域：公众号、小程序、企微。需备案与广告法合规。

---

### 东南亚（SEA）

| 推荐 | 特点 |
|------|------|
| Facebook、TikTok、Shopee、Telegram 社群、WhatsApp | Mobile-first、多语言 |

---

### 日本（JP）

| 推荐 | 注意 |
|------|------|
| LINE、X、Instagram、精细落地页 | 冷邮件效果差；日语本地化 |

---

### 中东（MENA）

| 推荐 | 注意 |
|------|------|
| Instagram、Snapchat、WhatsApp、TikTok | 阿语内容、文化敏感 |

---

### 拉丁美洲（LATAM）

| 推荐 | 注意 |
|------|------|
| WhatsApp、Instagram、Facebook、TikTok | 西语/葡语 |

---

### 全球英语（GLOBAL_EN）

| 推荐 | 说明 |
|------|------|
| SEO、Twitter/X、LinkedIn、PH/HN、Telegram | Tech/SaaS 默认；仍需细化国家 |

---

## 3. 多国目标时的产品行为

当 `audience.geography` 含多个国家/区域时：

1. **feasibility.md** 按 **每个 region** 输出渠道可行性表  
2. 策略可建议：**分市场执行**（Project 子计划或 phase）  
3. 素材与语言：`audience.languages` 与 region 对齐检查  
4. 自动化 task 按 region 拆 `campaigns/{region}-{channel}/`（可选）

---

## 4. 区域 → 渠道 ID 对照（扩展）

中国区渠道 ID（catalog 扩展，v0.3 Pack）：

| channelId | 平台 |
|-----------|------|
| wechat | 微信 |
| douyin | 抖音 |
| xiaohongshu | 小红书 |
| weibo | 微博 |
| baidu | 百度 |

当前 `action-catalog.json` 以全球社媒为主；中国区 Pack 将补充对应 actions。

---

## 5. 合规速查（feasibility 必提）

| 区域 | 常见合规点 |
|------|------------|
| US | CAN-SPAM、FTC |
| EU | GDPR opt-in |
| CN | 广告法、PIPL、备案 |
| BR | LGPD |
| 全球 | 平台 ToS、反 spam |

---

## 6. 相关文档

- [integration-marketing-catalog.md](./integration-marketing-catalog.md)
- [intake-and-materials.md](./intake-and-materials.md) §6.2 可行性评估
