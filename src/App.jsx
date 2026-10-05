import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FloatingSearchBar from './components/FloatingSearchBar';
import CategoryExplorer from './components/CategoryExplorer';
import MundoAutomotorSidebar from './components/MundoAutomotorSidebar';
import Sidebar from './components/Sidebar';
import MonetizationSection from './components/MonetizationSection';
import FeaturedVehiclesFeed from './components/FeaturedVehiclesFeed';
import VehicleDetailModal from './components/VehicleDetailModal';
import PublishModal from './components/PublishModal';
import FavoritesModal from './components/FavoritesModal';
import AuthPage from './components/AuthPage';
import UserDashboardPage from './components/UserDashboardPage';
import SuperAdminPage from './components/SuperAdminPage';
import RegisterBusinessModal from './components/RegisterBusinessModal';
import BusinessDirectoryModal from './components/BusinessDirectoryModal';
import ProofTrustFooter from './components/ProofTrustFooter';
import PingPongVideo from './components/PingPongVideo';
import WheelSectionDivider from './components/WheelSectionDivider';
import AllVehiclesPage from './components/AllVehiclesPage';
import AgenciesPage from './components/AgenciesPage';
import BusinessesPage from './components/BusinessesPage';
import ComingSoonPage from './components/ComingSoonPage';
import { MOCK_VEHICLES } from './data/mockVehicles';
import { supabase } from './lib/supabase';

export default function App() {
  // Navigation View State: 'coming-soon' | 'home' | 'auth' | 'dashboard' | 'vehicles' | 'agencies' | 'businesses' | 'superadmin'
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash.toLowerCase();
    const path = window.location.pathname.toLowerCase();
    const params = new URLSearchParams(window.location.search);
    const viewParam = params.get('page') || params.get('view');
    
    if (hash === '#inicio' || hash === '#home' || path === '/inicio' || viewParam === 'inicio') {
      return 'home';
    }
    if (hash === '#vehiculos' || hash === '#catalogo' || path === '/vehiculos') return 'vehicles';
    if (hash === '#agencias' || hash === '#concesionarias' || path === '/agencias') return 'agencies';
    if (hash === '#negocios' || hash === '#servicios' || path === '/negocios') return 'businesses';
    if (hash === '#superadmin' || path === '/superadmin') return 'superadmin';
    if (hash === '#panel' || hash === '#dashboard' || path === '/panel') return 'dashboard';
    if (hash === '#registro' || hash === '#ingresar' || hash === '#auth' || path === '/auth') return 'auth';

    return 'coming-soon';
  });
  const [authMode, setAuthMode] = useState('signup'); // 'login' | 'signup'
  const [catalogCategory, setCatalogCategory] = useState('all');
  const [catalogSearch, setCatalogSearch] = useState('');

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

  // Escuchar navegación por Hash (#inicio, #auth, #login, #registro, #panel, #dashboard, #vehiculos, #agencias, #negocios, #proximamente)
  useEffect(() => {
    const handleUrl = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('page') || params.get('view');

      if (hash === '#inicio' || hash === '#home' || path === '/inicio' || viewParam === 'inicio') {
        setCurrentView('home');
      } else if (hash === '#proximamente' || hash === '#coming-soon') {
        setCurrentView('coming-soon');
      } else if (hash === '#login' || hash === '#ingresar') {
        setAuthMode('login');
        setCurrentView('auth');
      } else if (hash === '#registro' || hash === '#signup' || hash === '#auth') {
        setAuthMode('signup');
        setCurrentView('auth');
      } else if (hash === '#panel' || hash === '#dashboard') {
        setCurrentView('dashboard');
      } else if (hash === '#vehiculos' || hash === '#catalogo' || hash === '#todos-los-autos') {
        setCurrentView('vehicles');
      } else if (hash === '#agencias' || hash === '#concesionarias') {
        setCurrentView('agencies');
      } else if (hash === '#negocios' || hash === '#servicios' || hash === '#directorio') {
        setCurrentView('businesses');
      } else if (hash === '#superadmin' || hash === '#admin-total') {
        setCurrentView('superadmin');
      } else if (hash === '' && (path === '/' || path === '')) {
        setCurrentView('coming-soon');
      }
    };
    handleUrl();
    window.addEventListener('hashchange', handleUrl);
    window.addEventListener('popstate', handleUrl);
    return () => {
      window.removeEventListener('hashchange', handleUrl);
      window.removeEventListener('popstate', handleUrl);
    };
  }, []);

  // Fetch live vehicles from Supabase Cloud on mount
  // Fetch live vehicles from Supabase Cloud on mount (ONLY FROM USERS WITH ACTIVE PLAN)
  useEffect(() => {
    async function fetchSupabaseVehicles() {
      try {
        // 1. Fetch active profiles to verify active plans
        const { data: activeProfiles } = await supabase
          .from('profiles')
          .select('id, plan_status')
          .eq('plan_status', 'active');

        const activeUserIds = new Set((activeProfiles || []).map(p => p.id));

        // 2. Fetch vehicles from database
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          // Filter out vehicles from users without active plan
          const activeVehiclesOnly = data.filter((v) => {
            if (v.plan_status === 'active') return true;
            if (v.user_id) return activeUserIds.has(v.user_id);
            return true; // Seed items with null user_id
          });

          const formatted = activeVehiclesOnly.map((v) => ({
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
            features: v.features || [],
            userId: v.user_id,
            planStatus: v.plan_status || (v.user_id ? (activeUserIds.has(v.user_id) ? 'active' : 'inactive') : 'active'),
          }));
          
          setVehicles((prev) => {
            const liveIds = new Set(formatted.map(f => f.id));
            const filteredMock = prev.filter(p => !liveIds.has(p.id));
            return [...formatted, ...filteredMock];
          });
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
  const [registerBusinessModalOpen, setRegisterBusinessModalOpen] = useState(false);
  const [businessDirectoryModalOpen, setBusinessDirectoryModalOpen] = useState(false);

  // Escuchar estado de autenticación en Supabase y persistir perfil
  useEffect(() => {
    async function getInitialSession() {
      try {
        const cachedSession = localStorage.getItem('sa_session_profile');
        if (cachedSession) {
          const parsed = JSON.parse(cachedSession);
          if (parsed && parsed.profile) {
            setCurrentUser(parsed);
          }
        }
      } catch (e) {
        console.warn('Cache read err:', e);
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        const resolvedType = profile?.user_type || user.user_metadata?.user_type || user.raw_user_meta_data?.user_type || 'particular';
        const finalUserSession = {
          user,
          profile: profile ? { ...profile, user_type: resolvedType } : {
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Usuario',
            user_type: resolvedType,
            phone_whatsapp: user.user_metadata?.phone_whatsapp || '',
            business_name: user.user_metadata?.business_name || '',
          },
        };

        setCurrentUser(finalUserSession);
        try {
          localStorage.setItem('sa_session_profile', JSON.stringify(finalUserSession));
        } catch (e) {
          console.warn('Cache save err:', e);
        }
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

        const resolvedType = profile?.user_type || session.user.user_metadata?.user_type || session.user.raw_user_meta_data?.user_type || 'particular';
        const finalUserSession = {
          user: session.user,
          profile: profile ? { ...profile, user_type: resolvedType } : {
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.full_name || 'Usuario',
            user_type: resolvedType,
            phone_whatsapp: session.user.user_metadata?.phone_whatsapp || '',
            business_name: session.user.user_metadata?.business_name || '',
          },
        };

        setCurrentUser(finalUserSession);
        try {
          localStorage.setItem('sa_session_profile', JSON.stringify(finalUserSession));
        } catch (e) {
          console.warn('Cache save err:', e);
        }
      } else {
        setCurrentUser(null);
        try {
          localStorage.removeItem('sa_session_profile');
        } catch (e) {}
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

  const handleOpenAuthPage = (mode = 'signup') => {
    setAuthMode(mode);
    setCurrentView('auth');
    window.location.hash = mode === 'login' ? '#ingresar' : '#registro';
  };

  const handleNavigate = (viewId, cat = 'all', search = '') => {
    setCatalogCategory(cat);
    setCatalogSearch(search);
    setCurrentView(viewId);
    if (viewId === 'home') window.location.hash = '#inicio';
    else if (viewId === 'coming-soon') window.location.hash = '#proximamente';
    else if (viewId === 'vehicles') window.location.hash = '#vehiculos';
    else if (viewId === 'agencies') window.location.hash = '#agencias';
    else if (viewId === 'businesses') window.location.hash = '#negocios';
    else if (viewId === 'superadmin') window.location.hash = '#superadmin';
    else window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

    try {
      if (typeof vehicle.id === 'string' && vehicle.id.length > 20) {
        await supabase.from('leads').insert([
          {
            vehicle_id: vehicle.id,
            user_id: currentUser?.user?.id || null,
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

    try {
      const { error } = await supabase.from('vehicles').insert([
        {
          user_id: newVehicle.userId || currentUser?.user?.id || null,
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
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesTitle = v.title ? v.title.toLowerCase().includes(term) : false;
        const matchesBrand = v.brand ? v.brand.toLowerCase().includes(term) : false;
        const matchesModel = v.model ? v.model.toLowerCase().includes(term) : false;
        if (!matchesTitle && !matchesBrand && !matchesModel) return false;
      }

      if (activeTab !== 'all' && v.category !== activeTab) {
        return false;
      }

      if (selectedCategory !== 'all' && v.category !== selectedCategory) {
        return false;
      }

      if (selectedBrand !== 'all' && v.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
        return false;
      }

      if (selectedYear !== 'all') {
        const minYear = parseInt(selectedYear, 10);
        if (v.year < minYear) return false;
      }

      if (selectedLocation !== 'all') {
        if (selectedLocation.includes(',')) {
          if (!v.location.toLowerCase().includes(selectedLocation.toLowerCase())) return false;
        } else {
          const prov = selectedLocation.split(',')[0].trim().toLowerCase();
          if (!v.location.toLowerCase().includes(prov)) return false;
        }
      }

      if (minPrice !== '' && !isNaN(Number(minPrice))) {
        if (v.price < Number(minPrice)) return false;
      }

      if (maxPrice !== '' && !isNaN(Number(maxPrice))) {
        if (v.price > Number(maxPrice)) return false;
      }

      return true;
    });

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

  // Render Dedicated Coming Soon Page when currentView === 'coming-soon'
  if (currentView === 'coming-soon') {
    return (
      <ComingSoonPage
        onGoToInicio={() => handleNavigate('home')}
      />
    );
  }

  // Render Dedicated Auth Page when currentView === 'auth'
  if (currentView === 'auth') {
    return (
      <AuthPage
        initialMode={authMode}
        onAuthSuccess={(userSession) => {
          setCurrentUser(userSession);
          setCurrentView('home');
          window.location.hash = '';
          showToast(`¡Bienvenido/a, ${userSession.profile?.full_name || 'Usuario'}! 🎉`);
        }}
        onBackToHome={() => {
          setCurrentView('home');
          window.location.hash = '';
        }}
      />
    );
  }

  // Render Dedicated User Admin Dashboard Page when currentView === 'dashboard'
  if (currentView === 'dashboard' && currentUser) {
    return (
      <UserDashboardPage
        currentUser={currentUser}
        onUpdateUser={(updatedUser) => {
          setCurrentUser(updatedUser);
          showToast('Perfil actualizado correctamente 🎉');
        }}
        onBackToHome={() => {
          setCurrentView('home');
          window.location.hash = '';
        }}
        onSignOut={handleSignOut}
        onOpenPublishModal={() => setPublishModalOpen(true)}
        vehicles={vehicles}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onOpenDetailModal={(v) => setDetailVehicle(v)}
        onWhatsAppContact={handleWhatsAppContact}
      />
    );
  }

  // Render SuperAdmin Panel when currentView === 'superadmin'
  if (currentView === 'superadmin') {
    return (
      <SuperAdminPage
        currentUser={currentUser}
        onBackToHome={() => {
          setCurrentView('home');
          window.location.hash = '';
        }}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-[#6D28D9] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-[#6D28D9] text-white font-bold text-xs shadow-2xl shadow-purple-900/30 border border-purple-400/40 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Navbar Consistente en todas las páginas */}
      <Navbar
        favoritesCount={favorites.length}
        onOpenPublishModal={() => setPublishModalOpen(true)}
        onOpenFavoritesModal={() => setFavoritesModalOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => handleOpenAuthPage('signup')}
        onOpenDashboard={() => {
          setCurrentView('dashboard');
          window.location.hash = '#panel';
        }}
        onOpenSuperAdmin={() => {
          setCurrentView('superadmin');
          window.location.hash = '#superadmin';
        }}
        onSignOut={handleSignOut}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main Content por Vista con Sidebar Izquierdo Completo */}
      <div className="flex-1 flex max-w-[1700px] w-full mx-auto">
        
        {/* Barra Lateral Izquierda (Mundo Automotor / Categorías) */}
        <div className="hidden lg:block shrink-0">
          <Sidebar
            selectedCategory={selectedCategory}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setActiveTab(catId);
              handleSearchScroll();
            }}
            selectedService={activeRubro}
            onSelectService={(rubroId) => {
              setActiveRubro(rubroId);
              if (rubroId) {
                setBusinessDirectoryModalOpen(true);
              }
            }}
          />
        </div>

        {/* Vista Principal */}
        <main className="flex-1 min-w-0">
        {currentView === 'home' && (
          <div className="relative w-full overflow-hidden bg-[#FAF7F2]">
            {/* Checkered Racing Pattern Background Overlay in Brand Violet */}
            <div 
              className="absolute inset-0 opacity-[0.06] pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h18v18H0V0zm18 18h18v18H18V18z' fill='%236D28D9' fill-opacity='1'/%3E%3C/svg%3E")`,
                backgroundSize: '28px 28px'
              }}
            />
            {/* Soft Glow Radial Accent */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <HeroSection
                onOpenPublishModal={() => setPublishModalOpen(true)}
                onSearchScroll={handleSearchScroll}
              />

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

                <CategoryExplorer
                  cardTheme={cardTheme}
                  selectedCategory={selectedCategory}
                  onSelectCategory={(catId) => {
                    setSelectedCategory(catId);
                    setActiveTab(catId);
                    handleSearchScroll();
                  }}
                />

                <WheelSectionDivider />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <div className="lg:col-span-3 lg:sticky lg:top-24 z-20">
                      <MundoAutomotorSidebar
                        cardTheme={cardTheme}
                        activeRubro={activeRubro}
                        onSelectRubro={(rubroId) => {
                          setActiveRubro(rubroId);
                          if (rubroId) {
                            setBusinessDirectoryModalOpen(true);
                          }
                        }}
                        onOpenRegisterBusiness={() => setRegisterBusinessModalOpen(true)}
                      />
                    </div>

                    <div className="lg:col-span-9">
                      <FeaturedVehiclesFeed
                        cardTheme={cardTheme}
                        vehicles={filteredVehicles}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                        onOpenDetailModal={(v) => setDetailVehicle(v)}
                        onWhatsAppContact={handleWhatsAppContact}
                        onNavigateToAllVehicles={() => handleNavigate('vehicles', 'all', searchTerm)}
                      />
                    </div>
                  </div>
                </div>

                <WheelSectionDivider />

                <MonetizationSection
                  cardTheme={cardTheme}
                  onOpenPublishModal={() => setPublishModalOpen(true)}
                  onOpenRegisterBusiness={() => setRegisterBusinessModalOpen(true)}
                  onOpenAuthModal={(mode) => handleOpenAuthPage(mode)}
                />

                <WheelSectionDivider />
              </div>
            </div>
          )}

        {currentView === 'vehicles' && (
          <AllVehiclesPage
            vehicles={vehicles}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetailModal={(v) => setDetailVehicle(v)}
            onWhatsAppContact={handleWhatsAppContact}
            onBackToHome={() => handleNavigate('home')}
            onOpenPublishModal={() => setPublishModalOpen(true)}
            currentUser={currentUser}
            onOpenAuthModal={() => handleOpenAuthPage('signup')}
            onOpenDashboard={() => {
              setCurrentView('dashboard');
              window.location.hash = '#panel';
            }}
            onSignOut={handleSignOut}
            cardTheme={cardTheme}
            initialCategory={catalogCategory}
            initialSearch={catalogSearch}
          />
        )}

        {currentView === 'agencies' && (
          <AgenciesPage
            onBackToHome={() => handleNavigate('home')}
            onSelectAgencyVehicles={(agencyName) => handleNavigate('vehicles', 'all', agencyName)}
          />
        )}

        {currentView === 'businesses' && (
          <BusinessesPage
            onBackToHome={() => handleNavigate('home')}
            onOpenRegisterBusiness={() => setRegisterBusinessModalOpen(true)}
          />
        )}
      </main>
      </div>

      {/* Footer Consistente en todas las páginas */}
      <ProofTrustFooter
        cardTheme={cardTheme}
        onOpenSuperAdmin={() => {
          setCurrentView('superadmin');
          window.location.hash = '#superadmin';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Modals compartidos */}
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
        onRequireAuth={(mode) => handleOpenAuthPage(mode)}
      />

      <RegisterBusinessModal
        isOpen={registerBusinessModalOpen}
        onClose={() => setRegisterBusinessModalOpen(false)}
        onBusinessRegistered={(serviceData) => {
          showToast(`¡Tu negocio "${serviceData.name}" fue agregado a Mundo Automotor! 🚀`);
        }}
      />

      <BusinessDirectoryModal
        isOpen={businessDirectoryModalOpen}
        onClose={() => setBusinessDirectoryModalOpen(false)}
        activeRubro={activeRubro}
        onOpenRegisterBusiness={() => setRegisterBusinessModalOpen(true)}
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
