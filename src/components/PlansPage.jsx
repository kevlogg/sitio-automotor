import React, { useState } from 'react';
import {
  Check,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building2,
  Wrench,
  Car,
  MessageCircle,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Award,
  PhoneCall,
  Flame,
  CreditCard
} from 'lucide-react';
import PaymentClaimModal from './PaymentClaimModal';

// Logo oficial estilizado idéntico a la identidad de Sitio Automotor
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

export default function PlansPage({
  onBackToHome,
  onOpenPublishModal,
  onOpenRegisterBusiness,
  onOpenAuthModal,
  currentUser,
  onUpdateUser,
  cardTheme = 'violet',
}) {
  const [openFaq, setOpenFaq] = useState(null);
  const [paymentClaimPlan, setPaymentClaimPlan] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handlePlanAction = (planKey) => {
    if (onOpenRegisterBusiness) {
      onOpenRegisterBusiness(planKey);
    } else if (onOpenAuthModal) {
      onOpenAuthModal('signup');
    }
  };

  const handleWhatsAppConsult = (planName, price) => {
    const cleanPhone = '5491152638000';
    const text = encodeURIComponent(
      `Hola Sitio Automotor, me interesa contratar el Plan ${planName} (${price}) para mi agencia/negocio. Quisiera consultar sobre la activación y medios de pago.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const plans = [
    {
      key: 'base',
      name: 'BASE',
      price: '$55.000',
      period: 'ABONO MENSUAL',
      logoColor: '#B38054',
      lineColor: '#B38054',
      borderColor: 'border-[#B38054]/50',
      badge: null,
      accentColor: 'text-[#B38054]',
      targetAudience: 'Comercios relacionados con el automotor y agencias virtuales',
      features: [
        'Comercios relacionados con el automotor y agencias virtuales',
        '1 aviso activo en la plataforma',
        'Ficha en la guía comercial de Negocios Automotor',
        'Enlace directo a WhatsApp de tu comercio',
        'Panel de autogestión de tu publicación',
        'Soporte técnico por WhatsApp'
      ],
      ctaText: 'Adherir mi negocio',
      isPopular: false
    },
    {
      key: 'premium',
      name: 'PREMIUM',
      price: '$110.000',
      period: 'ABONO MENSUAL',
      logoColor: '#71717A',
      lineColor: '#9CA3AF',
      borderColor: 'border-[#5328D7]/60 ring-2 ring-[#5328D7]/30',
      badge: 'MÁS ELEGIDO',
      badgeColor: 'bg-[#5328D7] text-white',
      accentColor: 'text-[#5328D7]',
      targetAudience: 'Agencias multimarca y grandes comercios del mundo automotor',
      features: [
        'Agencias multimarca y grandes comercios del mundo automotor',
        'Hasta 20 avisos simultáneos en la plataforma',
        'Perfil verificado en el Directorio de Agencias',
        'Galería de fotos HD y fichas técnicas completas',
        'Contacto directo a WhatsApp sin intermediarios',
        'Mayor visibilidad en el catálogo general de autos',
        'Soporte prioritario y asesoría para publicar'
      ],
      ctaText: 'Adherir mi agencia',
      isPopular: true
    },
    {
      key: 'super_premium',
      name: 'SÚPER PREMIUM',
      price: '$220.000',
      period: 'ABONO MENSUAL',
      logoColor: '#C59B27',
      lineColor: '#D4AF37',
      borderColor: 'border-[#D4AF37] ring-2 ring-amber-400/30',
      badge: 'MÁXIMA VISIBILIDAD',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-black',
      accentColor: 'text-[#C59B27]',
      targetAudience: 'Agencias oficiales y comercios Súper Premium',
      features: [
        'Agencias oficiales y comercios Súper Premium',
        'Hasta 50 avisos simultáneos en la plataforma',
        'Banners de promoción exclusivos en la portada y páginas',
        'Posición prioritaria destacada en búsquedas y listados',
        'Insignia dorada de Agencia Oficial Verificada',
        'Difusión y campañas conjuntas en redes sociales',
        'Ejecutivo comercial asignado y atención 24/7'
      ],
      ctaText: 'Adherir mi agencia VIP',
      isPopular: false
    }
  ];

  const faqs = [
    {
      q: '¿Cómo se abona el plan mensual y cuáles son los medios de pago?',
      a: 'El abono se realiza de forma simple mediante transferencia bancaria (CBU / Alias) o factura electrónica. Una vez contratado, recibís los datos bancarios y la confirmación se procesa de manera inmediata.'
    },
    {
      q: '¿Hay comisiones por las ventas que realizo a través del sitio?',
      a: '¡No! En Sitio Automotor cobramos 0% de comisión por venta. El 100% de la operación queda para vos o tu agencia. Tu abono mensual fijo cubre la totalidad de la publicación y exposición.'
    },
    {
      q: '¿Cómo me contactan los interesados en mis vehículos o servicios?',
      a: 'Cada una de tus publicaciones y tu perfil de agencia tienen un botón directo que abre una conversación de WhatsApp con tu número registrado. Recibís los datos del auto consultado en el primer mensaje.'
    },
    {
      q: '¿Cuánto demora en activarse mi cuenta y mis avisos?',
      a: 'La activación es casi inmediata. Una vez completado el registro y validado el abono, tu panel queda 100% habilitado para subir tus vehículos o tu negocio con fotos y datos.'
    },
    {
      q: '¿Puedo cambiar de plan o cancelar en cualquier momento?',
      a: 'Sí, podés subir de categoría a un plan superior en cualquier momento si tu stock crece. Tampoco hay contratos de permanencia forzada; renovás mes a mes según tu conveniencia.'
    },
    {
      q: '¿Soy un particular y sólo quiero vender mi auto usado, qué opción tengo?',
      a: 'Para particulares tenemos la opción de publicación individual donde podés subir tu auto rápidamente por 30 días con contacto directo por WhatsApp.'
    }
  ];

  const comparisonFeatures = [
    { title: 'Avisos activos simultáneos', base: '1 aviso', premium: 'Hasta 20 avisos', super: 'Hasta 50 avisos' },
    { title: 'Perfil comercial verificado', base: 'Sí (Negocios)', premium: 'Sí (Agencias)', super: 'Sí (Agencia Oficial VIP)' },
    { title: 'Enlace directo a WhatsApp', base: 'Sí', premium: 'Sí', super: 'Sí' },
    { title: 'Ficha técnica y galería de fotos', base: 'Estándar', premium: 'Completa HD', super: 'Completa HD + Video' },
    { title: 'Prioridad en listados y búsquedas', base: 'Estándar', premium: 'Alta', super: 'Máxima Exposición' },
    { title: 'Banners publicitarios en el sitio', base: 'No', premium: 'Opcional', super: 'Incluidos' },
    { title: 'Badge de verificación', base: 'Verificado', premium: 'Agencia Verificada', super: 'Agencia Oficial Gold' },
    { title: 'Soporte y atención comercial', base: 'WhatsApp', premium: 'Prioritario', super: 'Ejecutivo Dedicado 24/7' },
  ];

  return (
    <div className="bg-home-canvas text-slate-900 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Navigation Breadcrumb / Volver */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-[#5328D7]" />
            <span>Volver al Inicio</span>
          </button>

          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest hidden sm:inline-block">
            Membresías Comerciales Oficiales
          </span>
        </div>

        {/* Hero Banner Header */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#2E1065] to-[#0F172A] text-white p-7 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <span className="px-3.5 py-1.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-black uppercase tracking-wider inline-flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              Potenciá tu Presencia Comercial
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Planes y Membresías de <span className="text-purple-400">Sitio Automotor</span>
            </h1>
            <p className="text-sm sm:text-base text-purple-200/90 leading-relaxed font-medium">
              Elegí la suscripción mensual diseñada para el volumen de tu agencia o negocio automotriz. Publicá tu stock, posicionate ante miles de compradores y recibí contactos directos a tu WhatsApp todos los días.
            </p>

            {/* Quick Metrics */}
            <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-purple-950/60 border border-purple-800/40 rounded-2xl p-3 text-center">
                <div className="text-lg font-black text-white">0%</div>
                <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Comisiones</div>
              </div>
              <div className="bg-purple-950/60 border border-purple-800/40 rounded-2xl p-3 text-center">
                <div className="text-lg font-black text-white">100%</div>
                <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">WhatsApp Directo</div>
              </div>
              <div className="bg-purple-950/60 border border-purple-800/40 rounded-2xl p-3 text-center">
                <div className="text-lg font-black text-white">24/7</div>
                <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">Autogestión</div>
              </div>
              <div className="bg-purple-950/60 border border-purple-800/40 rounded-2xl p-3 text-center">
                <div className="text-lg font-black text-white">Google</div>
                <div className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">SEO Optimizado</div>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Planes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-7xl mx-auto pt-2">
          {plans.map((p) => (
            <div
              key={p.key}
              className={`bg-white rounded-3xl p-7 sm:p-8 border ${p.borderColor} shadow-xl shadow-slate-200/50 flex flex-col justify-between space-y-6 hover:-translate-y-1.5 hover:shadow-2xl transition-all duration-300 relative group`}
            >
              {/* Badge si es popular o VIP */}
              {p.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-[11px] font-black uppercase tracking-widest shadow-md ${p.badgeColor} inline-flex items-center gap-1.5`}>
                    <Flame className="w-3.5 h-3.5" />
                    {p.badge}
                  </span>
                </div>
              )}

              <div className="space-y-5">
                {/* Logo Header */}
                <PlanLogoHeader color={p.logoColor} lineColor={p.lineColor} />

                {/* Title & Price */}
                <div className="text-center space-y-1">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight uppercase">
                    {p.name}
                  </h2>
                  <div className="text-4xl sm:text-5xl font-black text-slate-950 tracking-tight pt-1">
                    {p.price}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-widest pt-1">
                    {p.period}
                  </div>
                  <p className="text-xs font-semibold text-slate-600 pt-2 min-h-[34px]">
                    {p.targetAudience}
                  </p>
                </div>

                {/* Gray Divider */}
                <div className="w-full h-px bg-slate-200/90 my-4" />

                {/* Checklist */}
                <ul className="space-y-3.5 text-sm font-medium text-slate-800 leading-snug">
                  {p.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-[#5328D7] flex items-center justify-center shrink-0 text-white mt-0.5 shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                      <span className="text-xs sm:text-sm">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-2.5">
                <button
                  onClick={() => handlePlanAction(p.key)}
                  className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#5328D7] hover:bg-[#431fb5] text-white font-black text-sm sm:text-base shadow-lg shadow-indigo-950/20 transition-all duration-200 cursor-pointer text-center active:scale-98"
                >
                  {p.ctaText}
                </button>

                <button
                  onClick={() => handleWhatsAppConsult(p.name, p.price)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Consultar por WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Callout para Particulares */}
        <div className="rounded-3xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Car className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                ¿Sos particular y querés vender tu auto o moto?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                Publicá tu vehículo individual de forma rápida y sencilla para que miles de compradores te contacten directo a tu WhatsApp personal.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenPublishModal}
            className="shrink-0 px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            + Publicar como Particular
          </button>
        </div>

        {/* Banner para informar pago de transferencia ("Ya pagué") */}
        <div className="rounded-3xl bg-[#0F172A] border border-slate-800 p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <CreditCard className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-black text-white">
                ¿Ya realizaste una transferencia bancaria?
              </h3>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Declarar tu pago con el número de comprobante o notificarlo por WhatsApp para que activemos tu cuenta de inmediato.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (!currentUser && onOpenAuthModal) {
                onOpenAuthModal('signup');
              } else {
                setPaymentClaimPlan('premium');
              }
            }}
            className="shrink-0 px-6 py-4 rounded-2xl bg-[#5328D7] hover:bg-[#431fb5] text-white font-black text-xs sm:text-sm shadow-lg shadow-indigo-950/40 transition-all cursor-pointer flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>Informar Pago ("Ya pagué")</span>
          </button>
        </div>

        {/* Tabla Comparativa Detallada */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#5328D7]" />
              Comparativa Detallada
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Compará las características de cada plan
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Conocé en detalle lo que incluye cada nivel de membresía para tu negocio.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-4 px-4 text-xs font-extrabold text-slate-500 uppercase tracking-wider">Beneficio / Característica</th>
                  <th className="py-4 px-4 text-xs font-black text-[#B38054] uppercase tracking-wider text-center">Base ($55.000)</th>
                  <th className="py-4 px-4 text-xs font-black text-[#5328D7] uppercase tracking-wider text-center bg-purple-50/50 rounded-t-xl">Premium ($110.000)</th>
                  <th className="py-4 px-4 text-xs font-black text-[#C59B27] uppercase tracking-wider text-center">Súper Premium ($220.000)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {comparisonFeatures.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-800">{row.title}</td>
                    <td className="py-3.5 px-4 text-center text-slate-600 font-semibold">{row.base}</td>
                    <td className="py-3.5 px-4 text-center text-[#5328D7] font-black bg-purple-50/30">{row.premium}</td>
                    <td className="py-3.5 px-4 text-center text-amber-700 font-bold">{row.super}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Banner de Contacto Directo WhatsApp */}
        <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white p-7 sm:p-9 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" />
              Asesoramiento Comercial Directo
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              ¿Tenés dudas sobre qué plan elegir para tu agencia?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed font-medium">
              Escribinos por WhatsApp y un asesor de Sitio Automotor te guiará para elegir el plan más conveniente y activar tu cuenta en el día.
            </p>
          </div>

          <button
            onClick={() => handleWhatsAppConsult('General', 'Asesoría')}
            className="shrink-0 px-6 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center gap-2.5 shadow-lg shadow-emerald-950/40 transition-all cursor-pointer active:scale-98"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Hablar con un Asesor</span>
          </button>
        </div>

        {/* Sección de Preguntas Frecuentes (FAQ) */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-purple-100 text-[#5328D7] border border-purple-200 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5" />
              Preguntas Frecuentes
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Todo lo que necesitás saber sobre los planes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Respuestas rápidas a las consultas más habituales de agencias y comercios.
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto pt-2">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-all duration-200 hover:border-slate-300"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-900 text-sm sm:text-base cursor-pointer hover:bg-slate-50/50"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-5 h-5 text-[#5328D7] shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modal de Confirmación de Pago */}
      <PaymentClaimModal
        isOpen={!!paymentClaimPlan}
        onClose={() => setPaymentClaimPlan(null)}
        planKey={paymentClaimPlan || 'premium'}
        currentUser={currentUser}
        onSuccess={({ planKey, referenceNumber }) => {
          if (onUpdateUser && currentUser) {
            onUpdateUser({
              ...currentUser,
              profile: {
                ...currentUser.profile,
                plan_status: 'pending',
                current_plan: planKey,
                payment_reference: referenceNumber,
              },
            });
          }
        }}
      />
    </div>
  );
}
