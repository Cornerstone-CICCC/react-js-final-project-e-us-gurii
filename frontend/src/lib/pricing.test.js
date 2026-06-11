import { describe, expect, it } from 'vitest';
import { estimateRouteBreakdown } from './pricing';

describe('estimateRouteBreakdown', () => {
  it('adds the route-level costs for the selected destinations', () => {
    const places = [
      {
        flightEstimate: 420,
        baseCost: 95,
        foodEstimate: 34,
        activityEstimate: 18,
      },
      {
        flightEstimate: 410,
        baseCost: 80,
        foodEstimate: 24,
        activityEstimate: 12,
      },
    ];

    const breakdown = estimateRouteBreakdown(places, 'USD', 1);

    expect(breakdown.flight).toBeCloseTo(420, 1); // single round-trip = max leg
    expect(breakdown.lodging).toBeCloseTo(175, 1);
    expect(breakdown.food).toBeCloseTo(58, 1);
    expect(breakdown.activities).toBeCloseTo(30, 1);
    expect(breakdown.total).toBeCloseTo(683, 1);
  });
});
