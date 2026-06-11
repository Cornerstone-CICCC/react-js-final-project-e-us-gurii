import { useEffect, useState } from 'react';
import { Link, Route, Routes, Navigate, useNavigate, useLocation } from 'react-router-dom';
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
  const [currency, setCurrency] = useState('USD');
  const [fxRate, setFxRate] = useState(1);

  useEffect(() => {
    async function loadRates() {
      try {
        const response = await fetch('https://api.frankfurter.app/latest?from=USD&to=CAD,EUR,BRL,JPY');
        const data = await response.json();
        const rate = data.rates?.[currency] ?? 1;
        setFxRate(rate);
      } catch {
        setFxRate(1);
      }
    }
    loadRates();
  }, [currency]);

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
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
          <Link to="/" className="font-display-lg text-2xl font-extrabold tracking-tight text-primary">VoyagePlan</Link>
          <div className="flex items-center gap-2">
            <Link to="/" className="rounded-full px-4 py-2 text-sm text-on-surface-variant transition hover:bg-surface-container hover:text-primary">Home</Link>
            <Link to="/planner" className="rounded-full px-4 py-2 text-sm text-on-surface-variant transition hover:bg-surface-container hover:text-primary">Planner</Link>
            <UserMenu user={user} onLogout={handleLogout} />
          </div>
        </nav>
      )}

      <Routes>
        <Route path="/" element={<HomePage user={user} onLogout={handleLogout} />} />
        <Route path="/auth" element={<AuthPage user={user} onLogin={handleLogin} token={token} navigate={navigate} />} />
        <Route path="/planner" element={<PlannerPage currency={currency} setCurrency={setCurrency} fxRate={fxRate} token={token} navigate={navigate} />} />
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
              <PlannerPage currency={currency} setCurrency={setCurrency} fxRate={fxRate} token={token} navigate={navigate} />
            </ProtectedRoute>
          )}
        />
      </Routes>
    </div>
  );
}

export default App;
