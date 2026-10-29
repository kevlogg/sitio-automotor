import React, { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FloatingSearchBar from './components/FloatingSearchBar';
import CategoryExplorer from './components/CategoryExplorer';
import MundoAutomotorSidebar from './components/MundoAutomotorSidebar';
import Sidebar from './components/Sidebar';
import MonetizationSection from './components/MonetizationSection';
import FeaturedVehiclesFeed from './components/FeaturedVehiclesFeed';
import LatestVehiclesScroll from './components/LatestVehiclesScroll';
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
import PlansPage from './components/PlansPage';
import ComingSoonPage from './components/ComingSoonPage';
import { LeftAdCard, RightAdCard } from './components/SideAdBanners';
import PwaInstallCard from './components/PwaInstallCard';
import { MOCK_VEHICLES } from './data/mockVehicles';
import { supabase } from './lib/supabase';
import { updateSeoMetadata, buildVehicleSchema } from './utils/seo';

export default function App() {
  // Helper para resolver rutas limpias (HTML5 History API) y redirigir hashes antiguos para SEO
  const parseCurrentRoute = () => {
    let path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // Retrocompatibilidad SEO: si alguien entra con un '#' antiguo,
    // lo convertimos inmediatamente a una URL limpia con replaceState (sin recargar)
    if (hash) {
      if (hash === '#vehiculos' || hash === '#catalogo' || hash === '#todos-los-autos') path = '/vehiculos';
      else if (hash === '#agencias' || hash === '#concesionarias') path = '/agencias';
      else if (hash === '#negocios' || hash === '#servicios' || hash === '#directorio') path = '/negocios';
      else if (hash === '#panel' || hash === '#dashboard') path = '/panel';
      else if (hash === '#ingresar' || hash === '#login') path = '/ingresar';
      else if (hash === '#registro' || hash === '#signup' || hash === '#auth') path = '/registro';
      else if (hash === '#superadmin' || hash === '#admin-total') path = '/superadmin';
      else if (hash === '#proximamente' || hash === '#coming-soon') path = '/proximamente';
      else if (hash === '#inicio' || hash === '#home') path = '/';

      const cleanQuery = window.location.search || '';
      window.history.replaceState(null, '', `${path}${cleanQuery}`);
    }

    if (path.startsWith('/vehiculos')) {
      const parts = path.split('/').filter(Boolean);
      const vehicleParam = parts.length > 1 ? parts[1] : null;
      return { view: 'vehicles', vehicleParam, path };
    }
    if (path === '/agencias' || path === '/concesionarias') return { view: 'agencies', path };
    if (path === '/negocios' || path === '/servicios') return { view: 'businesses', path };
    if (path === '/planes' || path === '/precios' || path === '/suscripciones') return { view: 'plans', path };
    if (path === '/panel' || path === '/dashboard') return { view: 'dashboard', path };
    if (path === '/ingresar' || path === '/login') return { view: 'auth', authMode: 'login', path };
    if (path === '/registro' || path === '/signup' || path === '/auth') return { view: 'auth', authMode: 'signup', path };
    if (path === '/superadmin') return { view: 'superadmin', path };
    if (path === '/proximamente') return { view: 'coming-soon', path };

    return { view: 'home', path: '/' };
  };

  const initialRoute = parseCurrentRoute();
  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [authMode, setAuthMode] = useState(initialRoute.authMode || 'signup');
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

  // Modal States
  const [detailVehicle, setDetailVehicle] = useState(null);

  // Escuchar navegación por History API (popstate) y sincronizar rutas
  useEffect(() => {
    const handlePopState = () => {
      const route = parseCurrentRoute();
      setCurrentView(route.view);
      if (route.authMode) setAuthMode(route.authMode);

      if (route.vehicleParam) {
        const found = vehicles.find((v) => {
          const vSlug = `${v.id}-${(v.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
          return String(v.id) === String(route.vehicleParam) || vSlug === route.vehicleParam;
        });
        if (found) setDetailVehicle(found);
      } else if (window.location.pathname === '/vehiculos' || window.location.pathname === '/') {
        setDetailVehicle(null);
      }
    };

    handlePopState();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [vehicles]);

  // Actualización dinámica de SEO (Title, Meta Description, Open Graph y Schema.org)
  useEffect(() => {
    const siteUrl = window.location.origin;

    if (detailVehicle) {
      const priceStr = detailVehicle.price ? ` - US$ ${Number(detailVehicle.price).toLocaleString('es-AR')}` : '';
      const yearStr = detailVehicle.year ? ` (${detailVehicle.year})` : '';
      const title = `${detailVehicle.title}${yearStr}${priceStr} | Sitio Automotor`;
      const description = `${detailVehicle.title} en venta en Argentina. ${detailVehicle.year ? 'Año ' + detailVehicle.year + '. ' : ''}${detailVehicle.mileage ? detailVehicle.mileage + ' km. ' : ''}Ubicación: ${detailVehicle.location || 'Argentina'}. Contactá directo por WhatsApp.`;
      const slug = `${detailVehicle.id}-${(detailVehicle.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;

      updateSeoMetadata({
        title,
        description,
        image: detailVehicle.image || `${siteUrl}/logo.png`,
        url: `${siteUrl}/vehiculos/${slug}`,
        type: 'product',
        schema: buildVehicleSchema(detailVehicle)
      });
      return;
    }

    switch (currentView) {
      case 'vehicles': {
        const catLabels = {
          autos: 'Autos',
          camionetas: 'Camionetas y SUVs',
          motos: 'Motos',
          camiones: 'Camiones',
          nautica: 'Embarcaciones y Náutica',
          agro: 'Maquinaria Agrícola'
        };
        const catName = catLabels[catalogCategory] || 'Autos, Camionetas y Motos';
        const searchSuffix = catalogSearch ? ` "${catalogSearch}"` : '';
        const dynTitle = `Catálogo de ${catName}${searchSuffix} en Venta | Sitio Automotor`;
        const dynDesc = `Encontrá ${catName.toLowerCase()}${searchSuffix} nuevos y usados en venta en Argentina. Precios actualizados en dólares y pesos, garantía oficial y contacto directo por WhatsApp.`;

        updateSeoMetadata({
          title: dynTitle,
          description: dynDesc,
          url: `${siteUrl}/vehiculos${catalogCategory !== 'all' ? `?categoria=${catalogCategory}` : ''}`,
          type: 'website'
        });
        break;
      }
      case 'agencies':
        updateSeoMetadata({
          title: 'Directorio de Concesionarias y Agencias de Autos | Sitio Automotor',
          description: 'Encontrá las agencias de autos oficiales y concesionarias más confiables de Argentina. Consultá su stock disponible con garantía.',
          url: `${siteUrl}/agencias`,
          type: 'website'
        });
        break;
      case 'businesses':
        updateSeoMetadata({
          title: 'Mundo Automotor | Talleres Mecánicos, Repuestos y Servicios | Sitio Automotor',
          description: 'Guía comercial automotriz: talleres mecánicos, casas de repuestos, lubricentros, detailing, gomerías y seguros para tu vehículo en Argentina.',
          url: `${siteUrl}/negocios`,
          type: 'website'
        });
        break;
      case 'plans':
        updateSeoMetadata({
          title: 'Planes y Membresías Oficiales | Sitio Automotor',
          description: 'Conocé los planes de suscripción para agencias, concesionarias y negocios del automotor. Publicaciones simultáneas, posicionamiento preferencial y soporte por WhatsApp.',
          url: `${siteUrl}/planes`,
          type: 'website'
        });
        break;
      case 'auth':
        updateSeoMetadata({
          title: authMode === 'login' ? 'Iniciar Sesión | Sitio Automotor' : 'Registrarse | Sitio Automotor',
          description: 'Accedé a tu cuenta en Sitio Automotor para publicar tus vehículos o administrar tu agencia.',
          url: `${siteUrl}/${authMode === 'login' ? 'ingresar' : 'registro'}`
        });
        break;
      case 'dashboard':
        updateSeoMetadata({
          title: 'Mi Panel de Control | Sitio Automotor',
          description: 'Panel de administración y gestión de publicaciones de vehículos y negocios.',
          url: `${siteUrl}/panel`
        });
        break;
      case 'superadmin':
        updateSeoMetadata({
          title: 'Administración Total | Sitio Automotor',
          description: 'Panel de administración central de Sitio Automotor.',
          url: `${siteUrl}/superadmin`
        });
        break;
      case 'home':
      default:
        updateSeoMetadata({
          title: 'Sitio Automotor | El Marketplace Automotor Líder de Argentina',
          description: 'Todo el mundo automotor en un solo sitio. Comprá y vendé autos, camionetas, motos y náutica con agencias oficiales y particulares verificados.',
          url: `${siteUrl}/`,
          type: 'website'
        });
        break;
    }
  }, [currentView, detailVehicle, authMode, catalogCategory, catalogSearch]);

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
    const path = mode === 'login' ? '/ingresar' : '/registro';
    window.history.pushState(null, '', path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (viewId, cat = 'all', search = '') => {
    setCatalogCategory(cat);
    setCatalogSearch(search);
    setCurrentView(viewId);
    let targetPath = '/';

    if (viewId === 'vehicles') {
      const params = new URLSearchParams();
      if (cat && cat !== 'all') params.set('categoria', cat);
      if (search) params.set('buscar', search);
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      targetPath = `/vehiculos${queryStr}`;
    } else if (viewId === 'agencies') {
      targetPath = '/agencias';
    } else if (viewId === 'businesses') {
      targetPath = '/negocios';
    } else if (viewId === 'plans') {
      targetPath = '/planes';
    } else if (viewId === 'superadmin') {
      targetPath = '/superadmin';
    } else if (viewId === 'dashboard') {
      targetPath = '/panel';
    } else if (viewId === 'coming-soon') {
      targetPath = '/proximamente';
    } else {
      targetPath = '/';
    }

    window.history.pushState(null, '', targetPath);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDetailModal = (vehicle) => {
    setDetailVehicle(vehicle);
    if (vehicle) {
      const slug = `${vehicle.id}-${(vehicle.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`;
      window.history.pushState(null, '', `/vehiculos/${slug}`);
    }
  };

  const handleCloseDetailModal = () => {
    setDetailVehicle(null);
    if (window.location.pathname.startsWith('/vehiculos/')) {
      const fallback = currentView === 'vehicles' ? '/vehiculos' : '/';
      window.history.pushState(null, '', fallback);
    }
  };

  // Modal States
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [favoritesModalOpen, setFavoritesModalOpen] = useState(false);
  const [pwaModalOpen, setPwaModalOpen] = useState(true);
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
      <>
        <ComingSoonPage
          onGoToInicio={() => handleNavigate('home')}
        />
        {/* Cartel Dinámico PWA que se puede cerrar */}
        <PwaInstallCard
          variant="modal"
          isOpen={pwaModalOpen}
          onClose={() => setPwaModalOpen(false)}
          cardTheme={cardTheme}
        />
      </>
    );
  }

  // Render Dedicated Auth Page when currentView === 'auth'
  if (currentView === 'auth') {
    return (
      <AuthPage
        initialMode={authMode}
        onAuthSuccess={(userSession) => {
          setCurrentUser(userSession);
          setCurrentView('dashboard');
          window.history.pushState(null, '', '/panel');
          const name = userSession.profile?.business_name || userSession.profile?.full_name || 'Usuario';
          showToast(`¡Bienvenido/a, ${name}! Te redirigimos a tu panel 🎉`);
        }}
        onBackToHome={() => {
          setCurrentView('home');
          window.history.pushState(null, '', '/');
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
          window.history.pushState(null, '', '/');
        }}
        onSignOut={handleSignOut}
        onOpenPublishModal={() => setPublishModalOpen(true)}
        vehicles={vehicles}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onOpenDetailModal={handleOpenDetailModal}
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
          window.history.pushState(null, '', '/');
        }}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <div className="min-h-screen bg-home-canvas text-slate-900 flex flex-col selection:bg-[#6D28D9] selection:text-white">
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
          window.history.pushState(null, '', '/panel');
        }}
        onOpenSuperAdmin={() => {
          setCurrentView('superadmin');
          window.history.pushState(null, '', '/superadmin');
        }}
        onSignOut={handleSignOut}
        currentView={currentView}
        onNavigate={handleNavigate}
      />

      {/* Main Content por Vista */}
      <div className="flex-1 flex w-full mx-auto">
        
        {/* Vista Principal */}
        <main className="flex-1 min-w-0">
        {currentView === 'home' && (
          <div className="relative w-full bg-[#FDF2F4] overflow-x-clip">
            {/* H1 Semántico principal para Googlebot y accesibilidad */}
            <h1 className="sr-only">Sitio Automotor | Marketplace de Autos Usados y Nuevos en Argentina</h1>

            {/* Soft Glow Radial Accent */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              {/* Hero Section (Fila Superior Completa) */}
              <HeroSection
                onOpenPublishModal={() => setPublishModalOpen(true)}
                onSearchScroll={handleSearchScroll}
              />

              {/* Fila Principal debajo del Hero con Publicidad a los Lados */}
              <div className="flex justify-center items-start gap-4 xl:gap-6 px-2 sm:px-4 py-4 max-w-[1920px] mx-auto min-h-screen">
                
                {/* Publicidad Izquierda (arranca luego del Hero y acompaña hasta el footer) */}
                <div className="hidden lg:block shrink-0 sticky top-24 z-30 self-start">
                  <LeftAdCard onActionClick={() => handleNavigate('businesses')} />
                </div>

                {/* Contenido Central de la Página (Más Grande, Ancho y Espaciado Uniforme) */}
                <div className="flex-1 min-w-0 max-w-[1550px] w-full space-y-6 sm:space-y-8">
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

                  <div className="w-full">
                    <FeaturedVehiclesFeed
                      cardTheme={cardTheme}
                      vehicles={filteredVehicles}
                      favorites={favorites}
                      onToggleFavorite={handleToggleFavorite}
                      onOpenDetailModal={handleOpenDetailModal}
                      onWhatsAppContact={handleWhatsAppContact}
                      onNavigateToAllVehicles={() => handleNavigate('vehicles', 'all', searchTerm)}
                      onNavigateToBusinesses={() => handleNavigate('businesses')}
                      onSelectRubro={(rubroId) => {
                        setActiveRubro(rubroId);
                        if (rubroId && rubroId !== 'all') {
                          setBusinessDirectoryModalOpen(true);
                        } else {
                          handleNavigate('businesses');
                        }
                      }}
                      onOpenRegisterBusiness={() => setRegisterBusinessModalOpen(true)}
                    />
                  </div>

                  {/* Scroll Horizontal de Últimos Vehículos Publicados */}
                  <LatestVehiclesScroll
                    vehicles={vehicles}
                    favorites={favorites}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenDetailModal={handleOpenDetailModal}
                    onWhatsAppContact={handleWhatsAppContact}
                    onNavigateToAllVehicles={() => handleNavigate('vehicles', 'all', searchTerm)}
                  />
                </div>

                {/* Publicidad Derecha (arranca luego del Hero y acompaña hasta el footer) */}
                <div className="hidden lg:block shrink-0 sticky top-24 z-30 self-start">
                  <RightAdCard onActionClick={() => setPublishModalOpen(true)} />
                </div>

              </div>

            </div>
          </div>
        )}

        {currentView === 'vehicles' && (
          <AllVehiclesPage
            vehicles={vehicles}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetailModal={handleOpenDetailModal}
            onWhatsAppContact={handleWhatsAppContact}
            onBackToHome={() => handleNavigate('home')}
            onOpenPublishModal={() => setPublishModalOpen(true)}
            currentUser={currentUser}
            onOpenAuthModal={() => handleOpenAuthPage('signup')}
            onOpenDashboard={() => {
              setCurrentView('dashboard');
              window.history.pushState(null, '', '/panel');
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

        {currentView === 'plans' && (
          <PlansPage
            onBackToHome={() => handleNavigate('home')}
            onOpenPublishModal={() => setPublishModalOpen(true)}
            onOpenRegisterBusiness={(planKey) => setRegisterBusinessModalOpen(true)}
            onOpenAuthModal={(mode) => handleOpenAuthPage(mode)}
            currentUser={currentUser}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            cardTheme={cardTheme}
          />
        )}
      </main>
      </div>

      {/* Banner Fijo de Descarga de App al Fondo de la Página */}
      <PwaInstallCard
        variant="banner"
        cardTheme={cardTheme}
      />

      {/* Footer Consistente en todas las páginas */}
      <ProofTrustFooter
        cardTheme={cardTheme}
        onNavigate={handleNavigate}
        onOpenSuperAdmin={() => {
          setCurrentView('superadmin');
          window.history.pushState(null, '', '/superadmin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Cartel Dinámico PWA que se puede cerrar */}
      <PwaInstallCard
        variant="modal"
        isOpen={pwaModalOpen}
        onClose={() => setPwaModalOpen(false)}
        cardTheme={cardTheme}
      />

      {/* Modals compartidos */}
      <VehicleDetailModal
        vehicle={detailVehicle}
        onClose={handleCloseDetailModal}
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
        vehicles={vehicles}
        onNavigate={handleNavigate}
      />

      <RegisterBusinessModal
        isOpen={registerBusinessModalOpen}
        onClose={() => setRegisterBusinessModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
        onRequireAuth={(mode) => handleOpenAuthPage(mode)}
        onNavigate={handleNavigate}
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
        onOpenDetailModal={handleOpenDetailModal}
        onWhatsAppContact={handleWhatsAppContact}
      />
    </div>
  );
}
