import React, { useState, useRef } from 'react';
import { ShieldCheck, Gauge, Globe, Mail, Phone, MapPin } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function ProofTrustFooter({ cardTheme = 'dark', onOpenSuperAdmin }) {
  const [logoError, setLogoError] = useState(false);
  const [secretHover, setSecretHover] = useState(false);
  const containerRef = useScrollReveal({ threshold: 0.1 });
  const hoverTimerRef = useRef(null);

  // 🔐 Acceso oculto: mantener hover sobre el punto 1.5s → abre SuperAdmin
  const handleSecretMouseEnter = () => {
    setSecretHover(true);
    hoverTimerRef.current = setTimeout(() => {
      if (onOpenSuperAdmin) onOpenSuperAdmin();
    }, 1500);
  };

  const handleSecretMouseLeave = () => {
    setSecretHover(false);
    clearTimeout(hoverTimerRef.current);
  };

  const metrics = [
    { title: 'Confianza', description: 'Verificamos vendedores y agencias.', icon: ShieldCheck },
    { title: 'Dinamismo', description: 'Publicaciones activas y actualizadas.', icon: Gauge },
    { title: 'Alcance', description: 'Todo el mundo automotor en un solo sitio.', icon: Globe },
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
                  <h4 className="text-base font-bold text-white mb-0.5 group-hover:text-purple-300 transition-colors">{m.title}</h4>
                  <p className="text-xs text-slate-400">{m.description}</p>
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
              <img src="/logo.png" alt="SA Sitio Automotor" onError={() => setLogoError(true)}
                className="h-10 w-auto object-contain rounded-lg" />
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
              <li><a href="#vehiculos" className="hover:text-purple-400 transition-colors">Autos Usados &amp; 0km</a></li>
              <li><a href="#vehiculos" className="hover:text-purple-400 transition-colors">Camionetas / SUVs</a></li>
              <li><a href="#vehiculos" className="hover:text-purple-400 transition-colors">Motos</a></li>
              <li><a href="#vehiculos" className="hover:text-purple-400 transition-colors">Camiones &amp; Pesados</a></li>
              <li><a href="#vehiculos" className="hover:text-purple-400 transition-colors">Náutica &amp; Recreación</a></li>
            </ul>
          </div>

          {/* Publicar */}
          <div>
            <h5 className="text-xs font-bold uppercase text-white mb-3 tracking-wider">Publicar</h5>
            <ul className="space-y-2 text-xs font-medium text-slate-400">
              <li><a href="#vender" className="hover:text-purple-400 transition-colors">Particular (1 auto x 30 días)</a></li>
              <li><a href="#vender" className="hover:text-purple-400 transition-colors">Red de Agencias (Plan Base / Pro)</a></li>
              <li><a href="#vender" className="hover:text-purple-400 transition-colors">Mundo Automotor (Servicios &amp; Repuestos)</a></li>
              <li><a href="#contacto" className="hover:text-purple-400 transition-colors">Preguntas Frecuentes</a></li>
            </ul>
          </div>

          {/* Contacto */}
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

        {/* Copyright + Secret Admin Trigger */}
        <div className="pt-6 flex items-center justify-center gap-3">
          <p className="text-[11px] text-slate-500 font-medium">
            © {new Date().getFullYear()} Sitio Automotor. Todos los derechos reservados.
          </p>

          {/* 🔐 Punto oculto — hover 1.5s abre el SuperAdmin */}
          <div
            id="sa-secret-trigger"
            onMouseEnter={handleSecretMouseEnter}
            onMouseLeave={handleSecretMouseLeave}
            className="relative cursor-pointer select-none flex-shrink-0"
          >
            <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
              secretHover
                ? 'bg-violet-500 shadow-[0_0_8px_3px_rgba(139,92,246,0.5)] scale-150'
                : 'bg-slate-800'
            }`} />
            {secretHover && (
              <div className="absolute inset-0 -m-2 flex items-center justify-center pointer-events-none">
                <svg className="w-5 h-5 animate-spin text-violet-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
}
