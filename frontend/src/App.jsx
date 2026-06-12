import { useEffect, useState } from 'react';
import { Link, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import PlannerPage from './pages/PlannerPage';
import BudgetPage from './pages/BudgetPage';
import MyTripsPage from './pages/MyTripsPage';
import UserMenu from './components/UserMenu';

// Guards routes that require a logged-in user.
function ProtectedRoute({ user, children }) {
  const location = useLocation();
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname + location.search }} replace />;
  return children;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('voyageplan-user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('voyageplan-token'));
  const [navOpen, setNavOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  // USD-based conversion rates for every supported currency, fetched once.
  const [rates, setRates] = useState({ USD: 1 });

  useEffect(() => {
    let cancelled = false;
    async function loadRates() {
      try {
        const response = await fetch('https://api.frankfurter.dev/v1/latest?base=USD');
        const data = await response.json();
        if (!cancelled) setRates({ USD: 1, ...(data.rates || {}) });
      } catch {
        if (!cancelled) setRates({ USD: 1 });
      }
    }
    loadRates();
    return () => { cancelled = true; };
  }, []);

  const handleLogin = (nextToken, nextUser) => {
    localStorage.setItem('voyageplan-token', nextToken);
    localStorage.setItem('voyageplan-user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('voyageplan-token');
    localStorage.removeItem('voyageplan-user');
    setToken(null);
    setUser(null);
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      {location.pathname !== '/' && location.pathname !== '/auth' && (
        <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <Link to="/" className="font-display-lg text-xl md:text-2xl font-extrabold tracking-tight text-primary">VoyagePlan</Link>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              <Link to="/" className="rounded-full px-4 py-2 text-sm text-on-surface-variant transition hover:bg-surface-container hover:text-primary">Home</Link>
              <Link to="/planner" className="rounded-full px-4 py-2 text-sm text-on-surface-variant transition hover:bg-surface-container hover:text-primary">Planner</Link>
            </div>
            <UserMenu user={user} onLogout={handleLogout} />
            <button type="button" className="md:hidden p-2 text-on-surface-variant" aria-label="Menu" onClick={() => setNavOpen((open) => !open)}>
              {navOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          {navOpen ? (
            <div className="absolute left-0 right-0 top-full z-50 flex flex-col gap-1 border-t border-outline-variant bg-surface px-4 py-3 shadow-md md:hidden">
              <Link to="/" onClick={() => setNavOpen(false)} className="rounded-lg px-3 py-2 text-body-md text-on-surface hover:bg-surface-container">Home</Link>
              <Link to="/planner" onClick={() => setNavOpen(false)} className="rounded-lg px-3 py-2 text-body-md text-on-surface hover:bg-surface-container">Planner</Link>
            </div>
          ) : null}
        </nav>
      )}

      <Routes>
        <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="/auth" element={<AuthPage user={user} onLogin={handleLogin} token={token} navigate={navigate} />} />
        <Route path="/planner" element={<PlannerPage currency={currency} setCurrency={setCurrency} rates={rates} token={token} navigate={navigate} />} />
        <Route
          path="/budget"
          element={(
            <ProtectedRoute user={user}>
              <BudgetPage token={token} />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/budget/:id"
          element={(
            <ProtectedRoute user={user}>
              <BudgetPage token={token} />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/my-trips"
          element={(
            <ProtectedRoute user={user}>
              <MyTripsPage token={token} />
            </ProtectedRoute>
          )}
        />
        <Route
          path="/trips/:id"
          element={(
            <ProtectedRoute user={user}>
              <PlannerPage currency={currency} setCurrency={setCurrency} rates={rates} token={token} navigate={navigate} />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </div>
  );
}

export default App;
