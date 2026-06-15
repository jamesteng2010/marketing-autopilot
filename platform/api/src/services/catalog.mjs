import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

let cache = {};

function loadCatalog(name) {
  if (!cache[name]) {
    cache[name] = JSON.parse(readFileSync(join(REPO_ROOT, 'runtime', name), 'utf8'));
  }
  return cache[name];
}

const CHANNEL_EN = {
  website_seo: 'Website & SEO',
  google_analytics: 'Google Analytics (GA4)',
  google_tag_manager: 'Google Tag Manager',
  meta_pixel: 'Meta Pixel',
  facebook_organic: 'Facebook (organic)',
  instagram_organic: 'Instagram (organic)',
  meta_ads: 'Meta Ads (Facebook / Instagram)',
  google_ads: 'Google Ads',
  email_marketing: 'Email marketing',
  linkedin_organic: 'LinkedIn (organic)',
  twitter_organic: 'X (Twitter)',
  crm: 'CRM / leads',
};

const PAID_CHANNEL_IDS = new Set(['meta_ads', 'google_ads']);

const CHANNEL_GROUP_EN = {
  website_measurement: 'Website & measurement',
  organic_social: 'Organic social',
  paid_ads: 'Paid advertising',
  email_crm: 'Email & CRM',
};

function channelLabelEn(channelId, fallbackLabel) {
  return CHANNEL_EN[channelId] || fallbackLabel?.replace(/[\u4e00-\u9fff（）]/g, '').trim() || channelId.replace(/_/g, ' ');
}

const REGION_EN = {
  US: 'United States',
  EU: 'Europe',
  CN: 'China',
  SEA: 'Southeast Asia',
  JP: 'Japan',
  MENA: 'Middle East & North Africa',
  LATAM: 'Latin America',
  GLOBAL_EN: 'Global (English)',
};

export function getRecommendations(regionCodes = []) {
  const regions = loadCatalog('regions-catalog.json');
  const methods = loadCatalog('marketing-methods-catalog.json');
  const channelsCat = loadCatalog('existing-marketing-channels-catalog.json');
  const rawChannels = channelsCat.channels || [];
  const groupOrder = (channelsCat.uiGroups || [])
    .slice()
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  const allChannels = rawChannels.map((c) => ({
    id: c.channelId,
    label: channelLabelEn(c.channelId, c.label),
    labelEn: channelLabelEn(c.channelId, c.label),
    uiGroup: c.uiGroup || 'other',
    isPaid: PAID_CHANNEL_IDS.has(c.channelId),
    userFields: c.userFields || [],
  }));

  const channelGroups = groupOrder.map((g) => ({
    id: g.id,
    labelEn: g.labelEn || CHANNEL_GROUP_EN[g.id] || g.id,
    channels: allChannels.filter((c) => c.uiGroup === g.id),
  })).filter((g) => g.channels.length > 0);

  const codes = regionCodes.length ? regionCodes : ['US', 'GLOBAL_EN'];
  const recommendedMethodIds = new Set();
  const recommendedChannelIds = new Set();
  const avoidNotes = [];

  for (const code of codes) {
    const r = regions.regions?.[code];
    if (!r) continue;
    for (const id of r.recommendedMethodIds || []) recommendedMethodIds.add(id);
    for (const id of r.recommendedChannelIds || []) recommendedChannelIds.add(id);
    for (const n of r.avoidNotes || []) avoidNotes.push(n);
  }

  const methodList = [];
  for (const cat of methods.categories || []) {
    for (const m of cat.methods || []) {
      if (recommendedMethodIds.has(m.id)) {
        methodList.push({ id: m.id, label: m.label, category: cat.label, recommended: true });
      }
    }
  }

  return {
    regions: codes,
    recommendedMethods: methodList,
    recommendedChannelIds: [...recommendedChannelIds],
    avoidNotes: [...new Set(avoidNotes)],
    allRegions: Object.entries(regions.regions || {}).map(([id, r]) => ({
      id,
      label: r.label,
      labelEn: REGION_EN[id] || id,
      labelDisplay: `${REGION_EN[id] || id} · ${r.label}`,
    })),
    allChannels,
    channelGroups,
    paidChannelIds: [...PAID_CHANNEL_IDS],
    allMethods: (methods.categories || []).flatMap((cat) =>
      (cat.methods || []).map((m) => ({ id: m.id, label: m.label, category: cat.label })),
    ),
  };
}
