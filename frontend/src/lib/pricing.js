export const currencyOptions = [
  { code: 'USD', symbol: '$' },
  { code: 'CAD', symbol: 'C$' },
  { code: 'EUR', symbol: '€' },
  { code: 'BRL', symbol: 'R$' },
  { code: 'JPY', symbol: '¥' },
];

// Map a destination country to one of our supported currencies; fall back to USD.
const COUNTRY_CURRENCY = {
  us: 'USD',
  ca: 'CAD',
  br: 'BRL',
  jp: 'JPY',
  // Eurozone
  fr: 'EUR', de: 'EUR', it: 'EUR', es: 'EUR', pt: 'EUR', nl: 'EUR', be: 'EUR',
  at: 'EUR', ie: 'EUR', fi: 'EUR', gr: 'EUR', lu: 'EUR', sk: 'EUR', si: 'EUR',
  ee: 'EUR', lv: 'EUR', lt: 'EUR', cy: 'EUR', mt: 'EUR', hr: 'EUR',
};

export function currencyForCountry(countryCode) {
  return COUNTRY_CURRENCY[(countryCode || '').toLowerCase()] || 'USD';
}

export function formatCurrency(value, currency = 'USD') {
  const symbol = currencyOptions.find((entry) => entry.code === currency)?.symbol ?? '$';
  return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
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
