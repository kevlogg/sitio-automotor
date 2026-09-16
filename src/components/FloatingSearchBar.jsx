import React from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { BRAND_OPTIONS, PROVINCE_OPTIONS } from '../data/mockVehicles';

export default function FloatingSearchBar({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  selectedBrand,
  setSelectedBrand,
  selectedYear,
  setSelectedYear,
  selectedLocation,
  setSelectedLocation,
  onSearchSubmit
}) {
  const categoryOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'autos', label: 'Autos' },
    { value: 'camionetas', label: 'Camionetas / SUVs' },
    { value: 'motos', label: 'Motos' },
    { value: 'camiones', label: 'Camiones' },
    { value: 'nautica', label: 'Náutica' }
  ];

  const yearOptions = [
    { value: 'all', label: 'Mínimo' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' },
    { value: '2020', label: '2020' }
  ];

  return (
    <div id="search-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 z-20">
      
      {/* Centered Header Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-6 tracking-tight">
        ¿Qué vehículo estás buscando?
      </h2>

      {/* Main Filter Container */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xl shadow-slate-200/60">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end"
        >
          {/* Text Input Search */}
          <div className="lg:col-span-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Marca, modelo o versión..."
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-[#6D28D9] focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Tipo de vehículo */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Tipo de vehículo
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#6D28D9] focus:bg-white transition-all cursor-pointer pr-8 font-medium"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Marca */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Marca
            </label>
            <div className="relative">
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#6D28D9] focus:bg-white transition-all cursor-pointer pr-8 font-medium"
              >
                <option value="all">Todas</option>
                {BRAND_OPTIONS.filter(b => b !== 'Todas las marcas').map((b) => (
                  <option key={b} value={b} className="bg-white text-slate-800">
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Año desde */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Año desde
            </label>
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#6D28D9] focus:bg-white transition-all cursor-pointer pr-8 font-medium"
              >
                {yearOptions.map((y) => (
                  <option key={y.value} value={y.value} className="bg-white text-slate-800">
                    {y.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Provincia */}
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Provincia
            </label>
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#6D28D9] focus:bg-white transition-all cursor-pointer pr-8 font-medium"
              >
                <option value="all">Todas</option>
                {PROVINCE_OPTIONS.filter(p => p !== 'Todas las ubicaciones').map((p) => (
                  <option key={p} value={p} className="bg-white text-slate-800">
                    {p}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="lg:col-span-1">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Buscar</span>
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}
