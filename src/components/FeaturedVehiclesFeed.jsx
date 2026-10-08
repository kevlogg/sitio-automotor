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

export default function FeaturedVehiclesFeed({
  cardTheme = 'violet',
  vehicles = [],
  businesses = SEED_BUSINESSES,
  favorites = [],
  onToggleFavorite,
  onOpenDetailModal,
  onWhatsAppContact,
  onNavigateToAllVehicles,
  onNavigateToBusinesses
}) {
  const isDark = cardTheme === 'dark';
  const containerRef = useScrollReveal({ threshold: 0.1 });
  const [animatingFavId, setAnimatingFavId] = useState(null);

  const vehiclesScrollRef = useRef(null);
  const businessesScrollRef = useRef(null);

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
    <div ref={containerRef} className="space-y-6 flex flex-col justify-between h-full">
      
      {/* SECCIÓN 1: Scroll Horizontal de 1 línea de Vehículos Destacados */}
      <section id="vehiculos" className="bg-transparent reveal-on-scroll">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-[#6D28D9]" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Vehículos destacados
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Nav Arrows */}
            <div className="hidden sm:flex items-center gap-1 mr-1">
              <button
                onClick={() => scrollContainer(vehiclesScrollRef, 'left')}
                className="p-1.5 rounded-xl bg-white border border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-purple-400 shadow-sm transition-all cursor-pointer"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(vehiclesScrollRef, 'right')}
                className="p-1.5 rounded-xl bg-white border border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-purple-400 shadow-sm transition-all cursor-pointer"
                title="Siguiente"
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

        {/* Horizontal Scroll Track - 1 Line Vehicles */}
        <div
          ref={vehiclesScrollRef}
          className="flex items-stretch gap-3.5 overflow-x-auto scroll-smooth pb-2 pt-1 no-scrollbar snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {vehicles.map((item) => {
            const isFav = favorites.includes(item.id);
            const isAnimatingFav = animatingFavId === item.id;

            return (
              <div
                key={item.id}
                className="w-[240px] sm:w-[255px] flex-shrink-0 snap-start rounded-2xl border-2 border-purple-300 hover:border-[#6D28D9] overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-lg shadow-purple-900/10 hover:shadow-2xl hover:shadow-purple-900/20 bg-white text-slate-900 group"
              >
                {/* Imagen Más Grande (Ocupa la mayor parte de la card) */}
                <div
                  className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900 cursor-pointer"
                  onClick={() => onOpenDetailModal && onOpenDetailModal(item)}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-400"
                  />

                  {/* Badge Categoría */}
                  <div className="absolute top-2 left-2 z-10">
                    <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider border border-white/20">
                      {item.category === 'autos' ? 'AUTO' : item.category === 'camionetas' ? 'CAMIONETA' : item.category === 'motos' ? 'MOTO' : item.category === 'camiones' ? 'CAMIÓN' : 'AGRO'}
                    </span>
                  </div>

                  {/* Favorito */}
                  <button
                    onClick={(e) => handleFavoriteClick(e, item.id)}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg backdrop-blur-md border transition-all z-10 active:scale-90 ${
                      isFav
                        ? 'bg-[#6D28D9] border-purple-400 text-white'
                        : 'bg-slate-950/60 border-purple-500/40 text-purple-200 hover:text-white hover:bg-purple-900/80'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white text-white' : ''} ${isAnimatingFav ? 'animate-heart-pop' : ''}`} />
                  </button>
                </div>

                {/* Info Más Chica y Compacta */}
                <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-1.5">
                  <div>
                    <h3
                      onClick={() => onOpenDetailModal && onOpenDetailModal(item)}
                      className="text-xs font-extrabold text-slate-900 transition-colors cursor-pointer line-clamp-1 group-hover:text-[#6D28D9]"
                    >
                      {item.title}
                    </h3>

                    <p className="text-[10px] font-bold text-purple-900/70 mt-0.5 truncate">
                      {item.year} • {item.mileage} • {item.location.split(',')[0]}
                    </p>
                  </div>

                  <div className="pt-1.5 border-t border-purple-200/80 flex items-center justify-between">
                    <span className="text-xs font-black font-mono text-[#6D28D9]">
                      US$ {item.price.toLocaleString('es-AR')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenDetailModal && onOpenDetailModal(item)}
                        className="p-1 rounded-lg bg-purple-100 hover:bg-[#6D28D9] text-purple-700 hover:text-white border border-purple-300 transition-all cursor-pointer"
                        title="Ver detalle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onWhatsAppContact && onWhatsAppContact(item)}
                        className="p-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer"
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
      </section>

      {/* SECCIÓN 2: Scroll Horizontal de 1 línea de Negocios Destacados */}
      <section id="negocios" className="bg-transparent reveal-on-scroll">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Negocios destacados
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Nav Arrows */}
            <div className="hidden sm:flex items-center gap-1 mr-1">
              <button
                onClick={() => scrollContainer(businessesScrollRef, 'left')}
                className="p-1.5 rounded-xl bg-white border border-amber-200 text-slate-700 hover:text-amber-600 hover:border-amber-400 shadow-sm transition-all cursor-pointer"
                title="Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollContainer(businessesScrollRef, 'right')}
                className="p-1.5 rounded-xl bg-white border border-amber-200 text-slate-700 hover:text-amber-600 hover:border-amber-400 shadow-sm transition-all cursor-pointer"
                title="Siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {onNavigateToBusinesses && (
              <button
                onClick={onNavigateToBusinesses}
                className="text-xs font-extrabold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl border border-amber-300/70 transition-all cursor-pointer"
              >
                <span>+ Más Negocios</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Scroll Track - 1 Line Businesses */}
        <div
          ref={businessesScrollRef}
          className="flex items-stretch gap-3.5 overflow-x-auto scroll-smooth pb-2 pt-1 no-scrollbar snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {businesses.map((b) => (
            <div
              key={b.id || b.name}
              className="w-[240px] sm:w-[255px] flex-shrink-0 snap-start rounded-2xl border-2 border-amber-300 hover:border-amber-500 overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-lg shadow-amber-900/10 hover:shadow-2xl hover:shadow-amber-900/20 bg-white text-slate-900 group"
            >
              {/* Imagen Más Grande del Comercio */}
              <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900 cursor-pointer">
                <img
                  src={b.image || 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=600&q=80'}
                  alt={b.name}
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-400"
                />

                {/* Badge Rubro */}
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-amber-300 text-[9px] font-black uppercase tracking-wider border border-amber-400/30">
                    {b.rubroLabel || b.rubro_id || 'SERVICIO'}
                  </span>
                </div>

                {/* Verificado Badge */}
                {b.verified && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/85 backdrop-blur-md text-emerald-300 text-[9px] font-extrabold flex items-center gap-1 border border-emerald-400/30">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Oficial
                    </span>
                  </div>
                )}
              </div>

              {/* Info Más Chica y Compacta del Comercio */}
              <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-1.5">
                <div>
                  <h3 className="text-xs font-black text-slate-900 transition-colors line-clamp-1 group-hover:text-amber-600">
                    {b.name}
                  </h3>

                  <div className="flex items-center justify-between text-[10px] font-bold text-amber-900/80 mt-1">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                      {b.rating || 5.0} / 5.0
                    </span>

                    <span className="flex items-center gap-0.5 text-slate-600 truncate max-w-[110px]">
                      <MapPin className="w-3 h-3 text-amber-500 flex-shrink-0" />
                      {b.city}
                    </span>
                  </div>
                </div>

                <div className="pt-1.5 border-t border-amber-200/80">
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
      </section>

    </div>
  );
}
