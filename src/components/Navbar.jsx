import React, { useState } from 'react';
import { PlusCircle, Menu, X, User, LogOut, Building2, Car, Wrench } from 'lucide-react';

export default function Navbar({
  favoritesCount,
  onOpenPublishModal,
  onOpenFavoritesModal,
  currentUser,
  onOpenAuthModal,
  onOpenDashboard,
  onSignOut,
  currentView = 'home',
  onNavigate
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const navLinks = [
    { name: 'Vehículos', id: 'vehicles', href: '#vehiculos' },
    { name: 'Agencias', id: 'agencies', href: '#agencias' },
    { name: 'Negocios', id: 'businesses', href: '#negocios' },
  ];

  const getUserBadge = () => {
    if (!currentUser?.profile) return null;
    const type = currentUser.profile.user_type;
    if (type === 'agencia') return { label: 'Agencia', icon: Building2, color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' };
    if (type === 'negocio_automotor') return { label: 'Negocio', icon: Wrench, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    return { label: 'Particular', icon: Car, color: 'bg-blue-500/20 text-blue-300 border-blue-500/40' };
  };

  const badgeInfo = getUserBadge();

  const handleNavClick = (viewId, href) => {
    if (onNavigate) {
      onNavigate(viewId);
    } else {
      window.location.hash = href;
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0D111A]/95 backdrop-blur-md border-b border-slate-800/80 transition-all duration-300 shadow-md">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-20">
          
          {/* Logo en el margen izquierdo */}
          <div
            className="flex items-center cursor-pointer shrink-0 z-10"
            onClick={() => {
              if (onNavigate) onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            {!logoError ? (
              <img
                src="/logofrase.png"
                alt="SA Sitio Automotor"
                onError={() => setLogoError(true)}
                className="h-14 sm:h-[58px] lg:h-[64px] max-h-[64px] w-auto object-contain transition-transform hover:scale-105 drop-shadow-md py-1"
              />
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#6D28D9] flex items-center justify-center font-black text-white text-lg shadow-md shadow-purple-900/40">
                  SA
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black tracking-tight text-white">
                    SITIO <span className="text-[#8B5CF6]">AUTOMOTOR</span>
                  </span>
                  <span className="text-[9px] tracking-widest text-slate-400 font-bold uppercase -mt-1">
                    TODO EL MUNDO AUTOMOTOR EN UN SOLO SITIO
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Links Centrales (Vehículos, Agencias, Negocios) - Perfectamente Centrados */}
          <nav className="hidden lg:flex items-center space-x-3 xl:space-x-6 absolute left-1/2 -translate-x-1/2 z-10">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.id, link.href)}
                  className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#6D28D9] text-white shadow-md shadow-purple-900/40 border border-purple-400/40'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>

          {/* Acciones Derechas (Ingresar / Perfil y Publicar mi vehículo) en el margen derecho */}
          <div className="hidden md:flex items-center space-x-3 shrink-0 z-10">
            
            {/* Estado de Sesión / Botón Mi Panel Admin */}
            {currentUser ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-2xl px-3 py-1.5">
                <button
                  onClick={onOpenDashboard}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left"
                  title="Abrir Mi Panel Admin"
                >
                  <div className="w-7 h-7 rounded-xl bg-[#6D28D9] text-white flex items-center justify-center font-bold text-xs shadow-md">
                    {currentUser.profile?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white max-w-[110px] truncate">
                      {currentUser.profile?.business_name || currentUser.profile?.full_name || 'Usuario'}
                    </span>
                    {badgeInfo && (
                      <span className={`text-[9px] font-extrabold border px-1.5 py-0.2 rounded-md ${badgeInfo.color}`}>
                        {badgeInfo.label} • Panel
                      </span>
                    )}
                  </div>
                </button>

                <button
                  onClick={onSignOut}
                  title="Cerrar sesión"
                  className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-2 rounded-xl border border-purple-500/40 bg-purple-950/30 hover:bg-purple-900/50 text-purple-200 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Ingresar / Registro</span>
              </button>
            )}

            {/* CTA + Publicar mi vehículo */}
            <button
              onClick={onOpenPublishModal}
              className="px-4 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center gap-1.5 border border-purple-500/30 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Publicar mi vehículo</span>
            </button>

          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Menú Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0D111A] border-b border-slate-800 px-4 pt-3 pb-6 space-y-3 shadow-xl">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = currentView === link.id;
              return (
                <button
                  key={link.name}
                  onClick={() => handleNavClick(link.id, link.href)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive ? 'bg-[#6D28D9] text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </button>
              );
            })}
          </nav>
          <div className="pt-3 border-t border-slate-800">
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
