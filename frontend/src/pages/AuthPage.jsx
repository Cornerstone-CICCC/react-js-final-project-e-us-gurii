import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight, Globe, ChevronDown } from 'lucide-react';
import { registerUser, loginUser, createTrip } from '../lib/api';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="w-5 h-5 fill-on-surface" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.05 20.28c-.96 0-2.04-.6-3.23-.6-1.16 0-2.21.57-3.11.57-1.3 0-2.91-1.48-4.04-3.56-1.12-2.06-1.63-4.21-1.63-6.18 0-3.12 2.05-4.78 4.02-4.78 1.02 0 1.94.61 2.62.61.64 0 1.7-.66 2.88-.66 1.48 0 2.65.6 3.42 1.73-3.08 1.63-2.58 5.61.54 6.75-.82 2.11-1.87 4.19-3.47 6.52zm-3.29-16.14c0 1.11-.94 2.13-2.04 2.13-1.22 0-2.11-1.15-2.11-2.2 0-1.03.96-2.14 2.04-2.14 1.14 0 2.11 1.17 2.11 2.21z" />
    </svg>
  );
}

function AuthPage({ user, onLogin, navigate }) {
  const location = useLocation();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/planner" replace />;

  const afterLogin = async (authToken) => {
    // If the user came here mid "Create Itinerary", finish saving that trip now.
    const pending = localStorage.getItem('voyageplan-pending-trip');
    if (pending) {
      try {
        await createTrip(JSON.parse(pending), authToken);
      } catch (err) {
        console.error('Could not save pending trip:', err);
      }
      localStorage.removeItem('voyageplan-pending-trip');
      navigate('/budget');
      return;
    }
    navigate(location.state?.from || '/planner');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'signup') {
        await registerUser({ name: form.name || 'Traveler', email: form.email, password: form.password });
      }
      const data = await loginUser({ email: form.email, password: form.password });
      onLogin(data.token, data.user);
      await afterLogin(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const socialLogin = () => setError('Social sign-in isn’t available yet — please use your email and password.');

  const isLogin = mode === 'login';

  return (
    <main className="flex flex-col md:flex-row min-h-screen w-full overflow-hidden">
      {/* Hero Side (Desktop only) */}
      <section className="hidden md:flex relative md:w-1/2 lg:w-7/12 items-center justify-center overflow-hidden">
        <img
          alt="Tropical travel destination"
          className="absolute inset-0 w-full h-full object-cover scale-105"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYKoTC2VBjfb_4nmWW_Xb7nauYqZPGWpQjJzPUduLKwZsHnguVF2X5DdYTptUSkzIuY8wK_kewNHYOgpMGFA6p3-h0-c5ZvbAssatl_Y3uaj6ovwCwA0XDAKwDA4QSGn5X1PiF85LFBD-XsEg6AmnpLU3hzvYKCv08GDJZLBV6bNiccz0LJM4s2TVrMYMty1-qzWc32Wk3ii5CQv9toXpgvWfHxKhgAJA32PmbtCJDAeNfjLtSXjR8egt0P04EgXtBQcrWvq8drbE"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,28,48,0.4) 0%, rgba(11,28,48,0) 50%, rgba(11,28,48,0.7) 100%)' }} />

        <div className="relative z-10 p-16 max-w-xl text-white">
          <h1 className="font-display-lg text-display-lg mb-6 leading-tight text-white">
            Start your next <span className="text-secondary-fixed">extraordinary</span> journey.
          </h1>
          <p className="font-body-lg text-body-lg text-white/90 mb-10">
            VoyagePlan helps you organize chaotic ideas into structured, trustworthy itineraries with high-end tools for the modern traveler.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-3">
              <img className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="Traveler" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTrXlLQGQb1J6dBfK4aXW-yU3vmdU2nfLrNS8XsXbk6zDJoxvbdprRuCK3-Ob9fJjB3OgJP1yWCkHcrtwlrKA6uEhIOJisWK80vzz5-56x-gurU1W_WrSnWgTahbYq2fTQI2kLDgwyGhyWRuiYNwWtunV6uzMNWAA2FIBQyp2glFU3WxR3zWZH_lfNtKT-6VAzLyDaPxskgrezNvfbLD6HMvgBD3hyN9ZCd6dUYCmDET0jiA8YUQOHPnsfTGJ7fCvpcHv9B8F6w0Y" />
              <img className="w-10 h-10 rounded-full border-2 border-white object-cover" alt="Traveler" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCcMcZBmD1EhXWhaixBQIqHJSNZAg-cbOoqCfV9DXceYvlfKT5prW0buf6teFjDfn1a8Ezn80ih_owO9sj5s0TIefldno6s5L5ELhp8kynQuc3zi8GBJBt8tSC3DmLNTPcHiNX8mAdE0TNEgyj_rke2Oy--qGTphZ9hCr_pCVDyi6BpNzblQU02HtpCzhQNJSnP7o-PeomD5Jp-96umSLSXyE6sd3SrLwFB9cYqVkjaZdQddrL5W0Y5P-BbQY3BeSGOCc6stMIZcc4" />
              <div className="w-10 h-10 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center font-label-md text-[10px]">+12k</div>
            </div>
            <span className="font-label-md text-label-md text-white">Joined by explorers worldwide</span>
          </div>
        </div>

        {/* Branding overlay */}
        <div className="absolute top-6 left-6 z-20 flex items-center gap-1">
          <Compass className="text-secondary-fixed" size={32} />
          <span className="font-display-lg text-headline-lg-mobile md:text-headline-lg text-white font-extrabold tracking-tight">VoyagePlan</span>
        </div>
      </section>

      {/* Form Side */}
      <section className="w-full md:w-1/2 lg:w-5/12 bg-surface flex flex-col items-center justify-center px-4 md:px-16 py-16 relative">
        {/* Mobile branding */}
        <div className="md:hidden w-full mb-10 flex items-center justify-center gap-1">
          <Compass className="text-primary" size={32} />
          <span className="font-display-lg text-headline-lg-mobile text-primary font-extrabold tracking-tight">VoyagePlan</span>
        </div>

        <div className="w-full max-w-md">
          <header className="mb-10">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-1">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {isLogin ? 'Log in to your account to continue planning.' : 'Sign up to start planning your next adventure.'}
            </p>
          </header>

          {error ? (
            <div className="mb-6 rounded-lg bg-error-container px-4 py-3 text-label-md text-on-error-container">{error}</div>
          ) : null}

          {/* Social login */}
          <div className="flex flex-col gap-2 mb-10">
            <button type="button" onClick={() => socialLogin('Google')} className="w-full flex items-center justify-center gap-3 py-2.5 px-6 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors duration-200">
              <GoogleIcon />
              <span className="font-label-md text-label-md text-on-surface">Continue with Google</span>
            </button>
            <button type="button" onClick={() => socialLogin('Apple')} className="w-full flex items-center justify-center gap-3 py-2.5 px-6 border border-outline-variant rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors duration-200">
              <AppleIcon />
              <span className="font-label-md text-label-md text-on-surface">Continue with Apple</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-10">
            <div className="flex-grow h-px bg-outline-variant" />
            <span className="font-caption text-caption text-outline uppercase tracking-widest">or {isLogin ? 'login' : 'sign up'} with email</span>
            <div className="flex-grow h-px bg-outline-variant" />
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="space-y-1">
                <label className="font-label-md text-label-md text-on-surface ml-1" htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Jane Traveler"
                  className="w-full px-6 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md"
                />
              </div>
            )}

            <div className="space-y-1">
              <label className="font-label-md text-label-md text-on-surface ml-1" htmlFor="email">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-6 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md"
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center ml-1">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                {isLogin && <a className="font-label-md text-label-md text-primary hover:underline transition-all" href="#">Forgot password?</a>}
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={20} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-body-md text-body-md"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
                className="w-5 h-5 rounded border-outline-variant text-primary focus:ring-primary/30 transition-all cursor-pointer"
              />
              <label className="font-body-md text-label-md text-on-surface-variant cursor-pointer select-none" htmlFor="remember">Remember me on this device</label>
            </div>

            <button type="submit" disabled={loading} className="w-full py-2.5 bg-primary text-white font-label-md text-label-md rounded-lg shadow-sm hover:bg-primary-container active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Please wait…' : (isLogin ? 'Sign In to VoyagePlan' : 'Create account')}
              {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <footer className="mt-16 text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" onClick={() => setMode(isLogin ? 'signup' : 'login')} className="text-primary font-label-md hover:underline">
                {isLogin ? 'Create an account' : 'Log in'}
              </button>
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-6 text-outline">
              <a className="font-caption text-caption hover:text-on-surface transition-colors" href="#">Privacy Policy</a>
              <a className="font-caption text-caption hover:text-on-surface transition-colors" href="#">Terms of Service</a>
              <a className="font-caption text-caption hover:text-on-surface transition-colors" href="#">Help Center</a>
            </div>
          </footer>
        </div>

        {/* Language picker */}
        <div className="absolute bottom-6 right-6 hidden lg:block">
          <button className="flex items-center gap-1 text-outline font-label-md hover:text-on-surface transition-colors">
            <Globe size={18} />
            English (US)
            <ChevronDown size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}

export default AuthPage;
