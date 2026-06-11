import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Map } from 'lucide-react';

function UserMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (event) => {
      if (ref.current && !ref.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!user) {
    return (
      <Link to="/auth" className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-on-primary transition hover:bg-primary-container">
        Sign in
      </Link>
    );
  }

  const initial = (user.name || user.email || '?').trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="User menu"
        className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold uppercase border-2 border-primary-container transition hover:bg-primary-container"
      >
        {initial}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-52 rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-outline-variant">
            <p className="text-body-md font-semibold text-on-surface truncate">{user.name}</p>
            <p className="text-caption text-on-surface-variant truncate">{user.email}</p>
          </div>
          <Link
            to="/my-trips"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-3 text-body-md text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <Map size={18} className="text-primary" /> My Trips
          </Link>
          <button
            type="button"
            onClick={() => { setOpen(false); onLogout(); }}
            className="flex w-full items-center gap-2 px-4 py-3 text-body-md text-error hover:bg-error-container transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default UserMenu;
