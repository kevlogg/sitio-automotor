import React, { useState, useEffect } from 'react';
import {
  Car, Phone, MapPin, PlusCircle, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, LogOut, Eye, Edit3, Trash2, ShieldCheck, Sparkles,
  Heart, X, Check, Building2, TrendingUp, Zap, Clock, CreditCard, Send, Mail
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ARGENTINA_LOCATION_DATA, PROVINCES_LIST } from '../../data/locationData';
import { submitPaymentClaim, PLAN_STATUS } from '../../lib/planUtils';

// ─── Tarjeta de plan con botón "Ya pagué" ─────────────────────────────────────
function PlanCard({ planKey, title, priceLabel, priceNote, features, disabledFeatures = [],
  accentColor, isHighlighted, badge, isCurrent, isPending, onPaymentClaim, submitting }) {

  const [paid, setPaid] = useState(false);
  const [err, setErr] = useState(null);

  const handlePaid = async () => {
    setErr(null);
    try {
      await onPaymentClaim(planKey);
      setPaid(true);
    } catch (e) {
      setErr('No se pudo registrar tu solicitud. Intentá de nuevo.');
    }
  };

  return (
    <div className={`rounded-3xl p-6 border flex flex-col justify-between space-y-5 transition-all relative ${
      isHighlighted
        ? `bg-gradient-to-b ${accentColor.gradient} ${accentColor.border} ring-2 ${accentColor.ring} shadow-2xl`
        : `bg-slate-900/80 ${accentColor.borderSoft} hover:${accentColor.borderHover}`
    }`}>
      {badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-white text-[10px] font-black tracking-wider shadow-md uppercase whitespace-nowrap ${accentColor.badge}`}>
          {badge}
        </div>
      )}

      <div className="space-y-4 pt-1">
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 border ${accentColor.chip}`}>
            {title}
          </span>
          {isCurrent && isPending && (
            <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Pendiente
            </span>
          )}
          {isCurrent && !isPending && (
            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
              ✓ Activo
            </span>
          )}
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{priceLabel}</span>
          </div>
          {priceNote && <p className={`text-xs mt-1 ${accentColor.note}`}>{priceNote}</p>}
        </div>

        <ul className="space-y-2 text-xs text-slate-300">
          {features.map(item => (
            <li key={item.text || item} className="flex items-start gap-2">
              <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${accentColor.check}`} />
              <span className={item.bold ? 'font-extrabold text-white' : ''}>{item.text || item}</span>
            </li>
          ))}
          {disabledFeatures.map(item => (
            <li key={item} className="flex items-start gap-2 opacity-40">
              <X className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTAs */}
      <div className="space-y-2">
        {paid ? (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>¡Solicitud enviada! El equipo validará tu pago y activará el plan.</span>
          </div>
        ) : isCurrent && isPending ? (
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-bold flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Solicitud enviada. Esperando verificación del equipo.</span>
          </div>
        ) : (
          <>
            <button
              onClick={handlePaid}
              disabled={submitting}
              className={`w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-all ${accentColor.payBtn} disabled:opacity-50`}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              <span>Ya pagué en efectivo / transferencia</span>
            </button>
            {err && <p className="text-[10px] text-rose-400 text-center">{err}</p>}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Dashboard Principal ───────────────────────────────────────────────────────
export default function DashboardParticular({
  currentUser, onUpdateUser, onBackToHome, onSignOut,
  onOpenPublishModal, vehicles, favorites, onToggleFavorite, onOpenDetailModal
}) {
  const profile = currentUser?.profile || {};
  const [activeTab, setActiveTab] = useState('perfil');
  const [locationType, setLocationType] = useState(profile.location_details ? 'multiple' : 'single');

  // Plan state
  const planStatus = profile.plan_status || null;
  const currentPlanKey = profile.current_plan || null;
  const [submittingPayment, setSubmittingPayment] = useState(false);

  const [formData, setFormData] = useState({
    fullName: profile.full_name || '',
    email: profile.email || currentUser?.user?.email || '',
    phoneWhatsApp: profile.phone_whatsapp || '',
    province: profile.province || 'Buenos Aires',
    city: profile.city || ARGENTINA_LOCATION_DATA['Buenos Aires'][0],
    customCity: '',
    locationDetails: profile.location_details || '',
    bio: profile.bio || '',
    avatarUrl: profile.avatar_url || '',
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (currentUser?.profile || currentUser?.user) {
      const p = currentUser?.profile || {};
      const u = currentUser?.user || {};
      setFormData(prev => ({
        ...prev,
        fullName: p.full_name || prev.fullName,
        email: p.email || u.email || prev.email,
        phoneWhatsApp: p.phone_whatsapp || prev.phoneWhatsApp,
        province: p.province || prev.province,
        city: p.city || prev.city,
        locationDetails: p.location_details || prev.locationDetails,
        bio: p.bio || prev.bio,
        avatarUrl: p.avatar_url || prev.avatarUrl,
      }));
      if (p.location_details) setLocationType('multiple');
    }
  }, [currentUser]);

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    const isCustomCity = formData.city.startsWith('Otra') || formData.city.startsWith('Otro');
    if (locationType === 'single' && isCustomCity && !formData.customCity.trim()) {
      setErrorMsg('Por favor especificá la ciudad o localidad.');
      setSaving(false);
      return;
    }

    const finalCity = locationType === 'multiple'
      ? 'Varias ubicaciones'
      : (isCustomCity ? formData.customCity.trim() : formData.city);
    const finalProvince = locationType === 'multiple' ? 'Varias provincias / Online' : formData.province;

    try {
      const updatedProfile = {
        id: currentUser.user.id,
        email: formData.email || currentUser.user.email,
        full_name: formData.fullName,
        user_type: 'particular',
        phone_whatsapp: formData.phoneWhatsApp,
        city: finalCity,
        province: finalProvince,
        location_details: locationType === 'multiple' ? formData.locationDetails : null,
        bio: formData.bio || null,
        avatar_url: formData.avatarUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updatedProfile);
      if (error) console.warn('Upsert warning:', error.message);

      onUpdateUser({ ...currentUser, profile: updatedProfile });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar los cambios.');
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentClaim = async (planKey) => {
    setSubmittingPayment(true);
    try {
      await submitPaymentClaim({
        userId: currentUser.user.id,
        userEmail: currentUser.user.email,
        userName: formData.fullName || 'Sin nombre',
        userType: 'particular',
        planKey,
      });
      onUpdateUser({
        ...currentUser,
        profile: { ...profile, plan_status: 'pending', current_plan: planKey },
      });
    } finally {
      setSubmittingPayment(false);
    }
  };

  const myVehicles = vehicles.filter(v =>
    (v.sellerName && profile.full_name && v.sellerName.toLowerCase().includes(profile.full_name.toLowerCase()))
  );
  const myFavorites = vehicles.filter(v => favorites.includes(v.id));

  const tabs = [
    { id: 'perfil', label: 'Mi Perfil', icon: Car },
    { id: 'publicaciones', label: `Publicaciones (${myVehicles.length})`, icon: TrendingUp },
    { id: 'favoritos', label: `Favoritos (${myFavorites.length})`, icon: Heart },
    { id: 'planes', label: planStatus === 'pending' ? 'Plan — Pendiente' : planStatus === 'active' ? 'Mi Plan ✓' : 'Contratar Plan', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBackToHome}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver a la Tienda</span>
            </button>
            <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-4">
              <Car className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-black text-white">Panel de Vendedor Particular</span>
            </div>
          </div>
          <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToHome}>
            <img src="/logofrase.png" alt="Sitio Automotor" className="h-11 w-auto object-contain" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xs">
                {profile.full_name?.charAt(0) || 'P'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white max-w-[130px] truncate">{profile.full_name || 'Particular'}</span>
                <span className="text-[9px] font-extrabold border px-1.5 rounded-md bg-blue-500/20 text-blue-300 border-blue-500/40">Particular</span>
              </div>
            </div>
            <button onClick={onSignOut} className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Hero Banner con alerta si no tiene plan */}
        <div className="relative rounded-3xl bg-gradient-to-r from-blue-950/80 via-[#0F172A] to-slate-900 border border-blue-900/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-black border flex items-center gap-1.5 w-fit bg-blue-500/20 text-blue-300 border-blue-500/40">
                <Car className="w-3.5 h-3.5" /> Vendedor Particular
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Hola, {profile.full_name || 'Usuario'} 👋
              </h1>
              {!planStatus && (
                <p className="text-xs sm:text-sm text-amber-300 font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  No tenés ningún plan activo. Ir a <button onClick={() => setActiveTab('planes')} className="underline cursor-pointer">Contratar Plan</button> para publicar.
                </p>
              )}
              {planStatus === 'pending' && (
                <p className="text-xs sm:text-sm text-amber-300 font-bold flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Tu solicitud está pendiente de verificación.
                </p>
              )}
              {planStatus === 'active' && (
                <p className="text-xs sm:text-sm text-emerald-300 font-bold">
                  ✅ Plan activo: $15.000 / publicación durante 30 días.
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <button onClick={onOpenPublishModal}
                className="px-5 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer">
                <PlusCircle className="w-4 h-4" />
                <span>+ Publicar Vehículo</span>
              </button>
              <button onClick={() => setActiveTab('planes')}
                className="px-5 py-3.5 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 font-extrabold text-xs border border-purple-500/40 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{planStatus ? 'Ver Planes' : 'Contratar Plan'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}>
                <Icon className={`w-4 h-4 ${tab.id === 'planes' ? 'text-amber-300' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB: PERFIL */}
        {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-blue-400" />
                  <span>Mi Información de Contacto</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Los compradores verán estos datos al consultar por tu publicación.</p>
              </div>

              {saveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="font-bold">¡Perfil actualizado correctamente!</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre Completo *</label>
                    <input type="text" required value={formData.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp de Contacto *</label>
                    <input type="tel" required placeholder="Ej. 5491134567890" value={formData.phoneWhatsApp}
                      onChange={e => handleChange('phoneWhatsApp', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo Electrónico (Email) *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input type="email" required placeholder="tuemail@ejemplo.com" value={formData.email}
                      onChange={e => handleChange('email', e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-none" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">Ubicación *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['single', 'multiple'].map(type => (
                      <button key={type} type="button" onClick={() => setLocationType(type)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          locationType === type
                            ? 'bg-blue-900/60 border border-blue-500 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}>
                        {type === 'single' ? 'Lugar Específico' : 'Varias Ubicaciones / Online'}
                      </button>
                    ))}
                  </div>
                  {locationType === 'single' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-blue-300 mb-1">Provincia *</label>
                        <select value={formData.province}
                          onChange={e => {
                            const p = e.target.value;
                            setFormData(prev => ({ ...prev, province: p, city: (ARGENTINA_LOCATION_DATA[p] || [])[0] || '', customCity: '' }));
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-none cursor-pointer">
                          {PROVINCES_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-blue-300 mb-1">Ciudad / Localidad *</label>
                        <select value={formData.city} onChange={e => handleChange('city', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-none cursor-pointer">
                          {(ARGENTINA_LOCATION_DATA[formData.province] || ['Otra ciudad / localidad']).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      {(formData.city.startsWith('Otra') || formData.city.startsWith('Otro')) && (
                        <div className="col-span-2 p-3 rounded-xl bg-blue-950/30 border border-blue-500/40">
                          <label className="block text-[11px] font-bold text-blue-300 mb-1">Especificá tu ciudad o localidad *</label>
                          <input type="text" required placeholder="Ej. Villa General Belgrano..."
                            value={formData.customCity} onChange={e => handleChange('customCity', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-blue-500/50 rounded-xl text-xs text-white focus:border-blue-400 focus:outline-none" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-extrabold text-blue-300">Aclaración de lugares *</label>
                      <textarea rows={2} required
                        placeholder="Ej. Vendo en CABA, GBA y alrededores / Puedo coordinar envío a interior"
                        value={formData.locationDetails} onChange={e => handleChange('locationDetails', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-blue-500/50 rounded-xl text-xs text-white focus:border-blue-400 focus:outline-none" />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Presentación Breve (opcional)</label>
                  <textarea rows={3} placeholder="Hola! Soy vendedor particular, el auto es el único dueño..."
                    value={formData.bio} onChange={e => handleChange('bio', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL de Foto de Perfil (opcional)</label>
                  <input type="url" placeholder="https://ejemplo.com/foto.jpg"
                    value={formData.avatarUrl} onChange={e => handleChange('avatarUrl', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-blue-500 focus:outline-none" />
                </div>

                <button type="submit" disabled={saving}
                  className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Guardando...</span></> : <><CheckCircle2 className="w-4 h-4" /><span>Guardar Perfil</span></>}
                </button>
              </form>
            </div>

            <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-black text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Vista del Comprador
                </span>
              </div>
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl p-5 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 border-2 border-slate-800 text-white flex items-center justify-center font-black text-lg overflow-hidden">
                    {formData.avatarUrl ? <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" /> : (formData.fullName?.charAt(0) || 'P')}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{formData.fullName || 'Tu Nombre'}</h4>
                    <span className="text-[10px] font-black border px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 border-blue-500/40">Particular</span>
                  </div>
                </div>
                {formData.bio && <p className="text-xs text-slate-300 leading-relaxed">{formData.bio}</p>}
                <div className="pt-2 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>{locationType === 'multiple' ? (formData.locationDetails || 'Varias ubicaciones') : `${formData.province}, ${formData.city.startsWith('Otra') ? formData.customCity || 'Otra ciudad' : formData.city}`}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300 font-mono">
                    <Mail className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span>Email: {formData.email || 'No ingresado'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                    <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>WhatsApp: {formData.phoneWhatsApp || 'No ingresado'}</span>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-xs text-blue-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
                <span>Las consultas sobre tus publicaciones llegan directamente a tu WhatsApp y Correo.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: PUBLICACIONES */}
        {activeTab === 'publicaciones' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Mis Publicaciones</h3>
                <p className="text-xs text-slate-400 mt-1">Cada publicación tiene una duración de <strong className="text-white">30 días</strong> por $15.000.</p>
              </div>
              <button onClick={onOpenPublishModal}
                className="px-4 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer">
                <PlusCircle className="w-4 h-4" /> Nueva Publicación
              </button>
            </div>
            {myVehicles.length === 0 ? (
              <div className="text-center py-16 space-y-4 bg-[#0F172A] border border-slate-800 rounded-3xl">
                <Car className="w-12 h-12 text-slate-700 mx-auto" />
                <div>
                  <p className="text-white font-black text-base">Todavía no tenés publicaciones activas</p>
                  <p className="text-xs text-slate-400 mt-1">Publicá tu vehículo y alcanzá miles de compradores en minutos.</p>
                </div>
                <button onClick={onOpenPublishModal}
                  className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm cursor-pointer transition-all">
                  + Publicar mi Vehículo — $15.000
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myVehicles.map(vehicle => (
                  <div key={vehicle.id} className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="relative aspect-video">
                      <img src={vehicle.image} alt={vehicle.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-black">Activa</div>
                    </div>
                    <div className="p-5 space-y-2">
                      <span className="text-xs font-mono font-black text-blue-400 block">{vehicle.formattedPrice}</span>
                      <h4 className="text-base font-black text-white line-clamp-1">{vehicle.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-blue-400" /><span>{vehicle.location}</span>
                      </div>
                    </div>
                    <div className="p-4 border-t border-slate-800/80 flex gap-2">
                      <button onClick={() => onOpenDetailModal(vehicle)}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                        <Eye className="w-3.5 h-3.5" /> Ver
                      </button>
                      <button className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 cursor-pointer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: FAVORITOS */}
        {activeTab === 'favoritos' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white">Mis Favoritos</h3>
            {myFavorites.length === 0 ? (
              <div className="text-center py-16 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-3">
                <Heart className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-white font-black text-base">Sin favoritos por ahora</p>
                <p className="text-xs text-slate-400">Guardá los vehículos que más te gusten para verlos después.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myFavorites.map(vehicle => (
                  <div key={vehicle.id} className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="relative aspect-video">
                      <img src={vehicle.image} alt={vehicle.title} className="w-full h-full object-cover" />
                      <button onClick={() => onToggleFavorite(vehicle.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-rose-500 shadow-md cursor-pointer">
                        <Heart className="w-4 h-4 fill-current" />
                      </button>
                    </div>
                    <div className="p-5 space-y-2">
                      <span className="text-xs font-mono font-black text-blue-400 block">{vehicle.formattedPrice}</span>
                      <h4 className="text-base font-black text-white line-clamp-1">{vehicle.title}</h4>
                    </div>
                    <div className="p-4 border-t border-slate-800/80">
                      <button onClick={() => onOpenDetailModal(vehicle)}
                        className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                        <Eye className="w-3.5 h-3.5" /> Ver Detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PLANES */}
        {activeTab === 'planes' && (
          <div className="space-y-8">
            {/* Estado actual del plan */}
            {!planStatus ? (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#0F172A] to-slate-900 border border-amber-700/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40">
                  <Sparkles className="w-7 h-7 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">No tenés ningún plan activo</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Para publicar tu vehículo o upgradear a Agencia, elegí un plan y declarate el pago abajo.</p>
                </div>
              </div>
            ) : planStatus === 'pending' ? (
              <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40">
                  <Clock className="w-7 h-7 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">Solicitud Pendiente de Verificación</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Declaraste el pago del plan. El equipo de Sitio Automotor lo verificará y activará tu plan en breve.</p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40">
                  <CheckCircle2 className="w-7 h-7 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">Plan Activo ✓</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Tu plan está verificado y activo. Podés publicar vehículos sin restricciones.</p>
                </div>
              </div>
            )}

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white">Planes Disponibles para Particulares</h2>
              <p className="text-sm text-slate-400">Si vendés más de un auto, considerá un plan de Agencia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Particular */}
              <PlanCard
                planKey="particular"
                title={<><Car className="w-3.5 h-3.5" /> Particular</>}
                priceLabel="$15.000"
                priceNote="/ publicación · 30 días"
                features={['1 vehículo por publicación', '30 días de visibilidad', 'Consultas directas al WhatsApp', 'Galería de fotos']}
                disabledFeatures={['Publicaciones ilimitadas', 'Perfil de Concesionaria']}
                accentColor={{
                  gradient: 'from-blue-950/40 to-slate-900',
                  border: 'border-blue-500/50', ring: 'ring-blue-500/30',
                  borderSoft: 'border-slate-800', borderHover: 'border-blue-500/40',
                  chip: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                  check: 'text-blue-400', note: 'text-slate-400',
                  badge: 'bg-blue-700', payBtn: 'bg-blue-700 hover:bg-blue-600 text-white',
                }}
                isHighlighted={false}
                isCurrent={currentPlanKey === 'particular'}
                isPending={planStatus === 'pending'}
                onPaymentClaim={handlePaymentClaim}
                submitting={submittingPayment}
              />

              {/* Agencia Base */}
              <PlanCard
                planKey="agencia_base"
                title={<><Building2 className="w-3.5 h-3.5" /> Agencia Base</>}
                priceLabel="$90.000"
                priceNote="/ mes · Hasta 30 autos"
                features={['Hasta 30 autos publicados', 'Perfil de Concesionaria', 'Insignia Verificada', 'Banner y Logo oficial', 'WhatsApp comercial']}
                disabledFeatures={['Publicidad en web y medios']}
                accentColor={{
                  gradient: 'from-purple-950/40 to-slate-900',
                  border: 'border-purple-500', ring: 'ring-purple-500/40',
                  borderSoft: 'border-purple-900/50', borderHover: 'border-purple-500/40',
                  chip: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                  check: 'text-purple-400', note: 'text-purple-300',
                  badge: 'bg-purple-700', payBtn: 'bg-purple-700 hover:bg-purple-600 text-white',
                }}
                isHighlighted={false}
                isCurrent={currentPlanKey === 'agencia_base'}
                isPending={planStatus === 'pending'}
                onPaymentClaim={handlePaymentClaim}
                submitting={submittingPayment}
              />

              {/* Agencia Pro */}
              <PlanCard
                planKey="agencia_pro"
                title={<><Zap className="w-3.5 h-3.5 text-amber-300" /> Agencia Pro</>}
                priceLabel="$190.000"
                priceNote="/ mes · Autos ilimitados + Publicidad"
                features={[
                  { text: 'Autos ilimitados', bold: true },
                  { text: 'Publicidad en web y medios', bold: true },
                  'Perfil Pro de Concesionaria',
                  'Insignia Verificada Premium',
                  'Posicionamiento prioritario',
                ]}
                accentColor={{
                  gradient: 'from-purple-950/60 to-slate-900',
                  border: 'border-purple-500', ring: 'ring-purple-500/50',
                  borderSoft: 'border-purple-900/50', borderHover: 'border-purple-500/40',
                  chip: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
                  check: 'text-amber-400', note: 'text-purple-300',
                  badge: 'bg-[#6D28D9]', payBtn: 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white',
                }}
                badge="⭐ Máximo Alcance"
                isHighlighted={true}
                isCurrent={currentPlanKey === 'agencia_pro'}
                isPending={planStatus === 'pending'}
                onPaymentClaim={handlePaymentClaim}
                submitting={submittingPayment}
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <p className="text-xs text-slate-400 text-center">
                💡 <strong className="text-white">¿Cómo funciona?</strong> Elegí un plan, realizá el pago por transferencia o efectivo al número de cuenta del equipo comercial, y luego hacé clic en <strong className="text-amber-300">"Ya pagué"</strong>. El equipo verificará el pago y activará tu cuenta en menos de 24 hs hábiles.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
