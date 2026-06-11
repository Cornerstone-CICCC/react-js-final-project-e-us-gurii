import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useParams } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  Compass,
  MapPinned,
  Sparkles,
  UtensilsCrossed,
  ShoppingCart,
  Cross,
  Briefcase,
  Landmark,
  Star,
  Plus,
  Minus,
  LocateFixed,
  Trash2,
  ArrowRight,
  Calendar,
  Map as MapIcon,
} from 'lucide-react';
import { normalizeGeoapifyResult } from '../lib/places';
import { createTrip, getTrip, updateTrip } from '../lib/api';
import { estimateRouteBreakdown, formatCurrency, currencyForCountry, currencyOptions } from '../lib/pricing';

const categoryOptions = [
  { key: 'all', label: 'All', icon: Compass },
  { key: 'iconic', label: 'Iconic', icon: MapPinned },
  { key: 'culture', label: 'Culture', icon: Sparkles },
  { key: 'food', label: 'Food', icon: UtensilsCrossed },
  { key: 'shops', label: 'Shops', icon: ShoppingCart },
  { key: 'health', label: 'Health', icon: Cross },
  { key: 'business', label: 'Business', icon: Briefcase },
];

// Geoapify Places API category filters per chip.
const CATEGORY_QUERY = {
  all: 'tourism.attraction,tourism.sights,catering.restaurant,catering.cafe,entertainment.museum,entertainment.culture,leisure.park,commercial.supermarket,commercial.marketplace,commercial.shopping_mall,healthcare.hospital,healthcare.pharmacy,office,service',
  iconic: 'tourism.attraction,tourism.sights',
  culture: 'entertainment.museum,entertainment.culture,tourism.sights.place_of_worship',
  food: 'catering.restaurant,catering.cafe,catering.fast_food,catering.bar',
  shops: 'commercial.supermarket,commercial.marketplace,commercial.shopping_mall',
  health: 'healthcare',
  business: 'commercial,office,service',
};

const MARKER_LIMIT = 60;

const TOKYO_CENTER = { lat: 35.6895, lng: 139.6917 };

const markerColor = (category) => {
  switch (category) {
    case 'food': return '#825100';
    case 'culture': return '#006c49';
    case 'health': return '#ba1a1a';
    case 'shop': return '#8b5cf6';
    case 'business': return '#3f4756';
    default: return '#0058be'; // iconic
  }
};

// Lucide component per category, used as the list-card fallback when a place has no photo.
const glyphFor = (category) => {
  switch (category) {
    case 'food': return UtensilsCrossed;
    case 'culture': return Landmark;
    case 'health': return Cross;
    case 'shop': return ShoppingCart;
    case 'business': return Briefcase;
    default: return Star; // iconic
  }
};

function CategoryGlyph({ category }) {
  const Glyph = glyphFor(category);
  return (
    <div className="flex h-full w-full items-center justify-center" style={{ background: markerColor(category) }}>
      <Glyph size={26} className="text-white" />
    </div>
  );
}

// Lucide icon paths per category, drawn inside the marker badge.
const iconPaths = (category) => {
  switch (category) {
    case 'food': // utensils
      return '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>';
    case 'culture': // landmark
      return '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>';
    case 'health': // medical plus
      return '<path d="M5 12h14"/><path d="M12 5v14"/>';
    case 'shop': // shopping cart
      return '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>';
    case 'business': // briefcase
      return '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>';
    default: // iconic — star
      return '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>';
  }
};

const buildMarkerElement = (place) => {
  const element = document.createElement('div');
  element.innerHTML = `<div style="width:28px;height:28px;border-radius:50%;background:${markerColor(place.category)};border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;cursor:pointer">
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${iconPaths(place.category)}</svg>
  </div>`;
  element.classList.add('poi-marker');
  return element;
};

// Larger, ringed marker for places already added to the trip.
const buildSelectedMarkerElement = (place) => {
  const color = markerColor(place.category);
  const element = document.createElement('div');
  element.innerHTML = `<div style="width:34px;height:34px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 0 0 2px ${color},0 2px 6px rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;cursor:pointer">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${iconPaths(place.category)}</svg>
  </div>`;
  element.classList.add('poi-marker');
  return element;
};

const popupContent = (place, buttonId) => `
  <div style="color:#0b1c30;font-family:Inter,sans-serif;max-width:200px">
    <strong style="font-size:15px">${place.name}</strong><br/>
    <span style="color:#424754;font-size:12px">${place.city}${place.area ? ` · ${place.area}` : ''}</span>
    <button id="${buttonId}" style="margin-top:8px;width:100%;background:#0058be;color:#fff;border:none;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">Add to Trip</button>
  </div>`;

const removePopupContent = (place, buttonId) => `
  <div style="color:#0b1c30;font-family:Inter,sans-serif;max-width:200px">
    <strong style="font-size:15px">${place.name}</strong><br/>
    <span style="color:#424754;font-size:12px">${place.city}${place.area ? ` · ${place.area}` : ''}</span>
    <button id="${buttonId}" style="margin-top:8px;width:100%;background:#ba1a1a;color:#fff;border:none;padding:6px 10px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer">Remove from Trip</button>
  </div>`;

function PlannerPage({ currency, setCurrency, fxRate, token, navigate }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const selectedMarkersRef = useRef([]);
  const currentPopup = useRef(null);
  const addRef = useRef(() => {});
  const removeRef = useRef(() => {});

  // Edit mode when rendered at /trips/:id — preload that trip and update it instead of creating.
  const { id: editTripId } = useParams();
  const isEdit = Boolean(editTripId);

  const [selectedPlaces, setSelectedPlaces] = useState([]);
  const [editTrip, setEditTrip] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [mapReady, setMapReady] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [apiPlaces, setApiPlaces] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  // Trip context: from the loaded trip in edit mode, otherwise from the homepage URL params.
  const [searchParams] = useSearchParams();
  const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');
  const tripDest = isEdit ? (editTrip?.destination || '') : searchParams.get('dest');
  const tripFrom = isEdit ? toDateInput(editTrip?.startDate) : searchParams.get('from');
  const tripTo = isEdit ? toDateInput(editTrip?.endDate) : searchParams.get('to');
  const tripCountry = isEdit ? (editTrip?.country || null) : searchParams.get('country');
  const tripLat = parseFloat(searchParams.get('lat'));
  const tripLon = parseFloat(searchParams.get('lon'));
  const hasTripCoords = Number.isFinite(tripLat) && Number.isFinite(tripLon);
  const tripCenter = hasTripCoords ? [tripLon, tripLat] : [TOKYO_CENTER.lng, TOKYO_CENTER.lat];

  const addPlace = useCallback((place) => {
    setSelectedPlaces((current) => (current.some((entry) => entry.id === place.id) ? current : [...current, place]));
  }, []);
  const removePlace = (id) => setSelectedPlaces((current) => current.filter((entry) => entry.id !== id));

  // Default the currency to the destination's local currency — once per destination,
  // so a manual change via the selector still sticks.
  const placesCountry = useMemo(() => {
    const counts = {};
    selectedPlaces.forEach((place) => {
      if (place.countryCode) counts[place.countryCode] = (counts[place.countryCode] ?? 0) + 1;
    });
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] || null;
  }, [selectedPlaces]);
  const destCountry = tripCountry || placesCountry;
  const lastDestCountry = useRef(null);
  useEffect(() => {
    if (destCountry && destCountry !== lastDestCountry.current) {
      lastDestCountry.current = destCountry;
      setCurrency(currencyForCountry(destCountry));
    }
  }, [destCountry, setCurrency]);

  // Edit mode: load the trip and seed the sidebar/currency from it.
  useEffect(() => {
    if (!isEdit || !token) return undefined;
    let cancelled = false;
    getTrip(editTripId, token)
      .then((data) => {
        if (cancelled) return;
        setEditTrip(data);
        setSelectedPlaces(Array.isArray(data.places) ? data.places : []);
        if (data.currency) {
          lastDestCountry.current = data.country || null; // keep the saved currency, don't auto-override
          setCurrency(data.currency);
        }
      })
      .catch((err) => { if (!cancelled) setSaveError(err.message); });
    return () => { cancelled = true; };
  }, [isEdit, editTripId, token]);

  const breakdown = useMemo(() => estimateRouteBreakdown(selectedPlaces, currency, fxRate), [selectedPlaces, currency, fxRate]);

  // Add a place, enriching it with a real photo from the Place Details API when one exists.
  const addPlaceWithImage = useCallback(async (place) => {
    if (!place) return;
    if (geoapifyApiKey && place.id) {
      try {
        const response = await fetch(`https://api.geoapify.com/v2/place-details?id=${encodeURIComponent(place.id)}&features=wiki_and_media&apiKey=${geoapifyApiKey}`);
        if (response.ok) {
          const data = await response.json();
          const image = data.features?.[0]?.properties?.wiki_and_media?.image;
          if (image) {
            addPlace({ ...place, image });
            return;
          }
        }
      } catch {
        // Fall through to adding with the placeholder image.
      }
    }
    addPlace(place);
  }, [addPlace, geoapifyApiKey]);
  addRef.current = addPlaceWithImage;
  removeRef.current = removePlace;

  // Initialise the MapLibre map with a Geoapify vector style.
  useEffect(() => {
    if (!geoapifyApiKey || !mapContainer.current || map.current) return undefined;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${geoapifyApiKey}`,
      center: tripCenter,
      zoom: 12,
    });
    map.current = mapInstance;

    mapInstance.on('load', () => {
      mapInstance.resize();
      if (!mapInstance.getSource('route')) {
        mapInstance.addSource('route', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
        mapInstance.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-cap': 'round', 'line-join': 'round' },
          paint: { 'line-color': '#0058be', 'line-width': 4, 'line-opacity': 0.85 },
        });
      }
      setMapReady(true);
    });

    mapInstance.on('error', () => setSearchError('Map style failed to load. Check your Geoapify API key.'));

    // Click empty map → reverse geocode that point → offer to add it.
    mapInstance.on('click', async (event) => {
      // Ignore clicks that landed on a POI marker — those open their own popup.
      if (event.originalEvent?.target?.closest?.('.poi-marker')) return;
      const { lng, lat } = event.lngLat;
      try {
        const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&format=json&apiKey=${geoapifyApiKey}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        const result = data.results?.[0];
        if (result) {
          setSearchError('');
          openAddPopup(mapInstance, normalizeGeoapifyResult(result), [result.lon, result.lat], addRef.current, currentPopup);
        }
      } catch (error) {
        setSearchError(`Couldn't identify that spot (${error.message}). Check your Geoapify API key.`);
      }
    });

    return () => {
      mapInstance.remove();
      map.current = null;
      setMapReady(false);
    };
  }, [geoapifyApiKey]);

  // Fetch live POIs from the Geoapify Places API for the current viewport + category.
  const fetchApiPlaces = useCallback(async () => {
    if (!map.current || !geoapifyApiKey) return;
    const bounds = map.current.getBounds();
    // Geoapify rect format is lon1,lat1,lon2,lat2 = west,north,east,south.
    const rect = `rect:${bounds.getWest()},${bounds.getNorth()},${bounds.getEast()},${bounds.getSouth()}`;
    const categories = CATEGORY_QUERY[activeCategory] ?? CATEGORY_QUERY.all;
    try {
      const response = await fetch(
        `https://api.geoapify.com/v2/places?categories=${categories}&filter=${rect}&limit=${MARKER_LIMIT}&apiKey=${geoapifyApiKey}`,
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const items = (data.features ?? [])
        .map((feature) => normalizeGeoapifyResult(feature.properties))
        .filter((place) => place.lat != null && place.lng != null);
      setApiPlaces(items);
      setSearchError('');
    } catch (error) {
      setSearchError(`Couldn't load places (${error.message}). Check your Geoapify API key.`);
    }
  }, [activeCategory, geoapifyApiKey]);

  // Refetch POIs on load, when the category changes, and after the user pans/zooms.
  useEffect(() => {
    if (!map.current || !mapReady) return undefined;
    fetchApiPlaces();
    const handler = () => fetchApiPlaces();
    map.current.on('moveend', handler);
    return () => map.current?.off('moveend', handler);
  }, [mapReady, fetchApiPlaces]);

  // Render a marker for each POI returned by the Places API (excluding already-selected places).
  useEffect(() => {
    if (!map.current || !mapReady) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    const selectedIds = new Set(selectedPlaces.map((place) => place.id));
    apiPlaces.filter((place) => !selectedIds.has(place.id)).forEach((place) => {
      const element = buildMarkerElement(place);
      const buttonId = `add-place-${place.id}`;
      const popup = new maplibregl.Popup({ offset: 16, closeButton: false }).setHTML(popupContent(place, buttonId));
      const marker = new maplibregl.Marker({ element })
        .setLngLat([place.lng, place.lat])
        .setPopup(popup)
        .addTo(map.current);

      // Open the popup on hover; keep it open while the cursor is over the marker or the popup.
      let closeTimer;
      const cancelClose = () => clearTimeout(closeTimer);
      const scheduleClose = () => { closeTimer = setTimeout(() => { if (popup.isOpen()) marker.togglePopup(); }, 250); };
      const openHover = () => { cancelClose(); if (!popup.isOpen()) marker.togglePopup(); };
      element.addEventListener('mouseenter', openHover);
      element.addEventListener('mouseleave', scheduleClose);

      popup.on('open', () => {
        if (currentPopup.current && currentPopup.current !== popup) currentPopup.current.remove();
        currentPopup.current = popup;
        const button = document.getElementById(buttonId);
        if (button) {
          button.onclick = () => {
            addRef.current(place);
            popup.remove();
          };
        }
        const popupEl = popup.getElement();
        if (popupEl) {
          popupEl.addEventListener('mouseenter', cancelClose);
          popupEl.addEventListener('mouseleave', scheduleClose);
        }
      });

      markersRef.current.push(marker);
    });
  }, [mapReady, apiPlaces, selectedPlaces]);

  // Persistent markers for selected places — always visible, independent of the viewport POIs.
  useEffect(() => {
    if (!map.current || !mapReady) return;

    selectedMarkersRef.current.forEach((marker) => marker.remove());
    selectedMarkersRef.current = [];

    selectedPlaces.forEach((place) => {
      if (place.lat == null || place.lng == null) return;
      const element = buildSelectedMarkerElement(place);
      const buttonId = `remove-place-${place.id}`;
      const popup = new maplibregl.Popup({ offset: 18, closeButton: false }).setHTML(removePopupContent(place, buttonId));
      const marker = new maplibregl.Marker({ element })
        .setLngLat([place.lng, place.lat])
        .setPopup(popup)
        .addTo(map.current);

      let closeTimer;
      const cancelClose = () => clearTimeout(closeTimer);
      const scheduleClose = () => { closeTimer = setTimeout(() => { if (popup.isOpen()) marker.togglePopup(); }, 250); };
      const openHover = () => { cancelClose(); if (!popup.isOpen()) marker.togglePopup(); };
      element.addEventListener('mouseenter', openHover);
      element.addEventListener('mouseleave', scheduleClose);

      popup.on('open', () => {
        if (currentPopup.current && currentPopup.current !== popup) currentPopup.current.remove();
        currentPopup.current = popup;
        const button = document.getElementById(buttonId);
        if (button) {
          button.onclick = () => {
            removeRef.current(place.id);
            popup.remove();
          };
        }
        const popupEl = popup.getElement();
        if (popupEl) {
          popupEl.addEventListener('mouseenter', cancelClose);
          popupEl.addEventListener('mouseleave', scheduleClose);
        }
      });

      selectedMarkersRef.current.push(marker);
    });
  }, [mapReady, selectedPlaces]);

  // Draw a route connecting the selected places (driving route, straight-line fallback).
  useEffect(() => {
    if (!map.current || !mapReady) return undefined;
    const source = map.current.getSource('route');
    if (!source) return undefined;

    const empty = { type: 'FeatureCollection', features: [] };
    if (selectedPlaces.length < 2 || !geoapifyApiKey) {
      source.setData(empty);
      return undefined;
    }

    const straightLine = {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: selectedPlaces.map((place) => [place.lng, place.lat]) } }],
    };

    let cancelled = false;
    const waypoints = selectedPlaces.map((place) => `${place.lat},${place.lng}`).join('|');
    (async () => {
      try {
        const response = await fetch(`https://api.geoapify.com/v1/routing?waypoints=${waypoints}&mode=drive&apiKey=${geoapifyApiKey}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!cancelled) source.setData(data.features?.length ? data : straightLine);
      } catch {
        if (!cancelled) source.setData(straightLine);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mapReady, selectedPlaces, geoapifyApiKey]);

  // In edit mode, frame the map on the trip's places once they load.
  useEffect(() => {
    if (!map.current || !mapReady || !isEdit || selectedPlaces.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    selectedPlaces.forEach((place) => bounds.extend([place.lng, place.lat]));
    map.current.fitBounds(bounds, { padding: 80, maxZoom: 13, duration: 600 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapReady, editTrip]);

  const buildItineraryPayload = () => ({
    destination: tripDest || selectedPlaces[0]?.city || 'My Trip',
    country: destCountry || selectedPlaces[0]?.countryCode || null,
    dates: { from: tripFrom || null, to: tripTo || null },
    currency,
    fxRate,
    // Store the full place objects (incl. cost fields) so the trip can be re-edited later.
    places: selectedPlaces.map((place) => ({
      id: place.id,
      name: place.name,
      category: place.category,
      city: place.city,
      area: place.area,
      countryCode: place.countryCode,
      lat: place.lat,
      lng: place.lng,
      baseCost: place.baseCost,
      flightEstimate: place.flightEstimate,
      foodEstimate: place.foodEstimate,
      activityEstimate: place.activityEstimate,
      image: place.image ?? null,
    })),
    costs: breakdown,
  });

  const handleSaveItinerary = async () => {
    if (selectedPlaces.length === 0) {
      setSaveError(`Add at least one place before ${isEdit ? 'updating' : 'creating'} an itinerary.`);
      return;
    }

    const payload = buildItineraryPayload();
    console.log('Itinerary payload to send to backend →', payload);

    // Create mode + not logged in: stash the trip and log in first; AuthPage finishes saving it.
    if (!isEdit && !token) {
      localStorage.setItem('voyageplan-pending-trip', JSON.stringify(payload));
      navigate('/auth', { state: { from: '/budget' } });
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      if (isEdit) {
        await updateTrip(editTripId, payload, token);
        navigate('/my-trips');
      } else {
        await createTrip(payload, token);
        navigate('/budget');
      }
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const zoomBy = (delta) => {
    if (map.current) map.current.zoomTo((map.current.getZoom() ?? 12) + delta);
  };

  const recenter = () => {
    if (!map.current) return;
    if (selectedPlaces.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      selectedPlaces.forEach((place) => bounds.extend([place.lng, place.lat]));
      map.current.fitBounds(bounds, { padding: 80, maxZoom: 14 });
    } else {
      map.current.flyTo({ center: tripCenter, zoom: 12 });
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-65px)] min-h-[640px] bg-background text-on-surface">
      {/* Sidebar: Selected Places */}
      <aside className="w-full md:w-80 lg:w-96 bg-surface-bright border-b md:border-b-0 md:border-r border-outline-variant flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Selected Places</h2>
            <span className="bg-primary-container text-on-primary-container text-caption font-bold px-2.5 py-1 rounded-full transition-transform">{selectedPlaces.length}</span>
          </div>
          {tripDest || tripFrom || tripTo ? (
            <div className="mb-4 rounded-xl border border-primary-container/40 bg-surface-container-low px-3 py-2">
              {tripDest ? (
                <p className="flex items-center gap-1.5 text-body-md font-semibold text-on-surface">
                  <MapPinned size={16} className="shrink-0 text-primary" />
                  <span className="truncate">{tripDest}</span>
                </p>
              ) : null}
              {tripFrom || tripTo ? (
                <p className="mt-0.5 flex items-center gap-1.5 text-caption text-on-surface-variant">
                  <Calendar size={13} className="shrink-0" />
                  {tripFrom || '—'} → {tripTo || '—'}
                </p>
              ) : null}
            </div>
          ) : null}
          <p className="text-on-surface-variant text-body-md mb-4">Click any marker on the map to add it. Pan the map or pick a category to load more places.</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {categoryOptions.map((option) => {
              const Icon = option.icon;
              const active = activeCategory === option.key;
              return (
                <button
                  key={option.key}
                  onClick={() => setActiveCategory(option.key)}
                  className={`flex items-center gap-1.5 text-caption px-3 py-1.5 rounded-full whitespace-nowrap transition-colors ${active ? 'bg-primary text-on-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container'}`}
                >
                  <Icon size={14} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {searchError ? (
          <div className="px-6 pt-4">
            <p className="rounded-lg bg-error-container px-3 py-2 text-caption text-on-error-container">{searchError}</p>
          </div>
        ) : null}

        {/* Selected list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {selectedPlaces.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-2 opacity-60">
              <MapIcon size={48} className="text-outline" />
              <p className="font-title-md text-title-md">No places selected yet</p>
              <p className="text-caption">Click a marker on the map to build your itinerary.</p>
            </div>
          ) : (
            selectedPlaces.map((place) => (
              <div key={place.id} className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-surface-container">
                  {place.image ? (
                    <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                  ) : (
                    <CategoryGlyph category={place.category} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-title-md text-on-surface truncate">{place.name}</h4>
                  <p className="text-caption text-on-surface-variant truncate">{place.area || place.city}</p>
                  <p className="text-caption font-semibold text-secondary">{formatCurrency(estimateRouteBreakdown([place], currency, fxRate, 0).total, currency)}</p>
                </div>
                <button onClick={() => removePlace(place.id)} aria-label={`Remove ${place.name}`} className="text-outline hover:text-error transition-colors p-1.5 rounded-full hover:bg-error-container">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer: total + create itinerary */}
        <div className="p-6 bg-surface-container-low border-t border-outline-variant space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-caption text-on-surface-variant">Estimated route total</p>
              <p className="text-title-md font-bold text-on-surface">{formatCurrency(breakdown.total, currency)}</p>
            </div>
            <select
              className="rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-label-md text-on-surface outline-none"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              title="Defaults to the destination's currency — change to convert"
            >
              {currencyOptions.map((option) => (
                <option key={option.code} value={option.code}>{option.code}</option>
              ))}
            </select>
          </div>
          {saveError ? <p className="rounded-lg bg-error-container px-3 py-2 text-caption text-on-error-container">{saveError}</p> : null}
          <button
            type="button"
            onClick={handleSaveItinerary}
            disabled={saving || selectedPlaces.length === 0}
            className="w-full bg-primary text-on-primary py-3 rounded-lg font-label-md flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{saving ? 'Saving…' : isEdit ? 'Update Itinerary' : 'Create Itinerary'}</span>
            {!saving && <ArrowRight size={18} />}
          </button>
        </div>
      </aside>

      {/* Map Section */}
      <section className="flex-1 relative bg-surface-dim min-h-[400px]">
        {geoapifyApiKey ? (
          <>
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
            {/* Floating Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-30">
              <button onClick={() => zoomBy(1)} aria-label="Zoom in" className="bg-surface w-12 h-12 flex items-center justify-center rounded-lg shadow-lg border border-outline-variant hover:bg-surface-container transition-all active:scale-95">
                <Plus size={20} />
              </button>
              <button onClick={() => zoomBy(-1)} aria-label="Zoom out" className="bg-surface w-12 h-12 flex items-center justify-center rounded-lg shadow-lg border border-outline-variant hover:bg-surface-container transition-all active:scale-95">
                <Minus size={20} />
              </button>
              <button onClick={recenter} aria-label="Recenter map" className="bg-primary text-on-primary w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:bg-primary-container transition-all active:scale-95 mt-3">
                <LocateFixed size={20} />
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
            <Sparkles className="text-primary" size={40} />
            <h3 className="font-headline-lg text-headline-lg-mobile">Map preview</h3>
            <p className="max-w-md text-on-surface-variant text-body-md">Add a free Geoapify key as <code className="rounded bg-surface-container px-1.5 py-0.5">VITE_GEOAPIFY_API_KEY</code> in a <code className="rounded bg-surface-container px-1.5 py-0.5">.env</code> file to unlock the live map, search, and click-to-add.</p>
          </div>
        )}
      </section>
    </div>
  );
}

function openAddPopup(mapInstance, place, lngLat, addPlace, currentPopup) {
  if (!place?.name) return;
  if (currentPopup?.current) currentPopup.current.remove();
  const buttonId = `add-place-${place.id}`;
  const popup = new maplibregl.Popup({ offset: 16 })
    .setLngLat(lngLat)
    .setHTML(popupContent(place, buttonId))
    .addTo(mapInstance);
  if (currentPopup) currentPopup.current = popup;
  const button = document.getElementById(buttonId);
  if (button) {
    button.onclick = () => {
      addPlace(place);
      popup.remove();
    };
  }
}

export default PlannerPage;
