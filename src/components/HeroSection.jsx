import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function HeroSection({ onOpenPublishModal, onSearchScroll }) {
  const [heroImageUrl, setHeroImageUrl] = useState(
    localStorage.getItem('sa_hero_image_url') || '/hero_daylight_fleet.png'
  );
  const [heroLinkUrl, setHeroLinkUrl] = useState(
    localStorage.getItem('sa_hero_link_url') || ''
  );

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('id, value')
          .in('id', ['hero_image_url', 'hero_link_url']);
        
        if (data && data.length > 0) {
          data.forEach(row => {
            if (row.id === 'hero_image_url' && row.value?.trim()) {
              setHeroImageUrl(row.value.trim());
              localStorage.setItem('sa_hero_image_url', row.value.trim());
            }
            if (row.id === 'hero_link_url') {
              const link = row.value?.trim() || '';
              setHeroLinkUrl(link);
              localStorage.setItem('sa_hero_link_url', link);
            }
          });
        }
      } catch (err) {
        console.warn('Hero settings load warning:', err);
      }
    })();
  }, []);

  const handleHeroClick = () => {
    if (heroLinkUrl) {
      if (heroLinkUrl.startsWith('http://') || heroLinkUrl.startsWith('https://')) {
        window.open(heroLinkUrl, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = heroLinkUrl;
      }
    }
  };

  return (
    <section 
      id="hero" 
      onClick={handleHeroClick}
      className={`relative w-full min-h-[220px] sm:min-h-[280px] lg:min-h-[340px] flex items-center overflow-hidden ${
        heroLinkUrl ? 'cursor-pointer group' : ''
      }`}
      title={heroLinkUrl ? `Visitar: ${heroLinkUrl}` : undefined}
    >
      
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
          className={`w-full h-full object-cover object-center brightness-105 contrast-105 transition-transform duration-500 ${
            heroLinkUrl ? 'group-hover:scale-[1.01]' : ''
          }`}
          onError={() => setHeroImageUrl('/hero_daylight_fleet.png')}
        />
        {/* Soft bottom color transition starting very low */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#FAF7F2] to-transparent"></div>
      </div>

      {/* Floating indicator when there is an active redirection link */}
      {heroLinkUrl && (
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5 border border-white/20 shadow-lg pointer-events-none">
          <span>Abrir enlace</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </div>
      )}
    </section>
  );
}

