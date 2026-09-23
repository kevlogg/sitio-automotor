import React from 'react';
import { Search } from 'lucide-react';

export default function HeroSection({ onOpenPublishModal, onSearchScroll }) {
  return (
    <section id="hero" className="relative w-full min-h-[520px] lg:min-h-[580px] flex items-center overflow-hidden py-12">
      
      {/* Full Width Daylight Fleet Background Image - Multi-Vehicle Showcase */}
      <div className="absolute inset-0 z-0">
        <img
          src="/hero_daylight_fleet.png"
          alt="Sitio Automotor Flota Vehicular Completa de Día"
          className="w-full h-full object-cover object-center opacity-100 brightness-105 contrast-105"
        />

        {/* Soft Left Gradient Overlay for Maximum Text Contrast (Directly on Image, No Card) */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/40 to-transparent w-full lg:w-2/3 pointer-events-none"></div>

        {/* Smooth Difuminado Fade at the Bottom Transitioning Seamlessly to #F8FAFC */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#F8FAFC] to-transparent pointer-events-none"></div>
      </div>

      {/* Hero Content directly on top of image */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-8 lg:gap-12">
          
          {/* Left Side: Title, Subtitle, Action Buttons */}
          <div className="w-full lg:w-7/12 text-left space-y-6">
            
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.08] drop-shadow-xl animate-hero-reveal delay-75">
              Todo el mundo <br />
              automotor <br />
              <span className="text-[#A78BFA] drop-shadow-md">en un solo sitio.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-slate-100 text-sm sm:text-base leading-relaxed font-semibold drop-shadow-md max-w-xl animate-hero-reveal delay-150">
              Autos, camionetas, motos, camiones y náutica.<br />
              Comprá, vendé y conectate con agencias y particulares verificados.
            </p>

            {/* Buttons Row */}
            <div className="flex flex-wrap items-center gap-4 pt-2 animate-hero-reveal delay-250">
              
              {/* Primary Search Button */}
              <button
                onClick={onSearchScroll}
                className="px-6 py-3.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm shadow-xl shadow-purple-900/40 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-700/60 active:scale-[0.98] flex items-center gap-2 border border-purple-400/40 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Buscar vehículos</span>
              </button>

              {/* Secondary Publish Button */}
              <button
                onClick={onOpenPublishModal}
                className="px-6 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-white font-bold text-sm border border-slate-700/80 backdrop-blur-md shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-slate-950 active:scale-[0.98] cursor-pointer"
              >
                <span>Publicar mi vehículo</span>
              </button>

            </div>

          </div>

          {/* Right Side: Logo principal bien grande sobre el lado derecho */}
          <div className="w-full lg:w-5/12 flex justify-center lg:justify-end items-center animate-hero-reveal delay-200">
            <img
              src="/logo.png"
              alt="Sitio Automotor Logo Principal"
              className="h-32 sm:h-44 lg:h-56 xl:h-64 w-auto object-contain drop-shadow-[0_20px_25px_rgba(0,0,0,0.7)] filter brightness-110 hover:scale-105 transition-transform duration-300"
            />
          </div>

        </div>
      </div>"

    </section>
  );
}
