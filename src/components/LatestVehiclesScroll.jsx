import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  Heart,
  Eye,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function LatestVehiclesScroll({
  vehicles = [],
  favorites = [],
  onToggleFavorite,
  onOpenDetailModal,
  onWhatsAppContact,
  onNavigateToAllVehicles
}) {
  const containerRef = useScrollReveal({ threshold: 0.1 });
  const scrollTrackRef = useRef(null);
  const [animatingFavId, setAnimatingFavId] = useState(null);

  // Take latest 12 vehicles
  const latestVehicles = vehicles.slice(0, 12);

  const scrollContainer = (direction) => {
    if (scrollTrackRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollTrackRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
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

  return (
    <section ref={containerRef} className="w-full bg-transparent reveal-on-scroll py-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-100 border border-purple-300 text-[#6D28D9]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Últimos vehículos publicados
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-200" />
                Recientes
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 hidden sm:block mt-0.5">
              Las últimas incorporaciones al catálogo en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scroll Nav Buttons */}
          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            <button
              onClick={() => scrollContainer('left')}
              className="p-2 rounded-xl bg-white border-2 border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-[#6D28D9] shadow-sm hover:shadow-md transition-all cursor-pointer"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollContainer('right')}
              className="p-2 rounded-xl bg-white border-2 border-purple-200 text-slate-700 hover:text-[#6D28D9] hover:border-[#6D28D9] shadow-sm hover:shadow-md transition-all cursor-pointer"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {onNavigateToAllVehicles && (
            <button
              onClick={onNavigateToAllVehicles}
              className="text-xs font-extrabold text-white hover:bg-[#5B21B6] flex items-center gap-1.5 bg-[#6D28D9] px-4 py-2 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <span>Ver catálogo ({vehicles.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Horizontal Scroll Track */}
      <div
        ref={scrollTrackRef}
        className="flex items-stretch gap-4 overflow-x-auto scroll-smooth pb-3 pt-1 no-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {latestVehicles.map((item) => {
          const isFav = favorites.includes(item.id);
          const isAnimatingFav = animatingFavId === item.id;

          return (
            <div
              key={item.id}
              className="w-[250px] sm:w-[270px] flex-shrink-0 snap-start rounded-2xl border-2 border-purple-300 hover:border-[#6D28D9] overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-lg shadow-purple-900/10 hover:shadow-2xl hover:shadow-purple-900/20 bg-white text-slate-900 group"
            >
              {/* Imagen con Aspect Ratio Prominente */}
              <div
                className="relative h-44 sm:h-48 w-full overflow-hidden bg-slate-900 cursor-pointer"
                onClick={() => onOpenDetailModal && onOpenDetailModal(item)}
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-400"
                />

                {/* Badge Categoría & Nuevo */}
                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-wider border border-white/20">
                    {item.category === 'autos' ? 'AUTO' : item.category === 'camionetas' ? 'CAMIONETA' : item.category === 'motos' ? 'MOTO' : item.category === 'camiones' ? 'CAMIÓN' : 'AGRO'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-600/90 text-white text-[9px] font-black uppercase tracking-wider">
                    ¡NUEVO!
                  </span>
                </div>

                {/* Botón Favorito */}
                <button
                  onClick={(e) => handleFavoriteClick(e, item.id)}
                  className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md border transition-all z-10 active:scale-90 ${
                    isFav
                      ? 'bg-[#6D28D9] border-purple-400 text-white'
                      : 'bg-slate-950/60 border-purple-500/40 text-purple-200 hover:text-white hover:bg-purple-900/80'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white text-white' : ''} ${isAnimatingFav ? 'animate-heart-pop' : ''}`} />
                </button>
              </div>

              {/* Información Compacta y de Alto Contraste */}
              <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                <div>
                  <h3
                    onClick={() => onOpenDetailModal && onOpenDetailModal(item)}
                    className="text-xs font-black text-slate-900 transition-colors cursor-pointer line-clamp-1 group-hover:text-[#6D28D9]"
                  >
                    {item.title}
                  </h3>

                  <p className="text-[10px] font-bold text-purple-900/70 mt-1 truncate">
                    {item.year} • {item.mileage} • {item.location.split(',')[0]}
                  </p>
                </div>

                <div className="pt-2 border-t border-purple-200/80 flex items-center justify-between">
                  <span className="text-xs font-black font-mono text-[#6D28D9]">
                    US$ {item.price.toLocaleString('es-AR')}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenDetailModal && onOpenDetailModal(item)}
                      className="p-1.5 rounded-lg bg-purple-100 hover:bg-[#6D28D9] text-purple-700 hover:text-white border border-purple-300 transition-all cursor-pointer"
                      title="Ver detalle"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onWhatsAppContact && onWhatsAppContact(item)}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm cursor-pointer"
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
  );
}
