import React, { useState, useEffect } from 'react';
import {
  Building2, Phone, MapPin, Globe, Clock, PlusCircle, CheckCircle2,
  AlertCircle, Loader2, ArrowLeft, LogOut, Eye, Edit3, Trash2,
  ShieldCheck, Sparkles, Heart, X, Check, Car, TrendingUp, Zap, Share2, CreditCard, Mail
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ARGENTINA_LOCATION_DATA, PROVINCES_LIST } from '../../data/locationData';
import { submitPaymentClaim } from '../../lib/planUtils';

export default function DashboardAgencia({
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
  const [paymentClaimResult, setPaymentClaimResult] = useState({});

  const [formData, setFormData] = useState({
    fullName: profile.full_name || '',
    email: profile.email || currentUser?.user?.email || '',
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
    if (currentUser?.profile || currentUser?.user) {
      const p = currentUser?.profile || {};
      const u = currentUser?.user || {};
      setFormData(prev => ({
        ...prev,
        fullName: p.full_name || prev.fullName,
        email: p.email || u.email || prev.email,
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
        email: formData.email || currentUser.user.email,
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

  const handlePaymentClaim = async (planKey) => {
    setSubmittingPayment(true);
    try {
      await submitPaymentClaim({
        userId: currentUser.user.id,
        userEmail: currentUser.user.email,
        userName: formData.businessName || formData.fullName || 'Sin nombre',
        userType: 'agencia',
        planKey,
      });
      onUpdateUser({
        ...currentUser,
        profile: { ...profile, plan_status: 'pending', current_plan: planKey },
      });
      setPaymentClaimResult(prev => ({ ...prev, [planKey]: 'success' }));
    } catch (e) {
      setPaymentClaimResult(prev => ({ ...prev, [planKey]: 'error' }));
    } finally {
      setSubmittingPayment(false);
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

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Correo Electrónico (Email) *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input type="email" required placeholder="agencia@ejemplo.com"
                      value={formData.email} onChange={e => handleChange('email', e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none" />
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
                      <div className="flex items-center gap-2 text-slate-300 font-mono">
                        <Mail className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <span>{formData.email || 'No ingresado'}</span>
                      </div>
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
            {/* Estado actual del plan */}
            {!planStatus ? (
              <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-950/60 via-[#0F172A] to-slate-900 border border-amber-700/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40">
                  <Sparkles className="w-7 h-7 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">No tenés ningún plan activo</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Elegí un plan de Agencia y declará tu pago para que el equipo lo active en menos de 24 hs hábiles.</p>
                </div>
              </div>
            ) : planStatus === 'pending' ? (
              <div className="p-6 rounded-3xl bg-amber-950/40 border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40">
                  <Clock className="w-7 h-7 text-amber-300" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">Solicitud Pendiente de Verificación</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Declaraste el pago. El equipo de Sitio Automotor lo verificará y activará tu plan en breve.</p>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-emerald-950/40 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40">
                  <CheckCircle2 className="w-7 h-7 text-emerald-300" />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">Plan de Agencia Activo ✓</h4>
                  <p className="text-xs text-slate-400 mt-0.5">Tu plan está verificado y activo. Publicá todos los vehículos de tu inventario.</p>
                </div>
              </div>
            )}

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-black text-white">Planes de Agencia / Concesionaria</h2>
              <p className="text-sm text-slate-400">Elegí el nivel que mejor se adapte al volumen de tu agencia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {/* Agencia Base */}
              {['agencia_base', 'agencia_pro'].map(planKey => {
                const isBase = planKey === 'agencia_base';
                const isCurrent = currentPlanKey === planKey;
                const isPendingThis = planStatus === 'pending' && isCurrent;
                const claimed = paymentClaimResult[planKey] === 'success';
                return (
                  <div key={planKey} className={`rounded-3xl p-7 border relative flex flex-col justify-between space-y-6 transition-all ${
                    isBase
                      ? 'bg-slate-900/80 border-purple-900/50 hover:border-purple-500/40'
                      : 'bg-gradient-to-b from-purple-950/60 to-slate-900 border-purple-500 ring-2 ring-purple-500/50 shadow-2xl'
                  }`}>
                    {!isBase && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-[#6D28D9] text-white text-[10px] font-black tracking-wider shadow-md uppercase whitespace-nowrap">
                        ⭐ Pro — Máximo Alcance
                      </div>
                    )}
                    <div className="space-y-4 pt-1">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1 border ${isBase ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'}`}>
                          {isBase ? <><Building2 className="w-3.5 h-3.5" /> Agencia Base</> : <><Zap className="w-3.5 h-3.5" /> Agencia Pro</>}
                        </span>
                        {isCurrent && planStatus === 'pending' && <span className="text-[10px] font-black text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1"><Clock className="w-3 h-3" /> Pendiente</span>}
                        {isCurrent && planStatus === 'active' && <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">✓ Activo</span>}
                      </div>
                      <div>
                        <div className="flex items-baseline gap-1">
                          <span className="text-4xl font-black text-white">{isBase ? '$90.000' : '$190.000'}</span>
                          <span className="text-xs text-slate-400 font-bold">/ mes</span>
                        </div>
                        <p className={`text-xs mt-1 font-bold ${isBase ? 'text-purple-300' : 'text-amber-300'}`}>
                          {isBase ? 'Hasta 30 vehículos publicados simultáneamente' : 'Autos ilimitados + Publicidad web y medios'}
                        </p>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {(isBase
                          ? ['Hasta 30 autos activos al mismo tiempo', 'Perfil de Concesionaria', 'Insignia Verificada', 'Logo + Banner oficial', 'WhatsApp comercial']
                          : [
                            { text: 'Autos ilimitados', bold: true },
                            { text: 'Publicidad en web y medios', bold: true },
                            'Posicionamiento prioritario',
                            'Insignia Verificada Premium',
                            'Soporte comercial dedicado',
                          ]
                        ).map((item, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isBase ? 'text-purple-400' : 'text-amber-400'}`} />
                            <span className={typeof item === 'object' && item.bold ? 'font-extrabold text-white' : ''}>{typeof item === 'object' ? item.text : item}</span>
                          </li>
                        ))}
                        {isBase && <li className="flex items-start gap-2 opacity-40"><X className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" /><span>Publicidad en web y medios</span></li>}
                      </ul>
                    </div>
                    {/* CTA */}
                    {claimed ? (
                      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ¡Solicitud enviada! El equipo verificará tu pago y activará el plan.
                      </div>
                    ) : isPendingThis ? (
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 font-bold flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                        Solicitud enviada. Esperando verificación del equipo.
                      </div>
                    ) : (
                      <button
                        onClick={() => handlePaymentClaim(planKey)}
                        disabled={submittingPayment}
                        className={`w-full py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all disabled:opacity-50 ${
                          isBase ? 'bg-purple-700 hover:bg-purple-600 text-white' : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-purple-900/50'
                        }`}>
                        {submittingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                        Ya pagué en efectivo / transferencia
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800">
              <p className="text-xs text-slate-400 text-center">
                💡 <strong className="text-white">¿Cómo funciona?</strong> Realizá el pago por transferencia o efectivo al equipo comercial, luego hacé clic en <strong className="text-amber-300">"Ya pagué"</strong>. El equipo verificará y activará tu cuenta en menos de 24 hs hábiles. Si necesitás factura A/B para tu empresa, también podemos gestionarlo.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
