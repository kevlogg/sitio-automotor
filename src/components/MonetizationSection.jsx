import React from 'react';
import { Camera, Users, MessageSquare, Tag, Check } from 'lucide-react';

export default function MonetizationSection({ onOpenPublishModal }) {
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
    <section id="vender" className="py-16 bg-[#0D111A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Title matching screenshot */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">
          Publicá tu vehículo en 3 simples pasos
        </h2>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: 3 Steps */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {steps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div key={step.number} className="flex flex-col items-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#151B28] border border-slate-800 flex items-center justify-center text-[#8B5CF6]">
                    <StepIcon className="w-7 h-7 stroke-[1.5]" />
                  </div>
                  
                  <span className="text-sm font-bold text-[#8B5CF6]">
                    {step.number}
                  </span>

                  <h3 className="text-base font-bold text-white leading-snug">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed max-w-[200px]">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Column: Pricing Card matching screenshot */}
          <div className="lg:col-span-5">
            <div className="p-8 rounded-3xl bg-[#151B28] border border-[#6D28D9]/40 shadow-2xl glow-violet">
              
              <div className="flex items-center gap-2 mb-4 text-slate-300">
                <Tag className="w-5 h-5 text-[#8B5CF6]" />
                <span className="text-sm font-medium">Publicá tu vehículo</span>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-black text-white font-mono">$15.000</span>
                <span className="text-xs text-slate-400 block mt-1">por 30 días</span>
              </div>

              <ul className="space-y-3 mb-8">
                {checklist.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2.5 text-xs text-slate-300">
                    <Check className="w-4 h-4 text-[#8B5CF6]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={onOpenPublishModal}
                className="w-full py-3.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm transition-all border border-purple-500/30"
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
