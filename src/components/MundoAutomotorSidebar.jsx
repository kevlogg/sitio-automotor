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

export default function MundoAutomotorSidebar({ activeRubro, onSelectRubro }) {
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
    <aside className="w-full bg-white rounded-3xl border border-slate-200/90 p-5 shadow-sm space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#6D28D9]" />
          <h3 className="text-xs font-black tracking-widest text-slate-800 uppercase">
            MUNDO AUTOMOTOR
          </h3>
        </div>
        {activeRubro && (
          <button
            onClick={() => onSelectRubro(null)}
            className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-lg"
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
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 text-left ${
                isSelected
                  ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-600/30 scale-[1.01]'
                  : 'text-slate-700 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-0.5'
              }`}
            >
              <IconComponent className={`w-5 h-5 flex-shrink-0 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
              <span className="truncate">{item.name}</span>
            </button>
          );
        })}
      </nav>

    </aside>
  );
}
