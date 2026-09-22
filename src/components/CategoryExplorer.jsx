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
                className={`group rounded-2xl border overflow-hidden cursor-pointer transition-all duration-300 flex flex-col hover:-translate-y-0.5 shadow-xl hover:shadow-2xl hover:shadow-purple-950/60 ${
                  isDark
                    ? `bg-[#180E2E]/95 backdrop-blur-md hover:bg-[#231442] hover:border-purple-500 ${
                        isSelected ? 'border-purple-400 ring-2 ring-purple-500/50 bg-[#281549]' : 'border-purple-900/60'
                      }`
                    : `bg-gradient-to-br from-[#261647] via-[#1E1138] to-[#160B2B] border-purple-700/70 hover:border-purple-400 hover:from-[#311C5B] hover:to-[#21113E] ${
                        isSelected ? 'border-purple-400 ring-2 ring-purple-400/50 bg-[#2D1B54]' : ''
                      }`
                }`}
              >
                {/* Top Image */}
                <div className="h-36 overflow-hidden bg-slate-900">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Bottom Content */}
                <div className="p-4 text-center flex-1 flex flex-col justify-between items-center space-y-2">
                  <IconComponent className="w-6 h-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                  
                  <h3 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">
                    {cat.name}
                  </h3>

                  <span className="text-xs font-bold text-purple-300 group-hover:underline">
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
