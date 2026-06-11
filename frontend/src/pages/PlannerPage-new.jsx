import { useEffect, useRef, useState } from 'react';
import { Trash2, ZoomIn, ZoomOut, Navigation, Search } from 'lucide-react';

const poiData = [
  {
    id: 'shibuya',
    name: 'Shibuya Crossing',
    icon: 'location_on',
    description: "The world's busiest pedestrian intersection.",
    image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&q=80&w=100',
    position: { top: '60%', left: '35%' },
  },
  {
    id: 'sensoji',
    name: 'Senso-ji Temple',
    icon: 'temple_buddhist',
    description: "Tokyo's oldest and most significant temple.",
    image: 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&q=80&w=100',
    position: { top: '25%', left: '65%' },
  },
  {
    id: 'tsukiji',
    name: 'Tsukiji Market',
    icon: 'restaurant',
    description: 'Famous outer market for fresh seafood and sushi.',
    image: 'https://images.unsplash.com/photo-1534483909716-d44943269d41?auto=format&fit=crop&q=80&w=100',
    position: { top: '55%', left: '58%' },
  },
];

function PlannerPage({ togglePlace, selectedPlaces, currency, setCurrency, fxRate, places = [], addPlace }) {
  const [openPopupId, setOpenPopupId] = useState(null);

  const handleAddPlace = (poi) => {
    const newPlace = {
      id: poi.id,
      name: poi.name,
      city: 'Tokyo',
      area: poi.description,
      category: poi.id === 'shibuya' ? 'iconic' : poi.id === 'sensoji' ? 'culture' : 'food',
      lat: 35.6895,
      lng: 139.6917,
      baseCost: 85,
      flightEstimate: 420,
      foodEstimate: 30,
      activityEstimate: 15,
      image: poi.image,
    };
    addPlace(newPlace);
    setOpenPopupId(null);
  };

  const handleRemovePlace = (id) => {
    togglePlace(id);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar */}
      <aside className="w-full md:w-96 bg-white border-r border-outline-variant flex flex-col z-40 flex-shrink-0">
        {/* Header */}
        <div className="p-6 border-b border-outline-variant">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-on-surface">Selected Places</h2>
            <span className="bg-primary-container text-on-primary-container text-xs font-bold px-3 py-1 rounded-full">
              {selectedPlaces.length}
            </span>
          </div>
          <p className="text-on-surface-variant text-sm mb-4">Plan your Tokyo adventure by selecting points of interest from the map.</p>
          <div className="flex gap-2 overflow-x-auto pb-2">
            <span className="bg-surface-container-highest text-on-surface-variant text-xs px-3 py-1 rounded-full whitespace-nowrap">Adventure</span>
            <span className="bg-surface-container-highest text-on-surface-variant text-xs px-3 py-1 rounded-full whitespace-nowrap">Culture</span>
            <span className="bg-surface-container-highest text-on-surface-variant text-xs px-3 py-1 rounded-full whitespace-nowrap">Food</span>
          </div>
        </div>

        {/* Places List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {selectedPlaces.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
              <span className="text-6xl mb-3">🗺️</span>
              <p className="font-semibold text-on-surface">No places selected yet</p>
              <p className="text-xs text-on-surface-variant">Click on map markers to add them to your trip itinerary.</p>
            </div>
          ) : (
            selectedPlaces.map((place) => (
              <div key={place.id} className="bg-white p-4 rounded-xl border border-outline-variant flex items-center gap-4 hover:shadow-md transition-shadow">
                <img src={place.image} alt={place.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-on-surface truncate">{place.name}</h4>
                  <p className="text-xs text-on-surface-variant">Added to itinerary</p>
                </div>
                <button
                  onClick={() => handleRemovePlace(place.id)}
                  className="text-outline hover:text-error transition-colors p-2 rounded-full hover:bg-error-container"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer Button */}
        <div className="p-6 bg-surface-container-low border-t border-outline-variant">
          <button className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-sm">
            <span>Create Itinerary</span>
            <span>→</span>
          </button>
        </div>
      </aside>

      {/* Map Section */}
      <section className="flex-1 relative bg-gray-200 overflow-hidden">
        {/* Map Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-300">
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzHICAQDScuiNFq2fC1fLXQxTOG1ePQxwyCAJ8Qja2j43LF56UEXlNEfOXs_xOARejv1PhKtFj-x9oKuJ1mQW3z0gXCrBRGnktEe425x6Bjv2JuakShro7Xtv4zQ2U08-o10UWUT5cg1iUFdHaPZb5b3j3brLAr0fzLCbP63I8DaLPHWgHCOwgiZWprpO1zEfj0FAFjkhLS7tJnEaXXaqFBAYX0t2W4cadVF_D07EkzF7AiM0KdIwf2DYt_4ij99OIliZiL7YF0vw"
            alt="Tokyo Map"
          />
        </div>

        {/* Interactive Layer */}
        <div className="absolute inset-0 z-10 p-6">
          {/* POI Markers */}
          {poiData.map((poi) => (
            <div
              key={poi.id}
              className="absolute group"
              style={{ top: poi.position.top, left: poi.position.left, transform: 'translate(-50%, -50%)' }}
            >
              {/* Marker Button */}
              <button
                onClick={() => setOpenPopupId(openPopupId === poi.id ? null : poi.id)}
                className="bg-white text-primary p-2 rounded-full shadow-lg border-2 border-primary hover:bg-primary hover:text-white transition-all active:scale-90 relative z-20"
              >
                <MapPin size={20} />
              </button>

              {/* Popup */}
              {openPopupId === poi.id && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 w-72 bg-white rounded-xl shadow-2xl border border-outline-variant overflow-hidden z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <img className="w-full h-32 object-cover" src={poi.image} alt={poi.name} />
                  <div className="p-4">
                    <h3 className="font-semibold text-on-surface mb-1">{poi.name}</h3>
                    <p className="text-xs text-on-surface-variant mb-4">{poi.description}</p>
                    <button
                      onClick={() => handleAddPlace(poi)}
                      className="w-full bg-primary text-on-primary py-2 rounded-lg font-semibold text-sm hover:bg-primary-container transition-all"
                    >
                      Add to Trip
                    </button>
                  </div>
                  {/* Arrow */}
                  <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-outline-variant"></div>
                </div>
              )}
            </div>
          ))}

          {/* Floating Controls */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-2 z-30">
            <button className="bg-white w-12 h-12 flex items-center justify-center rounded-lg shadow-lg border border-outline-variant hover:bg-surface-container transition-all active:scale-95">
              <ZoomIn size={20} className="text-primary" />
            </button>
            <button className="bg-white w-12 h-12 flex items-center justify-center rounded-lg shadow-lg border border-outline-variant hover:bg-surface-container transition-all active:scale-95">
              <ZoomOut size={20} className="text-primary" />
            </button>
            <button className="bg-primary text-on-primary w-12 h-12 flex items-center justify-center rounded-full shadow-lg hover:bg-primary-container transition-all active:scale-95">
              <Navigation size={20} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PlannerPage;
