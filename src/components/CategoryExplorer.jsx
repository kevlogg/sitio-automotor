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

export default function CategoryExplorer({ selectedCategory, onSelectCategory }) {
  return (
    <section id="categorias" className="py-12 bg-[#0D111A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Centered Title matching screenshot */}
        <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
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
                className={`group rounded-2xl bg-[#151B28] border overflow-hidden cursor-pointer transition-all duration-300 flex flex-col hover:border-[#6D28D9] ${
                  isSelected ? 'border-[#6D28D9] ring-2 ring-[#6D28D9]/40' : 'border-slate-800'
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
                  <IconComponent className="w-6 h-6 text-slate-300 group-hover:text-[#8B5CF6] transition-colors" />
                  
                  <h3 className="text-base font-bold text-white group-hover:text-[#8B5CF6] transition-colors">
                    {cat.name}
                  </h3>

                  <span className="text-xs font-semibold text-[#8B5CF6] group-hover:underline">
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
