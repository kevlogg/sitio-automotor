import React from 'react';
import { Search } from 'lucide-react';

export default function HeroSection({ onOpenPublishModal, onSearchScroll }) {
  return (
    <section id="hero" className="relative bg-[#F8FAFC] min-h-[500px] lg:min-h-[540px] flex items-center overflow-hidden pt-8 pb-16 border-b border-slate-200/60">
      
      {/* Full Background Image displaying vehicles on center-right */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_exact.png"
          alt="Sitio Automotor Flota Vehicular"
          className="w-full h-full object-cover object-right lg:object-center opacity-90 brightness-105 contrast-100"
        />
        
        {/* Soft Light Overlay Fading on the Left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/95 to-transparent w-full lg:w-3/5"></div>
        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F8FAFC] to-transparent"></div>
        {/* Top Fade */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#F8FAFC]/90 to-transparent"></div>
      </div>

      {/* Left Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl text-left space-y-6">
          
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08]">
            Todo el mundo <br />
            automotor <br />
            <span className="text-[#6D28D9]">en un solo sitio.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed font-medium">
            Autos, camionetas, motos, camiones y náutica.<br />
            Comprá, vendé y conectate con agencias y particulares verificados.
          </p>

          {/* Buttons Row */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            
            {/* Primary Search Button */}
            <button
              onClick={onSearchScroll}
              className="px-6 py-3.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-all flex items-center gap-2 border border-purple-500/30 active:scale-95 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Buscar vehículos</span>
            </button>

            {/* Secondary Publish Button */}
            <button
              onClick={onOpenPublishModal}
              className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border border-slate-300 shadow-md shadow-slate-200/50 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
            >
              <span>Publicar mi vehículo</span>
            </button>

          </div>

        </div>
      </div>

    </section>
  );
}
