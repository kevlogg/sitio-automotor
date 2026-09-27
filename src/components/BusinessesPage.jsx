import React, { useState, useEffect, useMemo } from 'react';
import { 
  Store, Search, MapPin, Phone, MessageCircle, Star, ShieldCheck, 
  ArrowLeft, Loader2, Sparkles, Wrench, Settings, Droplet, Zap, Paintbrush, BatteryCharging
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PROVINCE_OPTIONS } from '../data/mockVehicles';

const RUBRO_OPTIONS = [
  { id: 'all', label: 'Todos los rubros' },
  { id: 'repuestos', label: 'Repuestos' },
  { id: 'accesorios', label: 'Accesorios' },
  { id: 'gomerias', label: 'Gomerías y neumáticos' },
  { id: 'talleres', label: 'Talleres mecánicos' },
  { id: 'lubricentros', label: 'Lubricentros' },
  { id: 'electricidad', label: 'Electricidad del automotor' },
  { id: 'chapa-pintura', label: 'Chapa y pintura' },
  { id: 'detailing', label: 'Detailing y lavaderos' },
  { id: 'baterias', label: 'Baterías' },
  { id: 'cristales', label: 'Cristales' },
  { id: 'seguros', label: 'Seguros' },
  { id: 'financiacion', label: 'Financiación' },
  { id: 'gruas', label: 'Grúas y auxilio' },
  { id: 'gestorias', label: 'Gestorías' },
];

const SEED_BUSINESSES = [
  {
    id: 'b-1',
    name: 'Taller Mecánico Especializado San Martín',
    rubro_id: 'talleres',
    address: 'Av. Pellegrini 1840',
    city: 'Rosario',
    province: 'Santa Fe',
    phone: '0341 4829922',
    whatsapp: '5493415550199',
    rating: 4.9,
    verified: true,
  },
  {
    id: 'b-2',
    name: 'Repuestos El Rayo Originales',
    rubro_id: 'repuestos',
    address: 'Av. Mitre 450',
    city: 'Rosario',
    province: 'Santa Fe',
    phone: '0341 4210088',
    whatsapp: '5493415550299',
    rating: 5.0,
    verified: true,
  },
  {
    id: 'b-3',
    name: 'Lubricentro Express Premium',
    rubro_id: 'lubricentros',
    address: 'Av. Juan B. Justo 2100',
    city: 'Buenos Aires',
    province: 'Buenos Aires',
    phone: '011 47712233',
    whatsapp: '5491133445566',
    rating: 4.8,
    verified: true,
  },
  {
    id: 'b-4',
    name: 'GT Detailing & Cerámico Studio',
    rubro_id: 'detailing',
    address: 'Calle 50 #1240',
    city: 'La Plata',
    province: 'Buenos Aires',
    phone: '0221 4891122',
    whatsapp: '5492215667788',
    rating: 5.0,
    verified: true,
  },
  {
    id: 'b-5',
    name: 'Neumáticos & Gomería Córdoba 24hs',
    rubro_id: 'gomerias',
    address: 'Av. Vélez Sarsfield 1200',
    city: 'Córdoba Capital',
    province: 'Córdoba',
    phone: '0351 4556677',
    whatsapp: '5493515667788',
    rating: 4.9,
    verified: true,
  }
];

export default function BusinessesPage({ onBackToHome, onOpenRegisterBusiness }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRubro, setSelectedRubro] = useState('all');
  const [selectedProvince, setSelectedProvince] = useState('all');

  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('services_directory')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          const liveIds = new Set(data.map(d => d.id));
          const filteredSeed = SEED_BUSINESSES.filter(s => !liveIds.has(s.id));
          setBusinesses([...data, ...filteredSeed]);
        } else {
          setBusinesses(SEED_BUSINESSES);
        }
      } catch (err) {
        console.warn('Fallback a negocios seed:', err);
        setBusinesses(SEED_BUSINESSES);
      } finally {
        setLoading(false);
      }
    }
    fetchBusinesses();
  }, []);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const name = (b.name || '').toLowerCase();
      const city = (b.city || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      if (term && !name.includes(term) && !city.includes(term)) {
        return false;
      }

      if (selectedRubro !== 'all') {
        const rId = b.rubro_id || '';
        if (!rId.toLowerCase().includes(selectedRubro.toLowerCase())) {
          return false;
        }
      }

      if (selectedProvince !== 'all' && b.province !== selectedProvince) {
        return false;
      }

      return true;
    });
  }, [businesses, searchTerm, selectedRubro, selectedProvince]);

  const handleWhatsAppContact = (b) => {
    const cleanPhone = b.whatsapp ? b.whatsapp.replace(/\D/g, '') : '5491134567890';
    const text = encodeURIComponent(
      `Hola ${b.name}, vi su negocio en el directorio Mundo Automotor de Sitio Automotor y quisiera hacer una consulta.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const getRubroLabel = (id) => {
    const found = RUBRO_OPTIONS.find(r => r.id === id);
    return found ? found.label : (id || 'Servicio Automotor');
  };

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Breadcrumb / Back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-slate-300 font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>Volver al Inicio</span>
          </button>

          <span className="text-xs font-bold text-slate-500">
            {filteredBusinesses.length} negocios en el directorio
          </span>
        </div>

        {/* Banner Hero Negocios */}
        <div className="rounded-3xl bg-gradient-to-r from-amber-950 via-[#1E1138] to-[#0F172A] text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-amber-400" />
              Directorio Oficial Mundo Automotor
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Comercios y Servicios Automotores
            </h1>
            <p className="text-xs text-amber-200/80 max-w-2xl">
              Encontrá talleres mecánicos, repuestos, gomerías, lubricentros, detaling, auxilio y gestorías cerca tuyo.
            </p>
          </div>

          {onOpenRegisterBusiness && (
            <button
              onClick={onOpenRegisterBusiness}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-lg shadow-amber-900/30 flex items-center gap-2 border border-amber-300/40 cursor-pointer transition-all hover:scale-105 whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span>+ Sumar mi Negocio Gratis</span>
            </button>
          )}
        </div>

        {/* Buscador de Negocios */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className="lg:col-span-5">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Buscar por nombre o palabra clave
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej. Taller San Martín, El Rayo, Rosario..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Rubro del negocio
              </label>
              <select
                value={selectedRubro}
                onChange={(e) => setSelectedRubro(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-amber-500 cursor-pointer font-semibold"
              >
                {RUBRO_OPTIONS.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Provincia
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-amber-500 cursor-pointer font-semibold"
              >
                <option value="all">Todas las provincias</option>
                {PROVINCE_OPTIONS.filter(p => p !== 'Todas las ubicaciones').map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Listado de Negocios Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-3 bg-white border border-slate-200 rounded-3xl">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Cargando directorio de comercios...</p>
          </div>
        ) : filteredBusinesses.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white border border-slate-200 rounded-3xl">
            <Store className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-black text-slate-800">No encontramos comercios con ese filtro</h3>
            <button
              onClick={() => { setSearchTerm(''); setSelectedRubro('all'); setSelectedProvince('all'); }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer shadow-md"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((b) => (
              <div
                key={b.id || b.name}
                className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group border-t-4 border-t-amber-500"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <span className="px-3 py-1 rounded-xl bg-amber-500/10 text-amber-800 border border-amber-500/30 text-xs font-black">
                      {getRubroLabel(b.rubro_id)}
                    </span>

                    {b.verified && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-extrabold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verificado
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-amber-600 transition-colors">
                      {b.name}
                    </h3>
                    {b.rating && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{b.rating} / 5.0</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                    {b.address && (
                      <div className="flex items-center gap-2">
                        <Store className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span className="truncate">{b.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>{b.city}, {b.province}</span>
                    </div>
                    {b.phone && (
                      <div className="flex items-center gap-2 font-mono">
                        <Phone className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>{b.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleWhatsAppContact(b)}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 mt-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contactar WhatsApp</span>
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
