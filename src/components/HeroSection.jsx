import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function HeroSection({ onOpenPublishModal, onSearchScroll }) {
  const [heroImageUrl, setHeroImageUrl] = useState(
    // Carga rápida desde localStorage como caché, luego Supabase overrides
    localStorage.getItem('sa_hero_image_url') || '/hero_daylight_fleet.png'
  );

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('id', 'hero_image_url')
          .maybeSingle();
        if (data?.value?.trim()) {
          setHeroImageUrl(data.value.trim());
          localStorage.setItem('sa_hero_image_url', data.value.trim());
        }
      } catch {}
    })();
  }, []);

  return (
    <section id="hero" className="relative w-full min-h-[220px] sm:min-h-[280px] lg:min-h-[340px] flex items-center overflow-hidden">
      
      {/* Full Width Daylight Fleet Background Image - Fade starts much lower (94%) */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%)',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 94%, rgba(0,0,0,0) 100%)'
        }}
      >
        <img
          src={heroImageUrl}
          alt="Sitio Automotor Flota Vehicular Completa de Día"
          className="w-full h-full object-cover object-center brightness-105 contrast-105"
          onError={() => setHeroImageUrl('/hero_daylight_fleet.png')}
        />
        {/* Soft bottom color transition starting very low */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#FAF7F2] to-transparent"></div>
      </div>
    </section>
  );
}

