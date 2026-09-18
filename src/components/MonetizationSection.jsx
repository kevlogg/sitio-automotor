import React from 'react';
import { Camera, Users, MessageSquare, Tag, Check } from 'lucide-react';

export default function MonetizationSection({ cardTheme = 'violet', onOpenPublishModal }) {
  const isDark = cardTheme === 'dark';

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

  return (
    <section id="vender" className="py-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-12 tracking-tight">
          Publicá tu vehículo en 3 simples pasos
        </h2>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: 3 Steps */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.number}
                  className={`flex flex-col items-center space-y-3 p-5 rounded-2xl border transition-all ${
                    isDark
                      ? 'bg-[#0D121F]/95 backdrop-blur-md border-slate-800 hover:bg-[#182235] text-white shadow-xl shadow-slate-950/40'
                      : 'bg-[#E4DAF8] border-purple-300/90 hover:bg-white text-slate-900 shadow-md'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${
                    isDark ? 'bg-slate-800 border-slate-700 text-[#A78BFA]' : 'bg-white border-purple-200 text-[#6D28D9]'
                  }`}>
                    <StepIcon className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  
                  <span className={`text-sm font-black ${isDark ? 'text-[#A78BFA]' : 'text-[#6D28D9]'}`}>
                    {step.number}
                  </span>

                  <h3 className={`text-base font-bold leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {step.title}
                  </h3>

                  <p className={`text-xs leading-relaxed max-w-[200px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Pricing Card */}
          <div className="lg:col-span-5">
            <div className={`p-8 rounded-3xl border-2 transition-all ${
              isDark
                ? 'bg-[#0D121F]/95 backdrop-blur-md border-purple-500 shadow-2xl shadow-purple-950/40 text-white'
                : 'bg-[#E4DAF8] border-purple-400 shadow-xl shadow-purple-900/10 text-slate-900'
            }`}>
              
              <div className={`flex items-center gap-2 mb-4 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                <Tag className={`w-5 h-5 ${isDark ? 'text-[#A78BFA]' : 'text-[#6D28D9]'}`} />
                <span className="text-sm font-semibold">Publicá tu vehículo</span>
              </div>

              <div className="mb-6">
                <span className={`text-4xl font-black font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>$15.000</span>
                <span className={`text-xs block mt-1 font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>por 30 días</span>
              </div>

              <ul className="space-y-3 mb-8">
                {checklist.map((item, idx) => (
                  <li key={idx} className={`flex items-center gap-2.5 text-xs font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                    <Check className={`w-4 h-4 ${isDark ? 'text-[#A78BFA]' : 'text-[#6D28D9]'}`} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onOpenPublishModal}
                className="w-full py-3.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition-all shadow-md shadow-purple-600/20 cursor-pointer"
              >
                Publicar mi vehículo
              </button>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
