import React from 'react';
import { Search } from 'lucide-react';

export default function HeroSection({ onOpenPublishModal, onSearchScroll }) {
  return (
    <section id="hero" className="relative w-full min-h-[520px] lg:min-h-[580px] flex items-center overflow-hidden py-12">
      
      {/* Full Width Background Image - Complete, Unblurred, Edge to Edge */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_exact.png"
          alt="Sitio Automotor Flota Vehicular"
          className="w-full h-full object-cover object-center opacity-100 brightness-100 contrast-105"
        />
      </div>

      {/* Floating Glass Box for Text & CTAs ensuring legibility while showing image 100% full width */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl text-left bg-[#0D111A]/85 backdrop-blur-md border border-slate-700/80 p-6 sm:p-8 rounded-3xl shadow-2xl shadow-black/50 space-y-6">
          
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.12]">
            Todo el mundo <br />
            automotor <br />
            <span className="text-[#8B5CF6]">en un solo sitio.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium">
            Autos, camionetas, motos, camiones y náutica.<br />
            Comprá, vendé y conectate con agencias y particulares verificados.
          </p>

          {/* Buttons Row */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            
            {/* Primary Search Button */}
            <button
              onClick={onSearchScroll}
              className="px-6 py-3.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm shadow-xl shadow-purple-900/50 transition-all flex items-center gap-2 border border-purple-500/30 active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Buscar vehículos</span>
            </button>

            {/* Secondary Publish Button */}
            <button
              onClick={onOpenPublishModal}
              className="px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-sm border border-slate-600 shadow-md backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Publicar mi vehículo</span>
            </button>

          </div>

        </div>
      </div>

    </section>
  );
}
