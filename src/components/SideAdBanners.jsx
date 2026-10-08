import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ExternalLink, ArrowRight } from 'lucide-react';

export function LeftAdCard({ onActionClick }) {
  const [adConfig, setAdConfig] = useState(() => ({
    imageUrl: localStorage.getItem('sa_ad_left_image_url') || '',
    linkUrl: localStorage.getItem('sa_ad_left_link_url') || '',
  }));

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('id, value')
          .in('id', ['ad_left_image_url', 'ad_left_link_url']);
        
        if (data && data.length > 0) {
          const map = {};
          data.forEach((row) => { map[row.id] = row.value; });
          
          setAdConfig((prev) => {
            const next = {
              imageUrl: map['ad_left_image_url'] ?? prev.imageUrl,
              linkUrl: map['ad_left_link_url'] ?? prev.linkUrl,
            };
            if (map['ad_left_image_url']) localStorage.setItem('sa_ad_left_image_url', map['ad_left_image_url']);
            if (map['ad_left_link_url']) localStorage.setItem('sa_ad_left_link_url', map['ad_left_link_url']);
            return next;
          });
        }
      } catch (err) {
        console.warn('Ad settings read warning:', err);
      }
    }
    loadSettings();
  }, []);

  const handleClick = () => {
    if (adConfig.linkUrl) {
      window.open(adConfig.linkUrl, '_blank');
    } else if (onActionClick) {
      onActionClick();
    }
  };

  const imageSrc = adConfig.imageUrl || '/ad_left_banner.png';

  return (
    <div className="w-40 xl:w-44 shrink-0 select-none">
      <div 
        onClick={handleClick}
        className="group relative rounded-2xl overflow-hidden border border-purple-800/80 bg-[#0F111A] text-white shadow-xl shadow-purple-950/50 cursor-pointer transition-all duration-300 hover:border-purple-400 hover:scale-[1.01] hover:shadow-purple-900/60"
      >
        
        {/* Full Image Banner */}
        <div className="relative w-full h-[520px] overflow-hidden">
          <img
            src={imageSrc}
            alt="Publicidad Repuestos y Accesorios"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = '/ad_left_banner.png'; }}
          />

          {/* Ad Top Label */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-slate-200 border border-white/20">
              PUBLICIDAD
            </span>
            {adConfig.linkUrl && (
              <div className="p-1 rounded-full bg-purple-600/80 text-white backdrop-blur-md">
                <ExternalLink className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          {/* Dark Overlay Gradient at Bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />

          {/* Bottom Interactive Content */}
          <div className="absolute bottom-3 left-3 right-3 z-10 space-y-2">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-300 block">
                REPUESTOS
              </span>
              <h4 className="text-xs font-black text-white leading-tight drop-shadow-md">
                Todo para tu vehículo
              </h4>
            </div>

            <button
              className="w-full py-2 px-2 rounded-lg bg-[#6D28D9] group-hover:bg-[#5B21B6] text-white text-[10px] font-extrabold flex items-center justify-center gap-1 border border-purple-400/40 shadow-md transition-all"
            >
              <span>Ver más</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export function RightAdCard({ onActionClick }) {
  const [adConfig, setAdConfig] = useState(() => ({
    imageUrl: localStorage.getItem('sa_ad_right_image_url') || '',
    linkUrl: localStorage.getItem('sa_ad_right_link_url') || '',
  }));

  useEffect(() => {
    async function loadSettings() {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('id, value')
          .in('id', ['ad_right_image_url', 'ad_right_link_url']);
        
        if (data && data.length > 0) {
          const map = {};
          data.forEach((row) => { map[row.id] = row.value; });
          
          setAdConfig((prev) => {
            const next = {
              imageUrl: map['ad_right_image_url'] ?? prev.imageUrl,
              linkUrl: map['ad_right_link_url'] ?? prev.linkUrl,
            };
            if (map['ad_right_image_url']) localStorage.setItem('sa_ad_right_image_url', map['ad_right_image_url']);
            if (map['ad_right_link_url']) localStorage.setItem('sa_ad_right_link_url', map['ad_right_link_url']);
            return next;
          });
        }
      } catch (err) {
        console.warn('Ad right settings read warning:', err);
      }
    }
    loadSettings();
  }, []);

  const handleClick = () => {
    if (adConfig.linkUrl) {
      window.open(adConfig.linkUrl, '_blank');
    } else if (onActionClick) {
      onActionClick();
    }
  };

  const imageSrc = adConfig.imageUrl || '/ad_right_banner.png';

  return (
    <div className="w-40 xl:w-44 shrink-0 select-none">
      <div 
        onClick={handleClick}
        className="group relative rounded-2xl overflow-hidden border border-purple-800/80 bg-[#0F111A] text-white shadow-xl shadow-purple-950/50 cursor-pointer transition-all duration-300 hover:border-purple-400 hover:scale-[1.01] hover:shadow-purple-900/60"
      >
        
        {/* Full Image Banner */}
        <div className="relative w-full h-[520px] overflow-hidden">
          <img
            src={imageSrc}
            alt="Publicidad Publicá tu Vehículo"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            onError={(e) => { e.target.src = '/ad_right_banner.png'; }}
          />

          {/* Ad Top Label */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
            <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-slate-200 border border-white/20">
              PUBLICIDAD
            </span>
            {adConfig.linkUrl && (
              <div className="p-1 rounded-full bg-purple-600/80 text-white backdrop-blur-md">
                <ExternalLink className="w-2.5 h-2.5" />
              </div>
            )}
          </div>

          {/* Dark Overlay Gradient at Bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-transparent" />

          {/* Bottom Interactive Content */}
          <div className="absolute bottom-3 left-3 right-3 z-10 space-y-2">
            <div>
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-purple-300 block">
                PUBLICÁ AHORA
              </span>
              <h4 className="text-xs font-black text-white leading-tight drop-shadow-md">
                Vendé tu vehículo rápido
              </h4>
            </div>

            <button
              className="w-full py-2 px-2 rounded-lg bg-[#6D28D9] group-hover:bg-[#5B21B6] text-white text-[10px] font-extrabold flex items-center justify-center gap-1 border border-purple-400/40 shadow-md transition-all"
            >
              <span>Publicar</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
