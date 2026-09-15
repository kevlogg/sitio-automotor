import React from 'react';
import { ArrowRight, Heart, Eye, MessageCircle } from 'lucide-react';

export default function FeaturedVehiclesFeed({
  vehicles,
  favorites,
  onToggleFavorite,
  onOpenDetailModal,
  onWhatsAppContact
}) {
  return (
    <section id="vehiculos" className="py-12 bg-[#0D111A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header matching screenshot */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Vehículos destacados
          </h2>

          <a href="#vehiculos" className="text-xs font-bold text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1">
            <span>Ver todos</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {vehicles.map((item) => {
            const isFav = favorites.includes(item.id);

            return (
              <div
                key={item.id}
                className="group rounded-2xl bg-[#151B28] border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-[#6D28D9] transition-all duration-300"
              >
                {/* Image 16:9 with category badge */}
                <div className="relative aspect-video overflow-hidden bg-slate-900 cursor-pointer" onClick={() => onOpenDetailModal(item)}>
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Left Badge matching screenshot (e.g. "AUTO", "CAMIONETA", "MOTO") */}
                  <div className="absolute top-2.5 left-2.5 z-10">
                    <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
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
                        : 'bg-black/60 border-slate-700/60 text-slate-300 hover:text-white'
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
                      className="text-sm font-bold text-white hover:text-[#8B5CF6] transition-colors cursor-pointer line-clamp-1"
                    >
                      {item.title}
                    </h3>

                    {/* Specs line matching screenshot: "2021 • 56.000 km • CABA" */}
                    <p className="text-[11px] text-slate-400 mt-1">
                      {item.year} • {item.mileage} • {item.location.split(',')[0]}
                    </p>
                  </div>

                  {/* Price in solid violet font */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-sm font-extrabold text-[#8B5CF6] font-mono">
                      US$ {item.price.toLocaleString('es-AR')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenDetailModal(item)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-[#6D28D9] text-white text-xs"
                        title="Ver detalle"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onWhatsAppContact(item)}
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
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
