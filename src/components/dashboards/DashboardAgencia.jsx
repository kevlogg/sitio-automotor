import React, { useState, useEffect } from 'react';
import {
  Building2, Phone, MapPin, Globe, Clock, PlusCircle, CheckCircle2,
  AlertCircle, Loader2, ArrowLeft, LogOut, Eye, Edit3, Trash2,
  ShieldCheck, Sparkles, Heart, X, Check, Car, Star, TrendingUp, Zap, Image, Share2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ARGENTINA_LOCATION_DATA, PROVINCES_LIST } from '../../data/locationData';

export default function DashboardAgencia({
  currentUser, onUpdateUser, onBackToHome, onSignOut,
  onOpenPublishModal, vehicles, favorites, onToggleFavorite, onOpenDetailModal
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
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (currentUser?.profile) {
      const p = currentUser.profile;
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

    const finalCity = locationType === 'multiple' ? 'Varias ubicaciones' : (isCustomCity ? formData.customCity.trim() : formData.city);
    const finalProvince = locationType === 'multiple' ? 'Varias provincias / Online' : formData.province;

    try {
      const updatedProfile = {
        id: currentUser.user.id,
        email: currentUser.user.email,
        full_name: formData.fullName,
        user_type: 'agencia',
        business_name: formData.businessName,
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

  const myVehicles = vehicles.filter(v =>
    (v.sellerName && formData.businessName && v.sellerName.toLowerCase().includes(formData.businessName.toLowerCase())) ||
    (v.sellerName && formData.fullName && v.sellerName.toLowerCase().includes(formData.fullName.toLowerCase()))
  );

  const myFavorites = vehicles.filter(v => favorites.includes(v.id));

  const tabs = [
    { id: 'perfil', label: 'Perfil de Concesionaria', icon: Building2 },
    { id: 'inventario', label: `Inventario (${myVehicles.length})`, icon: Car },
    { id: 'favoritos', label: `Favoritos (${myFavorites.length})`, icon: Heart },
    { id: 'planes', label: 'Mi Plan & Membresía', icon: Sparkles },
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
              <Building2 className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-black text-white">Panel de Agencia / Concesionaria</span>
            </div>
          </div>

          <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToHome}>
            <img src="/logofrase.png" alt="Sitio Automotor" className="h-11 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-xl bg-[#6D28D9] text-white flex items-center justify-center font-black text-xs overflow-hidden">
                {formData.avatarUrl ? <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" /> : (formData.businessName?.charAt(0) || formData.fullName?.charAt(0) || 'A')}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white max-w-[130px] truncate">{formData.businessName || formData.fullName || 'Agencia'}</span>
                <span className="text-[9px] font-extrabold border px-1.5 rounded-md bg-purple-500/20 text-purple-300 border-purple-500/40">Agencia Verificada</span>
              </div>
            </div>
            <button onClick={onSignOut} className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">

        {/* Hero Banner Agencia */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-slate-900 border border-purple-900/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          {formData.bannerUrl && (
            <div className="absolute inset-0 rounded-3xl overflow-hidden">
              <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover opacity-10" />
            </div>
          )}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#6D28D9] border-2 border-purple-500/40 text-white flex items-center justify-center font-black text-2xl overflow-hidden shadow-xl">
                {formData.avatarUrl ? <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" /> : (formData.businessName?.charAt(0) || 'A')}
              </div>
              <div className="space-y-1">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black border flex items-center gap-1.5 w-fit bg-purple-500/20 text-purple-300 border-purple-500/40">
                  <ShieldCheck className="w-3.5 h-3.5" /> Concesionaria Verificada
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {formData.businessName || formData.fullName || 'Tu Agencia'} 🏢
                </h1>
                <p className="text-xs text-slate-300">
                  {formData.businessHours || 'Configurá tus horarios de atención'}
                </p>
              </div>
            </div>
            <button onClick={onOpenPublishModal}
              className="px-5 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <PlusCircle className="w-4 h-4" />
              <span>+ Publicar Vehículo</span>
            </button>
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
                    ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-900/30'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}>
                <Icon className={`w-4 h-4 ${tab.id === 'planes' ? 'text-amber-300' : ''}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB: PERFIL DE CONCESIONARIA */}
        {activeTab === 'perfil' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-400" />
                  <span>Datos de la Concesionaria</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">Esta información forma tu perfil público visible para compradores y generará tu ficha oficial de concesionaria.</p>
              </div>

              {saveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="font-bold">¡Perfil de concesionaria actualizado!</span>
                </div>
              )}
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                {/* Nombre del Responsable y Nombre de Agencia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre del Responsable *</label>
                    <input type="text" required value={formData.fullName}
                      onChange={e => handleChange('fullName', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre Comercial de la Agencia *</label>
                    <input type="text" required placeholder="Ej. Mendoza Automotores"
                      value={formData.businessName} onChange={e => handleChange('businessName', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none" />
                  </div>
                </div>

                {/* Contacto */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp Comercial *</label>
                    <input type="tel" required placeholder="Ej. 5491134567890"
                      value={formData.phoneWhatsApp} onChange={e => handleChange('phoneWhatsApp', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Horarios de Atención</label>
                    <input type="text" placeholder="Ej. Lun a Vie 9-19 hs, Sáb 9-13 hs"
                      value={formData.businessHours} onChange={e => handleChange('businessHours', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none" />
                  </div>
                </div>

                {/* Ubicación */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">Ubicación de la Agencia *</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['single', 'multiple'].map(type => (
                      <button key={type} type="button" onClick={() => setLocationType(type)}
                        className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          locationType === type
                            ? 'bg-purple-900/60 border border-purple-500 text-white shadow-md'
                            : 'bg-slate-950 text-slate-400 border border-slate-800'
                        }`}>
                        {type === 'single' ? 'Sucursal Principal' : 'Varias Sucursales / Online'}
                      </button>
                    ))}
                  </div>
                  {locationType === 'single' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-purple-300 mb-1">Provincia *</label>
                        <select value={formData.province}
                          onChange={e => {
                            const p = e.target.value;
                            setFormData(prev => ({ ...prev, province: p, city: (ARGENTINA_LOCATION_DATA[p] || [])[0] || '', customCity: '' }));
                          }}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none cursor-pointer">
                          {PROVINCES_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-purple-300 mb-1">Ciudad / Localidad *</label>
                        <select value={formData.city} onChange={e => handleChange('city', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none cursor-pointer">
                          {(ARGENTINA_LOCATION_DATA[formData.province] || ['Otra ciudad / localidad']).map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                      {(formData.city.startsWith('Otra') || formData.city.startsWith('Otro')) && (
                        <div className="col-span-2 p-3 rounded-xl bg-purple-950/30 border border-purple-500/40">
                          <label className="block text-[11px] font-bold text-purple-300 mb-1">Especificá tu ciudad *</label>
                          <input type="text" required placeholder="Ej. Hurlingham, Morón..."
                            value={formData.customCity} onChange={e => handleChange('customCity', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-purple-500/50 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1">
                      <label className="block text-xs font-extrabold text-purple-300">Aclaración de sucursales / cobertura *</label>
                      <textarea rows={2} required
                        placeholder="Ej. Sucursales en Rosario, Córdoba y CABA / Entregamos en todo el país"
                        value={formData.locationDetails} onChange={e => handleChange('locationDetails', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/50 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none" />
                    </div>
                  )}
                </div>

                {/* Dirección Física */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dirección Física de la Agencia</label>
                  <input type="text" placeholder="Ej. Av. Libertador 4520, Piso 2"
                    value={formData.address} onChange={e => handleChange('address', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none" />
                </div>

                {/* Redes sociales */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sitio Web Oficial</label>
                    <input type="url" placeholder="https://tuagencia.com.ar"
                      value={formData.websiteUrl} onChange={e => handleChange('websiteUrl', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Instagram</label>
                    <input type="text" placeholder="@tuagencia.oficial"
                      value={formData.instagramUrl} onChange={e => handleChange('instagramUrl', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Facebook</label>
                    <input type="text" placeholder="facebook.com/tuagencia"
                      value={formData.facebookUrl} onChange={e => handleChange('facebookUrl', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none" />
                  </div>
                </div>

                {/* Bio / Descripción Institucional */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Descripción Institucional de la Agencia</label>
                  <textarea rows={4}
                    placeholder="Somos una concesionaria con 15 años de trayectoria, especializada en usados seleccionados con garantía, financiación propia y un equipo de asesores certificados..."
                    value={formData.bio} onChange={e => handleChange('bio', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none" />
                </div>

                {/* Logo y Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL de Logo / Avatar</label>
                    <input type="url" placeholder="https://ejemplo.com/logo.jpg"
                      value={formData.avatarUrl} onChange={e => handleChange('avatarUrl', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL de Portada / Banner</label>
                    <input type="url" placeholder="https://ejemplo.com/banner.jpg"
                      value={formData.bannerUrl} onChange={e => handleChange('bannerUrl', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none" />
                  </div>
                </div>

                <button type="submit" disabled={saving}
                  className="w-full py-4 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-xl shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4">
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Guardando...</span></> : <><CheckCircle2 className="w-4 h-4" /><span>Guardar Perfil de la Agencia</span></>}
                </button>
              </form>
            </div>

            {/* Vista Previa Agencia */}
            <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Ficha Pública de la Agencia
                </span>
              </div>
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
                <div className="h-28 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 relative">
                  {formData.bannerUrl ? (
                    <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full opacity-30 bg-[radial-gradient(#6D28D9_1px,transparent_1px)] [background-size:16px_16px]" />
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 text-[10px] text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-400" /> Verificado
                  </div>
                </div>
                <div className="p-5 relative pt-0">
                  <div className="flex items-end justify-between -mt-8 mb-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#6D28D9] border-4 border-[#0F172A] shadow-xl text-white flex items-center justify-center font-black text-xl overflow-hidden">
                      {formData.avatarUrl ? <img src={formData.avatarUrl} alt="" className="w-full h-full object-cover" /> : (formData.businessName?.charAt(0) || 'A')}
                    </div>
                    <span className="text-[10px] font-black border px-2.5 py-0.5 rounded-lg bg-purple-500/20 text-purple-300 border-purple-500/40">Concesionaria</span>
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white">{formData.businessName || 'Nombre de la Agencia'}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{formData.bio || 'Sin descripción ingresada aún.'}</p>
                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                      {formData.address && <div className="flex items-center gap-2"><Building2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" /><span>{formData.address}</span></div>}
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <span>{locationType === 'multiple' ? (formData.locationDetails || 'Varias sucursales') : `${formData.province}, ${formData.city}`}</span>
                      </div>
                      {formData.businessHours && <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" /><span>{formData.businessHours}</span></div>}
                      <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{formData.phoneWhatsApp || 'No ingresado'}</span>
                      </div>
                    </div>
                    {(formData.websiteUrl || formData.instagramUrl) && (
                      <div className="pt-3 flex items-center gap-2">
                        {formData.websiteUrl && <a href={formData.websiteUrl} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300"><Globe className="w-4 h-4" /></a>}
                        {formData.instagramUrl && <span className="p-2 rounded-xl bg-slate-800 text-purple-300 text-xs font-bold flex items-center gap-1"><Share2 className="w-4 h-4" /><span>{formData.instagramUrl}</span></span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: INVENTARIO */}
        {activeTab === 'inventario' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-white">Inventario de Vehículos</h3>
                <p className="text-xs text-slate-400 mt-1">Gestioná todos los autos publicados de tu concesionaria.</p>
              </div>
              <button onClick={onOpenPublishModal}
                className="px-4 py-3 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-lg">
                <PlusCircle className="w-4 h-4" /> Agregar Vehículo
              </button>
            </div>

            {myVehicles.length === 0 ? (
              <div className="text-center py-16 space-y-4 bg-[#0F172A] border border-slate-800 rounded-3xl">
                <Car className="w-12 h-12 text-slate-700 mx-auto" />
                <div>
                  <p className="text-white font-black text-base">El inventario está vacío</p>
                  <p className="text-xs text-slate-400 mt-1">Agregá los vehículos de tu concesionaria para que aparezcan en el catálogo.</p>
                </div>
                <button onClick={onOpenPublishModal}
                  className="px-6 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-sm cursor-pointer">
                  + Agregar Primer Vehículo
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {myVehicles.map(vehicle => (
                  <div key={vehicle.id} className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
                    <div className="relative aspect-video">
                      <img src={vehicle.image} alt={vehicle.title} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-emerald-500/90 text-white text-[10px] font-black">Publicado</div>
                    </div>
                    <div className="p-5 space-y-2">
                      <span className="text-xs font-mono font-black text-purple-400 block">{vehicle.formattedPrice}</span>
                      <h4 className="text-base font-black text-white line-clamp-1">{vehicle.title}</h4>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-purple-400" /><span>{vehicle.location}</span>
                      </div>
                    </div>
                    <div className="p-4 border-t border-slate-800/80 flex gap-2">
                      <button onClick={() => onOpenDetailModal(vehicle)}
                        className="flex-1 py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
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
            <h3 className="text-xl font-black text-white">Favoritos</h3>
            {myFavorites.length === 0 ? (
              <div className="text-center py-16 bg-[#0F172A] border border-slate-800 rounded-3xl space-y-3">
                <Heart className="w-12 h-12 text-slate-700 mx-auto" />
                <p className="text-white font-black text-base">Sin favoritos guardados</p>
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
                      <span className="text-xs font-mono font-black text-purple-400 block">{vehicle.formattedPrice}</span>
                      <h4 className="text-base font-black text-white line-clamp-1">{vehicle.title}</h4>
                    </div>
                    <div className="p-4 border-t border-slate-800/80">
                      <button onClick={() => onOpenDetailModal(vehicle)}
                        className="w-full py-2.5 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
                        <Eye className="w-3.5 h-3.5" /> Ver Detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: PLANES Y MEMBRESÍA */}
        {activeTab === 'planes' && (
          <div className="space-y-8">
            {/* Plan actual */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-slate-900 border border-purple-900/40 shadow-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-2xl bg-purple-500/20 border border-purple-500/40">
                    <Building2 className="w-7 h-7 text-purple-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Tu Plan Actual</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">Activo</span>
                    </div>
                    <h4 className="text-lg font-black text-white">Plan Agencia — (Consultá tu nivel actual)</h4>
                    <p className="text-xs text-slate-400">Base: $90.000/mes hasta 30 autos · Pro: $190.000/mes autos ilimitados + publicidad</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparación Base vs Pro */}
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-black text-white">Planes de Agencia / Concesionaria</h2>
              <p className="text-sm text-slate-400">Elegí el nivel que mejor se adapte al volumen de tu agencia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Agencia Base */}
              <div className="rounded-3xl p-7 border bg-slate-900/80 border-purple-900/50 hover:border-purple-500/40 flex flex-col justify-between space-y-6 transition-all">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-black flex items-center gap-1 border border-purple-500/30 w-fit">
                    <Building2 className="w-3.5 h-3.5" /> Agencia Base
                  </span>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">$90.000</span>
                      <span className="text-xs text-slate-400 font-bold">/ mes</span>
                    </div>
                    <p className="text-xs text-purple-300 mt-1 font-bold">Hasta 30 vehículos publicados simultáneamente</p>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {[
                      'Hasta 30 autos activos al mismo tiempo',
                      'Perfil público de Concesionaria',
                      'Insignia de Agencia Verificada',
                      'Logo + Banner de portada oficial',
                      'WhatsApp comercial de contacto',
                      'Descripción institucional',
                    ].map(item => (
                      <li key={item} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                    <li className="flex items-start gap-2 opacity-40"><X className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" /><span>Publicidad en web y medios</span></li>
                  </ul>
                </div>
                <button
                  onClick={() => {
                    const msg = `Hola! Soy ${formData.businessName || formData.fullName || 'Usuario'} (Email: ${currentUser?.user?.email}) y quiero contratar/renovar el plan AGENCIA BASE ($90.000/mes, hasta 30 autos).`;
                    window.open(`https://wa.me/5491134567890?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="w-full py-4 rounded-2xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all">
                  <Building2 className="w-4 h-4" />
                  Contratar / Renovar Plan Base
                </button>
              </div>

              {/* Agencia Pro */}
              <div className="rounded-3xl p-7 border relative bg-gradient-to-b from-purple-950/60 to-slate-900 border-purple-500 ring-2 ring-purple-500/50 flex flex-col justify-between space-y-6 shadow-2xl">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-[#6D28D9] text-white text-[10px] font-black tracking-wider shadow-md uppercase whitespace-nowrap">
                  ⭐ Pro — Máximo Alcance
                </div>
                <div className="space-y-4 pt-2">
                  <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black flex items-center gap-1 border border-amber-500/30 w-fit">
                    <Zap className="w-3.5 h-3.5" /> Agencia Pro
                  </span>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-white">$190.000</span>
                      <span className="text-xs text-slate-400 font-bold">/ mes</span>
                    </div>
                    <p className="text-xs text-amber-300 mt-1 font-bold">Autos ilimitados + Publicidad web y medios</p>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-300">
                    {[
                      { text: 'Autos ilimitados publicados', bold: true },
                      { text: 'Publicidad en página web y medios', bold: true },
                      'Posicionamiento prioritario en listados',
                      'Perfil Pro destacado con banner full',
                      'Insignia Verificada Premium',
                      'Soporte comercial dedicado',
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
                    const msg = `Hola! Soy ${formData.businessName || formData.fullName || 'Usuario'} (Email: ${currentUser?.user?.email}) y quiero contratar/upgradear al plan AGENCIA PRO ($190.000/mes, autos ilimitados + publicidad).`;
                    window.open(`https://wa.me/5491134567890?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className="w-full py-4 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-xl shadow-purple-900/50 transition-all">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Contratar / Upgradear a Pro
                </button>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                💡 <strong className="text-white">El cambio de nivel o la renovación se coordina por WhatsApp con el equipo comercial.</strong> Si necesitás factura A o B para tu empresa, también podemos gestionarlo.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
