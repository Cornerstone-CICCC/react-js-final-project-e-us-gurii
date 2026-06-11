import { describe, expect, it } from 'vitest';
import { buildPlaceId, getVisiblePlaces, normalizeMapboxFeature } from './places';

describe('getVisiblePlaces', () => {
  const places = [
    { id: 'shibuya', category: 'iconic' },
    { id: 'sensoji', category: 'culture' },
    { id: 'tsukiji', category: 'food' },
  ];

  it('returns all places when the category is all', () => {
    expect(getVisiblePlaces(places, 'all')).toEqual(places);
  });

  it('filters places by category', () => {
    expect(getVisiblePlaces(places, 'food')).toEqual([places[2]]);
  });
});

describe('normalizeMapboxFeature', () => {
  it('builds a normalized place object from a Mapbox feature', () => {
    const feature = {
      id: 'mapbox-place-1',
      text: 'Shibuya Crossing',
      place_type: ['poi'],
      geometry: { coordinates: [139.7004, 35.6595] },
      context: [{ id: 'place.1', text: 'Tokyo' }],
    };

    const place = normalizeMapboxFeature(feature);

    expect(place.name).toBe('Shibuya Crossing');
    expect(place.category).toBe('iconic');
    expect(place.lat).toBe(35.6595);
    expect(place.lng).toBe(139.7004);
  });

  it('builds a stable id from the feature name', () => {
    expect(buildPlaceId('Shibuya Crossing', [139.7004, 35.6595])).toBe('shibuya-crossing-35.6595-139.7004');
  });
});
