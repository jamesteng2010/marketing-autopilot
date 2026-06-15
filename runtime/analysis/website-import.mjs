/**
 * Build intake/active.json patches from a passive website scan.
 * Only fills empty fields unless force=true.
 */
import { scanSiteUrl } from './site-scan.mjs';
import { inferAudienceFromIntake } from './infer-audience.mjs';

function isEmpty(v) {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v.trim() === '';
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

function setField(patch, imported, intake, block, key, value, label, force) {
  if (isEmpty(value)) return;
  if (!force && !isEmpty(intake?.[block]?.[key])) return;
  patch[block] = patch[block] || {};
  patch[block][key] = value;
  imported.push(label);
}

function channelIdsFromScan(scan) {
  const ids = [];
  const ps = scan.passiveScan;
  if (ps.tags?.ga4MeasurementId) ids.push('google_analytics');
  if (ps.tags?.metaPixelId) ids.push('meta_ads');
  if (ps.tags?.gtmContainerId) ids.push('google_tag_manager');
  if (ps.seo?.hasSitemap || ps.seo?.titlePresent) ids.push('website_seo');
  for (const s of ps.socialLinksFound || []) {
    if (s === 'facebook') ids.push('facebook_organic');
    if (s === 'instagram') ids.push('instagram_organic');
    if (s === 'linkedin') ids.push('linkedin_organic');
    if (s === 'twitter') ids.push('twitter_organic');
  }
  return [...new Set(ids)];
}

export function buildIntakePatchFromScan(scan, intake = {}, { force = false } = {}) {
  const imported = [];
  const patch = {};
  const seo = scan.passiveScan?.seo || {};
  const tags = scan.passiveScan?.tags || {};
  const socialUrls = scan.passiveScan?.socialUrls || {};

  const productName = seo.ogSiteName || seo.ogTitle || seo.title || seo.h1;
  const oneLiner = (seo.metaDescription || seo.ogDescription || '').slice(0, 200);
  const descriptionParts = [seo.metaDescription || seo.ogDescription, seo.h1].filter(Boolean);
  const description = [...new Set(descriptionParts)].join('\n\n').slice(0, 2000);

  setField(patch, imported, intake, 'product', 'name', productName, 'product.name', force);
  setField(patch, imported, intake, 'product', 'oneLiner', oneLiner, 'product.oneLiner', force);
  setField(patch, imported, intake, 'product', 'description', description, 'product.description', force);
  setField(patch, imported, intake, 'product', 'url', scan.siteUrl, 'product.url', force);

  let hostname = '';
  try {
    hostname = new URL(scan.siteUrl).hostname.replace(/^www\./, '');
  } catch { /* ignore */ }

  if (hostname) {
    setField(patch, imported, intake, 'identity', 'domain', hostname, 'identity.domain', force);
    if (force || intake.identity?.hasCustomDomain === null || intake.identity?.hasCustomDomain === undefined) {
      patch.identity = patch.identity || {};
      patch.identity.hasCustomDomain = true;
      imported.push('identity.hasCustomDomain');
    }
  }

  const lang = seo.htmlLang?.slice(0, 2)?.toLowerCase();
  if (lang && (force || isEmpty(intake.audience?.languages))) {
    patch.audience = patch.audience || {};
    patch.audience.languages = [seo.htmlLang?.length <= 5 ? seo.htmlLang : lang];
    imported.push('audience.languages');
  }

  const inferredRegions = inferRegionsFromScan(seo, scan.siteUrl);
  if (inferredRegions.length && (force || isEmpty(intake.audience?.geographyRegions))) {
    patch.audience = patch.audience || {};
    patch.audience.geographyRegions = inferredRegions;
    imported.push('audience.geographyRegions');
  }

  const channels = channelIdsFromScan(scan);
  const em = intake.existingMarketing || {};
  patch.existingMarketing = patch.existingMarketing || {};

  if (channels.length > 0 && (force || em.hasActiveMarketing === null || em.hasActiveMarketing === undefined)) {
    patch.existingMarketing.hasActiveMarketing = true;
    imported.push('existingMarketing.hasActiveMarketing');
  } else if (channels.length === 0 && (force || em.hasActiveMarketing === null || em.hasActiveMarketing === undefined)) {
    patch.existingMarketing.hasActiveMarketing = false;
    imported.push('existingMarketing.hasActiveMarketing');
  }

  if (channels.length && (force || isEmpty(em.channelsUserDeclared))) {
    patch.existingMarketing.channelsUserDeclared = channels;
    imported.push('existingMarketing.channelsUserDeclared');
  }

  if (force || isEmpty(em.seo?.primarySiteUrl)) {
    patch.existingMarketing.seo = { ...(em.seo || {}), ...(patch.existingMarketing.seo || {}), primarySiteUrl: scan.siteUrl };
    imported.push('existingMarketing.seo.primarySiteUrl');
  }

  if (tags.ga4MeasurementId && (force || isEmpty(em.analytics?.ga4?.measurementId))) {
    patch.existingMarketing.analytics = {
      ...(em.analytics || {}),
      ...(patch.existingMarketing.analytics || {}),
      ga4: {
        ...(em.analytics?.ga4 || {}),
        measurementId: tags.ga4MeasurementId,
        discoverySource: 'passive_site_scan',
      },
    };
    imported.push('existingMarketing.analytics.ga4');
  }

  if (tags.metaPixelId && (force || isEmpty(em.analytics?.metaPixel?.pixelId))) {
    patch.existingMarketing.analytics = {
      ...(em.analytics || {}),
      ...(patch.existingMarketing.analytics || {}),
      metaPixel: {
        ...(em.analytics?.metaPixel || {}),
        pixelId: tags.metaPixelId,
        discoverySource: 'passive_site_scan',
      },
    };
    imported.push('existingMarketing.analytics.metaPixel');
  }

  if (tags.gtmContainerId && (force || isEmpty(em.analytics?.gtm?.containerId))) {
    patch.existingMarketing.analytics = {
      ...(em.analytics || {}),
      ...(patch.existingMarketing.analytics || {}),
      gtm: { ...(em.analytics?.gtm || {}), containerId: tags.gtmContainerId },
    };
    imported.push('existingMarketing.analytics.gtm');
  }

  const organic = { ...(em.organicSocial || {}) };
  let organicTouched = false;
  if (socialUrls.facebook && (force || isEmpty(organic.facebook?.pageUrl))) {
    organic.facebook = { ...(organic.facebook || {}), pageUrl: socialUrls.facebook, status: 'discovered' };
    organicTouched = true;
    imported.push('existingMarketing.organicSocial.facebook');
  }
  if (socialUrls.instagram && (force || isEmpty(organic.instagram?.profileUrl))) {
    organic.instagram = {
      ...(organic.instagram || {}),
      profileUrl: socialUrls.instagram,
      handle: socialUrls.instagram.split('/').filter(Boolean).pop() || '',
    };
    organicTouched = true;
    imported.push('existingMarketing.organicSocial.instagram');
  }
  if (socialUrls.linkedin && (force || isEmpty(organic.linkedin?.companyPageUrl))) {
    organic.linkedin = { ...(organic.linkedin || {}), companyPageUrl: socialUrls.linkedin };
    organicTouched = true;
    imported.push('existingMarketing.organicSocial.linkedin');
  }
  if (socialUrls.twitter && (force || isEmpty(organic.twitter?.handle))) {
    organic.twitter = {
      ...(organic.twitter || {}),
      handle: socialUrls.twitter.split('/').filter(Boolean).pop() || '',
    };
    organicTouched = true;
    imported.push('existingMarketing.organicSocial.twitter');
  }
  if (organicTouched) {
    patch.existingMarketing.organicSocial = organic;
  }

  patch.existingMarketing.discovery = {
    ...(em.discovery || {}),
    status: channels.length ? 'partial' : 'complete',
    lastRunAt: scan.discoveredAt,
    confidence: scan.confidence,
    blockedReason: null,
  };
  imported.push('existingMarketing.discovery');

  const mergedProduct = {
    ...(intake.product || {}),
    ...(patch.product || {}),
  };
  const audienceInference = inferAudienceFromIntake({ product: mergedProduct, scan });
  if (audienceInference.primary && (force || isEmpty(intake.audience?.primary))) {
    patch.audience = patch.audience || {};
    patch.audience.primary = audienceInference.primary;
    patch.audience.primarySource = 'website_inferred';
    patch.audience.primaryInference = {
      method: audienceInference.method,
      confidence: audienceInference.confidence,
      suggestedAt: audienceInference.suggestedAt,
    };
    imported.push('audience.primary');
  }
  if (
    audienceInference.painPoints?.length
    && (force || isEmpty(intake.audience?.painPoints))
  ) {
    patch.audience = patch.audience || {};
    patch.audience.painPoints = audienceInference.painPoints;
    imported.push('audience.painPoints');
  }

  // Suggest activity records from discovered channels (only if none yet)
  const existingActs = em.activities || [];
  if ((force || existingActs.length === 0) && channels.length > 0) {
    const socialKey = {
      facebook_organic: 'facebook', instagram_organic: 'instagram',
      linkedin_organic: 'linkedin', twitter_organic: 'twitter',
    };
    const suggested = channels.slice(0, 6).map((platform, idx) => ({
      id: `act_scan_${Date.now()}_${idx}`,
      platform,
      status: 'active',
      summary: 'Detected from website scan — please add details and links',
      linkOrId: socialUrls[socialKey[platform]] || '',
      monthlySpendUsd: null,
      source: 'website_scan',
    }));
    patch.existingMarketing.activities = suggested;
    imported.push('existingMarketing.activities');
  }

  return { patch, imported: [...new Set(imported)], scan };
}

function inferRegionsFromScan(seo, siteUrl) {
  const out = new Set(seo.hreflangRegions || []);
  const lang = (seo.htmlLang || '').toLowerCase();
  const locale = (seo.ogLocale || '').toLowerCase();

  if (lang.startsWith('zh')) out.add('CN');
  if (lang.startsWith('ja')) out.add('JP');
  if (lang.startsWith('en') && !out.size) out.add('GLOBAL_EN');

  if (locale.includes('cn') || locale.startsWith('zh')) out.add('CN');
  if (locale.includes('us')) out.add('US');
  if (locale.includes('gb') || locale.includes('uk')) out.add('EU');
  if (locale.includes('jp')) out.add('JP');

  try {
    const host = new URL(siteUrl).hostname;
    if (host.endsWith('.cn')) out.add('CN');
    if (host.endsWith('.com.au')) out.add('SEA');
  } catch { /* ignore */ }

  if (!out.size) out.add('GLOBAL_EN');
  return [...out];
}

export async function importWebsiteToIntake(siteUrl, intake = {}, options = {}) {
  const normalized = siteUrl.trim();
  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error('URL must start with http:// or https://');
  }
  const scan = await scanSiteUrl(normalized);
  const { patch, imported } = buildIntakePatchFromScan(scan, intake, options);
  return { patch, imported, scan };
}
