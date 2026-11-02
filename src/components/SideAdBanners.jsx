import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { ExternalLink, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Abre o navega a la URL de destino de la publicidad.
 * - Soporta URLs externas (https://..., http://..., wa.me/...) abriéndolas en una nueva pestaña.
 * - Soporta URLs internas (ej: /planes, /agencias, /negocios, #contacto) navegando fluidamente dentro de la SPA.
 */
export function openAdDestination(url, defaultAction) {
  if (!url || !url.trim()) {
    if (defaultAction) defaultAction();
    return;
  }

  const trimmed = url.trim();
  const isExternal = /^https?:\/\//i.test(trimmed) || 
                     trimmed.startsWith('//') || 
                     /^wa\.me\//i.test(trimmed) || 
                     /^mailto:/i.test(trimmed) || 
                     /^tel:/i.test(trimmed);

  if (isExternal) {
    const finalUrl = /^wa\.me\//i.test(trimmed) ? `https://${trimmed}` : trimmed;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  } else {
    // Enlace ancla interno (hash)
    if (trimmed.startsWith('#')) {
      const el = document.querySelector(trimmed);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    // Ruta interna SPA (ej: /planes, /agencias, /negocios, /vehiculos)
    const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
    try {
      window.history.pushState(null, '', cleanPath);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      window.location.href = cleanPath;
    }
  }
}

const DEFAULT_LEFT_BANNERS = [
  {
    id: 'default-left-1',
    imageUrl: '/ad_left_banner.png',
    linkUrl: '/negocios',
    title: 'Repuestos y Accesorios'
  }
];

const DEFAULT_RIGHT_BANNERS = [
  {
    id: 'default-right-1',
    imageUrl: '/ad_right_banner.png',
    linkUrl: '/planes',
    title: 'Publicá tu Vehículo'
  }
];

// =============================================================================
// PUBLICIDAD IZQUIERDA (CARRUSEL ROTATIVO 7 SEGUNDOS)
// =============================================================================
export function LeftAdCard({ onActionClick }) {
  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('sa_ad_left_banners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacyImg = localStorage.getItem('sa_ad_left_image_url');
      if (legacyImg) {
        return [{ id: 'legacy-left', imageUrl: legacyImg, linkUrl: localStorage.getItem('sa_ad_left_link_url') || '' }];
      }
    } catch (e) {}
    return DEFAULT_LEFT_BANNERS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-rotación cada 7 segundos
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, isPaused, currentIndex]);

  // Carga de configuración desde Supabase site_settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('id, value')
          .in('id', ['ad_left_banners', 'ad_left_image_url', 'ad_left_link_url']);

        if (data && data.length > 0) {
          const bannersRow = data.find(r => r.id === 'ad_left_banners');
          const imgRow = data.find(r => r.id === 'ad_left_image_url');
          const linkRow = data.find(r => r.id === 'ad_left_link_url');

          if (bannersRow?.value) {
            try {
              const parsed = JSON.parse(bannersRow.value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setBanners(parsed);
                localStorage.setItem('sa_ad_left_banners', bannersRow.value);
                return;
              }
            } catch (e) {}
          }

          if (imgRow?.value) {
            const list = [{ id: 'legacy-left', imageUrl: imgRow.value, linkUrl: linkRow?.value || '' }];
            setBanners(list);
            localStorage.setItem('sa_ad_left_banners', JSON.stringify(list));
          }
        }
      } catch (err) {
        console.warn('Ad left settings read warning:', err);
      }
    }

    loadSettings();

    const handleUpdate = (e) => {
      if (e.detail?.leftBanners) {
        setBanners(e.detail.leftBanners);
        setCurrentIndex(0);
      }
    };
    window.addEventListener('sa_ads_updated', handleUpdate);
    return () => window.removeEventListener('sa_ads_updated', handleUpdate);
  }, []);

  const safeIndex = currentIndex < banners.length ? currentIndex : 0;
  const currentBanner = banners[safeIndex] || banners[0] || DEFAULT_LEFT_BANNERS[0];
  const isExternal = currentBanner.linkUrl && /^https?:\/\/|^\/\/|^wa\.me\//i.test(currentBanner.linkUrl);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleClick = () => {
    openAdDestination(currentBanner.linkUrl, onActionClick);
  };

  return (
    <div 
      className="w-40 xl:w-44 shrink-0 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        onClick={handleClick}
        className="group relative rounded-2xl overflow-hidden border border-purple-800/80 bg-[#0F111A] text-white shadow-xl shadow-purple-950/50 cursor-pointer transition-all duration-300 hover:border-purple-400 hover:scale-[1.01] hover:shadow-purple-900/60"
        title={currentBanner.linkUrl ? `Abrir publicidad: ${currentBanner.linkUrl}` : 'Ver publicidad'}
      >
        {/* Contenedor de Banners con Fade Transition */}
        <div className="relative w-full h-[520px] overflow-hidden bg-slate-950">
          {banners.map((b, idx) => (
            <div
              key={b.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === safeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={b.imageUrl}
                alt={b.title || 'Publicidad Repuestos y Accesorios'}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e) => { e.target.src = '/ad_left_banner.png'; }}
              />
            </div>
          ))}

          {/* Top Bar: Etiqueta PUBLICIDAD + Contador si hay varios + Icono de enlace */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-slate-200 border border-white/20 shadow-sm">
                PUBLICIDAD
              </span>
              {banners.length > 1 && (
                <span className="px-1.5 py-0.5 rounded-full bg-purple-950/80 backdrop-blur-md text-[8px] font-mono font-bold text-purple-300 border border-purple-500/30">
                  {safeIndex + 1}/{banners.length}
                </span>
              )}
            </div>

            {currentBanner.linkUrl && (
              <div 
                className="p-1 rounded-full bg-purple-600/90 text-white backdrop-blur-md border border-white/20 shadow-md"
                title={isExternal ? 'Enlace externo' : 'Enlace interno del sitio'}
              >
                {isExternal ? (
                  <ExternalLink className="w-2.5 h-2.5" />
                ) : (
                  <ArrowRight className="w-2.5 h-2.5" />
                )}
              </div>
            )}
          </div>

          {/* Flechas de navegación manual en hover si hay múltiples banners */}
          {banners.length > 1 && (
            <div className="absolute inset-y-0 left-1 right-1 flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <button
                type="button"
                onClick={handlePrev}
                className="pointer-events-auto p-1 rounded-full bg-black/70 hover:bg-purple-600 text-white transition-all transform hover:scale-110 shadow-lg border border-white/20 cursor-pointer"
                title="Banner anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="pointer-events-auto p-1 rounded-full bg-black/70 hover:bg-purple-600 text-white transition-all transform hover:scale-110 shadow-lg border border-white/20 cursor-pointer"
                title="Siguiente banner"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Dots Indicadores del Carrusel (solo si hay más de 1 banner, sin sombreado sobre la imagen) */}
          {banners.length > 1 && (
            <div className="absolute bottom-2.5 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm pointer-events-auto border border-white/10 shadow-sm">
                {banners.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(dotIdx);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      dotIdx === safeIndex 
                        ? 'w-5 bg-purple-400 shadow-sm shadow-purple-500/50' 
                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Ver imagen ${dotIdx + 1} de ${banners.length}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// =============================================================================
// PUBLICIDAD DERECHA (CARRUSEL ROTATIVO 7 SEGUNDOS)
// =============================================================================
export function RightAdCard({ onActionClick }) {
  const [banners, setBanners] = useState(() => {
    try {
      const saved = localStorage.getItem('sa_ad_right_banners');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacyImg = localStorage.getItem('sa_ad_right_image_url');
      if (legacyImg) {
        return [{ id: 'legacy-right', imageUrl: legacyImg, linkUrl: localStorage.getItem('sa_ad_right_link_url') || '' }];
      }
    } catch (e) {}
    return DEFAULT_RIGHT_BANNERS;
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  // Auto-rotación cada 7 segundos
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 7000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [banners.length, isPaused, currentIndex]);

  // Carga de configuración desde Supabase site_settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('id, value')
          .in('id', ['ad_right_banners', 'ad_right_image_url', 'ad_right_link_url']);

        if (data && data.length > 0) {
          const bannersRow = data.find(r => r.id === 'ad_right_banners');
          const imgRow = data.find(r => r.id === 'ad_right_image_url');
          const linkRow = data.find(r => r.id === 'ad_right_link_url');

          if (bannersRow?.value) {
            try {
              const parsed = JSON.parse(bannersRow.value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setBanners(parsed);
                localStorage.setItem('sa_ad_right_banners', bannersRow.value);
                return;
              }
            } catch (e) {}
          }

          if (imgRow?.value) {
            const list = [{ id: 'legacy-right', imageUrl: imgRow.value, linkUrl: linkRow?.value || '' }];
            setBanners(list);
            localStorage.setItem('sa_ad_right_banners', JSON.stringify(list));
          }
        }
      } catch (err) {
        console.warn('Ad right settings read warning:', err);
      }
    }

    loadSettings();

    const handleUpdate = (e) => {
      if (e.detail?.rightBanners) {
        setBanners(e.detail.rightBanners);
        setCurrentIndex(0);
      }
    };
    window.addEventListener('sa_ads_updated', handleUpdate);
    return () => window.removeEventListener('sa_ads_updated', handleUpdate);
  }, []);

  const safeIndex = currentIndex < banners.length ? currentIndex : 0;
  const currentBanner = banners[safeIndex] || banners[0] || DEFAULT_RIGHT_BANNERS[0];
  const isExternal = currentBanner.linkUrl && /^https?:\/\/|^\/\/|^wa\.me\//i.test(currentBanner.linkUrl);

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const handleClick = () => {
    openAdDestination(currentBanner.linkUrl, onActionClick);
  };

  return (
    <div 
      className="w-40 xl:w-44 shrink-0 select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div 
        onClick={handleClick}
        className="group relative rounded-2xl overflow-hidden border border-purple-800/80 bg-[#0F111A] text-white shadow-xl shadow-purple-950/50 cursor-pointer transition-all duration-300 hover:border-purple-400 hover:scale-[1.01] hover:shadow-purple-900/60"
        title={currentBanner.linkUrl ? `Abrir publicidad: ${currentBanner.linkUrl}` : 'Ver publicidad'}
      >
        {/* Contenedor de Banners con Fade Transition */}
        <div className="relative w-full h-[520px] overflow-hidden bg-slate-950">
          {banners.map((b, idx) => (
            <div
              key={b.id || idx}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                idx === safeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={b.imageUrl}
                alt={b.title || 'Publicidad Publicá tu Vehículo'}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                onError={(e) => { e.target.src = '/ad_right_banner.png'; }}
              />
            </div>
          ))}

          {/* Top Bar: Etiqueta PUBLICIDAD + Contador si hay varios + Icono de enlace */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-slate-200 border border-white/20 shadow-sm">
                PUBLICIDAD
              </span>
              {banners.length > 1 && (
                <span className="px-1.5 py-0.5 rounded-full bg-purple-950/80 backdrop-blur-md text-[8px] font-mono font-bold text-purple-300 border border-purple-500/30">
                  {safeIndex + 1}/{banners.length}
                </span>
              )}
            </div>

            {currentBanner.linkUrl && (
              <div 
                className="p-1 rounded-full bg-purple-600/90 text-white backdrop-blur-md border border-white/20 shadow-md"
                title={isExternal ? 'Enlace externo' : 'Enlace interno del sitio'}
              >
                {isExternal ? (
                  <ExternalLink className="w-2.5 h-2.5" />
                ) : (
                  <ArrowRight className="w-2.5 h-2.5" />
                )}
              </div>
            )}
          </div>

          {/* Flechas de navegación manual en hover si hay múltiples banners */}
          {banners.length > 1 && (
            <div className="absolute inset-y-0 left-1 right-1 flex items-center justify-between z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <button
                type="button"
                onClick={handlePrev}
                className="pointer-events-auto p-1 rounded-full bg-black/70 hover:bg-purple-600 text-white transition-all transform hover:scale-110 shadow-lg border border-white/20 cursor-pointer"
                title="Banner anterior"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="pointer-events-auto p-1 rounded-full bg-black/70 hover:bg-purple-600 text-white transition-all transform hover:scale-110 shadow-lg border border-white/20 cursor-pointer"
                title="Siguiente banner"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Dots Indicadores del Carrusel (solo si hay más de 1 banner, sin sombreado sobre la imagen) */}
          {banners.length > 1 && (
            <div className="absolute bottom-2.5 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm pointer-events-auto border border-white/10 shadow-sm">
                {banners.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(dotIdx);
                    }}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      dotIdx === safeIndex 
                        ? 'w-5 bg-purple-400 shadow-sm shadow-purple-500/50' 
                        : 'w-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                    title={`Ver imagen ${dotIdx + 1} de ${banners.length}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
