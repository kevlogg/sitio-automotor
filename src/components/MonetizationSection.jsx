import React from 'react';
import { 
  Car, Building2, Wrench, CheckCircle2, ArrowRight, Flag, Sparkles
} from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function MonetizationSection({
  cardTheme = 'violet',
  onOpenPublishModal,
  onOpenRegisterBusiness,
  onOpenAuthModal
}) {
  const containerRef = useScrollReveal({ threshold: 0.1 });

  return (
    <section id="vender" ref={containerRef} className="py-16 sm:py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#6D28D9]/10 text-[#6D28D9] border border-[#6D28D9]/20 text-xs font-black uppercase tracking-widest">
            <Flag className="w-3.5 h-3.5 text-[#6D28D9]" />
            <span>Soluciones Automotrices para Cada Perfil</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            ¿Qué querés hacer en <span className="text-[#6D28D9]">Sitio Automotor</span>?
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed">
            Elegí la opción según tu objetivo. Las 3 modalidades cuentan con atención personalizada y publicación inmediata.
          </p>
        </div>

        {/* 3 Action Cards Grid (Strict Visual & Architectural Consistency across all 3 profiles) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">

          {/* CARD 1: PARTICULARES (Vender tu Auto) */}
          <div className="reveal-on-scroll delay-75 rounded-3xl bg-gradient-to-br from-[#261647] via-[#1E1138] to-[#160B2B] border-2 border-purple-500/70 p-7 text-white shadow-2xl shadow-purple-950/40 flex flex-col justify-between space-y-6 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="space-y-5 relative z-10">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-black flex items-center gap-1.5">
                  <Car className="w-3.5 h-3.5 text-purple-300" /> Particular
                </span>
                <span className="text-[10px] font-mono text-purple-300 font-extrabold uppercase bg-white/10 px-2.5 py-1 rounded-md tracking-wider">
                  Venta Rápida
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Publicá tu Vehículo
                </h3>
                <p className="text-xs text-purple-200/80 leading-relaxed min-h-[36px]">
                  Para dueños particulares que buscan vender su auto, camioneta, moto o embarcación.
                </p>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white">$15.000</span>
                  <span className="text-xs text-purple-200/80 font-medium">/ 30 días</span>
                </div>
                <p className="text-[11px] text-purple-300 font-bold">
                  Publicación destacada sin comisiones de venta
                </p>
              </div>

              {/* Checklist */}
              <ul className="space-y-3 text-xs text-purple-100 min-h-[100px]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Publicación activa por 30 días con fotos HD</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Contacto directo a tu WhatsApp personal</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <span>Alcance a compradores en todo el país</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-2 relative z-10">
              <button
                onClick={onOpenPublishModal}
                className="w-full py-4 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-lg shadow-purple-900/50 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-98 border border-purple-400/40"
              >
                <Car className="w-4 h-4" />
                <span>Publicar mi vehículo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CARD 2: AGENCIAS Y CONCESIONARIAS */}
          <div className="reveal-on-scroll delay-150 rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#090D16] border-2 border-slate-700/80 p-7 text-white shadow-2xl shadow-slate-950/50 flex flex-col justify-between space-y-6 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="space-y-5 relative z-10">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-black flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" /> Agencia / Concesionaria
                </span>
                <span className="text-[10px] font-mono text-blue-300 font-extrabold uppercase bg-white/10 px-2.5 py-1 rounded-md tracking-wider">
                  Red Oficial
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Potenciá tu Agencia
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed min-h-[36px]">
                  Para concesionarias oficiales y multimarca que buscan publicar su catálogo completo.
                </p>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-white">$90.000</span>
                  <span className="text-xs text-slate-300 font-medium">/ mes</span>
                </div>
                <p className="text-[11px] text-blue-300 font-bold">
                  Planes de Agencia con catálogo de inventario
                </p>
              </div>

              {/* Checklist */}
              <ul className="space-y-3 text-xs text-slate-200 min-h-[100px]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Ficha oficial con logo, portada y horarios</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Insignia de Concesionaria Verificada</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>Posicionamiento prioritario y stock amplio</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-2 relative z-10">
              <button
                onClick={() => {
                  if (onOpenAuthModal) onOpenAuthModal('signup');
                }}
                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-98 border border-blue-400/30"
              >
                <Building2 className="w-4 h-4" />
                <span>Ingresar como Agencia</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CARD 3: NEGOCIOS AUTOMOTRICES (Mundo Automotor) */}
          <div className="reveal-on-scroll delay-250 rounded-3xl bg-gradient-to-br from-[#2D1A04] via-[#1E1138] to-[#0F172A] border-2 border-amber-500/70 p-7 text-white shadow-2xl shadow-amber-950/40 flex flex-col justify-between space-y-6 hover:-translate-y-1.5 transition-all duration-300 relative overflow-hidden group">
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            
            <div className="space-y-5 relative z-10">
              {/* Header Badges */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-black flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-400" /> Comercio Automotor
                </span>
                <span className="text-[10px] font-mono text-amber-300 font-extrabold uppercase bg-white/10 px-2.5 py-1 rounded-md tracking-wider">
                  Mundo Automotor
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-1">
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Sumá tu Comercio
                </h3>
                <p className="text-xs text-amber-200/80 leading-relaxed min-h-[36px]">
                  Para talleres mecánicos, lubricentros, repuestos, gomerías, detailing y gestorías.
                </p>
              </div>

              {/* Price Box */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black font-mono text-[#F59E0B]">$49.000</span>
                  <span className="text-xs text-amber-200/80 font-medium">/ mes</span>
                </div>
                <p className="text-[11px] text-amber-300 font-bold">
                  Ficha activa en el directorio Mundo Automotor
                </p>
              </div>

              {/* Checklist */}
              <ul className="space-y-3 text-xs text-amber-100 min-h-[100px]">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Ficha visible en el directorio oficial</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Conexión directa con clientes de tu zona</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Botón directo de consultas a tu WhatsApp</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-2 relative z-10">
              <button
                onClick={onOpenRegisterBusiness}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-98 border border-amber-300/40"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Registrar mi Comercio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Banner: 3 Pasos sencillos y claros */}
        <div className="reveal-on-scroll delay-300 p-6 sm:p-8 rounded-3xl bg-white/90 border border-stone-200 shadow-xl backdrop-blur-md flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#6D28D9] text-white flex items-center justify-center font-black text-xl shrink-0 shadow-lg shadow-purple-900/20">
              ⚡
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-slate-900">
                Proceso 100% digital, directo y transparente
              </h4>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Elegí tu perfil ➔ Registrá tus datos y plan ➔ Recibí consultas directo a tu WhatsApp
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={onOpenPublishModal}
              className="flex-1 lg:flex-none px-6 py-3.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs shadow-md cursor-pointer transition-all whitespace-nowrap"
            >
              Publicar Vehículo ($15.000)
            </button>
            <button
              onClick={onOpenRegisterBusiness}
              className="flex-1 lg:flex-none px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md cursor-pointer transition-all whitespace-nowrap"
            >
              Registrar Comercio
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
