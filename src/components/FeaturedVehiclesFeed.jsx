import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  Heart,
  Eye,
  MessageCircle,
  Car,
  Store,
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MapPin
} from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';
import { SEED_BUSINESSES } from './BusinessesPage';

// Rubros para la sección "Mundo Automotor"
export const MUNDO_AUTOMOTOR_RUBROS = [
  {
    id: 'repuestos',
    name: 'Repuestos y accesorios',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=600&q=80',
    alt: 'Repuestos y accesorios automotor'
  },
  {
    id: 'gomerias',
    name: 'Neumáticos',
    image: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
    alt: 'Neumáticos y gomería'
  },
  {
    id: 'talleres',
    name: 'Talleres mecánicos',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    alt: 'Talleres mecánicos especializados'
  },
  {
    id: 'lubricentros',
    name: 'Lubricentros',
    image: 'https://images.unsplash.com/photo-1625047509168-a7026f36de04?auto=format&fit=crop&w=600&q=80',
    alt: 'Lubricentro y cambio de aceite'
  },
  {
    id: 'detailing',
    name: 'Detailing y lavaderos',
    image: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?auto=format&fit=crop&w=600&q=80',
    alt: 'Detailing y lavaderos'
  },
  {
    id: 'seguros',
    name: 'Seguros y financiación',
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=600&q=80',
    alt: 'Seguros y planes de financiación'
  }
];

export default function FeaturedVehiclesFeed({
  cardTheme = 'violet',
  vehicles = [],
  businesses = SEED_BUSINESSES,
  favorites = [],
  onToggleFavorite,
  onOpenDetailModal,
  onWhatsAppContact,
  onNavigateToAllVehicles,
  onNavigateToBusinesses,
  onSelectRubro,
  onOpenRegisterBusiness
}) {
  const isDark = cardTheme === 'dark';
  const containerRef = useScrollReveal({ threshold: 0.1 });
  const [animatingFavId, setAnimatingFavId] = useState(null);

  const vehiclesScrollRef = useRef(null);
  const businessesScrollRef = useRef(null);
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);
  const [activeBusinessIndex, setActiveBusinessIndex] = useState(0);

  const getVehicleCategoryTag = (cat, title = '') => {
    const text = (String(cat || '') + ' ' + String(title || '')).toLowerCase();
    if (text.includes('corolla') || text.includes('auto') || text.includes('sedan') || text.includes('hatchback') || text.includes('golf') || text.includes('focus') || text.includes('cruze')) return 'AUTO';
    if (text.includes('camioneta') || text.includes('pick') || text.includes('suv') || text.includes('amarok') || text.includes('hilux') || text.includes('ranger')) return 'CAMIONETA';
    if (text.includes('moto')) return 'MOTO';
    if (text.includes('camion') || text.includes('chasis') || text.includes('scania') || text.includes('mercedes-benz')) return 'CAMIÓN';
    if (text.includes('nautic') || text.includes('lancha') || text.includes('crucero') || text.includes('barco')) return 'NÁUTICA';
    if (text.includes('agro') || text.includes('tractor') || text.includes('cosechadora')) return 'AGRO';
    return 'AUTO';
  };

  const handleVehiclesScroll = () => {
    if (!vehiclesScrollRef.current) return;
    const container = vehiclesScrollRef.current;
    const firstChild = container.firstElementChild;
    if (!firstChild) return;
    const cardStep = firstChild.offsetWidth + 12; // card + gap
    const index = Math.round(container.scrollLeft / cardStep);
    setActiveVehicleIndex(Math.max(0, Math.min(index, vehicles.length - 1)));
  };

  const scrollToVehicle = (index) => {
    if (!vehiclesScrollRef.current) return;
    const container = vehiclesScrollRef.current;
    const child = container.children[index];
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    } else {
      const cardStep = (container.firstElementChild?.offsetWidth || 280) + 12;
      container.scrollTo({ left: index * cardStep, behavior: 'smooth' });
    }
    setActiveVehicleIndex(index);
  };

  const scrollVehicleStep = (direction) => {
    if (!vehiclesScrollRef.current) return;
    const container = vehiclesScrollRef.current;
    const nextIndex =
      direction === 'left'
        ? Math.max(0, activeVehicleIndex - 1)
        : Math.min(vehicles.length - 1, activeVehicleIndex + 1);

    const targetChild = container.children[nextIndex];
    if (targetChild) {
      targetChild.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    } else {
      const step = (container.firstElementChild?.offsetWidth || 280) + 12;
      container.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth'
      });
    }
    setActiveVehicleIndex(nextIndex);
  };

  // Paginación de puntos deslizantes estilo mobile moderno para vehículos
  const getVisibleDotIndices = () => {
    const total = vehicles.length;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    let start = Math.max(0, activeVehicleIndex - 3);
    let end = Math.min(total - 1, start + 6);
    if (end - start < 6) {
      start = Math.max(0, end - 6);
    }
    const indices = [];
    for (let i = start; i <= end; i++) indices.push(i);
    return indices;
  };

  // Handlers para carrusel de Negocios Destacados
  const handleBusinessesScroll = () => {
    if (!businessesScrollRef.current) return;
    const container = businessesScrollRef.current;
    const firstChild = container.firstElementChild;
    if (!firstChild) return;
    const cardStep = firstChild.offsetWidth + 12;
    const index = Math.round(container.scrollLeft / cardStep);
    setActiveBusinessIndex(Math.max(0, Math.min(index, businesses.length - 1)));
  };

  const scrollToBusiness = (index) => {
    if (!businessesScrollRef.current) return;
    const container = businessesScrollRef.current;
    const child = container.children[index];
    if (child) {
      child.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    } else {
      const step = (container.firstElementChild?.offsetWidth || 280) + 12;
      container.scrollTo({ left: index * step, behavior: 'smooth' });
    }
    setActiveBusinessIndex(index);
  };

  const scrollBusinessStep = (direction) => {
    if (!businessesScrollRef.current) return;
    const container = businessesScrollRef.current;
    const nextIndex =
      direction === 'left'
        ? Math.max(0, activeBusinessIndex - 1)
        : Math.min(businesses.length - 1, activeBusinessIndex + 1);

    const targetChild = container.children[nextIndex];
    if (targetChild) {
      targetChild.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    } else {
      const step = (container.firstElementChild?.offsetWidth || 280) + 12;
      container.scrollBy({
        left: direction === 'left' ? -step : step,
        behavior: 'smooth'
      });
    }
    setActiveBusinessIndex(nextIndex);
  };

  const getVisibleBusinessDotIndices = () => {
    const total = businesses.length;
    if (total <= 7) return Array.from({ length: total }, (_, i) => i);
    let start = Math.max(0, activeBusinessIndex - 3);
    let end = Math.min(total - 1, start + 6);
    if (end - start < 6) {
      start = Math.max(0, end - 6);
    }
    const indices = [];
    for (let i = start; i <= end; i++) indices.push(i);
    return indices;
  };

  const scrollContainer = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleFavoriteClick = (e, id) => {
    e.stopPropagation();
    setAnimatingFavId(id);
    if (onToggleFavorite) onToggleFavorite(id);
    setTimeout(() => {
      setAnimatingFavId(null);
    }, 250);
  };

  const handleBusinessWhatsApp = (b) => {
    const cleanPhone = b.whatsapp ? b.whatsapp.replace(/\D/g, '') : '5491134567890';
    const text = encodeURIComponent(
      `Hola ${b.name}, vi su negocio en el sitio Sitio Automotor y me interesa consultar.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div ref={containerRef} className="space-y-8 sm:space-y-12 flex flex-col w-full">
      
      {/* SECCIÓN 1: Scroll Horizontal de 1 línea de Vehículos Destacados */}
      <section id="vehiculos" className="bg-transparent reveal-on-scroll w-full max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-[#6D28D9]" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Vehículos destacados
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Nav Arrows (visibles en desktop y tablet) */}
            <div className="hidden sm:flex items-center gap-1 mr-1">
              <button
                onClick={() => scrollVehicleStep('left')}
                className="p-1.5 rounded-xl bg-white border border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-purple-400 active:scale-95 shadow-sm transition-all cursor-pointer"
                title="Anterior"
                aria-label="Vehículo anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollVehicleStep('right')}
                className="p-1.5 rounded-xl bg-white border border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-purple-400 active:scale-95 shadow-sm transition-all cursor-pointer"
                title="Siguiente"
                aria-label="Vehículo siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {onNavigateToAllVehicles && (
              <button
                onClick={onNavigateToAllVehicles}
                className="text-xs font-extrabold text-[#6D28D9] hover:text-[#5B21B6] flex items-center gap-1.5 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-xl border border-purple-300/60 transition-all cursor-pointer"
              >
                <span>Ver todos ({vehicles.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Scroll Track - 1 Line Vehicles con Peek en Mobile */}
        <div
          ref={vehiclesScrollRef}
          onScroll={handleVehiclesScroll}
          className="flex items-stretch gap-3 sm:gap-3.5 overflow-x-auto scroll-smooth pb-2 pt-1 px-1 no-scrollbar snap-x snap-mandatory w-full max-w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {vehicles.map((item) => {
            const isFav = favorites.includes(item.id);
            const isAnimatingFav = animatingFavId === item.id;
            const categoryTag = getVehicleCategoryTag(item.category || item.categoryLabel, item.title);
            const displayLocation = item.location ? item.location.split(',')[0].trim() : 'Argentina';

            return (
              <div
                key={item.id}
                className="w-[86%] sm:w-[255px] flex-shrink-0 snap-start rounded-2xl border-2 border-purple-300 sm:hover:border-[#6D28D9] overflow-hidden flex flex-col justify-between sm:transition-all sm:duration-300 shadow-md shadow-purple-900/10 sm:hover:shadow-xl sm:hover:shadow-purple-900/20 bg-white text-slate-900 group"
              >
                {/* Imagen del Vehículo */}
                <div
                  className="relative h-48 sm:h-44 w-full overflow-hidden bg-slate-900 cursor-pointer"
                  onClick={() => onOpenDetailModal && onOpenDetailModal(item)}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover sm:group-hover:scale-105 sm:transition-transform sm:duration-300"
                    loading="lazy"
                  />

                  {/* Badge Categoría ("AUTO", "CAMIONETA", etc.) */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20 shadow-sm">
                      {categoryTag}
                    </span>
                  </div>

                  {/* Favorito */}
                  <button
                    onClick={(e) => handleFavoriteClick(e, item.id)}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md border transition-all z-10 active:scale-90 ${
                      isFav
                        ? 'bg-[#6D28D9] border-purple-400 text-white'
                        : 'bg-slate-950/60 border-purple-500/40 text-purple-200 hover:text-white hover:bg-purple-900/80'
                    }`}
                    aria-label={isFav ? "Quitar de favoritos" : "Guardar en favoritos"}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white text-white' : ''} ${isAnimatingFav ? 'animate-heart-pop' : ''}`} />
                  </button>
                </div>

                {/* Info Completa: Modelo, Año, Kilometraje, Ubicación y Precio */}
                <div className="p-3 sm:p-2.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    {/* Modelo / Título */}
                    <h3
                      onClick={() => onOpenDetailModal && onOpenDetailModal(item)}
                      className="text-sm sm:text-xs font-black text-slate-900 transition-colors cursor-pointer line-clamp-1 group-hover:text-[#6D28D9]"
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    {/* Año, Kilometraje y Ubicación */}
                    <div className="flex items-center gap-1.5 text-[11px] sm:text-[10px] font-bold text-slate-600 mt-1 flex-wrap">
                      <span className="px-1.5 py-0.5 rounded bg-purple-50 text-[#6D28D9] font-extrabold border border-purple-200/70">
                        {item.year}
                      </span>
                      <span className="text-purple-300">•</span>
                      <span className="text-slate-700">{item.mileage}</span>
                      <span className="text-purple-300">•</span>
                      <span className="inline-flex items-center gap-0.5 text-slate-700 truncate max-w-[130px]">
                        <MapPin className="w-3 h-3 text-[#6D28D9] shrink-0" />
                        <span className="truncate">{displayLocation}</span>
                      </span>
                    </div>
                  </div>

                  {/* Precio y Acciones */}
                  <div className="pt-2 border-t border-purple-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-sm sm:text-xs font-black font-mono text-[#6D28D9] tracking-tight">
                        US$ {Number(item.price || 0).toLocaleString('es-AR')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onOpenDetailModal && onOpenDetailModal(item)}
                        className="p-1.5 sm:p-1 rounded-lg bg-purple-100 hover:bg-[#6D28D9] text-purple-700 hover:text-white border border-purple-300 transition-all cursor-pointer active:scale-95"
                        title="Ver detalle"
                        aria-label="Ver detalle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onWhatsAppContact && onWhatsAppContact(item)}
                        className="p-1.5 sm:p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer active:scale-95"
                        title="Consultar WhatsApp"
                        aria-label="Consultar por WhatsApp"
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

        {/* Puntos de Navegación Discretos y Controles Celular */}
        {vehicles.length > 1 && (
          <div className="flex items-center justify-between sm:justify-center gap-2 pt-2.5 pb-1 px-1">
            {/* Flecha Anterior (celular cómoda) */}
            <button
              onClick={() => scrollVehicleStep('left')}
              disabled={activeVehicleIndex === 0}
              className="sm:hidden p-1.5 rounded-xl bg-white border border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-purple-400 active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
              aria-label="Vehículo anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Puntos de navegación discretos deslizantes estilo PWA */}
            <div className="flex items-center gap-2 bg-purple-50/80 px-2.5 py-1 rounded-full border border-purple-200/60 shadow-xs">
              <div className="flex items-center justify-center gap-1.5">
                {getVisibleDotIndices().map((idx) => {
                  const isActive = idx === activeVehicleIndex;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => scrollToVehicle(idx)}
                      className="p-0 m-0 border-0 outline-none rounded-full cursor-pointer block transition-all duration-300"
                      style={{
                        backgroundColor: isActive ? '#6D28D9' : '#DDD6FE',
                        width: isActive ? '20px' : '6px',
                        height: '6px'
                      }}
                      aria-label={`Ir al vehículo ${idx + 1}`}
                      title={`Vehículo ${idx + 1}`}
                    />
                  );
                })}
              </div>

              {/* Contador de posición discreto */}
              <span className="text-[10px] font-extrabold text-[#6D28D9] font-mono tracking-tight pl-1 border-l border-purple-200">
                {activeVehicleIndex + 1}/{vehicles.length}
              </span>
            </div>

            {/* Flecha Siguiente (celular cómoda) */}
            <button
              onClick={() => scrollVehicleStep('right')}
              disabled={activeVehicleIndex >= vehicles.length - 1}
              className="sm:hidden p-1.5 rounded-xl bg-white border border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-purple-400 active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
              aria-label="Vehículo siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* SECCIÓN 2: Scroll Horizontal de 1 línea de Negocios Destacados (Sin usar naranja, identidad violeta) */}
      <section id="negocios" className="bg-transparent reveal-on-scroll w-full max-w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 px-0.5">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-[#6D28D9]" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Negocios destacados
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Nav Arrows (desktop / tablet) */}
            <div className="hidden sm:flex items-center gap-1 mr-1">
              <button
                onClick={() => scrollBusinessStep('left')}
                className="p-1.5 rounded-xl bg-white border border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-purple-400 active:scale-95 shadow-sm transition-all cursor-pointer"
                title="Anterior"
                aria-label="Negocio anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollBusinessStep('right')}
                className="p-1.5 rounded-xl bg-white border border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-purple-400 active:scale-95 shadow-sm transition-all cursor-pointer"
                title="Siguiente"
                aria-label="Negocio siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {onNavigateToBusinesses && (
              <button
                onClick={onNavigateToBusinesses}
                className="text-xs font-extrabold text-[#6D28D9] hover:text-[#5B21B6] flex items-center gap-1.5 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-xl border border-purple-300/60 transition-all cursor-pointer"
              >
                <span>Ver todos ({businesses.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Scroll Track - 1 Line Businesses con Peek en Celular */}
        <div
          ref={businessesScrollRef}
          onScroll={handleBusinessesScroll}
          className="flex items-stretch gap-3 sm:gap-3.5 overflow-x-auto scroll-smooth pb-2 pt-1 px-1 no-scrollbar snap-x snap-mandatory w-full max-w-full"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {businesses.map((b) => (
            <div
              key={b.id || b.name}
              className="w-[86%] sm:w-[255px] flex-shrink-0 snap-start rounded-2xl border-2 border-purple-300 sm:hover:border-[#6D28D9] overflow-hidden flex flex-col justify-between sm:transition-all sm:duration-300 shadow-md shadow-purple-900/10 sm:hover:shadow-xl sm:hover:shadow-purple-900/20 bg-white text-slate-900 group"
            >
              {/* Imagen del Comercio */}
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900 cursor-pointer">
                <img
                  src={b.image || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80'}
                  alt={b.name}
                  className="w-full h-full object-cover sm:group-hover:scale-106 sm:transition-transform sm:duration-400"
                />

                {/* Badge Rubro (Violeta y oscuro) */}
                <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-purple-200 text-[9px] font-black uppercase tracking-wider border border-purple-400/30 shadow-sm">
                    {b.rubroLabel || b.rubro_id || 'SERVICIO'}
                  </span>
                </div>

                {/* Verificado Badge */}
                {b.verified && (
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-950/85 backdrop-blur-md text-emerald-300 text-[9px] font-extrabold flex items-center gap-1 border border-emerald-400/30 shadow-sm">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Oficial
                    </span>
                  </div>
                )}
              </div>

              {/* Info del Comercio */}
              <div className="p-3 sm:p-2.5 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3 className="text-xs font-black text-slate-900 transition-colors line-clamp-1 group-hover:text-[#6D28D9]">
                    {b.name}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] sm:text-[10px] font-bold text-slate-600 mt-1">
                    <span className="flex items-center gap-1 text-[#6D28D9]">
                      <Star className="w-3.5 h-3.5 fill-[#6D28D9] text-[#6D28D9]" />
                      <span className="font-extrabold text-slate-900">{b.rating || 5.0} / 5.0</span>
                    </span>

                    <span className="flex items-center gap-0.5 text-slate-600 truncate max-w-[120px]">
                      <MapPin className="w-3 h-3 text-[#6D28D9] flex-shrink-0" />
                      <span className="truncate">{b.city}</span>
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-purple-200/80">
                  <button
                    onClick={() => handleBusinessWhatsApp(b)}
                    className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[11px] shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contactar WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Puntos de Navegación Discretos y Controles Celular para Negocios */}
        {businesses.length > 1 && (
          <div className="flex items-center justify-between sm:justify-center gap-2 pt-2.5 pb-1 px-1">
            <button
              onClick={() => scrollBusinessStep('left')}
              disabled={activeBusinessIndex === 0}
              className="sm:hidden p-1.5 rounded-xl bg-white border border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-purple-400 active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
              aria-label="Negocio anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 bg-purple-50/80 px-2.5 py-1 rounded-full border border-purple-200/60 shadow-xs">
              <div className="flex items-center justify-center gap-1.5">
                {getVisibleBusinessDotIndices().map((idx) => {
                  const isActive = idx === activeBusinessIndex;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => scrollToBusiness(idx)}
                      className="p-0 m-0 border-0 outline-none rounded-full cursor-pointer block transition-all duration-300"
                      style={{
                        backgroundColor: isActive ? '#6D28D9' : '#DDD6FE',
                        width: isActive ? '20px' : '6px',
                        height: '6px'
                      }}
                      aria-label={`Ir al negocio ${idx + 1}`}
                      title={`Negocio ${idx + 1}`}
                    />
                  );
                })}
              </div>

              <span className="text-[10px] font-extrabold text-[#6D28D9] font-mono tracking-tight pl-1 border-l border-purple-200">
                {activeBusinessIndex + 1}/{businesses.length}
              </span>
            </div>

            <button
              onClick={() => scrollBusinessStep('right')}
              disabled={activeBusinessIndex >= businesses.length - 1}
              className="sm:hidden p-1.5 rounded-xl bg-white border border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-purple-400 active:scale-95 disabled:opacity-25 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
              aria-label="Negocio siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* SECCIÓN 3: Mundo Automotor - Encontrá servicios para tu vehículo */}
      <section id="mundo-automotor" className="bg-transparent reveal-on-scroll w-full max-w-full pt-2">
        {/* Header con título oscuro e identidad violeta */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 gap-2 px-0.5">
          <div>
            <div className="flex items-center gap-2">
              <Car className="w-5 h-5 text-[#6D28D9]" />
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Mundo Automotor
              </h2>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
              Encontrá servicios para tu vehículo
            </p>
          </div>

          <button
            onClick={() => {
              if (onSelectRubro) onSelectRubro('all');
              else if (onNavigateToBusinesses) onNavigateToBusinesses();
            }}
            className="text-xs font-extrabold text-[#6D28D9] hover:text-[#5B21B6] self-start sm:self-auto flex items-center gap-1.5 bg-purple-100 hover:bg-purple-200 px-3 py-1.5 rounded-xl border border-purple-300/60 transition-all cursor-pointer"
          >
            <span>Explorar rubros</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Grilla de 2 columnas para celular y 3 / 6 para pantallas mayores */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {MUNDO_AUTOMOTOR_RUBROS.map((rubro) => (
            <div
              key={rubro.id}
              onClick={() => {
                if (onSelectRubro) {
                  onSelectRubro(rubro.id);
                } else if (onNavigateToBusinesses) {
                  onNavigateToBusinesses();
                }
              }}
              className="relative group overflow-hidden rounded-2xl border-2 border-purple-200/90 sm:hover:border-[#6D28D9] shadow-md shadow-purple-900/10 sm:hover:shadow-xl sm:hover:shadow-purple-900/20 sm:transition-all sm:duration-300 cursor-pointer active:scale-95 aspect-[4/3] sm:aspect-[16/11] bg-slate-900"
            >
              {/* Foto que corresponde a cada rubro */}
              <img
                src={rubro.image}
                alt={rubro.name}
                className="w-full h-full object-cover sm:group-hover:scale-108 sm:transition-transform sm:duration-500 ease-out"
                loading="lazy"
              />

              {/* Franja oscura sutil en la parte inferior */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/95 via-slate-950/65 to-transparent pt-8 pb-2.5 px-2.5 sm:px-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  {/* Pequeño acento violeta */}
                  <span className="w-1.5 h-3.5 bg-[#6D28D9] rounded-full shrink-0 shadow-xs" />
                  <span className="text-white text-xs sm:text-[13px] font-extrabold tracking-tight truncate drop-shadow-sm group-hover:text-purple-200 transition-colors">
                    {rubro.name}
                  </span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-purple-300 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0 ml-1" />
              </div>
            </div>
          ))}
        </div>

        {/* Enlace al final: Ver todos los rubros */}
        <div className="flex items-center justify-center pt-5">
          <button
            onClick={() => {
              if (onSelectRubro) {
                onSelectRubro('all');
              } else if (onNavigateToBusinesses) {
                onNavigateToBusinesses();
              }
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-purple-50 text-[#6D28D9] hover:text-[#5B21B6] border-2 border-purple-200 hover:border-[#6D28D9] font-black text-xs sm:text-sm shadow-sm transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <span>Ver todos los rubros</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
}
