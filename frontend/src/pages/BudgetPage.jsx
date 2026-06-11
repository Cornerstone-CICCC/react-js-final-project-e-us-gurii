import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { PiggyBank, TrendingDown, Download, ArrowRight, Compass } from 'lucide-react';
import { getMyTrips, getTrip } from '../lib/api';
import { formatCurrency } from '../lib/pricing';

const CATEGORY_META = [
  { key: 'flightCost', label: 'Flights', color: '#0058be', badge: 'bg-primary-fixed text-on-primary-fixed' },
  { key: 'lodgingCost', label: 'Lodging', color: '#006c49', badge: 'bg-secondary-container text-on-secondary-container' },
  { key: 'foodCost', label: 'Food', color: '#a36700', badge: 'bg-tertiary-fixed text-on-tertiary-fixed-variant' },
  { key: 'activitiesCost', label: 'Activities', color: '#ba1a1a', badge: 'bg-error-container text-on-error-container' },
];

function BudgetPage({ token }) {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        if (id) {
          // A specific trip (opened from the My Trips table).
          const data = await getTrip(id, token);
          if (!cancelled) setTrip(data);
        } else {
          // Fallback: the most recently created trip.
          const trips = await getMyTrips(token);
          const latest = [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0] || null;
          if (!cancelled) setTrip(latest);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, token]);

  const categories = useMemo(() => {
    if (!trip) return [];
    return CATEGORY_META.map((meta) => ({ ...meta, value: Number(trip[meta.key] || 0) }));
  }, [trip]);

  const total = categories.reduce((sum, category) => sum + category.value, 0);
  const currency = trip?.currency || 'USD';

  const nights = useMemo(() => {
    if (!trip?.startDate || !trip?.endDate) return null;
    const diff = Math.round((new Date(trip.endDate) - new Date(trip.startDate)) / 86400000);
    return diff > 0 ? diff : null;
  }, [trip]);

  // Synthetic budget ceiling (20% headroom) for the "potential savings" insight.
  const limit = Math.max(50, Math.ceil((total * 1.2) / 50) * 50);
  const savingsPct = limit > 0 ? Math.round(((limit - total) / limit) * 100) : 0;
  const dailyAverage = nights ? total / nights : total;

  // Donut segments (circumference normalised to 100 via r=15.915).
  let acc = 0;
  const segments = categories.map((category) => {
    const pct = total > 0 ? (category.value / total) * 100 : 0;
    const seg = { ...category, pct, offset: acc };
    acc += pct;
    return seg;
  });

  if (loading) {
    return <div className="mx-auto max-w-7xl px-6 py-16 text-center text-on-surface-variant">Loading your budget…</div>;
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-16 text-center">
        <p className="text-error font-semibold">Couldn’t load your trips.</p>
        <p className="mt-2 text-on-surface-variant font-body-md">{error}</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <Compass size={48} className="mx-auto text-outline" />
        <h2 className="mt-4 font-headline-lg text-headline-lg-mobile text-on-surface">No itinerary yet</h2>
        <p className="mt-2 text-on-surface-variant font-body-md">Plan a trip and hit “Create Itinerary” to see your budget here.</p>
        <Link to="/planner" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-label-md text-on-primary hover:bg-primary-container transition-colors">
          Go to Planner <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-16 py-10">
      {/* Title */}
      <div className="mb-12">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">{trip.destination} Budget Analysis</h1>
        <p className="text-on-surface-variant font-body-md">
          {nights ? `Managing your ${nights}-day exploration of ${trip.destination}.` : `Your itinerary for ${trip.destination}.`}
        </p>
        {Array.isArray(trip.places) && trip.places.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {trip.places.map((place) => (
              <span key={place.id || place.name} className="rounded-full bg-surface-container px-3 py-1 text-caption text-on-surface-variant">{place.name}</span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
        {/* Donut + legend */}
        <div className="md:col-span-5 bg-surface-container-lowest p-8 rounded-xl border border-outline-variant flex flex-col items-center">
          <h3 className="font-title-md text-title-md mb-8 self-start">Spending Categories</h3>
          <div className="relative w-64 h-64 mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              {segments.map((seg) => (
                <circle
                  key={seg.key}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="4"
                  strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                  strokeDashoffset={-seg.offset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display-lg text-headline-lg">{formatCurrency(total, currency)}</span>
              <span className="text-caption font-caption uppercase tracking-wider text-on-surface-variant">Total Spent</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full">
            {categories.map((category) => (
              <div key={category.key} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: category.color }} />
                <span className="font-label-md text-label-md truncate">{category.label} ({formatCurrency(category.value, currency)})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action card + mini insights */}
        <div className="md:col-span-7 flex flex-col gap-6">
          <div className="bg-primary-container text-on-primary-container p-10 rounded-xl relative overflow-hidden flex-1">
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h2 className="font-headline-lg text-headline-lg mb-2">Ready to Lock Your Trip?</h2>
                <p className="font-body-lg text-body-lg opacity-90 mb-8 max-w-md">Bundle your flights and lodging now to secure today’s prices for your {trip.destination} itinerary.</p>
              </div>
              <button type="button" className="bg-surface text-primary font-label-md px-8 py-4 rounded-lg self-start shadow-md hover:bg-surface-bright transition-all active:scale-95 flex items-center gap-2">
                Book Now <ArrowRight size={18} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant">
              <PiggyBank size={24} className="text-primary mb-1" />
              <p className="font-label-md text-label-md text-on-surface-variant">Daily Average</p>
              <p className="font-title-md text-title-md text-on-surface">{formatCurrency(dailyAverage, currency)}{nights ? '/day' : ''}</p>
            </div>
            <div className="bg-surface-container p-6 rounded-xl border border-outline-variant">
              <TrendingDown size={24} className="text-secondary mb-1" />
              <p className="font-label-md text-label-md text-on-surface-variant">Potential Savings</p>
              <p className="font-title-md text-title-md text-on-surface">{savingsPct}% Under</p>
            </div>
          </div>
        </div>
      </div>

      {/* Expense Log */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
        <div className="px-8 py-6 border-b border-outline-variant flex justify-between items-center">
          <h3 className="font-title-md text-title-md">Expense Log</h3>
          <button type="button" className="text-primary font-label-md flex items-center gap-1 hover:underline">
            <Download size={18} /> Export CSV
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low text-on-surface-variant">
              <tr>
                <th className="px-8 py-4 font-label-md text-label-md">Category</th>
                <th className="px-8 py-4 font-label-md text-label-md">Dates</th>
                <th className="px-8 py-4 font-label-md text-label-md text-right">Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {categories.map((category) => (
                <tr key={category.key} className="hover:bg-surface-bright transition-colors">
                  <td className="px-8 py-4">
                    <span className={`${category.badge} px-2 py-1 rounded-full font-caption text-caption`}>{category.label}</span>
                  </td>
                  <td className="px-8 py-4 text-on-surface-variant font-body-md">
                    {trip.startDate ? new Date(trip.startDate).toLocaleDateString() : '—'}
                    {trip.endDate ? ` – ${new Date(trip.endDate).toLocaleDateString()}` : ''}
                  </td>
                  <td className="px-8 py-4 text-right font-body-md font-bold">{formatCurrency(category.value, currency)}</td>
                </tr>
              ))}
              <tr className="bg-surface-container-low">
                <td className="px-8 py-4 font-title-md" colSpan={2}>Total</td>
                <td className="px-8 py-4 text-right font-title-md text-primary">{formatCurrency(total, currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default BudgetPage;
