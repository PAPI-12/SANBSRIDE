import { fetchWithRetry } from './http.js';

const NOMINATIM_SEARCH = 'https://nominatim.openstreetmap.org/search';
const CACHE_LIMIT = 80;
const searchCache = new Map();
let nextRequestAt = 0;

function cleanResult(result) {
  const lat = Number(result.lat);
  const lon = Number(result.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  return {
    id: String(result.place_id || `${lat},${lon}`),
    label: result.display_name || '',
    lat,
    lon,
    type: result.type || '',
  };
}

async function waitForRateLimit(signal) {
  const startAt = Math.max(Date.now(), nextRequestAt);
  nextRequestAt = startAt + 1100;
  const wait = startAt - Date.now();
  if (wait) await new Promise((resolve) => window.setTimeout(resolve, wait));
  if (signal?.aborted) throw new DOMException('Address search cancelled.', 'AbortError');
}

/** Search actual South African addresses. Selection stores the returned coordinates. */
export async function searchPickupAddresses(query, { limit = 5, signal } = {}) {
  const normalized = query.trim().replace(/\s+/g, ' ');
  if (normalized.length < 4) return [];
  const key = `${normalized.toLowerCase()}|${limit}`;
  if (searchCache.has(key)) return searchCache.get(key);

  await waitForRateLimit(signal);
  const params = new URLSearchParams({
    q: `${normalized}, Gauteng, South Africa`,
    format: 'jsonv2',
    addressdetails: '1',
    countrycodes: 'za',
    limit: String(limit),
    viewbox: '27.15,-25.45,28.95,-26.95',
    bounded: '0',
  });
  const response = await fetchWithRetry(`${NOMINATIM_SEARCH}?${params}`, {
    headers: { Accept: 'application/json', 'Accept-Language': 'en-ZA,en;q=0.8' },
    signal,
  });
  if (!response.ok) throw new Error('Address search is unavailable right now. Try again in a moment.');
  const results = (await response.json()).map(cleanResult).filter((item) => item?.label);
  searchCache.set(key, results);
  if (searchCache.size > CACHE_LIMIT) searchCache.delete(searchCache.keys().next().value);
  return results;
}

export async function geocodePickupAddress(address) {
  const result = (await searchPickupAddresses(address, { limit: 1 }))[0];
  if (!result) throw new Error("We couldn't find that address. Try a nearby landmark or pick a suggestion from the list.");
  return result;
}
