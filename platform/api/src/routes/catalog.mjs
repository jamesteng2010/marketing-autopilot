import { json } from '../lib/http.mjs';
import { getRecommendations } from '../services/catalog.mjs';

export async function handleCatalogRecommendations(res, url) {
  const regions = (url.searchParams.get('regions') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  json(res, 200, getRecommendations(regions));
}
