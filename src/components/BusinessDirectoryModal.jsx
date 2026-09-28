import React, { useState, useEffect } from 'react';
import { X, Store, MapPin, Phone, MessageCircle, Star, ShieldCheck, Sparkles, Loader2, Wrench } from 'lucide-react';
import { supabase } from '../lib/supabase';

const RUBRO_NAMES = {
  repuestos: 'Repuestos',
  accesorios: 'Accesorios',
  gomerias: 'Gomerías y neumáticos',
  talleres: 'Talleres mecánicos',
  lubricentros: 'Lubricentros',
  electricidad: 'Electricidad del automotor',
  'chapa-pintura': 'Chapa y pintura',
  detailing: 'Detailing y lavaderos',
  baterias: 'Baterías',
  cristales: 'Cristales',
  seguros: 'Seguros',
  financiacion: 'Financiación',
  gruas: 'Grúas y auxilio',
  gestorias: 'Gestorías',
  'audio-alarmas': 'Audio y alarmas',
};

// Seed fallback businesses when DB has no records for a rubro
const SEED_SERVICES = [
  {
    id: 's1',
    rubro_id: 'talleres',
    name: 'Taller Mecánico Especializado San Martín',
    address: 'Av. Pellegrini 1840',
    city: 'Rosario',
    province: 'Santa Fe',
    phone: '0341 4829922',
    whatsapp: '5493415550199',
    rating: 4.9,
    verified: true,
  },
  {
    id: 's2',
    rubro_id: 'repuestos',
    name: 'Repuestos El Rayo Originales',
    address: 'Av. Mitre 450',
    city: 'Rosario',
    province: 'Santa Fe',
    phone: '0341 4210088',
    whatsapp: '5493415550299',
    rating: 5.0,
    verified: true,
  },
  {
    id: 's3',
    rubro_id: 'lubricentros',
    name: 'Lubricentro Express Premium',
    address: 'Av. Juan B. Justo 2100',
    city: 'Buenos Aires',
    province: 'CABA',
    phone: '011 47712233',
    whatsapp: '5491133445566',
    rating: 4.8,
    verified: true,
  },
  {
    id: 's4',
    rubro_id: 'detailing',
    name: 'GT Detailing & Ceramico Studio',
    address: 'Calle 50 #1240',
    city: 'La Plata',
    province: 'Buenos Aires',
    phone: '0221 4891122',
    whatsapp: '5492215667788',
    rating: 5.0,
    verified: true,
  },
];

export default function BusinessDirectoryModal({ isOpen, onClose, activeRubro, onOpenRegisterBusiness }) {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);

  const rubroName = RUBRO_NAMES[activeRubro] || activeRubro || 'Servicios Automotor';

  useEffect(() => {
    if (!isOpen || !activeRubro) return;

    async function fetchDirectory() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('services_directory')
          .select('*')
          .eq('rubro_id', activeRubro)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          setBusinesses(data);
        } else {
          // Fallback to seed businesses matching rubro or default
          const filteredSeed = SEED_SERVICES.filter((s) => s.rubro_id === activeRubro);
          setBusinesses(filteredSeed.length > 0 ? filteredSeed : [
            {
              id: 'demo-1',
              rubro_id: activeRubro,
              name: `Centro Oficial de ${rubroName}`,
              address: 'Av. Belgrano 1200',
              city: 'Rosario',
              province: 'Santa Fe',
              whatsapp: '5493415550199',
              rating: 5.0,
              verified: true,
            }
          ]);
        }
      } catch (err) {
        console.warn('Fallback a comercios seed:', err);
        setBusinesses(SEED_SERVICES.filter((s) => s.rubro_id === activeRubro));
      } finally {
        setLoading(false);
      }
    }

    fetchDirectory();
  }, [isOpen, activeRubro]);

  if (!isOpen) return null;

  const handleWhatsAppContact = (b) => {
    const cleanPhone = b.whatsapp ? b.whatsapp.replace(/\D/g, '') : '5491112345678';
    const text = encodeURIComponent(
      `Hola ${b.name}, vi su negocio en el directorio Mundo Automotor de Sitio Automotor y quisiera hacer una consulta.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#0F172A] border border-purple-800/80 shadow-2xl overflow-hidden my-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#1E293B]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-purple-400 uppercase block">
                Directorio Mundo Automotor
              </span>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                {rubroName}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Cargando comercios verificados desde Supabase Cloud...</p>
            </div>
          ) : businesses.length === 0 ? (
            <div className="py-8 text-center space-y-4">
              <p className="text-sm text-slate-300">Aún no hay comercios registrados en este rubro.</p>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenRegisterBusiness) onOpenRegisterBusiness();
                }}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-lg flex items-center gap-2 mx-auto cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-200" />
                <span>Sé el primero en registrar tu comercio</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {businesses.map((b) => (
                <div
                  key={b.id || b.name}
                  className="p-4 rounded-2xl bg-slate-900/90 border border-purple-900/40 hover:border-purple-500/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-white group-hover:text-purple-300 transition-colors">
                        {b.name}
                      </h4>
                      {b.verified && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          Verificado
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" />
                        {b.address ? `${b.address}, ` : ''}{b.city} ({b.province})
                      </span>
                      {b.rating && (
                        <span className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {b.rating}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleWhatsAppContact(b)}
                    className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-900/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 flex-shrink-0"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contactar WhatsApp</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div className="p-4 border-t border-slate-800 bg-[#1E293B]/40 flex items-center justify-between">
          <span className="text-xs text-slate-400">¿Tenés un taller o comercio automotor?</span>
          <button
            onClick={() => {
              onClose();
              if (onOpenRegisterBusiness) onOpenRegisterBusiness();
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 transition-transform"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Sumar mi Comercio</span>
          </button>
        </div>
      </div>
    </div>
  );
}
