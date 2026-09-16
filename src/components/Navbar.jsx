import React, { useState } from 'react';
import { Heart, PlusCircle, Menu, X } from 'lucide-react';

export default function Navbar({ favoritesCount, onOpenPublishModal, onOpenFavoritesModal }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navLinks = [
    { name: 'Inicio', href: '#hero' },
    { name: 'Vehículos', href: '#vehiculos' },
    { name: 'Agencias', href: '#agencias' },
    { name: 'Servicios', href: '#servicios' },
    { name: 'Quiénes somos', href: '#nosotros' },
    { name: 'Contacto', href: '#contacto' },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav border-b border-slate-200/80 transition-all duration-300 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo original desde public/logo.png */}
          <div className="flex items-center cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            {!logoError ? (
              <img
                src="/logo.png"
                alt="SA Sitio Automotor"
                onError={() => setLogoError(true)}
                className="h-10 sm:h-12 w-auto object-contain rounded-lg"
              />
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#6D28D9] flex items-center justify-center font-black text-white text-lg shadow-md shadow-purple-500/20">
                  SA
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight text-slate-900">
                    SITIO <span className="text-[#6D28D9]">AUTOMOTOR</span>
                  </span>
                  <span className="text-[9px] tracking-widest text-slate-500 font-bold uppercase -mt-1">
                    TODO EL MUNDO AUTOMOTOR EN UN SOLO SITIO
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Links Centrales Desktop */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-3">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#6D28D9] hover:bg-purple-50 transition-all"
              >
                {link.name}
              </a>
            ))}
          </nav>

          {/* Acciones Derechas */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Favoritos */}
            <button
              onClick={onOpenFavoritesModal}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#6D28D9] transition-colors py-2 px-3 rounded-lg hover:bg-slate-100"
              title="Mis Favoritos"
            >
              <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'fill-[#6D28D9] text-[#6D28D9]' : 'text-slate-400'}`} />
              <span>Favoritos</span>
              {favoritesCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#6D28D9] text-white text-[10px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* CTA + Publicar mi vehículo (Sin texto adicional abajo) */}
            <button
              onClick={onOpenPublishModal}
              className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 border border-purple-500/30"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Publicar mi vehículo</span>
            </button>

          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={onOpenFavoritesModal}
              className="p-2 rounded-lg text-slate-600"
            >
              <Heart className={`w-5 h-5 ${favoritesCount > 0 ? 'fill-[#6D28D9] text-[#6D28D9]' : ''}`} />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-[#6D28D9] hover:bg-purple-50"
              >
                {link.name}
              </a>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPublishModal();
              }}
              className="w-full py-2.5 rounded-xl bg-[#6D28D9] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Publicar mi vehículo</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
