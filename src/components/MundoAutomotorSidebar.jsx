import React from 'react';
import {
  Settings,
  CircleDot,
  Wrench,
  Droplet,
  Zap,
  Paintbrush,
  Sparkles,
  BatteryCharging,
  Layers,
  ShieldCheck,
  Coins,
  Truck,
  FileText,
  Volume2,
  SlidersHorizontal,
  X
} from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function MundoAutomotorSidebar({ cardTheme = 'violet', activeRubro, onSelectRubro, onOpenRegisterBusiness }) {
  const isDark = cardTheme === 'dark';
  const containerRef = useScrollReveal({ threshold: 0.1 });

  const rubros = [
    { id: 'repuestos', name: 'Repuestos', icon: Settings },
    { id: 'accesorios', name: 'Accesorios', icon: CircleDot },
    { id: 'gomerias', name: 'Gomerías y neumáticos', icon: CircleDot },
    { id: 'talleres', name: 'Talleres mecánicos', icon: Wrench },
    { id: 'lubricentros', name: 'Lubricentros', icon: Droplet },
    { id: 'electricidad', name: 'Electricidad del automotor', icon: Zap },
    { id: 'chapa-pintura', name: 'Chapa y pintura', icon: Paintbrush },
    { id: 'detailing', name: 'Detailing y lavaderos', icon: Sparkles },
    { id: 'baterias', name: 'Baterías', icon: BatteryCharging },
    { id: 'cristales', name: 'Cristales', icon: Layers },
    { id: 'seguros', name: 'Seguros', icon: ShieldCheck },
    { id: 'financiacion', name: 'Financiación', icon: Coins },
    { id: 'gruas', name: 'Grúas y auxilio', icon: Truck },
    { id: 'gestorias', name: 'Gestorías', icon: FileText },
    { id: 'audio-alarmas', name: 'Audio y alarmas', icon: Volume2 },
  ];

  return (
    <aside ref={containerRef} className="w-full rounded-3xl border border-purple-800/80 bg-gradient-to-b from-[#261647] via-[#1E1138] to-[#160B2B] text-white p-5 space-y-4 shadow-xl shadow-purple-950/50 reveal-on-scroll">
      
      {/* CTA Registrar Negocio Automotor */}
      {onOpenRegisterBusiness && (
        <button
          onClick={onOpenRegisterBusiness}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-md shadow-amber-900/30 flex items-center justify-center gap-2 border border-amber-300/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-900/40 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>+ Sumar mi Negocio / Servicio</span>
        </button>
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-purple-800/60">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-purple-300" />
          <h3 className="text-xs font-black tracking-widest uppercase text-white">
            MUNDO AUTOMOTOR
          </h3>
        </div>
        {activeRubro && (
          <button
            onClick={() => onSelectRubro(null)}
            className="text-[11px] font-semibold text-purple-300 hover:text-white flex items-center gap-1 bg-purple-900/60 px-2 py-0.5 rounded-lg border border-purple-500/40 transition-colors duration-150"
          >
            <span>Limpiar</span>
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* List of Rubros */}
      <nav className="space-y-1">
        {rubros.map((item) => {
          const IconComponent = item.icon;
          const isSelected = activeRubro === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectRubro(isSelected ? null : item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-[180ms] ease-out text-left ${
                isSelected
                  ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-600/40 translate-x-1 border border-purple-400'
                  : 'text-purple-200/90 hover:bg-purple-900/60 hover:text-purple-100 hover:border-purple-600/60 border border-transparent hover:translate-x-1'
              }`}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 transition-colors duration-[180ms] ${
                isSelected ? 'text-white' : 'text-purple-400 group-hover:text-purple-300'
              }`} />
              <span className="truncate">{item.name}</span>
            </button>
          );
        })}
      </nav>

    </aside>
  );
}
