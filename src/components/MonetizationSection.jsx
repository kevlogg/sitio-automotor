import React from 'react';
import { 
  Check, Car, ArrowRight, ShieldCheck, Sparkles, Building2
} from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

// Logo oficial estilizado idéntico al encabezado de las tarjetas
function PlanLogoHeader({ color, lineColor }) {
  return (
    <div className="w-full flex flex-col items-center select-none">
      <div className="flex flex-col items-center" style={{ color }}>
        <span className="text-3xl sm:text-[34px] font-black tracking-wider leading-tight">
          SITIO
        </span>
        <span className="text-[10px] sm:text-[11px] font-black tracking-[0.38em] uppercase -mt-0.5 pl-[0.38em]">
          ΛUTOMOTOR
        </span>
      </div>
      <div className="w-full h-[1px] mt-4 opacity-80" style={{ backgroundColor: lineColor || color }} />
    </div>
  );
}

export default function MonetizationSection({
  cardTheme = 'violet',
  onOpenPublishModal,
  onOpenRegisterBusiness,
  onOpenAuthModal,
  onSelectPlan,
}) {
  const containerRef = useScrollReveal({ threshold: 0.1 });

  const handlePlanAction = (planKey) => {
    if (onSelectPlan) {
      onSelectPlan(planKey);
    } else if (onOpenRegisterBusiness) {
      onOpenRegisterBusiness(planKey);
    } else if (onOpenAuthModal) {
      onOpenAuthModal('signup');
    }
  };

  return (
    <section id="vender" ref={containerRef} className="w-full bg-transparent space-y-8 py-4">
      <div className="w-full">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 reveal-on-scroll">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#5328D7]/10 text-[#5328D7] border border-[#5328D7]/20 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#5328D7]" />
            <span>Membresías & Soluciones Comerciales</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Planes de <span className="text-[#5328D7]">Sitio Automotor</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-600 font-semibold leading-relaxed">
            Elegí la suscripción mensual adecuada para tu volumen de publicaciones y presencia comercial en toda la provincia.
          </p>
        </div>

        {/* 3 Action Cards Grid — Réplica exacta y estricta de la imagen */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-7xl mx-auto">

          {/* ═══════════════════════════════════════════════════════
              CARD 1: BASE ($55.000)
             ═══════════════════════════════════════════════════════ */}
          <div className="reveal-on-scroll delay-75 bg-white rounded-3xl p-7 sm:p-8 border border-[#B38054]/50 shadow-xl shadow-slate-200/50 flex flex-col justify-between space-y-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative group">
            
            <div className="space-y-5">
              {/* Logo Header */}
              <PlanLogoHeader color="#B38054" lineColor="#B38054" />

              {/* Title & Price */}
              <div className="text-center space-y-1">
                <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight uppercase">
                  BASE
                </h3>
                <div className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight pt-1">
                  $55.000
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest pt-1">
                  ABONO MENSUAL
                </div>
              </div>

              {/* Gray Divider */}
              <div className="w-full h-px bg-slate-200/90 my-5" />

              {/* Checklist */}
              <ul className="space-y-4 text-sm font-medium text-slate-800 leading-snug">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5328D7] flex items-center justify-center shrink-0 text-white mt-0.5 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>Comercios relacionados con el automotor y agencias virtuales</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5328D7] flex items-center justify-center shrink-0 text-white mt-0.5 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>1 aviso en la plataforma</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={() => handlePlanAction('base')}
                className="w-full py-4 rounded-2xl bg-[#5328D7] hover:bg-[#431fb5] text-white font-black text-base shadow-lg shadow-indigo-950/20 transition-all duration-200 cursor-pointer text-center active:scale-98"
              >
                Adherir mi negocio
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              CARD 2: PREMIUM ($110.000)
             ═══════════════════════════════════════════════════════ */}
          <div className="reveal-on-scroll delay-150 bg-white rounded-3xl p-7 sm:p-8 border border-slate-300 shadow-xl shadow-slate-200/50 flex flex-col justify-between space-y-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative group">
            
            <div className="space-y-5">
              {/* Logo Header */}
              <PlanLogoHeader color="#71717A" lineColor="#9CA3AF" />

              {/* Title & Price */}
              <div className="text-center space-y-1">
                <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight uppercase">
                  PREMIUM
                </h3>
                <div className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight pt-1">
                  $110.000
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest pt-1">
                  ABONO MENSUAL
                </div>
              </div>

              {/* Gray Divider */}
              <div className="w-full h-px bg-slate-200/90 my-5" />

              {/* Checklist */}
              <ul className="space-y-4 text-sm font-medium text-slate-800 leading-snug">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5328D7] flex items-center justify-center shrink-0 text-white mt-0.5 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>Agencias multimarca y grandes comercios del mundo automotor</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5328D7] flex items-center justify-center shrink-0 text-white mt-0.5 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>Hasta 20 avisos en la plataforma</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={() => handlePlanAction('premium')}
                className="w-full py-4 rounded-2xl bg-[#5328D7] hover:bg-[#431fb5] text-white font-black text-base shadow-lg shadow-indigo-950/20 transition-all duration-200 cursor-pointer text-center active:scale-98"
              >
                Adherir mi negocio
              </button>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════
              CARD 3: SÚPER PREMIUM ($220.000)
             ═══════════════════════════════════════════════════════ */}
          <div className="reveal-on-scroll delay-250 bg-white rounded-3xl p-7 sm:p-8 border border-[#D4AF37] shadow-xl shadow-amber-200/30 flex flex-col justify-between space-y-6 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 relative group">
            
            <div className="space-y-5">
              {/* Logo Header */}
              <PlanLogoHeader color="#C59B27" lineColor="#D4AF37" />

              {/* Title & Price */}
              <div className="text-center space-y-1">
                <h3 className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight uppercase">
                  SÚPER PREMIUM
                </h3>
                <div className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight pt-1">
                  $220.000
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest pt-1">
                  ABONO MENSUAL
                </div>
              </div>

              {/* Gray Divider */}
              <div className="w-full h-px bg-slate-200/90 my-5" />

              {/* Checklist */}
              <ul className="space-y-4 text-sm font-medium text-slate-800 leading-snug">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5328D7] flex items-center justify-center shrink-0 text-white mt-0.5 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>Agencias oficiales y comercios Súper Premium</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5328D7] flex items-center justify-center shrink-0 text-white mt-0.5 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>Hasta 50 avisos en la plataforma</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#5328D7] flex items-center justify-center shrink-0 text-white mt-0.5 shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </span>
                  <span>Banners de promoción en la página</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <button
                onClick={() => handlePlanAction('super_premium')}
                className="w-full py-4 rounded-2xl bg-[#5328D7] hover:bg-[#431fb5] text-white font-black text-base shadow-lg shadow-indigo-950/20 transition-all duration-200 cursor-pointer text-center active:scale-98"
              >
                Adherir mi negocio
              </button>
            </div>
          </div>

        </div>



      </div>
    </section>
  );
}
