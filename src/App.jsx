import React, { useState, useMemo, useEffect } from 'react';
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
import AuthModal from './components/AuthModal';
import RegisterBusinessModal from './components/RegisterBusinessModal';
import ProofTrustFooter from './components/ProofTrustFooter';
import PingPongVideo from './components/PingPongVideo';
import WheelSectionDivider from './components/WheelSectionDivider';
import { MOCK_VEHICLES } from './data/mockVehicles';
import { supabase } from './lib/supabase';

export default function App() {
  // Vehicle state initialized with localStorage fallback
  const [vehicles, setVehicles] = useState(() => {
    try {
      const savedCustom = localStorage.getItem('sa_custom_vehicles');
      if (savedCustom) {
        const parsedArr = JSON.parse(savedCustom);
        if (Array.isArray(parsedArr) && parsedArr.length > 0) {
          return [...parsedArr, ...MOCK_VEHICLES];
        }
      }
    } catch (err) {
      console.error('Error al cargar publicaciones de localStorage:', err);
    }
    return MOCK_VEHICLES;
  });

  // Fetch live vehicles from Supabase Cloud on mount
  useEffect(() => {
    async function fetchSupabaseVehicles() {
      try {
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map((v) => ({
            id: v.id,
            title: v.title,
            category: v.category,
            categoryLabel: v.category_label || v.category,
            brand: v.brand,
            model: v.model,
            year: v.year,
            mileage: v.mileage,
            mileageNum: v.mileage_num,
            fuel: v.fuel,
            transmission: v.transmission,
            priceCurrency: v.price_currency,
            price: Number(v.price),
            formattedPrice: v.formatted_price || `${v.price_currency || 'USD'} ${Number(v.price).toLocaleString('es-AR')}`,
            location: v.location,
            sellerType: v.seller_type,
            sellerName: v.seller_name,
            sellerWhatsApp: v.seller_whatsapp,
            badge: v.badge,
            badgeColor: v.badge_color || 'violet',
            image: v.image_url,
            images: v.images && v.images.length > 0 ? v.images : [v.image_url],
            description: v.description,
            features: v.features || []
          }));
          setVehicles(formatted);
        }
      } catch (err) {
        console.warn('Conexión a Supabase usando fallback local:', err);
      }
    }
    fetchSupabaseVehicles();
  }, []);

  // Favorites state initialized with localStorage persistence
  const [favorites, setFavorites] = useState(() => {
    try {
      const savedFavs = localStorage.getItem('sa_favorites');
      if (savedFavs) {
        const parsed = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.error('Error al cargar favoritos de localStorage:', err);
    }
    return ['v1', 'v2'];
  });

  // Sync favorites changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sa_favorites', JSON.stringify(favorites));
    } catch (err) {
      console.error('Error al guardar favoritos en localStorage:', err);
    }
  }, [favorites]);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [activeTab, setActiveTab] = useState('all');
  const [activeRubro, setActiveRubro] = useState(null);
  const [cardTheme, setCardTheme] = useState('violet'); // 'violet' | 'dark'

  // User Authentication State
  const [currentUser, setCurrentUser] = useState(null); // { user, profile }
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signup'); // 'login' | 'signup'
  const [registerBusinessModalOpen, setRegisterBusinessModalOpen] = useState(false);

  // Escuchar estado de autenticación en Supabase
  useEffect(() => {
    async function getInitialSession() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        setCurrentUser({
          user,
          profile: profile || {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Usuario',
            user_type: user.user_metadata?.user_type || 'particular',
          },
        });
      }
    }
    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .maybeSingle();

        setCurrentUser({
          user: session.user,
          profile: profile || {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || 'Usuario',
            user_type: session.user.user_metadata?.user_type || 'particular',
          },
        });
      } else {
        setCurrentUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    showToast('Sesión cerrada correctamente');
  };

  const handleOpenAuthModal = (mode = 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

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
      setFavorites(favorites.filter((favId) => favId !== id));
      showToast('Vehículo eliminado de favoritos');
    } else {
      setFavorites([...favorites, id]);
      showToast('Vehículo agregado a favoritos ❤️');
    }
  };

  // WhatsApp Contact Lead Simulator & Analytics Tracker
  const handleWhatsAppContact = async (vehicle) => {
    const cleanPhone = vehicle.sellerWhatsApp ? vehicle.sellerWhatsApp.replace(/\D/g, '') : '5491112345678';
    const text = encodeURIComponent(
      `Hola ${vehicle.sellerName}, vi tu aviso "${vehicle.title}" (${vehicle.formattedPrice}) en Sitio Automotor y quisiera consultar disponibilidad e información.`
    );
    const url = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(url, '_blank');
    showToast(`Iniciando contacto por WhatsApp con ${vehicle.sellerName}...`);

    // Track lead in Supabase cloud asynchronously
    try {
      if (typeof vehicle.id === 'string' && vehicle.id.length > 20) {
        await supabase.from('leads').insert([
          {
            vehicle_id: vehicle.id,
            seller_whatsapp: cleanPhone
          }
        ]);
      }
    } catch (e) {
      console.warn('Lead track skipped:', e);
    }
  };

  // Adding a new vehicle listing with Supabase Cloud & Local Storage
  const handleAddVehicle = async (newVehicle) => {
    const updated = [newVehicle, ...vehicles];
    setVehicles(updated);

    try {
      const savedCustom = localStorage.getItem('sa_custom_vehicles');
      const customArr = savedCustom ? JSON.parse(savedCustom) : [];
      localStorage.setItem('sa_custom_vehicles', JSON.stringify([newVehicle, ...customArr]));
    } catch (err) {
      console.error('Error al guardar aviso en localStorage:', err);
    }

    // Insert into Supabase Table
    try {
      const { error } = await supabase.from('vehicles').insert([
        {
          title: newVehicle.title,
          category: newVehicle.category,
          category_label: newVehicle.categoryLabel,
          brand: newVehicle.brand,
          model: newVehicle.model,
          year: newVehicle.year,
          mileage: newVehicle.mileage,
          mileage_num: newVehicle.mileageNum || 0,
          fuel: newVehicle.fuel,
          transmission: newVehicle.transmission,
          price_currency: newVehicle.priceCurrency,
          price: newVehicle.price,
          formatted_price: newVehicle.formattedPrice,
          location: newVehicle.location,
          seller_type: newVehicle.sellerType,
          seller_name: newVehicle.sellerName,
          seller_whatsapp: newVehicle.sellerWhatsApp,
          badge: newVehicle.badge,
          badge_color: newVehicle.badgeColor,
          image_url: newVehicle.image,
          images: newVehicle.images,
          description: newVehicle.description,
          features: newVehicle.features,
          status: 'active'
        }
      ]);
      if (error) {
        console.warn('Supabase Insert Pending Table Execution:', error.message);
      }
    } catch (e) {
      console.warn('Error al insertar en Supabase:', e);
    }

    showToast('¡Tu vehículo fue publicado exitosamente! 🎉');
  };

  const handleSearchScroll = () => {
    const el = document.getElementById('search-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered & Sorted Vehicles Computation
  const filteredVehicles = useMemo(() => {
    const list = vehicles.filter((v) => {
      // Search term filter
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesTitle = v.title ? v.title.toLowerCase().includes(term) : false;
        const matchesBrand = v.brand ? v.brand.toLowerCase().includes(term) : false;
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
        const minYear = parseInt(selectedYear, 10);
        if (v.year < minYear) return false;
      }

      // Location filter fix
      if (selectedLocation !== 'all') {
        if (selectedLocation.includes(',')) {
          if (!v.location.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
        } else {
          const prov = selectedLocation.split(',')[0].trim().toLowerCase();
          if (!v.location.toLowerCase().includes(prov)) return false;
        }
      }

      // Min Price Filter
      if (minPrice !== '' && !isNaN(Number(minPrice))) {
        if (v.price < Number(minPrice)) return false;
      }

      // Max Price Filter
      if (maxPrice !== '' && !isNaN(Number(maxPrice))) {
        if (v.price > Number(maxPrice)) return false;
      }

      return true;
    });

    // Sort Result
    if (sortBy === 'price-asc') {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'year-desc') {
      list.sort((a, b) => b.year - a.year);
    }

    return list;
  }, [
    vehicles,
    searchTerm,
    activeTab,
    selectedCategory,
    selectedBrand,
    selectedYear,
    selectedLocation,
    minPrice,
    maxPrice,
    sortBy,
  ]);

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
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthModal('signup')}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Left Aligned Hero Section */}
        <HeroSection
          onOpenPublishModal={() => setPublishModalOpen(true)}
          onSearchScroll={handleSearchScroll}
        />

        {/* Section 2 Downwards - Video Background (rueda.mp4 Ping-Pong Loop) */}
        <div className="relative w-full overflow-hidden">
          {/* Background Video Layer with Boomerang / Ping-Pong Effect */}
          <PingPongVideo
            src="/rueda.mp4"
            className="w-full h-full object-cover opacity-35 filter saturate-110 brightness-95"
            overlayClassName="absolute inset-0 bg-gradient-to-b from-[#F8FAFC]/90 via-[#F8FAFC]/50 to-[#F8FAFC]/90 pointer-events-none"
          />

          {/* Content Layer on Top of Video */}
          <div className="relative z-10 space-y-4">
            {/* Floating Search Bar with Price & Sort */}
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
              minPrice={minPrice}
              setMinPrice={setMinPrice}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onSearchSubmit={handleSearchScroll}
              cardTheme={cardTheme}
            />

            {/* Category Explorer */}
            <CategoryExplorer
              cardTheme={cardTheme}
              selectedCategory={selectedCategory}
              onSelectCategory={(catId) => {
                setSelectedCategory(catId);
                setActiveTab(catId);
                handleSearchScroll();
              }}
            />

            {/* Section Cut Divider: Rolling Wheel & Smoke */}
            <WheelSectionDivider />

            {/* Main Feed Section with Mundo Automotor Sidebar */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Sidebar Column */}
                <div className="lg:col-span-3 lg:sticky lg:top-24 z-20">
                  <MundoAutomotorSidebar
                    cardTheme={cardTheme}
                    activeRubro={activeRubro}
                    onSelectRubro={(rubroId) => {
                      setActiveRubro(rubroId);
                      if (rubroId) {
                        showToast(`Rubro seleccionado: ${rubroId}`);
                      }
                    }}
                    onOpenRegisterBusiness={() => setRegisterBusinessModalOpen(true)}
                  />
                </div>

                {/* Featured Feed Column */}
                <div className="lg:col-span-9">
                  <FeaturedVehiclesFeed
                    cardTheme={cardTheme}
                    vehicles={filteredVehicles}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenDetailModal={(v) => setDetailVehicle(v)}
                    onWhatsAppContact={handleWhatsAppContact}
                  />
                </div>
              </div>
            </div>

            {/* Section Cut Divider: Rolling Wheel & Smoke */}
            <WheelSectionDivider />

            {/* Monetization / Vender Section */}
            <MonetizationSection cardTheme={cardTheme} onOpenPublishModal={() => setPublishModalOpen(true)} />
            
            {/* Section Cut Divider: Rolling Wheel & Smoke */}
            <WheelSectionDivider />
          </div>
        </div>
      </main>

      {/* Proof & Trust Footer */}
      <ProofTrustFooter cardTheme={cardTheme} />

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
        currentUser={currentUser}
        onRequireAuth={(mode) => handleOpenAuthModal(mode)}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(userSession) => {
          setCurrentUser(userSession);
          showToast(`¡Bienvenido/a, ${userSession.profile?.full_name || 'Usuario'}! 🎉`);
        }}
      />

      <RegisterBusinessModal
        isOpen={registerBusinessModalOpen}
        onClose={() => setRegisterBusinessModalOpen(false)}
        onBusinessRegistered={(serviceData) => {
          showToast(`¡Tu negocio "${serviceData.name}" fue agregado a Mundo Automotor! 🚀`);
        }}
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
