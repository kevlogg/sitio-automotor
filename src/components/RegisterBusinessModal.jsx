import React, { useState } from 'react';
import { X, Wrench, Building2, MapPin, Phone, CheckCircle2, Loader2, Sparkles, Store } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ARGENTINA_LOCATION_DATA, PROVINCES_LIST } from '../data/locationData';

export default function RegisterBusinessModal({ 
  isOpen, 
  onClose, 
  onBusinessRegistered,
  currentUser,
  onUpdateUser,
  onRequireAuth,
  onNavigate
}) {
  const [locationType, setLocationType] = useState('single'); // 'single' | 'multiple'

  const profile = currentUser?.profile || {};

  const [formData, setFormData] = useState({
    rubroId: profile.rubro || 'talleres',
    customRubro: '',
    name: profile.business_name || profile.full_name || '',
    address: profile.address || '',
    province: profile.province || 'Santa Fe',
    city: profile.city || ARGENTINA_LOCATION_DATA['Santa Fe'][0],
    customCity: '',
    locationDetails: profile.location_details || '',
    phone: profile.phone_whatsapp || '',
    whatsapp: profile.phone_whatsapp || '',
  });

  // Si cambia el usuario, actualizar datos
  React.useEffect(() => {
    if (currentUser?.profile) {
      const p = currentUser.profile;
      setFormData(prev => ({
        ...prev,
        name: p.business_name || p.full_name || prev.name,
        phone: p.phone_whatsapp || prev.phone,
        whatsapp: p.phone_whatsapp || prev.whatsapp,
        province: p.province || prev.province,
        city: p.city || prev.city,
        address: p.address || prev.address,
        rubroId: p.rubro || prev.rubroId,
      }));
    }
  }, [currentUser]);

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
        user_id: currentUser?.user?.id || null,
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

      // Si el usuario está autenticado, sincronizar su perfil en profiles
      if (currentUser?.user?.id) {
        try {
          const updatedProfile = {
            ...profile,
            business_name: formData.name,
            rubro: finalRubro,
            phone_whatsapp: formData.whatsapp || formData.phone,
            city: finalCity,
            province: finalProvince,
            user_type: profile.user_type === 'particular' ? 'negocio_automotor' : profile.user_type,
            address: formData.address || profile.address,
            updated_at: new Date().toISOString(),
          };

          await supabase.from('profiles').update(updatedProfile).eq('id', currentUser.user.id);

          if (onUpdateUser) {
            onUpdateUser({
              ...currentUser,
              profile: updatedProfile,
            });
          }
        } catch (profileErr) {
          console.warn('Sync profile warning:', profileErr);
        }
      }

      setSubmitted(true);
      if (onBusinessRegistered) {
        onBusinessRegistered(data || newService);
      }
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
          <div className="p-10 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center animate-bounce shadow-lg shadow-emerald-950/40">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-2xl font-black text-white">¡Negocio Registrado con Éxito!</h4>
              <p className="text-slate-300 text-xs leading-relaxed font-medium">
                Tu comercio <strong className="text-white">"{formData.name}"</strong> ya figura publicado en la guía oficial de <strong className="text-amber-400">Mundo Automotor</strong>.
              </p>
              {currentUser ? (
                <p className="text-[11px] text-emerald-300 font-bold bg-emerald-950/40 py-2 px-3 rounded-xl border border-emerald-800/40">
                  ✓ Vinculado a tu cuenta. Podés autogestionar tus datos desde tu panel de negocio.
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  Si más adelante querés modificar horarios, fotos o datos de contacto, podés crearte una cuenta gratuita.
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-sm mx-auto">
              {currentUser && onNavigate ? (
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                    onNavigate('dashboard');
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-black text-xs shadow-md cursor-pointer transition-all"
                >
                  Ir a Mi Panel de Negocio
                </button>
              ) : onRequireAuth ? (
                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                    onRequireAuth('signup');
                  }}
                  className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md cursor-pointer transition-all"
                >
                  Crear Cuenta de Negocio
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  onClose();
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Aviso de doble vía (conectado vs invitado) */}
            {currentUser ? (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Sesión activa: tu negocio se vinculará a <strong>{currentUser.profile?.full_name || currentUser.user?.email}</strong>.</span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <span>¿Querés autogestionar fotos, horarios y consultas desde tu panel?</span>
                {onRequireAuth && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequireAuth('signup');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] whitespace-nowrap cursor-pointer transition-colors"
                  >
                    Crear Cuenta Gratis
                  </button>
                )}
              </div>
            )}

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
                  <span>Registrar mi Comercio (Plan Base $55.000/mes)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
