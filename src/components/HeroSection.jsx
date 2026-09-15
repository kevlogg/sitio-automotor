import React from 'react';
import { Search } from 'lucide-react';

export default function HeroSection({ onOpenPublishModal, onSearchScroll }) {
  return (
    <section id="hero" className="relative bg-[#0D111A] min-h-[500px] lg:min-h-[560px] flex items-center overflow-hidden pt-8 pb-16">
      
      {/* Full Background Image displaying vehicles on center-right */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_exact.png"
          alt="Sitio Automotor Flota Vehicular"
          className="w-full h-full object-cover object-right lg:object-center opacity-95 brightness-100 contrast-105"
        />
        
        {/* Soft Dark Overlay Fading on the Left to Ensure High Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0D111A] via-[#0D111A]/85 to-transparent w-full lg:w-3/5"></div>
        {/* Bottom Fade to section base */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#0D111A] to-transparent"></div>
        {/* Top Fade from navbar */}
        <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#0D111A]/80 to-transparent"></div>
      </div>

      {/* Left Content Container matching reference screenshot */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-xl text-left space-y-6">
          
          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-lg">
            Todo el mundo <br />
            automotor <br />
            <span className="text-[#8B5CF6]">en un solo sitio.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-medium drop-shadow-md">
            Autos, camionetas, motos, camiones y náutica.<br />
            Comprá, vendé y conectate.
          </p>

          {/* Buttons Row Perfectly Aligned Horizontally */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            
            {/* Primary Search Button */}
            <button
              onClick={onSearchScroll}
              className="px-6 py-3.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm shadow-xl shadow-purple-950/60 transition-all flex items-center gap-2 border border-purple-500/30 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>Buscar vehículos</span>
            </button>

            {/* Secondary Publish Button with Floating Notice Badge */}
            <div className="relative inline-flex items-center">
              <button
                onClick={onOpenPublishModal}
                className="px-6 py-3.5 rounded-xl bg-[#0D111A]/80 hover:bg-slate-900 text-white font-bold text-sm border border-slate-700/90 backdrop-blur-md transition-all active:scale-95"
              >
                <span>Publicar mi vehículo</span>
              </button>
              
              {/* Floating Notice Tag Badge */}
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-0.5 rounded-full bg-[#6D28D9] text-white text-[10px] font-bold shadow-lg border border-purple-400/50 pointer-events-none tracking-wide">
                $15.000 por 30 días
              </span>
            </div>


          </div>


        </div>
      </div>

    </section>
  );
}
