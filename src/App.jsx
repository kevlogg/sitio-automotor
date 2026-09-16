import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FloatingSearchBar from './components/FloatingSearchBar';
import CategoryExplorer from './components/CategoryExplorer';
import MundoAutomotorSidebar from './components/MundoAutomotorSidebar';
import MonetizationSection from './components/MonetizationSection';
import FeaturedVehiclesFeed from './components/FeaturedVehiclesFeed';
import VehicleDetailModal from './components/VehicleDetailModal';
import PublishModal from './components/PublishModal';
import FavoritesModal from './components/FavoritesModal';
import ProofTrustFooter from './components/ProofTrustFooter';
import { MOCK_VEHICLES } from './data/mockVehicles';

export default function App() {
  // Vehicle state
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [favorites, setFavorites] = useState(['v1', 'v2']);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  const [activeRubro, setActiveRubro] = useState(null);

  // Modal States
  const [detailVehicle, setDetailVehicle] = useState(null);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Trigger Toast Notification
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Favoriting Handler
  const handleToggleFavorite = (id) => {
    if (favorites.includes(id)) {
      setFavorites(favorites.filter(favId => favId !== id));
      showToast('Vehículo eliminado de favoritos');
    } else {
      setFavorites([...favorites, id]);
      showToast('Vehículo agregado a favoritos ❤️');
    }
  };

  // WhatsApp Contact Lead Simulator
  const handleWhatsAppContact = (vehicle) => {
    const text = encodeURIComponent(
      `Hola ${vehicle.sellerName}, vi tu aviso "${vehicle.title}" (${vehicle.formattedPrice}) en Sitio Automotor y quisiera consultar disponibilidad e información.`
    );
    const url = `https://wa.me/${vehicle.sellerWhatsApp}?text=${text}`;
    window.open(url, '_blank');
    showToast(`Iniciando contacto por WhatsApp con ${vehicle.sellerName}...`);
  };

  // Adding a new vehicle listing
  const handleAddVehicle = (newVehicle) => {
    setVehicles([newVehicle, ...vehicles]);
    showToast('¡Tu vehículo fue publicado exitosamente! 🎉');
  };

  const handleSearchScroll = () => {
    const el = document.getElementById('search-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered Vehicles Computation
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      // Search term filter
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesTitle = v.title.toLowerCase().includes(term);
        const matchesBrand = v.brand.toLowerCase().includes(term);
        const matchesModel = v.model ? v.model.toLowerCase().includes(term) : false;
        if (!matchesTitle && !matchesBrand && !matchesModel) return false;
      }

      // Quick Tab filter
      if (activeTab !== 'all' && v.category !== activeTab) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && v.category !== selectedCategory) {
        return false;
      }

      // Brand filter
      if (selectedBrand !== 'all' && v.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      // Year filter
      if (selectedYear !== 'all') {
        const minYear = parseInt(selectedYear);
        if (v.year < minYear) return false;
      }

      // Location filter
      if (selectedLocation !== 'all' && !v.location.includes(selectedLocation.split(',')[0])) {
        return false;
      }

      return true;
    });
  }, [vehicles, searchTerm, activeTab, selectedCategory, selectedBrand, selectedYear, selectedLocation]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-[#6D28D9] selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-[#6D28D9] text-white font-bold text-xs shadow-2xl shadow-purple-900/30 border border-purple-400/40 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Navbar */}
      <Navbar
        favoritesCount={favorites.length}
        onOpenPublishModal={() => setPublishModalOpen(true)}
        onOpenFavoritesModal={() => setFavoritesModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        
        {/* Left Aligned Hero Section */}
        <HeroSection
          onOpenPublishModal={() => setPublishModalOpen(true)}
          onSearchScroll={handleSearchScroll}
        />

        {/* Floating Search Bar */}
        <FloatingSearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={(cat) => {
            setSelectedCategory(cat);
            if (cat !== 'all') setActiveTab(cat);
          }}
          selectedBrand={selectedBrand}
          setSelectedBrand={setSelectedBrand}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedLocation={selectedLocation}
          setSelectedLocation={setSelectedLocation}
          onSearchSubmit={handleSearchScroll}
        />

        {/* Category Explorer */}
        <CategoryExplorer
          selectedCategory={selectedCategory}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setActiveTab(catId);
            handleSearchScroll();
          }}
        />

        {/* Main Feed Section with Mundo Automotor Sidebar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Sidebar Column */}
            <div className="lg:col-span-3 lg:sticky lg:top-24 z-20">
              <MundoAutomotorSidebar
                activeRubro={activeRubro}
                onSelectRubro={(rubroId) => {
                  setActiveRubro(rubroId);
                  if (rubroId) {
                    showToast(`Rubro seleccionado: ${rubroId}`);
                  }
                }}
              />
            </div>

            {/* Featured Feed Column */}
            <div className="lg:col-span-9">
              <FeaturedVehiclesFeed
                vehicles={filteredVehicles}
                favorites={favorites}
                onToggleFavorite={handleToggleFavorite}
                onOpenDetailModal={(v) => setDetailVehicle(v)}
                onWhatsAppContact={handleWhatsAppContact}
              />
            </div>

          </div>
        </div>

        {/* Monetization / Vender Section */}
        <MonetizationSection
          onOpenPublishModal={() => setPublishModalOpen(true)}
        />

      </main>

      {/* Proof & Trust Footer */}
      <ProofTrustFooter />

      {/* Modals */}
      <VehicleDetailModal
        vehicle={detailVehicle}
        onClose={() => setDetailVehicle(null)}
        isFavorite={detailVehicle ? favorites.includes(detailVehicle.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onWhatsAppContact={handleWhatsAppContact}
      />

      <PublishModal
        isOpen={publishModalOpen}
        onClose={() => setPublishModalOpen(false)}
        onVehicleAdded={handleAddVehicle}
      />

      <FavoritesModal
        isOpen={favoritesModalOpen}
        onClose={() => setFavoritesModalOpen(false)}
        favorites={favorites}
        allVehicles={vehicles}
        onRemoveFavorite={handleToggleFavorite}
        onOpenDetailModal={(v) => setDetailVehicle(v)}
        onWhatsAppContact={handleWhatsAppContact}
      />

    </div>
  );
}
