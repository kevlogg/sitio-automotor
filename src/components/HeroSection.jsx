import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function HeroSection({ onOpenPublishModal, onSearchScroll }) {
  const [slides, setSlides] = useState(() => {
    try {
      const savedSlides = localStorage.getItem('sa_hero_slides');
      if (savedSlides) {
        const parsed = JSON.parse(savedSlides);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      const legacyUrl = localStorage.getItem('sa_hero_image_url');
      if (legacyUrl) {
        return [{
          id: 'legacy-1',
          imageUrl: legacyUrl,
          linkUrl: localStorage.getItem('sa_hero_link_url') || ''
        }];
      }
    } catch (e) {
      console.warn('Error reading saved hero slides:', e);
    }
    return [{
      id: 'default-1',
      imageUrl: '/hero_daylight_fleet.png',
      linkUrl: ''
    }];
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Load from Supabase site_settings (hero_slides or legacy hero_image_url)
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('id, value')
          .in('id', ['hero_slides', 'hero_image_url', 'hero_link_url']);

        if (!isMounted || !data) return;

        const slidesRow = data.find(r => r.id === 'hero_slides');
        const imgRow = data.find(r => r.id === 'hero_image_url');
        const linkRow = data.find(r => r.id === 'hero_link_url');

        if (slidesRow?.value?.trim()) {
          try {
            const parsed = JSON.parse(slidesRow.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSlides(parsed);
              localStorage.setItem('sa_hero_slides', JSON.stringify(parsed));
              return;
            }
          } catch (e) {
            console.warn('Failed parsing hero_slides:', e);
          }
        }

        if (imgRow?.value?.trim()) {
          const single = [{
            id: 'cloud-1',
            imageUrl: imgRow.value.trim(),
            linkUrl: linkRow?.value?.trim() || ''
          }];
          setSlides(single);
          localStorage.setItem('sa_hero_image_url', imgRow.value.trim());
          if (linkRow?.value?.trim()) {
            localStorage.setItem('sa_hero_link_url', linkRow.value.trim());
          }
        }
      } catch (err) {
        console.warn('Hero settings load warning:', err);
      }
    })();

    return () => { isMounted = false; };
  }, []);

  // Safe navigation
  const nextSlide = useCallback(() => {
    setSlides(current => {
      if (current.length <= 1) return current;
      setCurrentIndex(prev => (prev + 1) % current.length);
      return current;
    });
  }, []);

  const prevSlide = useCallback(() => {
    setSlides(current => {
      if (current.length <= 1) return current;
      setCurrentIndex(prev => (prev - 1 + current.length) % current.length);
      return current;
    });
  }, []);

  const goToSlide = (idx) => {
    setCurrentIndex(idx);
  };

  // Autoplay (every 5 seconds when multiple slides and not paused)
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 5000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused, nextSlide]);

  // Keep currentIndex in valid bounds if slides change
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  // Touch gesture handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  const handleSlideClick = (slide) => {
    const url = slide?.linkUrl?.trim();
    if (url) {
      if (url.startsWith('http://') || url.startsWith('https://')) {
        window.open(url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = url;
      }
    }
  };

  return (
    <section 
      id="hero" 
      className="relative w-full bg-[#0B0F19] overflow-hidden select-none group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carrusel Slides Container — Proporcional, no recorta altura en ningún dispositivo */}
      <div className="relative w-full flex items-center justify-center min-h-[160px] sm:min-h-[220px] md:min-h-[280px]">
        {slides.map((slide, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={slide.id || idx}
              onClick={() => handleSlideClick(slide)}
              className={`w-full transition-opacity duration-700 ease-in-out ${
                isActive
                  ? 'opacity-100 relative z-10 block'
                  : 'opacity-0 absolute inset-0 z-0 pointer-events-none'
              } ${slide.linkUrl ? 'cursor-pointer' : ''}`}
              title={slide.linkUrl ? `Visitar: ${slide.linkUrl}` : undefined}
            >
              {/* Resplandor ambiental de fondo con los tonos de la imagen */}
              <div 
                className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 scale-110 pointer-events-none"
                style={{ backgroundImage: `url(${slide.imageUrl})` }}
              />

              {/* Imagen completa sin cortes de altura */}
              <div className="relative z-10 w-full flex items-center justify-center">
                <img
                  src={slide.imageUrl}
                  alt={slide.title || `Sitio Automotor Banner ${idx + 1}`}
                  className="w-full h-auto max-h-[460px] sm:max-h-[520px] lg:max-h-[620px] object-contain mx-auto block brightness-105 contrast-105 transition-transform duration-500 group-hover:scale-[1.005]"
                  onError={(e) => {
                    e.currentTarget.src = '/hero_daylight_fleet.png';
                  }}
                />
              </div>

              {/* Indicador flotante si tiene enlace de redirección */}
              {slide.linkUrl && (
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20 shadow-lg pointer-events-none">
                  <span>Abrir enlace</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Flechas de Navegación (Prev / Next) — solo si hay más de 1 imagen */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Banner anterior"
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-[#6D28D9] text-white/90 hover:text-white backdrop-blur-md border border-white/15 shadow-xl transition-all duration-200 cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Banner siguiente"
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-black/50 hover:bg-[#6D28D9] text-white/90 hover:text-white backdrop-blur-md border border-white/15 shadow-xl transition-all duration-200 cursor-pointer opacity-80 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-110 active:scale-95"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Dots / Indicadores de diapositiva */}
          <div className="absolute bottom-2.5 sm:bottom-4 inset-x-0 z-20 flex items-center justify-center gap-1.5 sm:gap-2 pointer-events-auto">
            {slides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  aria-label={`Ir al banner ${idx + 1}`}
                  className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    isActive
                      ? 'w-7 sm:w-8 bg-[#8B5CF6] shadow-lg shadow-purple-900/60'
                      : 'w-2 sm:w-2.5 bg-white/40 hover:bg-white/80'
                  }`}
                />
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

