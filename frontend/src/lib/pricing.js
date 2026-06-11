// Currencies supported by the Frankfurter API (used for live conversion).
export const SUPPORTED_CURRENCIES = [
  'AUD', 'BGN', 'BRL', 'CAD', 'CHF', 'CNY', 'CZK', 'DKK', 'EUR', 'GBP', 'HKD',
  'HUF', 'IDR', 'ILS', 'INR', 'ISK', 'JPY', 'KRW', 'MXN', 'MYR', 'NOK', 'NZD',
  'PHP', 'PLN', 'RON', 'SEK', 'SGD', 'THB', 'TRY', 'USD', 'ZAR',
];

// Currencies offered in the selector (the "total" display currency).
export const currencyOptions = [
  { code: 'USD' }, { code: 'EUR' }, { code: 'GBP' }, { code: 'CAD' }, { code: 'AUD' },
  { code: 'BRL' }, { code: 'JPY' }, { code: 'MXN' }, { code: 'CHF' }, { code: 'CNY' },
  { code: 'INR' }, { code: 'SGD' },
];

// Map a destination country to its currency.
const COUNTRY_CURRENCY = {
  us: 'USD', ca: 'CAD', mx: 'MXN', br: 'BRL', au: 'AUD', nz: 'NZD',
  gb: 'GBP', ch: 'CHF', dk: 'DKK', no: 'NOK', se: 'SEK', cz: 'CZK', pl: 'PLN',
  hu: 'HUF', ro: 'RON', bg: 'BGN', tr: 'TRY', is: 'ISK',
  jp: 'JPY', cn: 'CNY', hk: 'HKD', sg: 'SGD', kr: 'KRW', in: 'INR', id: 'IDR',
  my: 'MYR', th: 'THB', ph: 'PHP', il: 'ILS', za: 'ZAR',
  // Eurozone
  fr: 'EUR', de: 'EUR', it: 'EUR', es: 'EUR', pt: 'EUR', nl: 'EUR', be: 'EUR',
  at: 'EUR', ie: 'EUR', fi: 'EUR', gr: 'EUR', lu: 'EUR', sk: 'EUR', si: 'EUR',
  ee: 'EUR', lv: 'EUR', lt: 'EUR', cy: 'EUR', mt: 'EUR', hr: 'EUR',
};

// The destination's local currency, or USD when it isn't one we can convert.
export function currencyForCountry(countryCode) {
  const currency = COUNTRY_CURRENCY[(countryCode || '').toLowerCase()];
  return currency && SUPPORTED_CURRENCIES.includes(currency) ? currency : 'USD';
}

export function convertFromUSD(usdValue, currency, rates) {
  const rate = rates?.[currency] ?? 1;
  return (usdValue || 0) * rate;
}

// Convert between two currencies using USD-based rates. Same currency → no conversion.
export function convertCurrency(value, fromCode, toCode, rates) {
  if (!value) return 0;
  if (!fromCode || !toCode || fromCode === toCode) return value;
  const fromRate = rates?.[fromCode] ?? 1;
  const toRate = rates?.[toCode] ?? 1;
  return value * (toRate / fromRate);
}

export function formatCurrency(value, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value || 0);
  } catch {
    return `${Math.round(value || 0).toLocaleString()} ${currency}`;
  }
}

export function estimateRouteBreakdown(selectedPlaces, currency = 'USD', fxRate = 1, flightOverride = null) {
  // One round-trip flight to the destination (the priciest leg), not one per place.
  const estimatedFlight = selectedPlaces.length
    ? Math.max(...selectedPlaces.map((place) => place.flightEstimate || 0))
    : 0;
  const flight = flightOverride != null ? flightOverride : estimatedFlight;
  const lodging = selectedPlaces.reduce((sum, place) => sum + (place.baseCost || 0), 0);
  const food = selectedPlaces.reduce((sum, place) => sum + (place.foodEstimate || 0), 0);
  const activities = selectedPlaces.reduce((sum, place) => sum + (place.activityEstimate || 0), 0);
  const total = (flight + lodging + food + activities) * fxRate;

  return {
    flight: flight * fxRate,
    lodging: lodging * fxRate,
    food: food * fxRate,
    activities: activities * fxRate,
    total,
  };
}
