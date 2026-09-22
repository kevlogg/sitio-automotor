import React, { useState } from 'react';
import { ShieldCheck, Gauge, Globe, Mail, Phone, MapPin } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function ProofTrustFooter({ cardTheme = 'dark' }) {
  const [logoError, setLogoError] = useState(false);
  const containerRef = useScrollReveal({ threshold: 0.1 });

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
    <footer ref={containerRef} className="bg-[#0D111A] border-t border-slate-800/80 text-slate-300 pt-12 pb-8 transition-colors">
      
      {/* 3 Metrics Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 reveal-on-scroll">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-6 px-6 rounded-2xl border border-slate-800/80 bg-slate-900/90 backdrop-blur-md text-white shadow-xl shadow-slate-950/50">
          {metrics.map((m, idx) => {
            const IconComp = m.icon;
            return (
              <div key={idx} className="group flex items-center gap-4 justify-center md:justify-start cursor-default">
                <div className="w-12 h-12 rounded-xl border border-purple-800/50 bg-purple-950/40 text-purple-400 flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:rotate-[4deg] group-hover:border-purple-500 group-hover:bg-purple-900/50">
                  <IconComp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white mb-0.5 group-hover:text-purple-300 transition-colors">
                    {m.title}
                  </h4>
                  <p className="text-xs text-slate-400">
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800/80">
          
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
              <span className="text-lg font-black tracking-tight text-white">
                SITIO <span className="text-[#8B5CF6]">AUTOMOTOR</span>
              </span>
            )}
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-medium">
              Marketplace automotor líder en Argentina. Conexión directa entre compradores, agencias y particulares verificados.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 className="text-xs font-bold uppercase text-white mb-3 tracking-wider">Categorías</h5>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li><a href="#vehiculos" className="hover:text-purple-400 transition-colors">Autos Usados & 0km</a></li>
              <li><a href="#vehiculos" className="hover:text-purple-400 transition-colors">Camionetas / SUVs</a></li>
              <li><a href="#vehiculos" className="hover:text-purple-400 transition-colors">Motos</a></li>
              <li><a href="#vehiculos" className="hover:text-purple-400 transition-colors">Camiones & Pesados</a></li>
              <li><a href="#vehiculos" className="hover:text-purple-400 transition-colors">Náutica & Recreación</a></li>
            </ul>
          </div>

          {/* Monetization */}
          <div>
            <h5 className="text-xs font-bold uppercase text-white mb-3 tracking-wider">Publicar</h5>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li><a href="#vender" className="hover:text-purple-400 transition-colors">Particular (1 auto x 30 días)</a></li>
              <li><a href="#vender" className="hover:text-purple-400 transition-colors">Red de Agencias (Plan Base / Pro)</a></li>
              <li><a href="#vender" className="hover:text-purple-400 transition-colors">Mundo Automotor (Servicios & Repuestos)</a></li>
              <li><a href="#contacto" className="hover:text-purple-400 transition-colors">Preguntas Frecuentes</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h5 className="text-xs font-bold uppercase text-white mb-3 tracking-wider">Contacto</h5>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>contacto@sitioautomotor.com.ar</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span>+54 (11) 5263-8000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
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
