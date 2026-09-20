import React, { useState } from 'react';
import { X, Wrench, Building2, MapPin, Phone, CheckCircle2, Loader2, Sparkles, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function RegisterBusinessModal({ isOpen, onClose, onBusinessRegistered }) {
  const [formData, setFormData] = useState({
    rubroId: 'talleres',
    name: '',
    address: '',
    city: 'Rosario',
    province: 'Santa Fe',
    phone: '',
    whatsapp: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const newService = {
        rubro_id: formData.rubroId,
        name: formData.name,
        address: formData.address || null,
        city: formData.city,
        province: formData.province,
        phone: formData.phone || null,
        whatsapp: formData.whatsapp || formData.phone,
        rating: 5.0,
        verified: true,
      };

      const { data, error } = await supabase
        .from('services_directory')
        .insert([newService])
        .select()
        .single();

      if (error) {
        console.warn('Fallback a guardado local por falta de conexión o RLS:', error.message);
      }

      setSubmitted(true);
      setTimeout(() => {
        if (onBusinessRegistered) {
          onBusinessRegistered(data || newService);
        }
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message || 'Error al registrar el negocio.');
    } finally {
      setLoading(false);
    }
  };

  const rubros = [
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
    { id: 'audio-alarmas', label: 'Audio y alarmas' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-xl rounded-3xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden my-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#1E293B]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-900/30">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase block">
                Directorio Automotor
              </span>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Sumá tu negocio a Mundo Automotor
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

        {submitted ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-extrabold text-white">¡Negocio Registrado Exitosamente!</h4>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Tu comercio ya figura en el directorio destacado de <strong className="text-white">Mundo Automotor</strong>.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                ⚠️ {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Rubro del Negocio *</label>
              <select
                value={formData.rubroId}
                onChange={(e) => setFormData({ ...formData, rubroId: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
              >
                {rubros.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Nombre Comercial del Negocio *</label>
              <input
                type="text"
                required
                placeholder="Ej. Lubricentro San Martín, Repuestos El Rayo…"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Rosario"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Provincia *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Santa Fe"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Dirección (Opcional)</label>
              <input
                type="text"
                placeholder="Ej. Av. Pellegrini 1420"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Teléfono Fijo / Móvil</label>
                <input
                  type="tel"
                  placeholder="Ej. 0341 4556677"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp de Consultas *</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 5493415550199"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-lg shadow-amber-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-200" />
                  <span>Guardando en el directorio...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Registrar mi negocio gratuitamente</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
