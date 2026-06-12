import { useState } from "react";

const PLACES_DATA = [
  {
    id: "shibuya",
    name: "Shibuya Crossing",
    description: "The world's busiest pedestrian intersection.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC417KuM-fDZdeuI8b-AO36qpXnrc93M43i_x3x1-ISU13SSn50rCmJTj_CKpUiZo-U4egVCJ1NswwGhzz9FvF-GMK4lWlDXgSz6lqwy93i9n5aEh6CSmYp3p_vvFLvu1GeU8mUS_O9ouLQZiLQT5mhNkKQmBx0NlWfT2UtBXSyO7Qu3_YbZvxbPvDLO3S6bC40tM6Ude1Lf9p2zCe1k7v6hXuoDzsWmz-s2KbTuT-7WUYUg15UcV3Z6eEvw4ZSzwoWfGByD8WMVxY",
    position: { top: "60%", left: "35%" },
    icon: "location_on",
  },
  {
    id: "sensoji",
    name: "Senso-ji Temple",
    description: "Tokyo's oldest and most significant temple.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB0mvSiTA2tBdkJ3A7VpuhekihPfTbEGA-Ck4s61iH0o7f310VEXoBR4CrqINU-nerv1l3acUA7bavE0mF-zH6mkj3pBffWMwhGL7MFvk_ooWP_QRuuHjR2X_c",
    position: { top: "25%", left: "65%" },
    icon: "temple_buddhist",
  },
  {
    id: "tsukiji",
    name: "Tsukiji Market",
    description: "Famous outer market for fresh seafood and sushi.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGOtGs3V4aRabk6wBMtBZnrKB_nGynMg8wV09RUkesMeF5HGiiQ2DEwumtMvXkTUAHm2LSKXpOGpeTFDNQfHbXu68jpjbhTqQSZMgAmEYkdbG5OklQMItYowfaazQJc7_fFA8tFOX_ey8C0gHJsQJblrTN7nR0csC_M8yJ01dVvet_S0NRtyI2ViQzhM1XMojywTf2RYyH4Rf48a5bmgYvAKV2R_wNI25DewhE0J1OgJ0pBffWMwhGL7MFvk_ooWP_QRuuHjR2X_c",
    position: { top: "55%", left: "58%" },
    icon: "restaurant",
  },
];

const PlaceCard = ({ place, onRemove }) => (
  <div className="bg-surface-container-lowest p-3 rounded-xl border border-outline-variant flex items-center gap-4 group animate-in fade-in slide-in-from-left-4 duration-300">
    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
      <img
        src={place.image}
        className="w-full h-full object-cover"
        alt={place.name}
      />
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-semibold text-on-surface truncate">{place.name}</h4>
      <p className="text-xs text-on-surface-variant">Added to itinerary</p>
    </div>
    <button
      onClick={() => onRemove(place.name)}
      className="text-outline hover:text-error transition-colors p-2 rounded-full hover:bg-error-container"
    >
      <span className="text-xl">✕</span>
    </button>
  </div>
);

const EmptyState = () => (
  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60 py-8">
    <div className="text-5xl">🗺️</div>
    <p className="font-semibold text-on-surface text-sm">
      No places selected yet
    </p>
    <p className="text-xs text-on-surface-variant">
      Click on map markers to add them to your trip itinerary.
    </p>
  </div>
);

const PlacePopup = ({ place, onAdd, onClose }) => {
  const handleAddClick = (e) => {
    e.stopPropagation(); // Evita fechar o popup ao clicar no botão
    onAdd(place.name);
    onClose();
  };

  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 sm:w-64 bg-surface rounded-xl shadow-xl border border-outline-variant overflow-hidden z-30"
      onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do popup feche ele mesmo
    >
      <img
        src={place.image}
        className="w-full h-24 sm:h-32 object-cover"
        alt={place.name}
      />
      <div className="p-3">
        <h3 className="font-semibold text-on-surface text-sm">{place.name}</h3>
        <p className="text-xs text-on-surface-variant mb-3 line-clamp-2">
          {place.description}
        </p>
        <button
          onClick={handleAddClick}
          className="w-full bg-primary text-on-primary py-2 rounded-lg font-semibold text-xs hover:bg-primary-container transition-all"
        >
          Add to Trip
        </button>
      </div>
      <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-4 h-4 bg-surface rotate-45 border-r border-b border-outline-variant"></div>
    </div>
  );
};

const MapMarker = ({ place, isSelected, openPopup }) => (
  <div className="absolute group" style={place.position}>
    <button
      onClick={(e) => {
        e.stopPropagation(); // Evita que o clique propague para o fundo do mapa
        openPopup(place.id);
      }}
      className={`p-2 rounded-full shadow-lg border-2 transition-all active:scale-90 ${
        isSelected
          ? "bg-primary text-on-primary border-primary scale-110"
          : "bg-surface text-primary border-primary hover:bg-primary hover:text-on-primary"
      }`}
    >
      <span className="text-base sm:text-lg">
        {place.icon === "location_on"
          ? "📍"
          : place.icon === "temple_buddhist"
            ? "⛩️"
            : "🍱"}
      </span>
    </button>
  </div>
);

export default function TokyoTravelPlanner() {
  const [selectedPlaces, setSelectedPlaces] = useState(new Set());
  const [openPopupId, setOpenPopupId] = useState(null);

  // Estado para controlar a aba ativa no Mobile ('map' ou 'list')
  const [activeTab, setActiveTab] = useState("map");

  const togglePopup = (id) => {
    setOpenPopupId(openPopupId === id ? null : id);
  };

  const addPlace = (placeName) => {
    if (selectedPlaces.has(placeName)) {
      alert("Place already added to your trip!");
      return;
    }
    const newSet = new Set(selectedPlaces);
    newSet.add(placeName);
    setSelectedPlaces(newSet);
  };

  const removePlace = (placeName) => {
    const newSet = new Set(selectedPlaces);
    newSet.delete(placeName);
    setSelectedPlaces(newSet);
  };

  return (
    <div className="h-screen flex flex-col bg-background text-on-surface font-body-md overflow-hidden pb-[64px] md:pb-0">
      {/* TopNavBar */}
      <nav className="bg-surface border-b border-outline-variant flex justify-between items-center w-full px-4 md:px-8 py-3 md:py-4 z-50">
        <div className="flex items-center gap-8">
          <span className="text-2xl md:text-3xl font-bold text-primary cursor-pointer">
            VoyagePlan
          </span>
          <div className="hidden md:flex items-center gap-6">
            <a className="text-primary border-b-2 border-primary pb-1 text-sm font-semibold cursor-pointer">
              Plan
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold cursor-pointer">
              Itinerary
            </a>
            <a className="text-on-surface-variant hover:text-primary transition-colors text-sm font-semibold cursor-pointer">
              Budget
            </a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center bg-surface-container rounded-full px-3 py-1 border border-outline-variant">
            <span className="text-on-surface-variant mr-2">🔍</span>
            <input
              className="bg-transparent border-none focus:ring-0 text-sm w-64 text-on-surface placeholder:text-on-surface-variant focus:outline-none"
              placeholder="Search Tokyo destinations..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="text-primary p-2 hover:bg-surface-container rounded-full transition-all">
              🔔
            </button>
            <button className="text-primary p-2 hover:bg-surface-container rounded-full transition-all">
              ⚙️
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary ml-1">
              <img
                alt="User profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3VI8shkclZRkgDuS00i6T71PwTfiwNt891DDzqSkFK53qq9Jh4WuxmpJ_29D1VUh8nv3Gqkqik4Dfsj6uQvLUFD7LjFg_1zuuWPa7zIAE1tZeR2F8eCcvAC7-5GMQGA_Y0Kon_0cJ6KrSIZeXCNjXGYEw3MzLMSYVBk6xerQUYQJmGeFSfGGYsJ0skqf56pz5hr9en9SewtJJTeraQAw0zNv2pPxzkDSuzOgP5-POfy6CJZl_L7WVuDXxtG76jMIVeqnmXgz2C8w"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Sidebar: Selected Places */}
        <aside
          className={`absolute inset-0 md:relative md:inset-auto w-full md:w-80 lg:w-96 bg-surface-bright border-r border-outline-variant flex flex-col z-40 transition-all duration-300 ${
            activeTab === "list"
              ? "translate-x-0 opacity-100"
              : "-translate-x-full md:translate-x-0 opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto"
          }`}
        >
          <div className="p-4 md:p-6 border-b border-outline-variant">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl md:text-2xl font-bold text-on-surface">
                Selected Places
              </h2>
              <span className="bg-primary-container text-on-primary-container text-xs font-bold px-3 py-1 rounded-full">
                {selectedPlaces.size}
              </span>
            </div>
            <p className="text-on-surface-variant text-xs md:text-sm mb-4">
              Plan your Tokyo adventure by selecting points of interest from the
              map.
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="bg-surface-container-highest text-on-surface-variant text-xs px-3 py-1 rounded-full whitespace-nowrap">
                Adventure
              </span>
              <span className="bg-surface-container-highest text-on-surface-variant text-xs px-3 py-1 rounded-full whitespace-nowrap">
                Culture
              </span>
              <span className="bg-surface-container-highest text-on-surface-variant text-xs px-3 py-1 rounded-full whitespace-nowrap">
                Food
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
            {selectedPlaces.size === 0 ? (
              <EmptyState />
            ) : (
              PLACES_DATA.filter((place) => selectedPlaces.has(place.name)).map(
                (place) => (
                  <PlaceCard
                    key={place.id}
                    place={place}
                    onRemove={removePlace}
                  />
                ),
              )
            )}
          </div>

          <div className="p-4 md:p-6 bg-surface-container-low border-t border-outline-variant">
            <button className="w-full bg-primary text-on-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-primary-container transition-all active:scale-95 shadow-sm text-sm">
              <span>Create Itinerary</span>
              <span>→</span>
            </button>
          </div>
        </aside>

        {/* Map Section */}
        <section
          className={`flex-1 relative bg-surface-dim map-container overflow-hidden h-full transition-all duration-300 ${
            activeTab === "map"
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 md:opacity-100 pointer-events-none md:pointer-events-auto"
          }`}
          onClick={() => setOpenPopupId(null)}
        >
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBzHICAQDScuiNFq2fC1fLXQxTOG1ePQxwyCAJ8Qja2j43LF56UEXlNEfOXs_xOARejv1PhKtFj-x9oKuJ1mQW3z0gXCrBRGnktEe425x6Bjv2JuakShro7Xtv4zQ2U08-o10UWUT5cg1iUFdHaPZb5b3j3brLAr0fzLCbP63I8DaLPHWgHCOwgiZWprpO1zEfj0FAFjkhLS7tJnEaXXaqFBAYX0t2W4cadVF_D07EkzF7AiM0KdIwf2DYt_4ij99OIliZiL7YF0vw"
            alt="Tokyo map"
          />

          {/* Map Interactive Layer */}
          <div className="absolute inset-0 z-10 p-4 md:p-8">
            {PLACES_DATA.map((place) => (
              <div key={place.id}>
                <MapMarker
                  place={place}
                  isSelected={selectedPlaces.has(place.name)}
                  openPopup={togglePopup}
                />
                {openPopupId === place.id && (
                  <PlacePopup
                    place={place}
                    onAdd={addPlace}
                    onClose={() => setOpenPopupId(null)}
                  />
                )}
              </div>
            ))}

            {/* Floating Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-3 z-30">
              <button
                onClick={(e) => e.stopPropagation()}
                className="bg-surface w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg shadow-lg border border-outline-variant hover:bg-surface-container transition-all active:scale-95 text-lg"
              >
                +
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="bg-surface w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-lg shadow-lg border border-outline-variant hover:bg-surface-container transition-all active:scale-95 text-lg"
              >
                −
              </button>
              <button
                onClick={(e) => e.stopPropagation()}
                className="bg-primary text-on-primary w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full shadow-lg hover:bg-primary-container transition-all active:scale-95 mt-2 md:mt-4 text-lg"
              >
                📍
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* BottomNavBar (Mobile Only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full h-[64px] z-50 flex justify-around items-center bg-surface border-t border-outline-variant shadow-md">
        <button
          onClick={() => setActiveTab("map")}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all duration-200 ${
            activeTab === "map"
              ? "bg-primary-container text-on-primary-container font-semibold"
              : "text-on-surface-variant"
          }`}
        >
          <span className="text-lg">🧭</span>
          <span className="text-[10px]">Map</span>
        </button>
        <button
          onClick={() => setActiveTab("list")}
          className={`flex flex-col items-center justify-center w-16 py-1 rounded-xl transition-all duration-200 relative ${
            activeTab === "list"
              ? "bg-primary-container text-on-primary-container font-semibold"
              : "text-on-surface-variant"
          }`}
        >
          <span className="text-lg">🗺️</span>
          <span className="text-[10px]">Saved</span>
          {selectedPlaces.size > 0 && (
            <span className="absolute top-1 right-2 bg-error text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {selectedPlaces.size}
            </span>
          )}
        </button>
        <button className="flex flex-col items-center justify-center w-16 text-on-surface-variant">
          <span className="text-lg">💳</span>
          <span className="text-[10px]">Budget</span>
        </button>
        <button className="flex flex-col items-center justify-center w-16 text-on-surface-variant">
          <span className="text-lg">👤</span>
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
}
