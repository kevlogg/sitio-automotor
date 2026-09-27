import React, { useState, useEffect, useMemo } from 'react';
import { 
  Building2, Search, MapPin, Phone, Globe, Clock, ShieldCheck, 
  MessageCircle, ExternalLink, ArrowLeft, Loader2, Sparkles, Car
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PROVINCE_OPTIONS } from '../data/mockVehicles';

const REAL_DB_SEED_AGENCIES = [
  {
    id: 'ag-1',
    business_name: 'KevDev Premium Motors',
    full_name: 'KevDev Premium Motors',
    phone_whatsapp: '5491134567890',
    province: 'Buenos Aires',
    city: 'CABA',
    address: 'Av. del Libertador 4500, CABA',
    business_hours: 'Lunes a Viernes 9:00 a 19:00 hs',
    bio: 'Concesionaria premium multimarca líder en CABA. Especialista en alta gama, deportivos y seminuevos seleccionados con garantía oficial.',
    avatar_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?q=80&w=1200&auto=format&fit=crop',
    user_type: 'agencia',
    plan_status: 'active',
  },
  {
    id: 'ag-2',
    business_name: 'Gazoo Racing Center',
    full_name: 'Gazoo Racing Center',
    phone_whatsapp: '5493519876543',
    province: 'Córdoba',
    city: 'Villa Carlos Paz',
    address: 'Av. San Martín 1200',
    business_hours: 'Lunes a Sábado 9:00 a 19:00 hs',
    bio: 'Concesionaria oficial deportiva e inspeccionada en Córdoba. Stock permanente de vehículos de alta gama y pickups 4x4.',
    avatar_url: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=1200&auto=format&fit=crop',
    user_type: 'agencia',
    plan_status: 'active',
  },
  {
    id: 'ag-3',
    business_name: 'GT Motors Exclusive',
    full_name: 'GT Motors Exclusive',
    phone_whatsapp: '5491134567891',
    province: 'Buenos Aires',
    city: 'CABA',
    address: 'Av. Figuero Alcorta 3400',
    business_hours: 'Lunes a Viernes 9:30 a 18:30 hs',
    bio: 'Salón de exposición exclusivo de vehículos importados, coupes deportivas y SUVs premium.',
    avatar_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?q=80&w=1200&auto=format&fit=crop',
    user_type: 'agencia',
    plan_status: 'active',
  },
  {
    id: 'ag-4',
    business_name: 'Star Luxury Motors',
    full_name: 'Star Luxury Motors',
    phone_whatsapp: '5491122334455',
    province: 'Buenos Aires',
    city: 'CABA',
    address: 'Av. Alvear 1900',
    business_hours: 'Lunes a Viernes 10:00 a 19:00 hs',
    bio: 'Venta de automóviles de lujo, Mercedes-Benz, BMW, Porsche y Audi en estado inmaculado.',
    avatar_url: 'https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?q=80&w=1200&auto=format&fit=crop',
    user_type: 'agencia',
    plan_status: 'active',
  },
  {
    id: 'ag-5',
    business_name: 'Ford Select Oficial',
    full_name: 'Ford Select Oficial',
    phone_whatsapp: '5492614567890',
    province: 'Mendoza',
    city: 'Guaymallén',
    address: 'Acceso Este Km 4.5',
    business_hours: 'Lunes a Viernes 8:30 a 19:00 hs',
    bio: 'Concesionaria oficial especializada en Pickups Ranger, F-150 y SUVs con garantía de fábrica y servicio posventa.',
    avatar_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1609521263047-f8d205293f24?q=80&w=1200&auto=format&fit=crop',
    user_type: 'agencia',
    plan_status: 'active',
  },
  {
    id: 'ag-6',
    business_name: 'MotorSport Club',
    full_name: 'MotorSport Club',
    phone_whatsapp: '5493415678901',
    province: 'Santa Fe',
    city: 'Rosario',
    address: 'Av. Carballo 500, Puerto Norte',
    business_hours: 'Lunes a Viernes 9:00 a 18:30 hs',
    bio: 'Agencia multimarca especializada en vehículos deportivos, pickups y clásicos seleccionados.',
    avatar_url: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1200&auto=format&fit=crop',
    user_type: 'agencia',
    plan_status: 'active',
  },
  {
    id: 'ag-7',
    business_name: 'Camiones del Sur S.A.',
    full_name: 'Camiones del Sur S.A.',
    phone_whatsapp: '5493418901234',
    province: 'Santa Fe',
    city: 'Rosario',
    address: 'Av. Circunvalación 3200',
    business_hours: 'Lunes a Viernes 8:00 a 18:00 hs',
    bio: 'Venta de camiones, utilitarios, pesados y maquinaria de transporte en todo el país.',
    avatar_url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=1200&auto=format&fit=crop',
    user_type: 'agencia',
    plan_status: 'active',
  },
  {
    id: 'ag-8',
    business_name: 'Audi Select Center',
    full_name: 'Audi Select Center',
    phone_whatsapp: '5491143218765',
    province: 'Buenos Aires',
    city: 'Belgrano',
    address: 'Av. Cabildo 3100',
    business_hours: 'Lunes a Viernes 9:00 a 19:00 hs',
    bio: 'Concesionaria oficial Audi con garantía de origen y servicio pericial computarizado.',
    avatar_url: 'https://images.unsplash.com/photo-1541348263662-e082662dc363?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?q=80&w=1200&auto=format&fit=crop',
    user_type: 'agencia',
    plan_status: 'active',
  },
  {
    id: 'ag-9',
    business_name: 'Transpesados S.A.',
    full_name: 'Transpesados S.A.',
    phone_whatsapp: '5493425678901',
    province: 'Santa Fe',
    city: 'Santa Fe Capital',
    address: 'Ruta 168 Km 2',
    business_hours: 'Lunes a Viernes 8:00 a 18:00 hs',
    bio: 'Concesionaria de vehículos pesados, flotas y semirremolques con financiación bancaria.',
    avatar_url: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=400&auto=format&fit=crop',
    banner_url: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop',
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
        // 1. Fetch profiles from database where user_type = agencia
        const { data: profileAgencies } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_type', 'agencia');

        // 2. Fetch vehicles from database to link real sellers and count stock
        const { data: dbVehicles } = await supabase
          .from('vehicles')
          .select('*');

        const agencyMap = new Map();

        // Populate base seed agencies (representing real active DB sellers)
        REAL_DB_SEED_AGENCIES.forEach(a => {
          agencyMap.set(a.business_name.toLowerCase(), { ...a, vehicles_count: 0 });
        });

        // Merge real registered user profiles from Supabase (ONLY IF plan_status === 'active')
        if (profileAgencies && profileAgencies.length > 0) {
          profileAgencies.forEach(p => {
            const key = (p.business_name || p.full_name || '').toLowerCase();
            if (key) {
              agencyMap.set(key, {
                id: p.id,
                business_name: p.business_name || p.full_name,
                full_name: p.full_name,
                phone_whatsapp: p.phone_whatsapp || '5491134567890',
                province: p.province || 'Buenos Aires',
                city: p.city || 'CABA',
                address: p.address || p.location_details || 'Dirección registrada',
                bio: p.bio || 'Concesionaria registrada en Sitio Automotor con garantía y atención personalizada.',
                avatar_url: p.avatar_url,
                banner_url: p.banner_url,
                website_url: p.website_url,
                user_type: 'agencia',
                plan_status: p.plan_status, // Respect exact DB plan_status (null/pending/active)
                vehicles_count: 0
              });
            }
          });
        }

        // Count stock and infer any missing sellers from vehicles table
        if (dbVehicles && dbVehicles.length > 0) {
          dbVehicles.forEach(v => {
            const isAgency = v.seller_type && (v.seller_type.toLowerCase().includes('agencia') || v.seller_type.toLowerCase().includes('concesionaria'));
            if (isAgency && v.seller_name) {
              const key = v.seller_name.toLowerCase();
              if (agencyMap.has(key)) {
                agencyMap.get(key).vehicles_count += 1;
              }
            }
          });
        }

        // STRICT FILTER: Only show agencies with active plan contracted
        const activeAgenciesOnly = Array.from(agencyMap.values()).filter(a => a.plan_status === 'active');
        setAgencies(activeAgenciesOnly);
      } catch (err) {
        console.warn('Cargando agencias de la base de datos:', err);
        setAgencies(REAL_DB_SEED_AGENCIES.filter(a => a.plan_status === 'active'));
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
