import React from 'react';
import {
  Settings,
  CircleDot,
  Wrench,
  Droplet,
  Zap,
  Paintbrush,
  Sparkles,
  ShieldCheck,
  FileText,
  Store,
  SlidersHorizontal,
  X,
  ArrowRight,
  BatteryCharging,
  Layers,
  Volume2
} from 'lucide-react';
import useScrollReveal from '../hooks/useScrollReveal';

export default function MundoAutomotorSidebar({
  cardTheme = 'violet',
  activeRubro,
  onSelectRubro,
  onOpenRegisterBusiness,
  onNavigateToBusinesses
}) {
  const isDark = cardTheme === 'dark';
  const containerRef = useScrollReveal({ threshold: 0.1 });

  // Complete list of 14 options filling full height
  const rubros = [
    { id: 'repuestos', name: 'Repuestos Originales', icon: Settings },
    { id: 'accesorios', name: 'Accesorios y Tuning', icon: SlidersHorizontal },
    { id: 'gomerias', name: 'Gomerías y Neumáticos', icon: CircleDot },
    { id: 'talleres', name: 'Talleres Mecánicos', icon: Wrench },
    { id: 'lubricentros', name: 'Lubricentros y Filtros', icon: Droplet },
    { id: 'electricidad', name: 'Electricidad e Inyección', icon: Zap },
    { id: 'chapa-pintura', name: 'Chapa y Pintura', icon: Paintbrush },
    { id: 'detailing', name: 'Detailing y Lavaderos', icon: Sparkles },
    { id: 'baterias', name: 'Baterías y Encendido', icon: BatteryCharging },
    { id: 'cristales', name: 'Cristales y Parabrisas', icon: Layers },
    { id: 'seguros', name: 'Seguros y Financiación', icon: ShieldCheck },
    { id: 'gestorias', name: 'Gestorías y Auxilios', icon: FileText },
    { id: 'audio-alarmas', name: 'Audio y Alarmas', icon: Volume2 },
    { id: 'mas-negocios', name: '+ Más Negocios', icon: Store, isCta: true },
  ];

  const handleItemClick = (item) => {
    if (item.isCta || item.id === 'mas-negocios') {
      if (onNavigateToBusinesses) {
        onNavigateToBusinesses();
      } else if (onSelectRubro) {
        onSelectRubro('all');
      }
    } else {
      if (onSelectRubro) {
        const isSelected = activeRubro === item.id;
        onSelectRubro(isSelected ? null : item.id);
      }
    }
  };

  return (
    <aside
      ref={containerRef}
      className="w-full h-full rounded-3xl border-2 border-purple-300 bg-white text-slate-900 p-4 sm:p-5 flex flex-col justify-between shadow-xl shadow-purple-900/10 reveal-on-scroll"
    >
      <div className="space-y-3">
        {/* CTA Registrar Negocio Automotor */}
        {onOpenRegisterBusiness && (
          <button
            onClick={onOpenRegisterBusiness}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-[11px] sm:text-xs shadow-md shadow-amber-900/30 flex items-center justify-center gap-1.5 border border-amber-300/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-900/40 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span className="truncate">+ Sumar mi Negocio</span>
          </button>
        )}

        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-purple-200">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-[#6D28D9]" />
            <h3 className="text-xs font-black tracking-widest uppercase text-slate-900">
              MUNDO AUTOMOTOR
            </h3>
          </div>
          {activeRubro && (
            <button
              onClick={() => onSelectRubro(null)}
              className="text-[10px] font-semibold text-purple-700 hover:text-[#6D28D9] flex items-center gap-1 bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-300 transition-colors duration-150 cursor-pointer"
            >
              <span>Limpiar</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* List of 14 Rubros filling sidebar height */}
        <nav className="space-y-1">
          {rubros.map((item) => {
            const IconComponent = item.icon;
            const isSelected = activeRubro === item.id;
            const isCta = item.isCta;

            if (isCta) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all duration-200 ease-out text-left bg-gradient-to-r from-[#6D28D9] to-purple-800 text-white shadow-md shadow-purple-900/30 border border-purple-400 hover:scale-[1.02] active:scale-95 cursor-pointer group mt-2"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <IconComponent className="w-4 h-4 text-purple-200 flex-shrink-0 group-hover:rotate-12 transition-transform" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center gap-2.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-150 ease-out text-left cursor-pointer ${
                  isSelected
                    ? 'bg-[#6D28D9] text-white shadow-md shadow-purple-600/30 translate-x-1 border border-purple-400'
                    : 'text-slate-800 hover:bg-purple-50/90 hover:text-[#6D28D9] hover:border-purple-300 border border-transparent hover:translate-x-1'
                }`}
              >
                <IconComponent className={`w-4 h-4 flex-shrink-0 transition-colors ${
                  isSelected ? 'text-white' : 'text-[#6D28D9]'
                }`} />
                <span className="truncate">{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Subtle Bottom Accent */}
      <div className="pt-3 mt-2 border-t border-purple-200/70 text-center">
        <p className="text-[10px] font-semibold text-purple-900/70">
          Servicios y comercios verificados
        </p>
      </div>
    </aside>
  );
}
