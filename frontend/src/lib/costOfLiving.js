// Approximate cost-of-living index, baseline 100 = New York City (Numbeo-style).
// Used to scale lodging/food estimates by how expensive the destination actually is.
const CITY_INDEX = {
  tokyo: 83, osaka: 78, kyoto: 78,
  paris: 82, london: 85, zurich: 122, geneva: 118,
  'new york': 100, 'san francisco': 98, 'los angeles': 86, chicago: 80,
  singapore: 90, 'hong kong': 89, seoul: 80, bangkok: 47, bali: 40,
  sydney: 83, melbourne: 80, dubai: 68,
  berlin: 70, amsterdam: 84, rome: 70, madrid: 62, barcelona: 65,
  'mexico city': 42, 'rio de janeiro': 40, lisbon: 58, prague: 55, vienna: 72,
  cairo: 30, istanbul: 42,
};

const COUNTRY_INDEX = {
  jp: 80, kr: 78, cn: 60, th: 45, sg: 90, in: 32, hk: 89, id: 38,
  fr: 78, gb: 80, de: 68, it: 68, es: 60, nl: 80, ch: 120, pt: 56, cz: 52, at: 70,
  us: 95, ca: 78, mx: 42, br: 42,
  au: 80, nz: 78, za: 45, ae: 68, eg: 30, tr: 42,
};

export function cityPriceIndex(city, countryCode) {
  const cityKey = (city || '').trim().toLowerCase();
  if (CITY_INDEX[cityKey]) return CITY_INDEX[cityKey];
  const countryKey = (countryCode || '').toLowerCase();
  if (COUNTRY_INDEX[countryKey]) return COUNTRY_INDEX[countryKey];
  return 65; // sensible global default
}

// Multiplier relative to the NYC baseline (1.0).
export function priceMultiplier(city, countryCode) {
  return cityPriceIndex(city, countryCode) / 100;
}
