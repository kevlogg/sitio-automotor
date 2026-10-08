import React from 'react';
import { Car, Truck, Bike, Container, Anchor, Tractor } from 'lucide-react';
import { CATEGORIES } from '../data/mockVehicles';
import useScrollReveal from '../hooks/useScrollReveal';

const ICON_MAP = {
  Car: Car,
  Truck: Truck,
  Bike: Bike,
  Container: Container,
  Anchor: Anchor,
  Tractor: Tractor,
};

export default function CategoryExplorer({ cardTheme = 'violet', selectedCategory, onSelectCategory }) {
  const containerRef = useScrollReveal({ threshold: 0.1 });
  const delays = ['delay-75', 'delay-150', 'delay-200', 'delay-300', 'delay-400', 'delay-500'];

  return (
    <section id="categorias" ref={containerRef} className="w-full bg-transparent">
      
      {/* 6 Larger Category Cards without Shadow Overlays */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, idx) => {
            const IconComponent = ICON_MAP[cat.iconName] || Car;
            const isSelected = selectedCategory === cat.id;
            const delayClass = delays[idx % delays.length];

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(isSelected ? 'all' : cat.id)}
                className={`group relative h-32 sm:h-40 lg:h-44 rounded-2xl overflow-hidden cursor-pointer reveal-on-scroll ${delayClass} transition-all duration-300 hover:-translate-y-1 border ${
                  isSelected
                    ? 'border-purple-600 ring-4 ring-purple-500/40 scale-[1.02]'
                    : 'border-slate-300/80 hover:border-purple-500'
                }`}
              >
                {/* Clean Full Background Image (No Shadow / No Dark Gradient) */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                />

                {/* Clean Pill Label sitting on top of the image at bottom left */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 z-10">
                  <div className="px-2.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/30 flex items-center gap-2 shrink-0 group-hover:bg-[#6D28D9] group-hover:border-purple-400 transition-colors duration-300">
                    <IconComponent className="w-4 h-4 text-white" />
                    <span className="text-xs sm:text-sm font-black text-white tracking-wide truncate">
                      {cat.name}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
    </section>
  );
}
