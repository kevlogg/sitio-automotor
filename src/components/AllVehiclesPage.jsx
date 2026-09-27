import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Search, ChevronDown, SlidersHorizontal, RotateCcw, 
  Car, Heart, Eye, MessageCircle, PlusCircle, ShieldCheck, User, LogOut, Building2, Wrench
} from 'lucide-react';
import { BRAND_OPTIONS, PROVINCE_OPTIONS } from '../data/mockVehicles';

export default function AllVehiclesPage({
  vehicles,
  favorites,
  onToggleFavorite,
  onOpenDetailModal,
  onWhatsAppContact,
  onBackToHome,
  onOpenPublishModal,
  currentUser,
  onOpenAuthModal,
  onOpenDashboard,
  onSignOut,
  cardTheme = 'violet',
  initialCategory = 'all',
  initialSearch = ''
}) {
  const isDark = cardTheme === 'dark';

  // Filter States
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [animatingFavId, setAnimatingFavId] = useState(null);

  const categoryOptions = [
    { value: 'all', label: 'Todos los vehículos' },
    { value: 'autos', label: 'Autos' },
    { value: 'camionetas', label: 'Camionetas / SUVs' },
    { value: 'motos', label: 'Motos' },
    { value: 'camiones', label: 'Camiones' },
    { value: 'nautica', label: 'Náutica' },
    { value: 'agro', label: 'Agro / Maquinaria' }
  ];

  const yearOptions = [
    { value: 'all', label: 'Cualquier año' },
    { value: '2024', label: '2024+' },
    { value: '2023', label: '2023+' },
    { value: '2022', label: '2022+' },
    { value: '2020', label: '2020+' }
  ];

  const sortOptions = [
    { value: 'featured', label: 'Destacados' },
    { value: 'price-asc', label: 'Precio: Menor a Mayor' },
    { value: 'price-desc', label: 'Precio: Mayor a Menor' },
    { value: 'year-desc', label: 'Año: Más Nuevo' }
  ];

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    selectedYear !== 'all' ||
    selectedLocation !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    sortBy !== 'featured';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedYear('all');
    setSelectedLocation('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
  };

  const handleFavoriteClick = (e, id) => {
    e.stopPropagation();
    setAnimatingFavId(id);
    onToggleFavorite(id);
    setTimeout(() => {
      setAnimatingFavId(null);
    }, 250);
  };

  // Filter Computation
  const filteredVehicles = useMemo(() => {
    const list = vehicles.filter((v) => {
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesTitle = v.title ? v.title.toLowerCase().includes(term) : false;
        const matchesBrand = v.brand ? v.brand.toLowerCase().includes(term) : false;
        const matchesModel = v.model ? v.model.toLowerCase().includes(term) : false;
        if (!matchesTitle && !matchesBrand && !matchesModel) return false;
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
    selectedCategory,
    selectedBrand,
    selectedYear,
    selectedLocation,
    minPrice,
    maxPrice,
    sortBy,
  ]);

  const getUserBadge = () => {
    if (!currentUser?.profile) return null;
    const type = currentUser.profile.user_type;
    if (type === 'agencia') return { label: 'Agencia', icon: Building2, color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    if (type === 'negocio_automotor') return { label: 'Negocio', icon: Wrench, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    return { label: 'Particular', icon: Car, color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
  };

  const badgeInfo = getUserBadge();

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col selection:bg-[#6D28D9] selection:text-white">
      {/* Header Superior */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0F172A]/95 backdrop-blur-md shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al inicio</span>
            </button>
            <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-4">
              <Car className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-black text-white">Catálogo Completo</span>
            </div>
          </div>

          <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToHome}>
            <img src="/logofrase.png" alt="Sitio Automotor" className="h-11 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5">
                <button onClick={onOpenDashboard} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left">
                  <div className="w-7 h-7 rounded-xl bg-[#6D28D9] text-white flex items-center justify-center font-bold text-xs shadow-md">
                    {currentUser.profile?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white max-w-[110px] truncate">
                      {currentUser.profile?.business_name || currentUser.profile?.full_name || 'Usuario'}
                    </span>
                    {badgeInfo && (
                      <span className={`text-[9px] font-extrabold border px-1.5 py-0.2 rounded-md ${badgeInfo.color}`}>
                        {badgeInfo.label} • Panel
                      </span>
                    )}
                  </div>
                </button>
                <button onClick={onSignOut} className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer">
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button onClick={onOpenAuthModal} className="px-3.5 py-2 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/50 text-purple-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer">
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Ingresar</span>
              </button>
            )}

            <button onClick={onOpenPublishModal} className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center gap-1.5 cursor-pointer border border-purple-500/30">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">+ Publicar vehículo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner de Título */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1E1138] via-[#0F172A] to-slate-900 border border-purple-900/50 p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-black uppercase tracking-wider block w-fit mb-2">
              🚗 Catálogo Oficial de Vehículos
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Todos los Vehículos Publicados
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Encontrá autos, camionetas, motos, comerciales, náutica y maquinaria agrícola en todo el país.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-purple-950/70 border border-purple-500/40 text-purple-200 text-xs font-black font-mono shadow-md">
            {filteredVehicles.length} {filteredVehicles.length === 1 ? 'vehículo disponible' : 'vehículos disponibles'}
          </div>
        </div>

        {/* Buscador y Filtro Idéntico al de Inicio */}
        <div className="bg-gradient-to-br from-[#261647] via-[#1E1138] to-[#160B2B] border border-purple-700/70 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-purple-800/60">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-purple-400" />
              <span>Filtrar Catálogo de Vehículos</span>
            </h3>
            {hasActiveFilters && (
              <button onClick={handleResetFilters} className="text-xs font-bold text-purple-300 hover:text-white flex items-center gap-1.5 bg-purple-900/60 px-3 py-1.5 rounded-xl border border-purple-500/40 transition-colors cursor-pointer">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpiar filtros</span>
              </button>
            )}
          </div>

          <div className="space-y-3">
            {/* Fila Principal: Búsqueda por texto, Categoría, Marca y Botón Buscar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-4">
                <label className="block text-[11px] font-semibold text-purple-200 mb-1">Búsqueda por nombre o modelo</label>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/70" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Marca, modelo o versión (ej. Corolla, Amarok)..."
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#180E2E]/80 border border-purple-700/60 rounded-xl text-white placeholder-purple-300/50 text-xs focus:outline-none focus:border-purple-400 focus:bg-[#231442] focus:ring-2 focus:ring-purple-500/40"
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-semibold text-purple-200 mb-1">Tipo de vehículo</label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 bg-[#180E2E]/80 border border-purple-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-purple-400 cursor-pointer pr-8 font-medium"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#180E2E] text-white">
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/70 pointer-events-none" />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-semibold text-purple-200 mb-1">Marca</label>
                <div className="relative">
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full appearance-none px-3 py-2.5 bg-[#180E2E]/80 border border-purple-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-purple-400 cursor-pointer pr-8 font-medium"
                  >
                    <option value="all" className="bg-[#180E2E] text-white">Todas las marcas</option>
                    {BRAND_OPTIONS.filter(b => b !== 'Todas las marcas').map((b) => (
                      <option key={b} value={b} className="bg-[#180E2E] text-white">{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/70 pointer-events-none" />
                </div>
              </div>

              <div className="lg:col-span-2">
                <button
                  type="button"
                  onClick={() => {}}
                  className="w-full py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs shadow-md shadow-purple-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Filtrar</span>
                </button>
              </div>
            </div>

            {/* Fila Secundaria: Año, Ubicación, Rango de Precio y Ordenamiento */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t border-purple-800/40">
              <div className="lg:col-span-3">
                <label className="block text-[11px] font-semibold text-purple-200 mb-1">Año mínimo</label>
                <div className="relative">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                    className="w-full appearance-none px-3 py-2 bg-[#180E2E]/80 border border-purple-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-purple-400 cursor-pointer pr-8 font-medium"
                  >
                    {yearOptions.map((y) => (
                      <option key={y.value} value={y.value} className="bg-[#180E2E] text-white">{y.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/70 pointer-events-none" />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-semibold text-purple-200 mb-1">Ubicación</label>
                <div className="relative">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full appearance-none px-3 py-2 bg-[#180E2E]/80 border border-purple-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-purple-400 cursor-pointer pr-8 font-medium"
                  >
                    <option value="all" className="bg-[#180E2E] text-white">Todas las provincias</option>
                    {PROVINCE_OPTIONS.filter(p => p !== 'Todas las ubicaciones').map((p) => (
                      <option key={p} value={p} className="bg-[#180E2E] text-white">{p}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/70 pointer-events-none" />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-semibold text-purple-200 mb-1">Precio (USD)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Mínimo"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#180E2E]/80 border border-purple-700/60 rounded-xl text-white text-xs placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
                  />
                  <input
                    type="number"
                    placeholder="Máximo"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#180E2E]/80 border border-purple-700/60 rounded-xl text-white text-xs placeholder-purple-300/50 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div className="lg:col-span-3">
                <label className="block text-[11px] font-semibold text-purple-200 mb-1">Ordenar por</label>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none px-3 py-2 bg-[#180E2E]/80 border border-purple-700/60 rounded-xl text-white text-xs focus:outline-none focus:border-purple-400 cursor-pointer pr-8 font-medium"
                  >
                    {sortOptions.map((opt) => (
                      <option key={opt.value} value={opt.value} className="bg-[#180E2E] text-white">{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-300/70 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Vehículos */}
        {filteredVehicles.length === 0 ? (
          <div className="py-20 text-center space-y-4 bg-[#0F172A] border border-slate-800 rounded-3xl">
            <Car className="w-12 h-12 text-purple-400/50 mx-auto" />
            <h3 className="text-xl font-extrabold text-white">No se encontraron vehículos</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Probá cambiando la búsqueda o limpiando los filtros seleccionados para ver más unidades disponibles.
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs transition-all cursor-pointer"
              >
                Limpiar todos los filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredVehicles.map((item) => {
              const isFav = favorites.includes(item.id);
              const isAnimatingFav = animatingFavId === item.id;

              return (
                <div
                  key={item.id}
                  className="group rounded-2xl border overflow-hidden flex flex-col justify-between hover:-translate-y-1.5 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-950/70 bg-gradient-to-br from-[#261647] via-[#1E1138] to-[#160B2B] border-purple-700/70 hover:border-purple-400 text-white"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onOpenDetailModal(item)}>
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20">
                        {item.category === 'autos' ? 'AUTO' : item.category === 'camionetas' ? 'CAMIONETA' : item.category === 'motos' ? 'MOTO' : item.category === 'camiones' ? 'CAMIÓN' : item.category === 'nautica' ? 'NÁUTICA' : 'AGRO'}
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleFavoriteClick(e, item.id)}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md border transition-all z-10 ${
                        isFav
                          ? 'bg-[#6D28D9] border-purple-400 text-white'
                          : 'bg-slate-950/60 border-purple-500/40 text-purple-200 hover:text-white hover:bg-purple-900/80'
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white text-white' : ''} ${isAnimatingFav ? 'animate-heart-pop' : ''}`} />
                    </button>
                  </div>

                  <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <h3
                        onClick={() => onOpenDetailModal(item)}
                        className="text-sm font-extrabold text-white transition-colors cursor-pointer line-clamp-1 group-hover:text-purple-300"
                      >
                        {item.title}
                      </h3>

                      <p className="text-[11px] mt-1 font-semibold text-purple-200/80">
                        {item.year} • {item.mileage} • {item.location.split(',')[0]}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-purple-800/60 flex items-center justify-between">
                      <span className="text-sm font-black font-mono text-purple-300">
                        US$ {item.price.toLocaleString('es-AR')}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => onOpenDetailModal(item)}
                          className="p-1.5 rounded-lg bg-purple-950/80 hover:bg-[#6D28D9] text-purple-200 hover:text-white border border-purple-800/50 transition-all duration-200 hover:scale-105 cursor-pointer"
                          title="Ver detalle"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onWhatsAppContact(item)}
                          className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200 hover:scale-105 shadow-md cursor-pointer"
                          title="Consultar WhatsApp"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
