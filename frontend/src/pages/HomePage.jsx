import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  Settings,
  Compass,
  Calendar,
  CheckCircle,
  ShieldCheck,
  Plane,
  ArrowRight,
  Heart,
  Map,
  MapPin,
  CreditCard,
  Users,
  CloudOff,
  User,
} from 'lucide-react';
import UserMenu from '../components/UserMenu';

function HomePage({ user, onLogout }) {
  const navigate = useNavigate();
  const [destination, setDestination] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const geoapifyApiKey = import.meta.env.VITE_GEOAPIFY_API_KEY;

  // Debounced Geoapify location autocomplete.
  useEffect(() => {
    if (!geoapifyApiKey || selectedPlace) return undefined;
    const query = destination.trim();
    if (query.length < 3) {
      setSuggestions([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&type=city&format=json&limit=5&apiKey=${geoapifyApiKey}`);
        const data = await response.json();
        setSuggestions(data.results ?? []);
        setShowSuggestions(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [destination, selectedPlace, geoapifyApiKey]);

  const selectSuggestion = (suggestion) => {
    setSelectedPlace({
      name: suggestion.city || suggestion.name || suggestion.formatted,
      lat: suggestion.lat,
      lon: suggestion.lon,
      countryCode: suggestion.country_code,
    });
    setDestination(suggestion.city || suggestion.formatted);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const calculateStay = () => {
    if (!dateFrom || !dateTo) return '';
    const from = new Date(dateFrom);
    const to = new Date(dateTo);
    const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days` : '';
  };

  const handleStartPlanning = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedPlace) {
      params.set('dest', selectedPlace.name);
      params.set('lat', String(selectedPlace.lat));
      params.set('lon', String(selectedPlace.lon));
      if (selectedPlace.countryCode) params.set('country', selectedPlace.countryCode);
    } else if (destination.trim()) {
      params.set('dest', destination.trim());
    }
    if (dateFrom) params.set('from', dateFrom);
    if (dateTo) params.set('to', dateTo);
    const queryString = params.toString();
    navigate(queryString ? `/planner?${queryString}` : '/planner');
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-body-md">
      {/* Top Navigation */}
      <header className="bg-surface sticky top-0 z-50">
        <nav className="flex justify-between items-center w-full px-6 md:px-16 py-2 max-w-7xl mx-auto">
          <div className="flex items-center gap-16">
            <span className="font-display-lg text-display-lg font-extrabold text-primary cursor-pointer">VoyagePlan</span>
            <div className="hidden md:flex items-center gap-10">
              <Link to="/planner" className="font-body-md text-body-md text-primary border-b-2 border-primary pb-1">Plan</Link>
              {user ? (
                <Link to="/my-trips" className="font-body-md text-body-md text-on-surface-variant hover:text-primary-container transition-colors">My Trips</Link>
              ) : null}
              <a className="font-body-md text-body-md text-on-surface-variant hover:text-primary-container transition-colors" href="#">Explore</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-150" aria-label="Notifications">
                  <Bell size={24} />
                </button>
                <button className="p-2 text-on-surface-variant hover:text-primary transition-colors active:scale-95 duration-150" aria-label="Settings">
                  <Settings size={24} />
                </button>
              </>
            ) : null}
            <UserMenu user={user} onLogout={onLogout} />
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-[10s]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDfZqwHkLE7P2XAYButqjWa09eEJT2AVI9_ECIiyE8_05GFNyUaBSxdOgZsVxYGPfuJ8BcPbX0W6HIujaAdzyxCiv0GZrQ-Bh3-mrHuOPh9tWkn74fLnMr7L6dNQZ8-5Gn_z2iCs3mwn1FzayqXeQdJTKie8MfRdzup8m3E26tyNP3YsoUNIBFygMHYWMdgpfW4Q6UpHi_jC1zcB0jDEgOD8V6wIFf8Mr5wHEoilDqLrF_XsdvzaJbqd6WXMaw4EmeKNDaiW391fPg" alt="Hero" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/90"></div>
          </div>

          <div className="relative z-10 w-full max-w-7xl px-6 md:px-16 text-center">
            <h1 className="text-5xl md:text-7xl font-display-lg font-extrabold text-white drop-shadow-lg mb-10 max-w-4xl mx-auto leading-tight">
              Your Story, <span className="text-secondary-container">Our Map.</span>
            </h1>

            <form onSubmit={handleStartPlanning} className="relative bg-white/90 backdrop-blur-xl max-w-3xl mx-auto p-2 rounded-2xl shadow-2xl flex flex-col md:flex-row md:items-stretch gap-2 mb-10">
              {/* Destination with autocomplete */}
              <div className="relative flex-1 min-w-0">
                <div className="flex items-center gap-3 px-4 py-3 h-full">
                  <Compass size={22} className="text-primary shrink-0" />
                  <input
                    className="w-full min-w-0 bg-transparent border-none focus:ring-0 text-lg placeholder:text-outline/60 outline-none"
                    placeholder="Where to?"
                    type="text"
                    autoComplete="off"
                    value={destination}
                    onChange={(e) => { setDestination(e.target.value); setSelectedPlace(null); }}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="flex items-center gap-2 px-4 py-3 min-w-0 border-t border-outline-variant md:border-t-0 md:border-l">
                <Calendar size={20} className="text-primary shrink-0" />
                <input type="date" aria-label="From date" className="w-full min-w-0 bg-transparent border-none focus:ring-0 text-base placeholder:text-outline/60 outline-none" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div className="flex items-center gap-2 px-4 py-3 min-w-0 border-t border-outline-variant md:border-t-0 md:border-l">
                <Calendar size={20} className="text-primary shrink-0" />
                <input type="date" aria-label="To date" className="w-full min-w-0 bg-transparent border-none focus:ring-0 text-base placeholder:text-outline/60 outline-none" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>

              <button type="submit" className="shrink-0 bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md hover:bg-primary-container transition-all active:scale-95 whitespace-nowrap">
                Start Planning
              </button>

              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute left-2 right-2 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-outline-variant bg-white text-left shadow-xl">
                  {suggestions.map((s) => (
                    <li key={s.place_id || `${s.lat}-${s.lon}`}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSuggestion(s)}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors"
                      >
                        <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-on-surface">{s.city || s.name || s.formatted}</span>
                          <span className="block truncate text-caption text-on-surface-variant">{s.formatted}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </form>

            {calculateStay() && <p className="text-white/90 font-semibold mb-4">Length of stay: {calculateStay()}</p>}

            <div className="mt-10 flex justify-center gap-10 text-white/90 flex-wrap">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} />
                <span className="font-label-md">1.2M+ Active Trips</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} />
                <span className="font-label-md">Verified Itineraries</span>
              </div>
            </div>
          </div>
        </section>

        {/* Trending Destinations */}
        <section className="py-16 max-w-7xl mx-auto px-6 md:px-16">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Trending Destinations</h2>
              <p className="font-body-md text-on-surface-variant mt-1">Voted by our community of world travelers.</p>
            </div>
            <Link to="/planner" className="text-primary font-label-md flex items-center gap-1 hover:gap-2 transition-all">
              View All Destinations <ArrowRight size={18} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Tokyo, Japan', category: 'Adventure', desc: 'From neon skylines to serene temples, experience the future and past in one city.', price: '$840', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBbR5zUALkAVvVFlIcx1Cyokg07i9n9yL2nBFEPxhhiHCWMAlfdID1SNuJlCLnpmhDsKkhbOeVSyxDyIZL7x3R1fKhI1GzxW_gicUxESw19di4cEFR3sIUSwUpUAVHa5kHDIuoC3knkweZBze5pmzxZi1lUUWeB0nyjP3WKaNb3HHng8yh6bCTrB6IcJvwECMEmTH1Kn2sqEFRLpD0SgQ-_hOaoVqr1uuU3zp7Um4ehPYC5sAS8eHS-qw4ibNSyWdR1MyCY-kxn6JE', catBg: 'bg-primary-container', catText: 'text-on-primary-container' },
              { name: 'Paris, France', category: 'Culture', desc: 'The city of lights awaits with art, culinary wonders, and romantic cobblestone streets.', price: '$620', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpIqjdCSRDJ3ocYFtjeFtQJku7KNwfj9_C5mOwYsPRbeqXhnGCrk3KQjlguItxu9uOQQky58Obwy6sMpx6XF6xrg1GQcitNeE4016sTn2rMR3Hjrbqi3G6hRbvTSb3nXvKZiG9eCIr253VcRFYwmp6cdtxVbFTTdGHO8Pyn8EHS-pAyH8BzgAanvlVsGEOBkOv97fS54WbplZL8kflAOktCj1n0f39AF5-gWpN1aUbhRBjUPZCgCeEwWpxUvcLjojIuoDTxCuRBG8', catBg: 'bg-surface-container-highest', catText: 'text-on-surface-variant' },
              { name: 'New York, USA', category: 'Urban', desc: 'The world\'s concrete jungle where every corner tells a story of ambition and life.', price: '$450', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAk26W5uRbonD4tXjZKditDrqJ9g4g6-nneTGm4oz61d4E9FbhCXVISyLvH6sUmKvWvWJ_SfdgKPf47D7Ftsyk_rPswrUPs2jiyu-E4BZUaFnkF-non8WsEbuWz2NzgWs3GBeNl4WMTx4MRXzC5lnAPRMwStSgMruCSo3D1HuXYv0LVMPTXOe91jaRSoBE1rZ0HBoBn9WZdabaIwJB9eDjwbwv_0ZMbDihl93kcTdBHI_JUFnzo7rUI7gQL2drZzpbsa0OmxQOW-Rk', catBg: 'bg-tertiary-container', catText: 'text-on-tertiary-container' },
            ].map((dest, idx) => (
              <div key={idx} className="group relative bg-white rounded-2xl overflow-hidden border border-outline-variant hover:shadow-lg transition-all duration-300">
                <div className="h-80 overflow-hidden">
                  <img className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" src={dest.img} alt={dest.name} />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-title-md text-title-md">{dest.name}</h3>
                    <span className={`${dest.catBg} ${dest.catText} px-3 py-1 rounded-full font-caption text-caption`}>{dest.category}</span>
                  </div>
                  <p className="font-body-md text-on-surface-variant mb-6">{dest.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-secondary font-label-md flex items-center gap-1">
                      <Plane size={16} /> From {dest.price}
                    </span>
                    <button className="w-10 h-10 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container transition-colors group/heart" aria-label={`Save ${dest.name}`}>
                      <Heart size={18} className="transition-colors group-hover/heart:fill-error group-hover/heart:text-error" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-6 md:px-16">
            <div className="text-center mb-12">
              <h2 className="font-headline-lg text-headline-lg text-on-surface">Plan Better, Travel More</h2>
              <p className="font-body-lg text-on-surface-variant">Intelligent tools for the modern explorer.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 min-h-[600px]">
              <div className="md:col-span-2 md:row-span-2 bg-primary text-on-primary p-10 rounded-2xl flex flex-col justify-end relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-20 transform group-hover:scale-110 transition-transform duration-700">
                  <Map size={120} fill="currentColor" />
                </div>
                <h3 className="font-display-lg text-4xl font-bold mb-4 relative z-10">Smart Itineraries</h3>
                <p className="font-body-lg opacity-90 max-w-sm mb-6 relative z-10">Our AI analyzes thousands of routes to suggest the most efficient and scenic journeys based on your interests.</p>
                <button className="bg-white text-primary px-8 py-3 rounded-lg font-label-md hover:bg-primary-container hover:text-white transition-colors w-fit relative z-10">Try it now</button>
              </div>

              <div className="md:col-span-2 bg-white border border-outline-variant p-6 rounded-2xl flex gap-6 items-center group hover:border-primary transition-colors">
                <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center text-secondary shrink-0 group-hover:rotate-12 transition-transform">
                  <CreditCard size={32} />
                </div>
                <div>
                  <h3 className="font-title-md mb-1">Budget Optimization</h3>
                  <p className="font-body-md text-on-surface-variant">Real-time cost tracking and currency conversion to keep your adventure on track.</p>
                </div>
              </div>

              <div className="bg-white border border-outline-variant p-6 rounded-2xl group hover:border-primary transition-colors">
                <Users size={28} className="text-primary mb-3" />
                <h3 className="font-title-md mb-1">Collaborative</h3>
                <p className="font-caption text-on-surface-variant">Share and edit plans with friends in real-time.</p>
              </div>

              <div className="bg-white border border-outline-variant p-6 rounded-2xl group hover:border-primary transition-colors">
                <CloudOff size={28} className="text-primary mb-3" />
                <h3 className="font-title-md mb-1">Offline Access</h3>
                <p className="font-caption text-on-surface-variant">Take your maps and details anywhere, even without signal.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-inverse-surface text-inverse-on-surface py-16">
        <div className="max-w-7xl mx-auto px-6 md:px-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 pb-12 border-b border-white/20">
            <div>
              <h2 className="font-display-lg text-3xl font-extrabold text-inverse-primary mb-3">VoyagePlan</h2>
              <p className="text-on-surface-variant font-body-md">Crafting unforgettable journeys since 2024. Your adventure starts with a single click.</p>
            </div>
            <div>
              <h4 className="font-label-md text-white mb-4">Product</h4>
              <ul className="space-y-2 text-on-surface-variant font-body-md">
                <li><a href="#" className="hover:text-inverse-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-inverse-primary transition-colors">Mobile App</a></li>
                <li><a href="#" className="hover:text-inverse-primary transition-colors">Itineraries</a></li>
                <li><a href="#" className="hover:text-inverse-primary transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-label-md text-white mb-4">Support</h4>
              <ul className="space-y-2 text-on-surface-variant font-body-md">
                <li><a href="#" className="hover:text-inverse-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-inverse-primary transition-colors">Safety Tips</a></li>
                <li><a href="#" className="hover:text-inverse-primary transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-inverse-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-label-md text-white mb-4">Newsletter</h4>
              <p className="text-on-surface-variant font-caption mb-4">Get travel inspiration delivered weekly.</p>
              <div className="flex gap-2">
                <input className="flex-1 bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-inverse-primary placeholder:text-white/30" placeholder="Email address" type="email" />
                <button className="bg-inverse-primary text-on-primary-fixed px-4 py-2 rounded-lg font-label-md hover:bg-white transition-colors">Join</button>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-on-surface-variant font-caption">
            <p>© 2024 VoyagePlan Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-inverse-primary transition-colors">Twitter</a>
              <a href="#" className="hover:text-inverse-primary transition-colors">Instagram</a>
              <a href="#" className="hover:text-inverse-primary transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-3 py-2 pb-4 bg-surface border-t border-outline-variant shadow-md rounded-t-2xl">
        <Link to="/planner" className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 transition-all">
          <Compass size={22} />
          <span className="font-label-md text-xs">Plan</span>
        </Link>
        <Link to="/budget" className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-all">
          <Map size={22} />
          <span className="font-label-md text-xs">Itinerary</span>
        </Link>
        <a href="#" className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-all">
          <CreditCard size={22} />
          <span className="font-label-md text-xs">Budget</span>
        </a>
        <a href="#" className="flex flex-col items-center justify-center text-on-surface-variant hover:bg-surface-variant transition-all">
          <User size={22} />
          <span className="font-label-md text-xs">Profile</span>
        </a>
      </nav>
    </div>
  );
}

export default HomePage;
