import React from 'react';
import { Car, Truck, Bike, Container, Anchor } from 'lucide-react';
import { CATEGORIES } from '../data/mockVehicles';

const ICON_MAP = {
  Car: Car,
  Truck: Truck,
  Bike: Bike,
  Container: Container,
  Anchor: Anchor
};

export default function CategoryExplorer({ cardTheme = 'violet', selectedCategory, onSelectCategory }) {
  const isDark = cardTheme === 'dark';

  return (
    <section id="categorias" className="py-12 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Title */}
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8 tracking-tight">
          Explorá por categoría
        </h2>

        {/* 5 Vertical Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {CATEGORIES.map((cat) => {
            const IconComponent = ICON_MAP[cat.iconName] || Car;
            const isSelected = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                className={`group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 flex flex-col hover:-translate-y-0.5 shadow-md hover:shadow-xl ${
                  isDark
                    ? `bg-[#0D121F]/95 backdrop-blur-md hover:bg-[#182235] hover:border-[#8B5CF6] ${
                        isSelected ? 'border-[#8B5CF6] ring-2 ring-purple-500/40 bg-[#1E1B4B]' : 'border-slate-800'
                      }`
                    : `bg-[#E4DAF8] hover:bg-white hover:border-[#6D28D9] ${
                        isSelected ? 'border-[#6D28D9] ring-2 ring-[#6D28D9]/40 bg-purple-200' : 'border-purple-300/90'
                      }`
                }`}
              >
                {/* Top Image */}
                <div className="h-36 overflow-hidden bg-slate-100">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Bottom Content */}
                <div className="p-4 text-center flex-1 flex flex-col justify-between items-center space-y-2">
                  <IconComponent className={`w-6 h-6 transition-colors ${
                    isDark ? 'text-purple-300 group-hover:text-[#A78BFA]' : 'text-slate-600 group-hover:text-[#6D28D9]'
                  }`} />
                  
                  <h3 className={`text-base font-bold transition-colors ${
                    isDark ? 'text-white group-hover:text-[#A78BFA]' : 'text-slate-900 group-hover:text-[#6D28D9]'
                  }`}>
                    {cat.name}
                  </h3>

                  <span className={`text-xs font-bold group-hover:underline ${
                    isDark ? 'text-[#A78BFA]' : 'text-[#6D28D9]'
                  }`}>
                    Ver más
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
