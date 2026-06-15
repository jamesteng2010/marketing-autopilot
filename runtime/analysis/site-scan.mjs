/**
 * Passive site scan for Intake Analysis (05 phase A — no credentials).
 * Fetches product.url HTML and detects SEO tags, GA4/GTM/Pixel, social links.
 */
import { readProjectJson, writeProjectJson, writeText } from '../campaign-lib/helpers.mjs';

const GA4_RE = /\bG-[A-Z0-9]{6,}\b/g;
const GTM_RE = /GTM-[A-Z0-9]+/g;
const PIXEL_RE = /fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/i;
const MEASUREMENT_ID_ATTR = /measurement[_-]?id[=:"'\s]+(G-[A-Z0-9]+)/gi;

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return m ? m[1].trim().slice(0, 200) : null;
}

function extractMetaDescription(html) {
  const m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  return m ? m[1].trim().slice(0, 300) : null;
}

function extractMetaProperty(html, prop) {
  const re = new RegExp(
    `<meta[^>]+property=["']${prop}["'][^>]+content=["']([^"']+)["']|<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${prop}["']`,
    'i',
  );
  const m = html.match(re);
  return m ? (m[1] || m[2]).trim().slice(0, 500) : null;
}

function extractHtmlLang(html) {
  const m = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  return m ? m[1].trim().slice(0, 16) : null;
}

function extractHreflangRegions(html) {
  const regions = new Set();
  const re = /<link[^>]+rel=["']alternate["'][^>]+hreflang=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const hl = m[1].toLowerCase();
    if (hl === 'x-default') continue;
    if (hl.startsWith('zh')) regions.add('CN');
    else if (hl.startsWith('ja')) regions.add('JP');
    else if (hl.startsWith('en')) regions.add('GLOBAL_EN');
    else if (hl.startsWith('de') || hl.startsWith('fr') || hl.startsWith('es') || hl.startsWith('it')) regions.add('EU');
  }
  return [...regions];
}

function extractOgLocale(html) {
  return extractMetaProperty(html, 'og:locale');
}

function extractH1(html) {
  const m = html.match(/<h1[^>]*>([^<]*)<\/h1>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').trim().slice(0, 200) : null;
}

function findSocialLinks(html) {
  const found = new Set();
  const urls = {};
  const patterns = [
    { id: 'facebook', re: /https?:\/\/(www\.)?facebook\.com\/[^\s"'<>]+/gi },
    { id: 'instagram', re: /https?:\/\/(www\.)?instagram\.com\/[^\s"'<>]+/gi },
    { id: 'linkedin', re: /https?:\/\/(www\.)?linkedin\.com\/[^\s"'<>]+/gi },
    { id: 'twitter', re: /https?:\/\/(www\.)?(twitter\.com|x\.com)\/[^\s"'<>]+/gi },
  ];
  for (const { id, re } of patterns) {
    const match = html.match(re);
    if (match) {
      found.add(id);
      urls[id] = match[0].replace(/["'<>].*$/, '');
    }
    re.lastIndex = 0;
  }
  return { ids: [...found], urls };
}

function detectTags(html) {
  const ga4 = [...new Set([...(html.match(GA4_RE) || []), ...collectRegex(MEASUREMENT_ID_ATTR, html)])];
  const gtm = [...new Set(html.match(GTM_RE) || [])];
  let metaPixelId = null;
  const pixel = html.match(PIXEL_RE);
  if (pixel) metaPixelId = pixel[1];
  return {
    ga4MeasurementId: ga4[0] || null,
    ga4MeasurementIds: ga4,
    gtmContainerId: gtm[0] || null,
    metaPixelId,
  };
}

function collectRegex(re, html) {
  const out = [];
  let m;
  const r = new RegExp(re.source, re.flags);
  while ((m = r.exec(html)) !== null) {
    if (m[1]) out.push(m[1]);
  }
  return out;
}

async function headOk(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(10000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function scanSiteUrl(siteUrl) {
  const res = await fetch(siteUrl, {
    redirect: 'follow',
    headers: { 'User-Agent': 'MarketingAutopilot-SiteScan/1.0' },
    signal: AbortSignal.timeout(20000),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} fetching ${siteUrl}`);
  }
  const html = await res.text();
  const tags = detectTags(html);
  const title = extractTitle(html);
  const metaDescription = extractMetaDescription(html);
  const h1 = extractH1(html);
  const ogTitle = extractMetaProperty(html, 'og:title');
  const ogDescription = extractMetaProperty(html, 'og:description');
  const ogSiteName = extractMetaProperty(html, 'og:site_name');
  const htmlLang = extractHtmlLang(html);
  const hreflangRegions = extractHreflangRegions(html);
  const ogLocale = extractOgLocale(html);
  const social = findSocialLinks(html);
  const origin = new URL(siteUrl).origin;
  const sitemapUrl = `${origin}/sitemap.xml`;
  const robotsUrl = `${origin}/robots.txt`;

  return {
    discoveredAt: new Date().toISOString(),
    siteUrl,
    passiveScan: {
      seo: {
        titlePresent: Boolean(title),
        title,
        metaDescription,
        h1Present: Boolean(h1),
        h1,
        ogTitle,
        ogDescription,
        ogSiteName,
        htmlLang,
        ogLocale,
        hreflangRegions,
        hasSitemap: await headOk(sitemapUrl),
        hasRobots: await headOk(robotsUrl),
        issues: [],
      },
      tags,
      socialLinksFound: social.ids,
      socialUrls: social.urls,
    },
    confidence: tags.ga4MeasurementId || tags.metaPixelId ? 'medium' : 'low',
  };
}

export async function runSiteScanForProject() {
  const intake = readProjectJson('intake/active.json');
  const siteUrl = intake?.product?.url?.trim();
  if (!siteUrl) {
    throw new Error('product.url missing in intake/active.json');
  }
  const scan = await scanSiteUrl(siteUrl);

  const userDeclared = {
    hasActiveMarketing: intake.existingMarketing?.hasActiveMarketing ?? null,
    userSummary: intake.existingMarketing?.userSummary || '',
    channelsUserDeclared: intake.existingMarketing?.channelsUserDeclared || [],
  };

  const existing = readProjectJson('intake/analysis/existing-marketing.json') || {};
  const merged = {
    ...existing,
    ...scan,
    userDeclared,
    passiveScan: scan.passiveScan,
    reconciled: buildReconciled(intake, scan),
    assetsNeededFromUser: buildAssetsNeeded(intake, scan),
  };

  writeProjectJson('intake/analysis/existing-marketing.json', merged);

  if (scan.passiveScan.tags.ga4MeasurementId && intake.existingMarketing) {
    intake.existingMarketing.analytics = intake.existingMarketing.analytics || {};
    intake.existingMarketing.analytics.ga4 = intake.existingMarketing.analytics.ga4 || {};
    if (!intake.existingMarketing.analytics.ga4.measurementId) {
      intake.existingMarketing.analytics.ga4.measurementId = scan.passiveScan.tags.ga4MeasurementId;
      intake.existingMarketing.analytics.ga4.discoverySource = 'passive_site_scan';
    }
    if (scan.passiveScan.tags.metaPixelId) {
      intake.existingMarketing.analytics = intake.existingMarketing.analytics || {};
      intake.existingMarketing.analytics.metaPixel = intake.existingMarketing.analytics.metaPixel || {};
      if (!intake.existingMarketing.analytics.metaPixel.pixelId) {
        intake.existingMarketing.analytics.metaPixel.pixelId = scan.passiveScan.tags.metaPixelId;
        intake.existingMarketing.analytics.metaPixel.discoverySource = 'passive_site_scan';
      }
    }
    intake.existingMarketing.discovery = {
      status: 'partial',
      lastRunAt: scan.discoveredAt,
      confidence: scan.confidence,
      blockedReason: null,
    };
    intake.existingMarketing.assetsNeededFromUser = merged.assetsNeededFromUser;
    writeProjectJson('intake/active.json', intake);
  }

  return merged;
}

function buildReconciled(intake, scan) {
  const channels = [];
  if (scan.passiveScan.tags.ga4MeasurementId) {
    channels.push({ channelId: 'google_analytics', status: 'discovered', source: 'passive_site_scan' });
  }
  if (scan.passiveScan.tags.metaPixelId) {
    channels.push({ channelId: 'meta_pixel', status: 'discovered', source: 'passive_site_scan' });
  }
  if (scan.passiveScan.seo?.hasSitemap) {
    channels.push({ channelId: 'website_seo', status: 'partial', source: 'passive_site_scan' });
  }
  for (const social of scan.passiveScan.socialLinksFound || []) {
    channels.push({ channelId: `${social}_organic`, status: 'discovered', source: 'passive_site_scan' });
  }
  if (intake.existingMarketing?.hasActiveMarketing === false && channels.length === 0) {
    return { posture: 'greenfield', channels: [] };
  }
  return { posture: intake.existingMarketing?.hasActiveMarketing ? 'active_baseline' : 'greenfield', channels };
}

function buildAssetsNeeded(intake, scan) {
  const needed = [];
  if (scan.passiveScan.tags.ga4MeasurementId && !intake.existingMarketing?.analytics?.ga4?.hasUserProvidedAccess) {
    needed.push({
      channelId: 'google_analytics',
      field: 'GA4 OAuth or service account',
      reason: 'Connect read-only access for baseline metrics',
      priority: 'recommended',
    });
  }
  if (!scan.passiveScan.seo?.hasSitemap) {
    needed.push({
      channelId: 'website_seo',
      field: 'sitemap.xml',
      reason: 'No sitemap detected at /sitemap.xml',
      priority: 'recommended',
    });
  }
  return needed;
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMain || process.argv[1]?.includes('site-scan.mjs')) {
  runSiteScanForProject()
    .then((r) => {
      console.log(JSON.stringify({ ok: true, siteUrl: r.siteUrl, confidence: r.confidence }, null, 2));
    })
    .catch((err) => {
      console.error(JSON.stringify({ ok: false, error: err.message }));
      process.exit(1);
    });
}
