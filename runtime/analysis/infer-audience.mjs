/**
 * Infer ICP (audience.primary) and pain points from product copy and website scan.
 * Heuristics always run; OpenAI used when OPENAI_API_KEY is set (suggest endpoint).
 */

const VERTICAL_RULES = [
  {
    id: 'parental_safety',
    re: /\b(parent|parents|mom|dad|family|child|children|kids?|teen|tween|screen time|online safety|cyberbully|parental control)\b/i,
    primary: 'Parents of children and teens concerned about online safety and healthy screen habits',
    pains: ['Worry about what kids see and do online', 'Hard to set healthy screen-time boundaries', 'Need visibility without constant monitoring'],
  },
  {
    id: 'dev_tools',
    re: /\b(developer|developers|engineer|engineers|dev team|software team|cursor|github|api|sdk|open.?source)\b/i,
    primary: 'Software developers and technical teams building and shipping products',
    pains: ['Limited time for non-coding work', 'Need automation without heavy ops overhead', 'Want tools that fit an existing dev workflow'],
  },
  {
    id: 'indie_founders',
    re: /\b(indie|solo founder|bootstrap|bootstrapped|side project|maker|small team|startup founder)\b/i,
    primary: 'Indie founders and small teams with a shipped product but no dedicated marketing hire',
    pains: ['No in-house marketing expertise', 'Limited budget for agencies', 'Need a repeatable growth plan, not one-off tactics'],
  },
  {
    id: 'saas_b2b',
    re: /\b(b2b|saas|subscription|enterprise|teams?|workflow|productivity|platform)\b/i,
    primary: 'B2B teams and operators looking for a SaaS tool to improve workflow and outcomes',
    pains: ['Manual processes slow the team down', 'Hard to prove ROI on new tools', 'Need something that integrates with existing stack'],
  },
  {
    id: 'smb_local',
    re: /\b(small business|local business|shop owner|retail|restaurant|salon|clinic)\b/i,
    primary: 'Small business owners who handle marketing themselves alongside day-to-day operations',
    pains: ['No time to learn complex marketing tools', 'Inconsistent lead flow', 'Competing with larger brands on a small budget'],
  },
  {
    id: 'marketers',
    re: /\b(marketer|marketing team|growth|demand gen|content team|agency)\b/i,
    primary: 'Marketing and growth professionals responsible for pipeline and brand awareness',
    pains: ['Too many channels, not enough focus', 'Reporting across tools is fragmented', 'Need faster experimentation cycles'],
  },
  {
    id: 'ecommerce',
    re: /\b(e-?commerce|shopify|store owner|online store|merchant|dtc|direct.to.consumer)\b/i,
    primary: 'E-commerce and DTC brands selling products online',
    pains: ['Rising customer acquisition costs', 'Cart abandonment and low repeat purchase rate', 'Hard to stand out in crowded marketplaces'],
  },
  {
    id: 'education',
    re: /\b(student|teacher|educator|school|university|learning|course|training)\b/i,
    primary: 'Students, educators, and learners seeking structured learning outcomes',
    pains: ['Overwhelmed by unstructured content', 'Need progress tracking and accountability', 'Want affordable, practical skills'],
  },
  {
    id: 'health_wellness',
    re: /\b(health|wellness|fitness|mental health|therapy|patient|caregiver)\b/i,
    primary: 'Health-conscious individuals and caregivers focused on wellbeing outcomes',
    pains: ['Hard to build consistent habits', 'Information overload without personalized guidance', 'Privacy and trust concerns with sensitive data'],
  },
];

const FOR_PATTERN = /\bfor\s+([^.!?]{8,80})/i;
const BUILT_FOR = /\bbuilt\s+for\s+([^.!?]{8,80})/i;
const DESIGNED_FOR = /\bdesigned\s+for\s+([^.!?]{8,80})/i;
const HELP_PATTERN = /\bhelp(s|ing)?\s+([^.!?]{8,80})/i;

function cleanPhrase(s) {
  return s
    .replace(/\s+/g, ' ')
    .replace(/\b(the|a|an)\s+/gi, '')
    .trim()
    .replace(/[,;:]$/, '')
    .slice(0, 120);
}

function capitalizeFirst(s) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function extractExplicitAudience(text) {
  for (const re of [FOR_PATTERN, BUILT_FOR, DESIGNED_FOR]) {
    const m = text.match(re);
    if (m?.[1]) {
      const phrase = cleanPhrase(m[1]);
      if (phrase.length >= 8) return capitalizeFirst(phrase);
    }
  }
  const help = text.match(HELP_PATTERN);
  if (help?.[2]) {
    const phrase = cleanPhrase(help[2]);
    if (phrase.length >= 8) return capitalizeFirst(phrase);
  }
  return null;
}

export function buildAudienceCorpus({ product = {}, scan } = {}) {
  const seo = scan?.passiveScan?.seo || scan?.seo || {};
  return [
    product.name,
    product.oneLiner,
    product.description,
    seo.title,
    seo.metaDescription,
    seo.h1,
    seo.ogDescription,
    seo.ogTitle,
  ]
    .filter(Boolean)
    .join('\n')
    .trim();
}

export function inferAudienceHeuristic(corpus) {
  const text = corpus || '';
  if (!text.trim()) {
    return { primary: '', painPoints: [], confidence: 'low', method: 'none' };
  }

  const explicit = extractExplicitAudience(text);
  if (explicit) {
    return {
      primary: explicit.endsWith('.') ? explicit : `${explicit}`,
      painPoints: inferPainFromVerticals(text).slice(0, 4),
      confidence: 'high',
      method: 'explicit_phrase',
    };
  }

  const matched = VERTICAL_RULES.filter((r) => r.re.test(text));
  if (matched.length) {
    const top = matched[0];
    const pains = [...new Set(matched.flatMap((m) => m.pains))].slice(0, 4);
    return {
      primary: top.primary,
      painPoints: pains,
      confidence: matched.length === 1 ? 'medium' : 'medium',
      method: 'vertical_rules',
      verticals: matched.map((m) => m.id),
    };
  }

  const productName = text.split('\n')[0]?.trim();
  if (productName && productName.length >= 3) {
    return {
      primary: `People and teams who would benefit from ${productName}`,
      painPoints: ['Need a clearer way to solve this problem', 'Looking for a simpler alternative to manual workarounds'],
      confidence: 'low',
      method: 'fallback',
    };
  }

  return { primary: '', painPoints: [], confidence: 'low', method: 'none' };
}

function inferPainFromVerticals(text) {
  return VERTICAL_RULES.filter((r) => r.re.test(text)).flatMap((r) => r.pains);
}

export function inferAudienceFromIntake({ product, scan } = {}) {
  const corpus = buildAudienceCorpus({ product, scan });
  const result = inferAudienceHeuristic(corpus);
  return {
    ...result,
    corpusLength: corpus.length,
    suggestedAt: new Date().toISOString(),
  };
}

export async function inferAudienceWithAi({ product, scan } = {}) {
  const corpus = buildAudienceCorpus({ product, scan });
  if (!corpus.trim()) {
    return { ...inferAudienceHeuristic(''), method: 'none' };
  }

  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) {
    return { ...inferAudienceFromIntake({ product, scan }), method: 'heuristic' };
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        temperature: 0.3,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You infer marketing ICP from product/website text. Return JSON: {"primary":"one plain-English ICP sentence","painPoints":["up to 4 short bullets"]}. ICP = who will buy/use the product. Be specific; no jargon.',
          },
          { role: 'user', content: corpus.slice(0, 6000) },
        ],
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      throw new Error(`OpenAI ${res.status}`);
    }
    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(raw);
    const primary = String(parsed.primary || '').trim().slice(0, 200);
    const painPoints = (parsed.painPoints || [])
      .map((p) => String(p).trim())
      .filter(Boolean)
      .slice(0, 4);
    if (primary) {
      return {
        primary,
        painPoints,
        confidence: 'high',
        method: 'openai',
        suggestedAt: new Date().toISOString(),
        corpusLength: corpus.length,
      };
    }
  } catch (err) {
    console.warn('[infer-audience] OpenAI failed, using heuristics:', err.message);
  }

  return { ...inferAudienceFromIntake({ product, scan }), method: 'heuristic' };
}
