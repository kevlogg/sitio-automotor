import React, { useState, useEffect } from 'react';
import {
  Wrench, Phone, MapPin, Globe, Clock, CheckCircle2, AlertCircle, Loader2,
  ArrowLeft, LogOut, Eye, Edit3, ShieldCheck, Sparkles, Heart, X, Check,
  Star, TrendingUp, Zap, Share2, BarChart3, PlusCircle, Camera, List
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ARGENTINA_LOCATION_DATA, PROVINCES_LIST } from '../../data/locationData';

const RUBROS = [
  { value: 'repuestos', label: 'Repuestos' },
  { value: 'accesorios', label: 'Accesorios' },
  { value: 'gomerias', label: 'Gomerías y neumáticos' },
  { value: 'talleres', label: 'Talleres mecánicos' },
  { value: 'lubricentros', label: 'Lubricentros' },
  { value: 'electricidad', label: 'Electricidad del automóvil' },
  { value: 'chapa-pintura', label: 'Chapa y pintura' },
  { value: 'detailing', label: 'Detailing y lavaderos' },
  { value: 'seguros', label: 'Seguros' },
  { value: 'financiacion', label: 'Financiación' },
  { value: 'gruas', label: 'Grúas y auxilio' },
  { value: 'gestorias', label: 'Gestorías' },
  { value: 'otro', label: 'Otro (Especificar)' },
];

// Simple stat card
function StatCard({ label, value, color }) {
  return (
    <div className={`p-5 rounded-2xl bg-[#0F172A] border ${color} space-y-1`}>
      <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-white">{value}</p>
    </div>
  );
}

export default function DashboardNegocio({
  currentUser, onUpdateUser, onBackToHome, onSignOut, favorites, vehicles, onToggleFavorite, onOpenDetailModal
}) {
  const profile = currentUser?.profile || {};
  const [activeTab, setActiveTab] = useState('perfil');
  const [locationType, setLocationType] = useState(profile.location_details ? 'multiple' : 'single');

  const [formData, setFormData] = useState({
    fullName: profile.full_name || '',
    businessName: profile.business_name || '',
    phoneWhatsApp: profile.phone_whatsapp || '',
    province: profile.province || 'Buenos Aires',
    city: profile.city || ARGENTINA_LOCATION_DATA['Buenos Aires'][0],
    customCity: '',
    locationDetails: profile.location_details || '',
    address: profile.address || '',
    websiteUrl: profile.website_url || '',
    instagramUrl: profile.instagram_url || '',
    facebookUrl: profile.facebook_url || '',
    businessHours: profile.business_hours || 'Lunes a Viernes de 9:00 a 18:00 hs',
    bio: profile.bio || '',
    avatarUrl: profile.avatar_url || '',
    bannerUrl: profile.banner_url || '',
    rubro: profile.rubro && !profile.rubro.startsWith('Otro:') ? profile.rubro : (profile.rubro ? 'otro' : 'talleres'),
    customRubro: profile.rubro?.startsWith('Otro:') ? profile.rubro.replace('Otro:', '').trim() : '',
    services: profile.services || '',  // JSON string of service list or free text
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (currentUser?.profile) {
      const p = currentUser.profile;
      const rub = p.rubro && p.rubro.startsWith('Otro:') ? 'otro' : (p.rubro || 'talleres');
      setFormData(prev => ({
        ...prev,
        fullName: p.full_name || prev.fullName,
        businessName: p.business_name || prev.businessName,
        phoneWhatsApp: p.phone_whatsapp || prev.phoneWhatsApp,
        province: p.province || prev.province,
        city: p.city || prev.city,
        locationDetails: p.location_details || prev.locationDetails,
        address: p.address || prev.address,
        websiteUrl: p.website_url || prev.websiteUrl,
        instagramUrl: p.instagram_url || prev.instagramUrl,
        facebookUrl: p.facebook_url || prev.facebookUrl,
        businessHours: p.business_hours || prev.businessHours,
        bio: p.bio || prev.bio,
        avatarUrl: p.avatar_url || prev.avatarUrl,
        bannerUrl: p.banner_url || prev.bannerUrl,
        rubro: rub,
        customRubro: p.rubro?.startsWith('Otro:') ? p.rubro.replace('Otro:', '').trim() : prev.customRubro,
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

    if (formData.rubro === 'otro' && !formData.customRubro.trim()) {
      setErrorMsg('Por favor especificá el rubro de tu negocio.');
      setSaving(false);
      return;
    }

    const isCustomCity = formData.city.startsWith('Otra') || formData.city.startsWith('Otro');
    if (locationType === 'single' && isCustomCity && !formData.customCity.trim()) {
      setErrorMsg('Por favor especificá la ciudad o localidad.');
      setSaving(false);
      return;
    }

    const finalCity = locationType === 'multiple' ? 'Varias ubicaciones' : (isCustomCity ? formData.customCity.trim() : formData.city);
    const finalProvince = locationType === 'multiple' ? 'Varias provincias / Online' : formData.province;
    const finalRubro = formData.rubro === 'otro' ? `Otro: ${formData.customRubro.trim()}` : formData.rubro;

    try {
      const updatedProfile = {
        id: currentUser.user.id,
        email: currentUser.user.email,
        full_name: formData.fullName,
        user_type: 'negocio_automotor',
        business_name: formData.businessName,
        rubro: finalRubro,
        phone_whatsapp: formData.phoneWhatsApp,
        city: finalCity,
        province: finalProvince,
        location_details: locationType === 'multiple' ? formData.locationDetails : null,
        address: formData.address || null,
        website_url: formData.websiteUrl || null,
        instagram_url: formData.instagramUrl || null,
        facebook_url: formData.facebookUrl || null,
        business_hours: formData.businessHours || null,
        bio: formData.bio || null,
        avatar_url: formData.avatarUrl || null,
        banner_url: formData.bannerUrl || null,
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

  const myFavorites = vehicles.filter(v => favorites.includes(v.id));
  const rubroLabel = RUBROS.find(r => r.value === formData.rubro)?.label || formData.rubro;

  const tabs = [
    { id: 'perfil', label: 'Ficha del Negocio', icon: Wrench },
    { id: 'servicios', label: 'Servicios', icon: List },
    { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
    { id: 'favoritos', label: `Guardados (${myFavorites.length})`, icon: Heart },
    { id: 'planes', label: 'Mi Plan', icon: Sparkles },
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
              <span className="hidden sm:inline">Volver</span>
            </button>
            <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-4">
              <Wrench className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-black text-white">Panel de Negocio Automotor</span>
            </div>
          </div>

          <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToHome}>
            <img src="/logofrase.png" alt="Sitio Automotor" className="h-11 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-xl bg-amber-600 text-white flex items-center justify-center font-black text-xs overflow-hidden">
                {formData.avatarUrl ? <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" /> : (formData.businessName?.charAt(0) || formData.fullName?.charAt(0) || 'N')}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white max-w-[130px] truncate">{formData.businessName || formData.fullName || 'Negocio'}</span>
                <span className="text-[9px] font-extrabold border px-1.5 rounded-md bg-amber-500/20 text-amber-300 border-amber-500/40">Negocio Automotor</span>
              </div>
            </div>
            <button onClick={onSignOut} className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Hero Banner Negocio */}
        <div className="relative rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#0F172A] to-slate-900 border border-amber-900/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
          {formData.bannerUrl && (
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-10" />
            </div>
          )}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-700 border-2 border-amber-500/40 text-white flex items-center justify-center font-black text-2xl overflow-hidden shadow-xl">
                {formData.avatarUrl ? <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" /> : (formData.businessName?.charAt(0) || 'N')}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-black border flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border-amber-500/40">
                    <Wrench className="w-3.5 h-3.5" /> Negocio Automotor
                  </span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-[10px] text-slate-300 font-bold border border-slate-700">
                    {formData.rubro === 'otro' ? formData.customRubro || 'Otro' : rubroLabel}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formData.businessName || formData.fullName || 'Tu Negocio'} 🔧
                </h1>
                <p className="text-xs text-slate-300">{formData.businessHours || 'Configurá tus horarios de atención'}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-amber-950/50 border border-amber-500/30 rounded-2xl px-4 py-3">
              <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span className="text-xs font-bold text-amber-200">
                {locationType === 'multiple' ? (formData.locationDetails || 'Varias ubicaciones') : `${formData.city}, ${formData.province}`}
              </span>
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
                    ? 'bg-amber-700 text-white shadow-lg'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}>
                <Icon className={`w-4 h-4 ${tab.id === 'planes' ? 'text-amber-300' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB: FICHA DEL NEGOCIO */}
        {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-amber-400" />
                  <span>Datos del Negocio en Mundo Automotor</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Completá tu ficha para que clientes de tu zona te encuentren fácilmente en el directorio de negocios.</p>
              </div>

              {saveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="font-bold">¡Ficha del negocio actualizada!</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Nombre Responsable y Comercio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre del Responsable *</label>
                    <input type="text" required value={formData.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre del Comercio / Negocio *</label>
                    <input type="text" required placeholder="Ej. Repuestos El Rayo"
                      value={formData.businessName} onChange={e => handleChange('businessName', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                </div>

                {/* Rubro */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rubro Principal *</label>
                    <select value={formData.rubro} onChange={e => handleChange('rubro', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer">
                      {RUBROS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp de Contacto *</label>
                    <input type="tel" required placeholder="Ej. 5491134567890"
                      value={formData.phoneWhatsApp} onChange={e => handleChange('phoneWhatsApp', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-amber-500 focus:outline-none" />
                  </div>
                </div>

                {/* Aclaración Rubro Otro */}
                {formData.rubro === 'otro' && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1.5">
                    <label className="block text-xs font-extrabold text-amber-300">Aclaración Obligatoria del Rubro *</label>
                    <input type="text" required placeholder="Ej. Ploteo, Wrap, polarizados y calcomanías"
                      value={formData.customRubro} onChange={e => handleChange('customRubro', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-amber-500/50 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none" />
                  </div>
                )}

                {/* Horarios y Dirección */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Horarios de Atención</label>
                    <input type="text" placeholder="Ej. Lun a Sáb de 8:00 a 20:00 hs"
                      value={formData.businessHours} onChange={e => handleChange('businessHours', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dirección Física</label>
                    <input type="text" placeholder="Ej. Av. San Martín 2240"
                      value={formData.address} onChange={e => handleChange('address', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                </div>

                {/* Ubicación */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">Ubicación del Negocio *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['single', 'multiple'].map(type => (
                      <button key={type} type="button" onClick={() => setLocationType(type)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          locationType === type
                            ? 'bg-amber-900/60 border border-amber-500 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}>
                        {type === 'single' ? 'Local Fijo' : 'Varios Locales / Online'}
                      </button>
                    ))}
                  </div>
                  {locationType === 'single' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 mb-1">Provincia *</label>
                        <select value={formData.province}
                          onChange={e => {
                            const p = e.target.value;
                            setFormData(prev => ({ ...prev, province: p, city: (ARGENTINA_LOCATION_DATA[p] || [])[0] || '', customCity: '' }));
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer">
                          {PROVINCES_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-amber-300 mb-1">Ciudad / Localidad *</label>
                        <select value={formData.city} onChange={e => handleChange('city', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none cursor-pointer">
                          {(ARGENTINA_LOCATION_DATA[formData.province] || ['Otra ciudad / localidad']).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      {(formData.city.startsWith('Otra') || formData.city.startsWith('Otro')) && (
                        <div className="col-span-2 p-3 rounded-xl bg-amber-950/30 border border-amber-500/40">
                          <label className="block text-[11px] font-bold text-amber-300 mb-1">Especificá tu ciudad *</label>
                          <input type="text" required placeholder="Ej. Merlo, Marcos Paz..."
                            value={formData.customCity} onChange={e => handleChange('customCity', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-amber-500/50 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-extrabold text-amber-300">Descripción de tus locaciones *</label>
                      <textarea rows={2} required
                        placeholder="Ej. Local en Palermo y Quilmes / También trabajamos a domicilio"
                        value={formData.locationDetails} onChange={e => handleChange('locationDetails', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none" />
                    </div>
                  )}
                </div>

                {/* Redes Sociales */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sitio Web</label>
                    <input type="url" placeholder="https://tunegocio.com.ar"
                      value={formData.websiteUrl} onChange={e => handleChange('websiteUrl', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Instagram</label>
                    <input type="text" placeholder="@tunegocio"
                      value={formData.instagramUrl} onChange={e => handleChange('instagramUrl', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Facebook</label>
                    <input type="text" placeholder="facebook.com/tunegocio"
                      value={formData.facebookUrl} onChange={e => handleChange('facebookUrl', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                </div>

                {/* Descripción de Servicios */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Descripción de Servicios y Productos</label>
                  <textarea rows={4}
                    placeholder="Nos especializamos en reparación de inyección electrónica, alineación 3D y service de frenos para todo tipo de vehículos. Presupuesto sin cargo..."
                    value={formData.bio} onChange={e => handleChange('bio', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none" />
                </div>

                {/* Logo y Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL de Logo del Local</label>
                    <input type="url" placeholder="https://ejemplo.com/logo.jpg"
                      value={formData.avatarUrl} onChange={e => handleChange('avatarUrl', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL de Banner / Foto del Local</label>
                    <input type="url" placeholder="https://ejemplo.com/local.jpg"
                      value={formData.bannerUrl} onChange={e => handleChange('bannerUrl', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-amber-500 focus:outline-none" />
                  </div>
                </div>

                <button type="submit" disabled={saving}
                  className="w-full py-4 rounded-2xl bg-amber-700 hover:bg-amber-600 text-white font-extrabold text-xs shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Guardando...</span></> : <><CheckCircle2 className="w-4 h-4" /><span>Guardar Ficha del Negocio</span></>}
                </button>
              </form>
            </div>

            {/* Vista Previa Negocio */}
            <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Ficha en Mundo Automotor
                </span>
              </div>

              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
                <div className="h-24 bg-gradient-to-r from-amber-900 via-orange-900 to-slate-900 relative">
                  {formData.bannerUrl ? (
                    <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full opacity-40 bg-[radial-gradient(#B45309_1px,transparent_1px)] [background-size:14px_14px]" />
                  )}
                </div>
                <div className="p-5 relative pt-0">
                  <div className="flex items-end justify-between -mt-7 mb-3">
                    <div className="w-14 h-14 rounded-2xl bg-amber-700 border-4 border-[#0F172A] shadow-xl text-white flex items-center justify-center font-black text-lg overflow-hidden">
                      {formData.avatarUrl ? <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" /> : (formData.businessName?.charAt(0) || 'N')}
                    </div>
                    <span className="text-[10px] font-black border px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border-amber-500/40">
                      {formData.rubro === 'otro' ? formData.customRubro || 'Otro' : rubroLabel}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white">{formData.businessName || 'Nombre del Negocio'}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">{formData.bio || 'Sin descripción ingresada aún.'}</p>
                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                      {formData.address && <div className="flex items-center gap-2"><Wrench className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /><span>{formData.address}</span></div>}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                        <span>{locationType === 'multiple' ? (formData.locationDetails || 'Varias ubicaciones') : `${formData.province}, ${formData.city}`}</span>
                      </div>
                      {formData.businessHours && <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" /><span>{formData.businessHours}</span></div>}
                      <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{formData.phoneWhatsApp || 'No ingresado'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
                <span>Tu ficha aparece en el directorio de Negocios Automotores para que clientes de tu zona te encuentren.</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB: SERVICIOS */}
        {activeTab === 'servicios' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-white">Catálogo de Servicios</h3>
              <p className="text-xs text-slate-400 mt-1">Listá los servicios que ofrecés con precios opcionales para que los clientes sepan qué esperarte.</p>
            </div>
            <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <div className="text-center py-10 space-y-4">
                <List className="w-10 h-10 text-amber-600/50 mx-auto" />
                <p className="text-white font-black">Catálogo de Servicios</p>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  En breve podrás cargar servicios individuales con precios opcionales (ej. "Cambio de aceite y filtro — desde $12.000"). 
                  <strong className="text-amber-300"> Próximamente disponible.</strong>
                </p>
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-300 max-w-md mx-auto">
                  Por ahora podés detallar tus servicios en el campo <strong>"Descripción de Servicios"</strong> de la pestaña <strong>"Ficha del Negocio"</strong>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ESTADÍSTICAS */}
        {activeTab === 'estadisticas' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-black text-white">Estadísticas del Perfil</h3>
              <p className="text-xs text-slate-400 mt-1">Métricas de visibilidad y rendimiento de tu ficha en Mundo Automotor.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Visitas al perfil" value="—" color="border-amber-500/30" />
              <StatCard label="Consultas recibidas" value="—" color="border-emerald-500/30" />
              <StatCard label="Clics en WhatsApp" value="—" color="border-blue-500/30" />
              <StatCard label="Posición en buscador" value="—" color="border-purple-500/30" />
            </div>
            <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-8 text-center space-y-3">
              <BarChart3 className="w-10 h-10 text-slate-700 mx-auto" />
              <p className="text-white font-black">Estadísticas detalladas próximamente</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                El dashboard de métricas mostrará visitas al perfil, clics en WhatsApp y posicionamiento en búsquedas por zona/rubro.
              </p>
            </div>
          </div>
        )}

        {/* TAB: GUARDADOS / FAVORITOS */}
        {activeTab === 'favoritos' && (
          <div className="space-y-6">
            <h3 className="text-xl font-black text-white">Vehículos Guardados</h3>
            {myFavorites.length === 0 ? (
              <div className="text-center py-16 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-3">
                <Heart className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-white font-black text-base">Sin guardados por ahora</p>
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
                      <span className="text-xs font-mono font-black text-amber-400 block">{vehicle.formattedPrice}</span>
                      <h4 className="text-base font-black text-white line-clamp-1">{vehicle.title}</h4>
                    </div>
                    <div className="p-4 border-t border-slate-800/80">
                      <button onClick={() => onOpenDetailModal(vehicle)}
                        className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
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
            {/* Plan actual */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#0F172A] to-slate-900 border border-amber-900/40 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40">
                    <Wrench className="w-7 h-7 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tu Plan Actual</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">Activo</span>
                    </div>
                    <h4 className="text-lg font-black text-white">Plan Negocio Automotor — (Consultá tu nivel)</h4>
                    <p className="text-xs text-slate-400">Base: $49.000/mes · Pro: $99.000/mes (perfil optimizado + beneficios)</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white">Planes para Negocios Automotores</h2>
              <p className="text-sm text-slate-400">Gestioná tu visibilidad en el directorio de Mundo Automotor.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Plan Base */}
              <div className="rounded-3xl p-7 border bg-slate-900/80 border-amber-900/50 hover:border-amber-500/40 flex flex-col justify-between space-y-6 transition-all">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black flex items-center gap-1 border border-amber-500/30 w-fit">
                    <Wrench className="w-3.5 h-3.5" /> Negocio Base
                  </span>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">$49.000</span>
                      <span className="text-xs text-slate-400 font-bold">/ mes</span>
                    </div>
                    <p className="text-xs text-amber-300 mt-1 font-bold">Ficha activa en el directorio de Mundo Automotor</p>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {[
                      'Ficha en directorio de Negocios',
                      'Rubro categorizado y filtrable',
                      'Horarios y dirección del local',
                      'WhatsApp de contacto directo',
                      'Descripción de servicios',
                      'Logo del negocio',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2 opacity-40"><X className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" /><span>Perfil optimizado y beneficios destacados</span></li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    const msg = `Hola! Soy ${formData.businessName || formData.fullName || 'Usuario'} (Email: ${currentUser?.user?.email}) y quiero contratar/renovar el plan NEGOCIO BASE ($49.000/mes).`;
                    window.open(`https://wa.me/5491134567890?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="w-full py-4 rounded-2xl bg-amber-700 hover:bg-amber-600 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all">
                  <Wrench className="w-4 h-4" />
                  Contratar / Renovar Plan Base
                </button>
              </div>

              {/* Plan Pro */}
              <div className="rounded-3xl p-7 border relative bg-gradient-to-b from-amber-950/50 to-slate-900 border-amber-500 ring-2 ring-amber-500/40 flex flex-col justify-between space-y-6 shadow-2xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black tracking-wider shadow-md uppercase whitespace-nowrap">
                  ⭐ Pro — Perfil Optimizado
                </div>
                <div className="space-y-4 pt-2">
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black flex items-center gap-1 border border-amber-500/30 w-fit">
                    <Zap className="w-3.5 h-3.5" /> Negocio Pro
                  </span>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">$99.000</span>
                      <span className="text-xs text-slate-400 font-bold">/ mes</span>
                    </div>
                    <p className="text-xs text-amber-300 mt-1 font-bold">Perfil optimizado + beneficios destacados</p>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {[
                      { text: 'Perfil optimizado y destacado', bold: true },
                      { text: 'Beneficios y posicionamiento premium', bold: true },
                      'Todo lo del plan Base',
                      'Banner de portada del local',
                      'Catálogo de servicios detallado',
                      'Estadísticas de visitas al perfil',
                      'Posicionamiento prioritario por zona',
                    ].map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className={typeof item === 'object' && item.bold ? 'font-extrabold text-white' : ''}>{typeof item === 'object' ? item.text : item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  onClick={() => {
                    const msg = `Hola! Soy ${formData.businessName || formData.fullName || 'Usuario'} (Email: ${currentUser?.user?.email}) y quiero contratar/upgradear al plan NEGOCIO PRO ($99.000/mes, perfil optimizado).`;
                    window.open(`https://wa.me/5491134567890?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="w-full py-4 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl transition-all">
                  <Sparkles className="w-4 h-4" />
                  Contratar / Upgradear a Pro
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-900/30 text-center">
              <p className="text-xs text-slate-400">
                💡 <strong className="text-white">Los Negocios Automotores son un directorio completamente independiente al de compra-venta de autos.</strong> Si también querés vender vehículos, necesitás un plan de Agencia.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
