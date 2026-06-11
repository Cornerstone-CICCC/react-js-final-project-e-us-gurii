import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2, Plus, Compass, PiggyBank } from 'lucide-react';
import { getMyTrips, deleteTrip } from '../lib/api';
import { formatCurrency } from '../lib/pricing';

function formatRange(trip) {
  if (!trip.startDate) return '—';
  const from = new Date(trip.startDate).toLocaleDateString();
  const to = trip.endDate ? new Date(trip.endDate).toLocaleDateString() : null;
  return to ? `${from} – ${to}` : from;
}

function MyTripsPage({ token }) {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getMyTrips(token);
        if (!cancelled) setTrips([...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [token]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this trip? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      await deleteTrip(id, token);
      setTrips((current) => current.filter((trip) => trip.id !== id));
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 md:px-16 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">My Trips</h1>
          <p className="text-on-surface-variant font-body-md mt-1">All your saved itineraries.</p>
        </div>
        <Link to="/planner" className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-label-md text-on-primary hover:bg-primary-container transition-colors">
          <Plus size={18} /> New Trip
        </Link>
      </div>

      {error ? <p className="mb-4 rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container">{error}</p> : null}

      {loading ? (
        <p className="py-16 text-center text-on-surface-variant">Loading your trips…</p>
      ) : trips.length === 0 ? (
        <div className="py-24 text-center">
          <Compass size={48} className="mx-auto text-outline" />
          <h2 className="mt-4 font-headline-lg text-headline-lg-mobile text-on-surface">No trips yet</h2>
          <p className="mt-2 text-on-surface-variant font-body-md">Plan a trip and create an itinerary to see it here.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low text-on-surface-variant">
                <tr>
                  <th className="px-6 py-4 font-label-md text-label-md">Destination</th>
                  <th className="px-6 py-4 font-label-md text-label-md">Dates</th>
                  <th className="px-6 py-4 font-label-md text-label-md">Places</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-right">Total</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {trips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-surface-bright transition-colors">
                    <td className="px-6 py-4 font-body-md font-semibold text-on-surface">{trip.destination}</td>
                    <td className="px-6 py-4 text-on-surface-variant font-body-md">{formatRange(trip)}</td>
                    <td className="px-6 py-4 text-on-surface-variant font-body-md">{Array.isArray(trip.places) ? trip.places.length : 0}</td>
                    <td className="px-6 py-4 text-right font-body-md font-bold">{formatCurrency(trip.totalCost || 0, trip.currency)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/budget/${trip.id}`}
                          aria-label={`Budget for ${trip.destination}`}
                          className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                        >
                          <PiggyBank size={18} />
                        </Link>
                        <Link
                          to={`/trips/${trip.id}`}
                          aria-label={`View ${trip.destination}`}
                          className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
                        >
                          <Eye size={18} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(trip.id)}
                          disabled={deletingId === trip.id}
                          aria-label={`Delete ${trip.destination}`}
                          className="w-9 h-9 flex items-center justify-center rounded-full border border-outline-variant text-on-surface-variant hover:bg-error-container hover:text-error transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

export default MyTripsPage;
