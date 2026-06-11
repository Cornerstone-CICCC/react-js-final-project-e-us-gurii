import { priceMultiplier } from './costOfLiving';

export function getVisiblePlaces(places = [], activeCategory = 'all') {
  if (activeCategory === 'all') return places;
  return places.filter((place) => place.category === activeCategory);
}

export function buildPlaceId(name, coordinates = []) {
  const [lng = 0, lat = 0] = coordinates;
  const seed = `${name}-${lat}-${lng}`.toLowerCase();
  return seed.replace(/[^a-z0-9.]+/g, '-').replace(/(^-|-$)/g, '');
}

export function normalizeMapboxFeature(feature, fallbackCategory = 'iconic') {
  const [lng, lat] = feature.geometry?.coordinates ?? [];
  const placeName = feature.text || feature.place_name || feature.properties?.name || 'Unnamed place';
  const cityContext = feature.context?.find((entry) => entry.id?.startsWith('place'))?.text ?? 'Unknown city';
  const regionContext = feature.context?.find((entry) => entry.id?.startsWith('region'))?.text ?? 'Nearby';
  const placeType = feature.place_type?.[0] ?? 'place';

  return {
    id: feature.id || buildPlaceId(placeName, [lng, lat]),
    name: placeName,
    city: cityContext,
    area: regionContext,
    category: placeType === 'poi' ? 'iconic' : fallbackCategory,
    lat,
    lng,
    baseCost: 70 + Math.round((lat + lng) % 18),
    flightEstimate: 360 + Math.round((lat + lng) % 30),
    foodEstimate: 20 + Math.round((lat + lng) % 14),
    activityEstimate: 10 + Math.round((lat + lng) % 12),
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800',
  };
}

export function normalizeGooglePlace(result, fallbackCategory = 'iconic') {
  const location = result.geometry?.location;
  const lat = typeof location?.lat === 'function' ? location.lat() : location?.lat;
  const lng = typeof location?.lng === 'function' ? location.lng() : location?.lng;
  const addressParts = result.formatted_address?.split(',') ?? [];
  const city = addressParts.at(-3)?.trim() || 'Unknown city';
  const area = addressParts.at(-2)?.trim() || 'Nearby';

  return {
    id: result.place_id || buildPlaceId(result.name, [lng, lat]),
    name: result.name || 'Unnamed place',
    city,
    area,
    category: result.types?.includes('restaurant') ? 'food' : result.types?.includes('park') ? 'culture' : fallbackCategory,
    lat,
    lng,
    baseCost: 70 + Math.round((lat + lng) % 18),
    flightEstimate: 360 + Math.round((lat + lng) % 30),
    foodEstimate: 20 + Math.round((lat + lng) % 14),
    activityEstimate: 10 + Math.round((lat + lng) % 12),
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=800',
  };
}

function tagsFromGeoapify(result) {
  return [result.category, result.result_type, ...(result.categories ?? [])].filter(Boolean).join(' ');
}

function categoryFromGeoapify(result, fallbackCategory) {
  const tags = tagsFromGeoapify(result);
  if (/healthcare|hospital|pharmacy|clinic|doctor/.test(tags)) return 'health';
  if (/catering|restaurant|cafe|bar|fast_food/.test(tags)) return 'food';
  if (/supermarket|marketplace|shopping|mall|commercial|shop|store/.test(tags)) return 'shop';
  if (/office|service/.test(tags)) return 'business';
  if (/museum|gallery|theatre|entertainment|place_of_worship|religion|temple|church/.test(tags)) return 'culture';
  if (/tourism|attraction|sights|leisure|park/.test(tags)) return 'iconic';
  return fallbackCategory;
}

// Rough round-trip flight estimate (USD) by destination country.
const FLIGHT_BY_COUNTRY = {
  jp: 850, kr: 820, cn: 780, th: 760, sg: 800, in: 900,
  fr: 620, gb: 600, de: 610, it: 640, es: 600, nl: 615, ch: 660,
  us: 450, ca: 480, mx: 420, br: 700,
  au: 1100, nz: 1150, za: 950, ae: 880, eg: 820,
};

// Per-place cost components derived from the location's category + country/city.
export function estimatePlaceCost(result) {
  const tags = tagsFromGeoapify(result);
  const countryCode = (result.country_code || '').toLowerCase();
  const flightEstimate = FLIGHT_BY_COUNTRY[countryCode] ?? 500;

  let baseCost = 70;
  let foodEstimate = 18;
  let activityEstimate = 14;

  if (/healthcare|hospital|pharmacy|clinic|doctor/.test(tags)) {
    baseCost = 55; foodEstimate = 10; activityEstimate = 0;
  } else if (/catering|restaurant|cafe|bar|fast_food/.test(tags)) {
    baseCost = 60; foodEstimate = 45; activityEstimate = 5;
  } else if (/supermarket|marketplace|shopping|mall|commercial|shop|store/.test(tags)) {
    baseCost = 55; foodEstimate = 25; activityEstimate = 8;
  } else if (/office|service/.test(tags)) {
    baseCost = 55; foodEstimate = 10; activityEstimate = 5;
  } else if (/museum|gallery|theatre|culture|entertainment/.test(tags)) {
    baseCost = 75; foodEstimate = 14; activityEstimate = 28;
  } else if (/place_of_worship|religion|temple|church|mosque|synagogue/.test(tags)) {
    baseCost = 50; foodEstimate = 10; activityEstimate = 6;
  } else if (/tourism|attraction|sights|leisure|park/.test(tags)) {
    baseCost = 80; foodEstimate = 16; activityEstimate = 25;
  }

  // Scale lodging and food by the destination's cost of living.
  const multiplier = priceMultiplier(result.city, result.country_code);
  return {
    baseCost: Math.round(baseCost * multiplier),
    flightEstimate,
    foodEstimate: Math.round(foodEstimate * multiplier),
    activityEstimate,
  };
}

export function normalizeGeoapifyResult(result, fallbackCategory = 'iconic') {
  const lat = result.lat;
  const lng = result.lon;
  const name = result.name || result.address_line1 || result.formatted?.split(',')[0] || 'Unnamed place';
  const city = result.city || result.county || result.state || result.country || 'Unknown city';
  const area = result.suburb || result.district || result.address_line2 || result.state || 'Nearby';

  return {
    id: result.place_id || buildPlaceId(name, [lng, lat]),
    name,
    city,
    area,
    category: categoryFromGeoapify(result, fallbackCategory),
    countryCode: (result.country_code || '').toLowerCase(),
    lat,
    lng,
    ...estimatePlaceCost(result),
    image: null,
  };
}

export async function searchMapboxPlaces(query, token) {
  if (!query?.trim() || !token) return [];

  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=6&types=poi,place,address`
  );

  if (!response.ok) {
    throw new Error('Unable to search places right now.');
  }

  const data = await response.json();
  return (data.features ?? []).map((feature) => normalizeMapboxFeature(feature));
}
