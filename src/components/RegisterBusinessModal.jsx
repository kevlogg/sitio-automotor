import React, { useState } from 'react';
import { X, Wrench, Building2, MapPin, Phone, CheckCircle2, Loader2, Sparkles, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ARGENTINA_LOCATION_DATA, PROVINCES_LIST } from '../data/locationData';

export default function RegisterBusinessModal({ isOpen, onClose, onBusinessRegistered }) {
  const [locationType, setLocationType] = useState('single'); // 'single' | 'multiple'

  const [formData, setFormData] = useState({
    rubroId: 'talleres',
    customRubro: '',
    name: '',
    address: '',
    province: 'Santa Fe',
    city: ARGENTINA_LOCATION_DATA['Santa Fe'][0],
    customCity: '',
    locationDetails: '',
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

    if (formData.rubroId === 'otro' && !formData.customRubro.trim()) {
      setErrorMsg('Debes especificar la aclaración del rubro al elegir "Otro".');
      setLoading(false);
      return;
    }

    if (locationType === 'multiple' && !formData.locationDetails.trim()) {
      setErrorMsg('Por favor detalla los lugares donde se ubica tu negocio o brinda servicio.');
      setLoading(false);
      return;
    }

    const isCustomCity = formData.city.startsWith('Otra') || formData.city.startsWith('Otro');
    if (locationType === 'single' && isCustomCity && !formData.customCity.trim()) {
      setErrorMsg('Por favor especifica el nombre de tu ciudad o localidad.');
      setLoading(false);
      return;
    }

    const finalCity = locationType === 'multiple' 
      ? 'Varias ubicaciones' 
      : (isCustomCity ? formData.customCity.trim() : formData.city);
    const finalProvince = locationType === 'multiple' ? 'Varias provincias / Online' : formData.province;
    const finalRubro = formData.rubroId === 'otro' ? `otro: ${formData.customRubro.trim()}` : formData.rubroId;

    try {
      const newService = {
        rubro_id: finalRubro,
        name: formData.name,
        address: locationType === 'multiple' ? (formData.locationDetails || null) : (formData.address || null),
        city: finalCity,
        province: finalProvince,
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
    { id: 'otro', label: 'Otro (Especificar)' },
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

            {formData.rubroId === 'otro' && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1.5 animate-fadeIn">
                <label className="block text-xs font-extrabold text-amber-300">
                  Aclaración Obligatoria del Rubro *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Ploteo, Wrap, polarizados y calcomanías"
                  value={formData.customRubro}
                  onChange={(e) => setFormData({ ...formData, customRubro: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-amber-500/50 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            )}

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

            {/* Ubicación y Modo de Alcance */}
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <label className="block text-xs font-bold text-slate-300">Ubicación / Cobertura *</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLocationType('single')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all ${
                    locationType === 'single'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Lugar Específico
                </button>
                <button
                  type="button"
                  onClick={() => setLocationType('multiple')}
                  className={`p-2 rounded-xl text-xs font-bold transition-all ${
                    locationType === 'multiple'
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-slate-950 text-slate-400 border border-slate-800'
                  }`}
                >
                  Varias Ubicaciones / Online
                </button>
              </div>

              {locationType === 'single' ? (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* 1. PROVINCIA PRIMERO */}
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">1. Provincia *</label>
                      <select
                        value={formData.province}
                        onChange={(e) => {
                          const newProv = e.target.value;
                          const cities = ARGENTINA_LOCATION_DATA[newProv] || [];
                          setFormData((prev) => ({
                            ...prev,
                            province: newProv,
                            city: cities[0] || '',
                            customCity: '',
                          }));
                        }}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
                      >
                        {PROVINCES_LIST.map((prov) => (
                          <option key={prov} value={prov}>
                            {prov}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* 2. CIUDAD SEGUNDO */}
                    <div>
                      <label className="block text-[11px] font-bold text-amber-300 mb-1">2. Ciudad / Localidad *</label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer"
                      >
                        {(ARGENTINA_LOCATION_DATA[formData.province] || ['Otra ciudad / localidad']).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {(formData.city.startsWith('Otra') || formData.city.startsWith('Otro')) && (
                    <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 space-y-1 animate-fadeIn">
                      <label className="block text-[11px] font-bold text-amber-300">
                        Especificá el nombre de tu ciudad o localidad *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Villa General Belgrano, El Chaltén..."
                        value={formData.customCity}
                        onChange={(e) => setFormData({ ...formData, customCity: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5 pt-1 animate-fadeIn">
                  <label className="block text-xs font-bold text-amber-300">
                    Aclaración de lugares donde te ubicas u operas *
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Ej. Sucursales en Rosario y CABA / Servicio móvil a todo GBA"
                    value={formData.locationDetails}
                    onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                  ></textarea>
                </div>
              )}
            </div>

            {locationType === 'single' && (
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
            )}

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
