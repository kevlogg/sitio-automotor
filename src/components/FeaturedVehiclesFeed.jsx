import React, { useState } from 'react';
import { ArrowRight, Heart, Eye, MessageCircle, Car } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function FeaturedVehiclesFeed({
  cardTheme = 'violet',
  vehicles,
  favorites,
  onToggleFavorite,
  onOpenDetailModal,
  onWhatsAppContact,
  onNavigateToAllVehicles
}) {
  const isDark = cardTheme === 'dark';
  const containerRef = useScrollReveal({ threshold: 0.1 });
  const [animatingFavId, setAnimatingFavId] = useState(null);

  const delays = ['delay-75', 'delay-150', 'delay-200', 'delay-300', 'delay-400'];

  const handleFavoriteClick = (e, id) => {
    e.stopPropagation();
    setAnimatingFavId(id);
    onToggleFavorite(id);
    setTimeout(() => {
      setAnimatingFavId(null);
    }, 250);
  };

  // Limit display on home feed to 4 rows max (up to 20 items for 5-col grid)
  const displayedVehicles = vehicles.slice(0, 20);

  return (
    <section id="vehiculos" ref={containerRef} className="bg-transparent">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 reveal-on-scroll">
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Vehículos destacados
        </h2>

        {onNavigateToAllVehicles && (
          <button
            onClick={onNavigateToAllVehicles}
            className="text-xs font-extrabold text-[#6D28D9] hover:text-[#5B21B6] flex items-center gap-1.5 bg-purple-100 hover:bg-purple-200 px-3.5 py-1.5 rounded-xl border border-purple-300/60 transition-all cursor-pointer"
          >
            <span>Ver todos ({vehicles.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Product Cards Grid (Limit to 4 rows max) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {displayedVehicles.map((item, idx) => {
          const isFav = favorites.includes(item.id);
          const isAnimatingFav = animatingFavId === item.id;
          const delayClass = delays[idx % delays.length];

          return (
            <div
              key={item.id}
              className={`group rounded-2xl border overflow-hidden flex flex-col justify-between reveal-on-scroll ${delayClass} hover:-translate-y-1.5 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-purple-950/70 ${
                isDark
                  ? 'bg-[#180E2E]/95 backdrop-blur-md border-purple-900/60 hover:bg-[#231442] hover:border-purple-500 text-white'
                  : 'bg-gradient-to-br from-[#261647] via-[#1E1138] to-[#160B2B] border-purple-700/70 hover:border-purple-400 hover:from-[#311C5B] hover:to-[#21113E] text-white'
              }`}
            >
              {/* Image 16:9 with category badge */}
              <div className="relative aspect-video overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onOpenDetailModal(item)}>
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover object-center group-hover:scale-106 scale-100 transition-transform duration-400 ease-out"
                />

                {/* Top Left Badge */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider border border-white/20 hover:bg-purple-900/90 hover:border-purple-400 transition-colors duration-200">
                    {item.category === 'autos' ? 'AUTO' : item.category === 'camionetas' ? 'CAMIONETA' : item.category === 'motos' ? 'MOTO' : item.category === 'camiones' ? 'CAMIÓN' : item.category === 'nautica' ? 'NÁUTICA' : 'AGRO'}
                  </span>
                </div>

                {/* Favorite button */}
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

              {/* Content */}
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

                {/* Price */}
                <div className="pt-2 border-t border-purple-800/60 flex items-center justify-between">
                  <span className="text-sm font-black font-mono text-purple-300">
                    US$ {item.price.toLocaleString('es-AR')}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenDetailModal(item)}
                      className="p-1.5 rounded-lg bg-purple-950/80 hover:bg-[#6D28D9] text-purple-200 hover:text-white border border-purple-800/50 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
                      title="Ver detalle"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onWhatsAppContact(item)}
                      className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md cursor-pointer"
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

      {/* CTA Botón "Ver todos los autos" */}
      {onNavigateToAllVehicles && (
        <div className="mt-8 text-center">
          <button
            onClick={onNavigateToAllVehicles}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-[#6D28D9] via-purple-700 to-purple-900 hover:from-[#5B21B6] hover:to-purple-950 text-white font-extrabold text-sm shadow-xl shadow-purple-950/40 hover:shadow-purple-900/60 border border-purple-400/40 transition-all duration-300 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3 mx-auto cursor-pointer"
          >
            <Car className="w-5 h-5 text-purple-300" />
            <span>Ver todos los autos ({vehicles.length} disponibles)</span>
            <ArrowRight className="w-5 h-5 text-purple-200" />
          </button>
        </div>
      )}
    </section>
  );
}
