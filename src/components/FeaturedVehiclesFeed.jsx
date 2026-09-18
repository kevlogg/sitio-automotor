import React from 'react';
import { ArrowRight, Heart, Eye, MessageCircle } from 'lucide-react';

export default function FeaturedVehiclesFeed({
  cardTheme = 'violet',
  vehicles,
  favorites,
  onToggleFavorite,
  onOpenDetailModal,
  onWhatsAppContact
}) {
  const isDark = cardTheme === 'dark';

  return (
    <section id="vehiculos" className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Vehículos destacados
          </h2>

          <a href="#vehiculos" className="text-xs font-bold text-[#6D28D9] hover:text-[#5B21B6] flex items-center gap-1">
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {vehicles.map((item) => {
            const isFav = favorites.includes(item.id);

            return (
              <div
                key={item.id}
                className={`group rounded-2xl border overflow-hidden flex flex-col justify-between hover:-translate-y-0.5 transition-all duration-300 shadow-md hover:shadow-xl ${
                  isDark
                    ? 'bg-[#0D121F]/95 backdrop-blur-md border-slate-800 hover:bg-[#182235] hover:border-[#8B5CF6] text-white'
                    : 'bg-[#E4DAF8] border-purple-300/90 hover:bg-white hover:border-[#6D28D9] text-slate-900'
                }`}
              >
                {/* Image 16:9 with category badge */}
                <div className="relative aspect-video overflow-hidden bg-slate-100 cursor-pointer" onClick={() => onOpenDetailModal(item)}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Left Badge */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                      {item.category === 'autos' ? 'AUTO' : item.category === 'camionetas' ? 'CAMIONETA' : item.category === 'motos' ? 'MOTO' : item.category === 'camiones' ? 'CAMIÓN' : 'NÁUTICA'}
                    </span>
                  </div>

                  {/* Favorite button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-md border transition-all z-10 ${
                      isFav
                        ? 'bg-[#6D28D9] border-purple-400 text-white'
                        : 'bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white text-white' : ''}`} />
                  </button>
                </div>

                {/* Content */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <h3
                      onClick={() => onOpenDetailModal(item)}
                      className={`text-sm font-bold transition-colors cursor-pointer line-clamp-1 ${
                        isDark ? 'text-white hover:text-[#A78BFA]' : 'text-slate-900 hover:text-[#6D28D9]'
                      }`}
                    >
                      {item.title}
                    </h3>

                    <p className={`text-[11px] mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {item.year} • {item.mileage} • {item.location.split(',')[0]}
                    </p>
                  </div>

                  {/* Price */}
                  <div className={`pt-2 border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-purple-200/80'}`}>
                    <span className={`text-sm font-extrabold font-mono ${isDark ? 'text-[#A78BFA]' : 'text-[#6D28D9]'}`}>
                      US$ {item.price.toLocaleString('es-AR')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenDetailModal(item)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          isDark
                            ? 'bg-slate-800 hover:bg-[#8B5CF6] text-slate-200 hover:text-white'
                            : 'bg-slate-100 hover:bg-[#6D28D9] text-slate-700 hover:text-white'
                        }`}
                        title="Ver detalle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onWhatsAppContact(item)}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
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

      </div>
    </section>
  );
}
