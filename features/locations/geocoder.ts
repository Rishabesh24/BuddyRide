// Tamil Nadu Intelligent Location Recognition & Geocoding Service
import { ALL_TAMIL_NADU_LOCATIONS, TamilNaduLocation } from './tamil-nadu-locations';
import { GeoCoordinate } from '../types';

export interface LocationMatchResult {
  location: TamilNaduLocation;
  score: number;
}

export interface ResolvedCoordinates extends GeoCoordinate {
  matchedName: string;
  city: string;
  district: string;
  address: string;
  isExact: boolean;
  source: 'database' | 'district_centroid' | 'nominatim_osm' | 'fallback_centroid';
}

// Bounding box for Tamil Nadu: Lat 8.0 to 13.6 N, Long 76.2 to 80.4 E
export const TAMIL_NADU_BOUNDS = {
  minLat: 8.0,
  maxLat: 13.6,
  minLng: 76.2,
  maxLng: 80.4,
  centerLat: 11.1271, // Center near Tiruchirappalli / Karur
  centerLng: 78.6569,
};

/**
 * Normalizes input text for resilient fuzzy searching
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches the Tamil Nadu location database using multi-token matching, aliases, and district weighting.
 */
export function searchTamilNaduLocations(
  query: string,
  limit: number = 8
): TamilNaduLocation[] {
  if (!query || query.trim().length === 0) {
    // Return key state hub default
    return ALL_TAMIL_NADU_LOCATIONS.slice(0, limit);
  }

  const cleanQuery = normalizeText(query);
  const queryTokens = cleanQuery.split(' ').filter((t) => t.length > 0);

  const scored: LocationMatchResult[] = [];

  for (const loc of ALL_TAMIL_NADU_LOCATIONS) {
    let score = 0;
    const normName = normalizeText(loc.name);
    const normCity = normalizeText(loc.city);
    const normDistrict = normalizeText(loc.district);
    const normAddress = normalizeText(loc.address);

    // Exact city or district match
    if (normCity === cleanQuery || normDistrict === cleanQuery) {
      score += 100;
    }

    // Exact name match or starts with
    if (normName === cleanQuery) {
      score += 150;
    } else if (normName.startsWith(cleanQuery)) {
      score += 80;
    }

    // Check aliases
    for (const alias of loc.aliases) {
      const normAlias = normalizeText(alias);
      if (normAlias === cleanQuery) {
        score += 120;
      } else if (normAlias.includes(cleanQuery)) {
        score += 60;
      }
    }

    // Token-level matching
    let allTokensMatched = true;
    for (const token of queryTokens) {
      const tokenInName = normName.includes(token);
      const tokenInCity = normCity.includes(token);
      const tokenInDistrict = normDistrict.includes(token);
      const tokenInAddress = normAddress.includes(token);
      const tokenInAliases = loc.aliases.some((a) => normalizeText(a).includes(token));

      if (tokenInName || tokenInCity || tokenInDistrict || tokenInAddress || tokenInAliases) {
        if (tokenInName) score += 30;
        if (tokenInCity) score += 25;
        if (tokenInDistrict) score += 20;
        if (tokenInAliases) score += 25;
        if (tokenInAddress) score += 10;
      } else {
        allTokensMatched = false;
      }
    }

    if (score > 0 || allTokensMatched) {
      scored.push({ location: loc, score });
    }
  }

  // Sort descending by score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit).map((s) => s.location);
}

/**
 * Resolves any user query in Tamil Nadu to precise coordinates.
 * Falls back safely to OSM Nominatim or district centroid if not in the local database.
 */
export async function resolveTamilNaduCoordinates(
  queryText: string
): Promise<ResolvedCoordinates> {
  const trimmed = queryText.trim();

  // 1. Check local Tamil Nadu database first (instantaneous & offline safe)
  const localMatches = searchTamilNaduLocations(trimmed, 1);
  if (localMatches.length > 0) {
    const top = localMatches[0];
    return {
      latitude: top.latitude,
      longitude: top.longitude,
      matchedName: top.name,
      city: top.city,
      district: top.district,
      address: top.address,
      isExact: true,
      source: 'database',
    };
  }

  // 2. Try Nominatim Geocoding bounded strictly to Tamil Nadu
  try {
    const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      trimmed + ', Tamil Nadu, India'
    )}&countrycodes=in&viewbox=76.2,13.6,80.4,8.0&bounded=1&limit=1`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5s strict timeout

    const res = await fetch(searchUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'RouteShare-TamilNadu-RideSharing/1.0',
        Accept: 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);

        // Verify latitude and longitude are genuinely within Tamil Nadu geographic bounds
        if (
          lat >= TAMIL_NADU_BOUNDS.minLat &&
          lat <= TAMIL_NADU_BOUNDS.maxLat &&
          lon >= TAMIL_NADU_BOUNDS.minLng &&
          lon <= TAMIL_NADU_BOUNDS.maxLng
        ) {
          return {
            latitude: lat,
            longitude: lon,
            matchedName: item.display_name?.split(',')[0] || trimmed,
            city: trimmed,
            district: 'Tamil Nadu',
            address: item.display_name || `${trimmed}, Tamil Nadu`,
            isExact: true,
            source: 'nominatim_osm',
          };
        }
      }
    }
  } catch {
    // Graceful continuation on network failure/timeout
  }

  // 3. Fallback: Geographic center of Tamil Nadu (near Tiruchirappalli)
  return {
    latitude: TAMIL_NADU_BOUNDS.centerLat,
    longitude: TAMIL_NADU_BOUNDS.centerLng,
    matchedName: trimmed || 'Tamil Nadu Central Corridor',
    city: 'Tamil Nadu',
    district: 'Tiruchirappalli',
    address: `${trimmed ? trimmed + ', ' : ''}Tamil Nadu, India`,
    isExact: false,
    source: 'fallback_centroid',
  };
}
