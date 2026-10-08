import React from 'react';
import { Search, ChevronDown, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { BRAND_OPTIONS, PROVINCE_OPTIONS } from '../data/mockVehicles';
import useScrollReveal from '../hooks/useScrollReveal';

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
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sortBy,
  setSortBy,
  onSearchSubmit,
  cardTheme = 'violet'
}) {
  const containerRef = useScrollReveal({ threshold: 0.1 });

  const categoryOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'autos', label: 'Autos' },
    { value: 'camionetas', label: 'Camionetas / SUVs' },
    { value: 'motos', label: 'Motos' },
    { value: 'camiones', label: 'Camiones' },
    { value: 'nautica', label: 'Náutica' },
    { value: 'agro', label: 'Agro / Maquinaria' }
  ];

  const yearOptions = [
    { value: 'all', label: 'Cualquier año' },
    { value: '2024', label: '2024+' },
    { value: '2023', label: '2023+' },
    { value: '2022', label: '2022+' },
    { value: '2020', label: '2020+' }
  ];

  const sortOptions = [
    { value: 'featured', label: 'Destacados' },
    { value: 'price-asc', label: 'Precio: Menor a Mayor' },
    { value: 'price-desc', label: 'Precio: Mayor a Menor' },
    { value: 'year-desc', label: 'Año: Más Nuevo' }
  ];

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    selectedBrand !== 'all' ||
    selectedYear !== 'all' ||
    selectedLocation !== 'all' ||
    minPrice !== '' ||
    maxPrice !== '' ||
    sortBy !== 'featured';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedBrand('all');
    setSelectedYear('all');
    setSelectedLocation('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
  };

  const isDark = cardTheme === 'dark';

  return (
    <div id="search-section" ref={containerRef} className="w-full z-20 reveal-on-scroll">
      
      {/* Header Title with Reset Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <SlidersHorizontal className="w-6 h-6 text-[#6D28D9]" />
          ¿Qué vehículo estás buscando?
        </h2>

        {hasActiveFilters && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#6D28D9] hover:text-[#5B21B6] flex items-center gap-1.5 bg-purple-50 hover:bg-purple-100 px-3 py-2 rounded-xl border border-purple-200 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar filtros</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Filter Container */}
      <div className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all duration-300 space-y-3 ${
        isDark
          ? 'bg-[#0D121F]/95 backdrop-blur-md border-slate-800 shadow-2xl shadow-slate-950/60 text-white'
          : 'bg-white border-purple-300 shadow-xl shadow-purple-900/10 text-slate-900'
      }`}>

        {/* Logo SA apoyado en la parte de arriba derecha de la card */}
        <div className="absolute -top-7 sm:-top-9 right-4 sm:right-6 z-30 pointer-events-none">
          <img
            src="/logo.png"
            alt="Sitio Automotor Logo"
            className="h-12 sm:h-16 lg:h-18 w-auto object-contain filter drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)] hover:scale-105 transition-transform duration-300"
          />
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSearchSubmit();
          }}
          className="space-y-3"
        >
          {/* Main Top Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            
            {/* Text Input Search */}
            <div className="lg:col-span-4">
              <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                Búsqueda
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 pointer-events-none" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Marca, modelo o versión (ej. Corolla, Amarok)..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-slate-900 placeholder-purple-400 text-xs focus:outline-none focus:border-purple-600 focus:bg-white focus:ring-2 focus:ring-purple-400/30 transition-all duration-300"
                />
              </div>
            </div>

            {/* Tipo de vehículo */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                Tipo de vehículo
              </label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 bg-white border border-purple-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 cursor-pointer pr-8 font-medium"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 pointer-events-none" />
              </div>
            </div>

            {/* Marca */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                Marca
              </label>
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full appearance-none px-3 py-2.5 bg-white border border-purple-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 cursor-pointer pr-8 font-medium"
                >
                  <option value="all" className="bg-white text-slate-900">Todas las marcas</option>
                  {BRAND_OPTIONS.filter(b => b !== 'Todas las marcas').map((b) => (
                    <option key={b} value={b} className="bg-white text-slate-900">
                      {b}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 pointer-events-none" />
              </div>
            </div>

            {/* Submit Button */}
            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-md shadow-purple-600/30 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Buscar</span>
              </button>
            </div>

          </div>

          {/* Secondary Row: Advanced Filters (Price Min/Max, Year, Location, Sort) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 pt-2 border-t border-purple-200">
            
            {/* Año desde */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                Año mínimo
              </label>
              <div className="relative">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-full appearance-none px-3 py-2 bg-white border border-purple-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 cursor-pointer pr-8 font-medium"
                >
                  {yearOptions.map((y) => (
                    <option key={y.value} value={y.value} className="bg-white text-slate-900">
                      {y.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 pointer-events-none" />
              </div>
            </div>

            {/* Provincia */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                Ubicación
              </label>
              <div className="relative">
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full appearance-none px-3 py-2 bg-white border border-purple-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 cursor-pointer pr-8 font-medium"
                >
                  <option value="all" className="bg-white text-slate-900">Todas las provincias</option>
                  {PROVINCE_OPTIONS.filter(p => p !== 'Todas las ubicaciones').map((p) => (
                    <option key={p} value={p} className="bg-white text-slate-900">
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 pointer-events-none" />
              </div>
            </div>

            {/* Rango de Precio Min/Max */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                Precio (USD)
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-purple-300 rounded-xl text-slate-900 text-xs placeholder-purple-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300"
                />
                <input
                  type="number"
                  placeholder="Máximo"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-2.5 py-2 bg-white border border-purple-300 rounded-xl text-slate-900 text-xs placeholder-purple-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300"
                />
              </div>
            </div>

            {/* Ordenar por */}
            <div className="lg:col-span-3">
              <label className="block text-[11px] font-extrabold text-slate-800 mb-1">
                Ordenar por
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full appearance-none px-3 py-2 bg-white border border-purple-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-400/30 transition-all duration-300 cursor-pointer pr-8 font-medium"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-white text-slate-900">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 pointer-events-none" />
              </div>
            </div>

          </div>
        </form>
      </div>

    </div>
  );
}

