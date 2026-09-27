import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Search, MapPin, Phone, Globe, Clock, ShieldCheck, 
  MessageCircle, ExternalLink, ArrowLeft, Loader2, Sparkles, Car
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PROVINCE_OPTIONS } from '../data/mockVehicles';

const SEED_AGENCIES = [
  {
    id: 'ag-1',
    business_name: 'Mendoza Automotores',
    full_name: 'Carlos Mendoza',
    phone_whatsapp: '5491134567890',
    province: 'Buenos Aires',
    city: 'San Isidro',
    address: 'Av. del Libertador 14200',
    business_hours: 'Lunes a Viernes 9:00 a 19:00 hs',
    bio: 'Concesionaria líder en zona norte con más de 20 años de experiencia en seminuevos seleccionados y garantía de 6 meses.',
    avatar_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=1200&auto=format&fit=crop',
    website_url: 'https://mendozaautomotores.com.ar',
    instagram_url: '@mendoza.automotores',
    user_type: 'agencia',
    plan_status: 'active',
  },
  {
    id: 'ag-2',
    business_name: 'Rosario Car Center',
    full_name: 'Gabriel Rossi',
    phone_whatsapp: '5493415550199',
    province: 'Santa Fe',
    city: 'Rosario',
    address: 'Av. Pellegrini 2800',
    business_hours: 'Lun a Vie 8:30 a 18:30 hs, Sáb 9 a 13 hs',
    bio: 'Multimarca premium especializada en pickups 4x4, SUVs y vehículos de alta gama con financiación propia.',
    avatar_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?q=80&w=1200&auto=format&fit=crop',
    instagram_url: '@rosariocarcenter',
    user_type: 'agencia',
    plan_status: 'active',
  },
  {
    id: 'ag-3',
    business_name: 'Córdoba Motors Oficial',
    full_name: 'Lucía Fernández',
    phone_whatsapp: '5493514445566',
    province: 'Córdoba',
    city: 'Córdoba Capital',
    address: 'Av. Colón 4500',
    business_hours: 'Lunes a Viernes 9:00 a 19:30 hs',
    bio: 'Stock permanente de 50+ unidades inspeccionadas con peritaje computarizado y toma de usados llave por llave.',
    avatar_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    website_url: 'https://cordobamotors.com.ar',
    user_type: 'agencia',
    plan_status: 'active',
  }
];

export default function AgenciesPage({ onBackToHome, onSelectAgencyVehicles }) {
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('all');

  useEffect(() => {
    async function fetchAgencies() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'agencia');

        if (!error && data && data.length > 0) {
          // Merge fetched with seed
          const liveIds = new Set(data.map(d => d.id));
          const filteredSeed = SEED_AGENCIES.filter(s => !liveIds.has(s.id));
          setAgencies([...data, ...filteredSeed]);
        } else {
          setAgencies(SEED_AGENCIES);
        }
      } catch (err) {
        console.warn('Fallback a agencias recomendadas:', err);
        setAgencies(SEED_AGENCIES);
      } finally {
        setLoading(false);
      }
    }
    fetchAgencies();
  }, []);

  const filteredAgencies = useMemo(() => {
    return agencies.filter((agency) => {
      const name = (agency.business_name || agency.full_name || '').toLowerCase();
      const city = (agency.city || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      if (term && !name.includes(term) && !city.includes(term)) {
        return false;
      }

      if (selectedProvince !== 'all' && agency.province !== selectedProvince) {
        return false;
      }

      return true;
    });
  }, [agencies, searchTerm, selectedProvince]);

  const handleWhatsAppContact = (agency) => {
    const cleanPhone = agency.phone_whatsapp ? agency.phone_whatsapp.replace(/\D/g, '') : '5491134567890';
    const text = encodeURIComponent(
      `Hola ${agency.business_name || agency.full_name}, vi su perfil de Concesionaria en Sitio Automotor y quisiera consultar por su stock disponible.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
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
            <ArrowLeft className="w-4 h-4 text-[#6D28D9]" />
            <span>Volver al Inicio</span>
          </button>

          <span className="text-xs font-bold text-slate-500">
            {filteredAgencies.length} concesionarias verificadas
          </span>
        </div>

        {/* Banner Hero Agencias */}
        <div className="rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#2E1065] to-[#0F172A] text-white p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              Red de Concesionarias Oficiales
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Agencias y Concesionarias Verificadas
            </h1>
            <p className="text-xs text-purple-200/80 max-w-2xl">
              Explorá el stock de agencias líderes del país. Comprá con seguridad, garantía e inspección técnica profesional.
            </p>
          </div>

          <div className="px-4 py-2.5 rounded-2xl bg-purple-950/80 border border-purple-400/40 text-purple-200 text-xs font-black font-mono shadow-md whitespace-nowrap">
            {filteredAgencies.length} agencias activas
          </div>
        </div>

        {/* Buscador de Agencias */}
        <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-end">
            <div className="lg:col-span-8">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Buscar Concesionaria por nombre o ciudad
              </label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Ej. Mendoza Automotores, Rosario, San Isidro..."
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-[#6D28D9] focus:bg-white"
                />
              </div>
            </div>

            <div className="lg:col-span-4">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Provincia
              </label>
              <select
                value={selectedProvince}
                onChange={(e) => setSelectedProvince(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-[#6D28D9] cursor-pointer font-semibold"
              >
                <option value="all">Todas las provincias</option>
                {PROVINCE_OPTIONS.filter(p => p !== 'Todas las ubicaciones').map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Listado de Agencias Grid */}
        {loading ? (
          <div className="py-16 text-center space-y-3 bg-white border border-slate-200 rounded-3xl">
            <Loader2 className="w-8 h-8 text-[#6D28D9] animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold">Cargando agencias verificadas...</p>
          </div>
        ) : filteredAgencies.length === 0 ? (
          <div className="py-16 text-center space-y-4 bg-white border border-slate-200 rounded-3xl">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-black text-slate-800">No encontramos agencias con ese filtro</h3>
            <button
              onClick={() => { setSearchTerm(''); setSelectedProvince('all'); }}
              className="px-5 py-2.5 rounded-xl bg-[#6D28D9] text-white font-bold text-xs cursor-pointer shadow-md"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAgencies.map((agency) => (
              <div
                key={agency.id || agency.business_name}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Banner Header */}
                  <div className="h-32 bg-gradient-to-r from-purple-950 via-indigo-900 to-slate-900 relative overflow-hidden">
                    {agency.banner_url ? (
                      <img src={agency.banner_url} alt="" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full opacity-20 bg-[radial-gradient(#6D28D9_1px,transparent_1px)] [background-size:16px_16px]" />
                    )}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-[10px] font-black text-purple-300 border border-purple-500/40 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Verificada
                    </div>
                  </div>

                  {/* Info Body */}
                  <div className="p-5 relative pt-0">
                    <div className="flex items-end justify-between -mt-9 mb-3">
                      <div className="w-16 h-16 rounded-2xl bg-[#6D28D9] border-4 border-white shadow-xl text-white flex items-center justify-center font-black text-xl overflow-hidden">
                        {agency.avatar_url ? (
                          <img src={agency.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (agency.business_name?.charAt(0) || 'A')
                        )}
                      </div>
                      <span className="px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-800 text-[10px] font-black border border-purple-200">
                        Concesionaria
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-slate-900 group-hover:text-[#6D28D9] transition-colors">
                        {agency.business_name || agency.full_name}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                        {agency.bio || 'Concesionaria con garantía y amplio catálogo de vehículos seleccionados.'}
                      </p>

                      <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        {agency.address && (
                          <div className="flex items-center gap-2">
                            <Building2 className="w-3.5 h-3.5 text-[#6D28D9] flex-shrink-0" />
                            <span className="truncate">{agency.address}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#6D28D9] flex-shrink-0" />
                          <span>{agency.city}, {agency.province}</span>
                        </div>
                        {agency.business_hours && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-[#6D28D9] flex-shrink-0" />
                            <span className="truncate">{agency.business_hours}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => handleWhatsAppContact(agency)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp</span>
                  </button>

                  {onSelectAgencyVehicles && (
                    <button
                      onClick={() => onSelectAgencyVehicles(agency.business_name || agency.full_name)}
                      className="py-2.5 px-3 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      title="Ver stock de esta agencia"
                    >
                      <Car className="w-4 h-4" />
                      <span className="hidden sm:inline">Stock</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
