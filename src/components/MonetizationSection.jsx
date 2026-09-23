import React from 'react';
import { Camera, Users, MessageSquare, Tag, Check } from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function MonetizationSection({ cardTheme = 'violet', onOpenPublishModal }) {
  const isDark = cardTheme === 'dark';
  const containerRef = useScrollReveal({ threshold: 0.1 });

  const steps = [
    {
      number: '01',
      title: 'Completá la publicación',
      description: 'Subí fotos, agregá detalles y precio de tu vehículo.',
      icon: Camera
    },
    {
      number: '02',
      title: 'Lo mostramos a miles',
      description: 'Tu anuncio aparece en todo el país y nuestra red.',
      icon: Users
    },
    {
      number: '03',
      title: 'Recibí consultas reales',
      description: 'Conectate directo con compradores y agencias interesadas.',
      icon: MessageSquare
    }
  ];

  const checklist = [
    'Anuncio destacado',
    'Fotos ilimitadas',
    'Contacto directo',
    'Red de agencias y vendedores'
  ];

  const stepDelays = ['delay-75', 'delay-150', 'delay-250'];

  return (
    <section id="vender" ref={containerRef} className="py-16 bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12 tracking-tight reveal-on-scroll">
          Publicá tu vehículo en 3 simples pasos
        </h2>

        {/* Vertical Stack: 3 Cards on Top + Full Width Pricing Banner Below */}
        <div className="space-y-8">
          
          {/* Top Row: 3 Step Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {steps.map((step, idx) => {
              const StepIcon = step.icon;
              const delayClass = stepDelays[idx];

              return (
                <div
                  key={step.number}
                  className={`flex flex-col items-center space-y-4 p-6 rounded-2xl border reveal-on-scroll ${delayClass} transition-all duration-300 hover:-translate-y-1 shadow-xl hover:shadow-2xl hover:shadow-purple-950/70 ${
                    isDark
                      ? 'bg-[#0D121F]/95 backdrop-blur-md border-slate-800 hover:bg-[#182235] text-white shadow-xl shadow-slate-950/40'
                      : 'bg-gradient-to-br from-[#261647] via-[#1E1138] to-[#160B2B] border-purple-700/70 hover:border-purple-400 text-white shadow-xl shadow-purple-950/50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-300 hover:scale-110 ${
                    isDark ? 'bg-slate-800 border-slate-700 text-[#A78BFA]' : 'bg-[#180E2E] border-purple-700/60 text-[#A78BFA]'
                  }`}>
                    <StepIcon className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  
                  <span className="text-sm font-black text-[#A78BFA]">
                    {step.number}
                  </span>

                  <h3 className="text-base font-bold leading-snug text-white">
                    {step.title}
                  </h3>

                  <p className="text-xs leading-relaxed text-purple-200/80">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Bottom Row: Full Width Pricing Banner */}
          <div className="reveal-on-scroll delay-300">
            <div className={`p-6 sm:p-8 rounded-3xl border-2 transition-all duration-300 animate-glow-pulse ${
              isDark
                ? 'bg-[#0D121F]/95 backdrop-blur-md border-purple-500 shadow-2xl shadow-purple-950/40 text-white'
                : 'bg-gradient-to-br from-[#261647] via-[#1E1138] to-[#160B2B] border-purple-500 shadow-2xl shadow-purple-950/60 text-white'
            }`}>
              
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
                
                {/* Price & Tag */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left min-w-[200px]">
                  <div className="flex items-center gap-2 mb-2 text-purple-200">
                    <Tag className="w-5 h-5 text-[#A78BFA]" />
                    <span className="text-sm font-semibold">Publicá tu vehículo</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-white">$15.000</span>
                    <span className="text-xs font-medium text-purple-200/80">por 30 días</span>
                  </div>
                </div>

                {/* Checklist Features */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 w-full lg:w-auto">
                  {checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 text-xs sm:text-sm font-medium text-purple-100 bg-white/5 lg:bg-transparent px-4 py-2.5 lg:p-0 rounded-xl border border-white/10 lg:border-none">
                      <Check className="w-4 h-4 text-[#A78BFA] shrink-0" />
                      <span className="whitespace-nowrap">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <div className="w-full lg:w-auto shrink-0">
                  <button
                    onClick={onOpenPublishModal}
                    className="w-full lg:w-auto px-8 py-4 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-purple-600/30 cursor-pointer whitespace-nowrap"
                  >
                    Publicar mi vehículo
                  </button>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
