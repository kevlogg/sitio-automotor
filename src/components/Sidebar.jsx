import React from 'react';
import {
  Car,
  Bike,
  Anchor,
  Truck,
  Bus,
  Tractor,
  Wrench,
  Disc,
  FileText,
  Shield,
  BadgeDollarSign,
  Repeat,
  Bell,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({
  selectedCategory,
  onSelectCategory,
  selectedService,
  onSelectService
}) {
  const vehicleCategories = [
    { id: 'autos', label: 'Autos y camionetas', icon: Car },
    { id: 'motos', label: 'Motos', icon: Bike },
    { id: 'nautica', label: 'Náutica', icon: Anchor },
    { id: 'camiones', label: 'Camiones y utilitarios', icon: Truck },
    { id: 'omnibus', label: 'Ómnibus y microbuses', icon: Bus },
    { id: 'maquinaria', label: 'Maquinaria', icon: Tractor },
    { id: 'repuestos', label: 'Repuestos y accesorios', icon: Wrench },
  ];

  const automotorServices = [
    { id: 'neumaticos', label: 'Neumáticos', icon: Disc },
    { id: 'servicios', label: 'Servicios', icon: Wrench },
    { id: 'planes', label: 'Planes de ahorro', icon: FileText },
    { id: 'seguros', label: 'Seguros', icon: Shield },
    { id: 'financiamiento', label: 'Financiamiento', icon: BadgeDollarSign },
    { id: 'permutas', label: 'Permutas', icon: Repeat },
    { id: 'notificaciones', label: 'Notificaciones y alertas', icon: Bell },
  ];

  return (
    <aside className="w-64 bg-[#11131F] border-r border-slate-800/80 flex flex-col shrink-0 min-h-[calc(100vh-4.5rem)] select-none">
      
      {/* Sección VEHÍCULOS */}
      <div className="p-4 border-b border-slate-800/50">
        <h3 className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
          Vehículos
        </h3>

        <nav className="space-y-1">
          {vehicleCategories.map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'}`} />
                  <span className="truncate">{cat.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sección MUNDO AUTOMOTOR / SERVICIOS */}
      <div className="p-4 flex-1">
        <h3 className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">
          Automotor
        </h3>

        <nav className="space-y-1">
          {automotorServices.map((srv) => {
            const Icon = srv.icon;
            const isActive = selectedService === srv.id;

            return (
              <button
                key={srv.id}
                onClick={() => onSelectService(srv.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-purple-400'}`} />
                  <span className="truncate">{srv.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-80" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer del Sidebar con versión */}
      <div className="p-4 border-t border-slate-800/80 bg-[#0E101A]">
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span>Sitio Automotor v2.0</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
      </div>

    </aside>
  );
}
