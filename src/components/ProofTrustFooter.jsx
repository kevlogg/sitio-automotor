import React, { useState } from 'react';
import { ShieldCheck, Gauge, Globe, Mail, Phone, MapPin } from 'lucide-react';

export default function ProofTrustFooter() {
  const [logoError, setLogoError] = useState(false);

  const metrics = [
    {
      title: 'Confianza',
      description: 'Verificamos vendedores y agencias.',
      icon: ShieldCheck
    },
    {
      title: 'Dinamismo',
      description: 'Publicaciones activas y actualizadas.',
      icon: Gauge
    },
    {
      title: 'Alcance',
      description: 'Todo el mundo automotor en un solo sitio.',
      icon: Globe
    }
  ];

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 pt-12 pb-8">
      
      {/* 3 Metrics Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 px-6 rounded-2xl bg-[#E4DAF8] border border-purple-300/90 shadow-md">
          {metrics.map((m, idx) => {
            const IconComp = m.icon;
            return (
              <div key={idx} className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-[#6D28D9] shadow-xs">
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 mb-0.5">
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {m.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200">
          
          {/* Logo & Info */}
          <div className="space-y-3">
            {!logoError ? (
              <img
                src="/logo.png"
                alt="SA Sitio Automotor"
                onError={() => setLogoError(true)}
                className="h-10 w-auto object-contain rounded-lg"
              />
            ) : (
              <span className="text-lg font-black tracking-tight text-slate-900">
                SITIO <span className="text-[#6D28D9]">AUTOMOTOR</span>
              </span>
            )}
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed">
              Marketplace automotor líder en Argentina. Conexión directa entre compradores, agencias y particulares verificados.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold uppercase text-slate-900 mb-3 tracking-wider">Categorías</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#categorias" className="hover:text-[#6D28D9] transition-colors">Autos</a></li>
              <li><a href="#categorias" className="hover:text-[#6D28D9] transition-colors">Camionetas / SUVs</a></li>
              <li><a href="#categorias" className="hover:text-[#6D28D9] transition-colors">Motos</a></li>
              <li><a href="#categorias" className="hover:text-[#6D28D9] transition-colors">Camiones</a></li>
              <li><a href="#categorias" className="hover:text-[#6D28D9] transition-colors">Náutica</a></li>
            </ul>
          </div>

          {/* Monetization */}
          <div>
            <h5 className="text-xs font-bold uppercase text-slate-900 mb-3 tracking-wider">Publicar</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#vender" className="hover:text-[#6D28D9] transition-colors">Plan Individual ($15.000)</a></li>
              <li><a href="#vender" className="hover:text-[#6D28D9] transition-colors">Red de Agencias</a></li>
              <li><a href="#vender" className="hover:text-[#6D28D9] transition-colors">Términos del Servicio</a></li>
              <li><a href="#vender" className="hover:text-[#6D28D9] transition-colors">Preguntas Frecuentes</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-xs font-bold uppercase text-slate-900 mb-3 tracking-wider">Contacto</h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#6D28D9]" />
                <span>contacto@sitioautomotor.com.ar</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#6D28D9]" />
                <span>+54 (11) 5263-8000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#6D28D9]" />
                <span>Buenos Aires, Argentina</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-6 text-center text-[11px] text-slate-500 font-medium">
          © {new Date().getFullYear()} Sitio Automotor. Todos los derechos reservados.
        </div>

      </div>
    </footer>
  );
}
