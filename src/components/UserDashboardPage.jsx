import React, { useState, useEffect } from 'react';
import { 
  User, Building2, Wrench, Car, Phone, MapPin, Globe, 
  Clock, PlusCircle, CheckCircle2, AlertCircle, Loader2, ArrowLeft, LogOut, 
  Eye, Edit3, Trash2, ShieldCheck, Sparkles, Store, Image, Heart, BarChart3, Layers, Share2, X, Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ARGENTINA_LOCATION_DATA, PROVINCES_LIST } from '../data/locationData';

export default function UserDashboardPage({ currentUser, onUpdateUser, onBackToHome, onSignOut, onOpenPublishModal, vehicles, favorites, onToggleFavorite, onOpenDetailModal, onWhatsAppContact }) {
  const profile = currentUser?.profile || {};
  const [userType, setUserType] = useState(profile.user_type || 'particular');

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'vehicles' | 'business' | 'favorites'
  const [locationType, setLocationType] = useState(profile.location_details ? 'multiple' : 'single');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Form State for Profile Settings
  const [formData, setFormData] = useState({
    fullName: profile.full_name || '',
    phoneWhatsApp: profile.phone_whatsapp || '',
    province: profile.province || 'Buenos Aires',
    city: profile.city || ARGENTINA_LOCATION_DATA['Buenos Aires'][0],
    customCity: '',
    locationDetails: profile.location_details || '',
    businessName: profile.business_name || '',
    rubro: profile.rubro || 'talleres',
    customRubro: profile.rubro && profile.rubro.startsWith('Otro:') ? profile.rubro.replace('Otro:', '').trim() : '',
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

  // Sync state if currentUser changes
  useEffect(() => {
    if (currentUser?.profile) {
      const p = currentUser.profile;
      setFormData((prev) => ({
        ...prev,
        fullName: p.full_name || prev.fullName,
        phoneWhatsApp: p.phone_whatsapp || prev.phoneWhatsApp,
        province: p.province || prev.province,
        city: p.city || prev.city,
        locationDetails: p.location_details || prev.locationDetails,
        businessName: p.business_name || prev.businessName,
        rubro: p.rubro || prev.rubro,
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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    // Validation for custom city
    const isCustomCity = formData.city.startsWith('Otra') || formData.city.startsWith('Otro');
    if (locationType === 'single' && isCustomCity && !formData.customCity.trim()) {
      setErrorMsg('Por favor especifica la ciudad o localidad.');
      setSaving(false);
      return;
    }

    const finalCity = locationType === 'multiple' 
      ? 'Varias ubicaciones' 
      : (isCustomCity ? formData.customCity.trim() : formData.city);
    const finalProvince = locationType === 'multiple' ? 'Varias provincias / Online' : formData.province;
    const finalLocationDetails = locationType === 'multiple' ? formData.locationDetails : null;

    const finalRubro = userType === 'negocio_automotor'
      ? (formData.rubro === 'otro' ? `Otro: ${formData.customRubro.trim()}` : formData.rubro)
      : profile.rubro;

    try {
      const updatedProfile = {
        id: currentUser.user.id,
        email: currentUser.user.email,
        full_name: formData.fullName,
        user_type: userType,
        phone_whatsapp: formData.phoneWhatsApp,
        city: finalCity,
        province: finalProvince,
        location_details: finalLocationDetails,
        business_name: userType !== 'particular' ? formData.businessName : null,
        rubro: finalRubro || null,
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

      if (error) {
        console.warn('Upsert de perfil con aviso:', error.message);
      }

      // Update parent application state
      onUpdateUser({
        ...currentUser,
        profile: updatedProfile,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar los cambios del perfil.');
    } finally {
      setSaving(false);
    }
  };

  // Filter user's own vehicles (or mock fallback matching user name/id)
  const myVehicles = vehicles.filter((v) => {
    if (v.sellerName && profile.business_name && v.sellerName.toLowerCase().includes(profile.business_name.toLowerCase())) {
      return true;
    }
    if (v.sellerName && profile.full_name && v.sellerName.toLowerCase().includes(profile.full_name.toLowerCase())) {
      return true;
    }
    return false;
  });

  const getBadgeColor = () => {
    if (userType === 'agencia') return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
    if (userType === 'negocio_automotor') return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
  };

  const getBadgeIcon = () => {
    if (userType === 'agencia') return Building2;
    if (userType === 'negocio_automotor') return Wrench;
    return Car;
  };

  const TypeIcon = getBadgeIcon();

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col selection:bg-[#6D28D9] selection:text-white">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0F172A]/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToHome}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a la Tienda</span>
            </button>
            <div className="hidden md:flex items-center gap-2 border-l border-slate-800 pl-4">
              <span className="text-sm font-black text-white">Panel de Administración</span>
            </div>
          </div>

          <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToHome}>
            <img src="/logofrase.png" alt="Sitio Automotor" className="h-11 w-auto object-contain" />
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-1.5">
              <div className="w-7 h-7 rounded-xl bg-[#6D28D9] text-white flex items-center justify-center font-black text-xs">
                {profile.full_name?.charAt(0) || 'U'}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white max-w-[130px] truncate">
                  {profile.business_name || profile.full_name || 'Usuario'}
                </span>
                <span className={`text-[9px] font-extrabold border px-1.5 py-0.2 rounded-md ${getBadgeColor()}`}>
                  {userType === 'agencia' ? 'Agencia Verificada' : userType === 'negocio_automotor' ? 'Negocio / Comercio' : 'Particular'}
                </span>
              </div>
            </div>

            <button
              onClick={onSignOut}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner de Saludo y Resumen Ejecutivo */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-slate-900 border border-purple-900/40 p-6 sm:p-8 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black border flex items-center gap-1.5 ${getBadgeColor()}`}>
                  <TypeIcon className="w-3.5 h-3.5" />
                  <span>{userType === 'agencia' ? 'Panel de Concesionaria' : userType === 'negocio_automotor' ? 'Panel de Comercio Automotor' : 'Panel de Vendedor Particular'}</span>
                </span>
                <span className="text-xs text-purple-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verificado
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Hola, {profile.business_name || profile.full_name || 'Usuario'} 👋
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {userType === 'agencia' && 'Administrá los datos públicos de tu concesionaria, tu inventario de autos y recibí consultas directamente a tu WhatsApp comercial.'}
                {userType === 'negocio_automotor' && 'Gestioná tu ficha pública en Mundo Automotor, configurá tus horarios y servicios para atraer clientes de tu zona.'}
                {userType === 'particular' && 'Gestioná tus publicaciones individuales de vehículos y mantené actualizada tu información de contacto.'}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={onOpenPublishModal}
                className="w-full md:w-auto px-5 py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Publicar Vehículo</span>
              </button>
            </div>
          </div>
        </div>

        {/* NAVEGACIÓN POR PESTAÑAS DEL PANEL */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Perfil Público & Datos Comercial</span>
          </button>

          {(userType === 'particular' || userType === 'agencia') && (
            <button
              onClick={() => setActiveTab('vehicles')}
              className={`px-5 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'vehicles'
                  ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-900/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Car className="w-4 h-4" />
              <span>Mis Vehículos ({myVehicles.length})</span>
            </button>
          )}

          {userType === 'negocio_automotor' && (
            <button
              onClick={() => setActiveTab('business')}
              className={`px-5 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'business'
                  ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-900/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Mi Ficha en Mundo Automotor</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('favorites')}
            className={`px-5 py-3 rounded-2xl font-extrabold text-xs transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
              activeTab === 'favorites'
                ? 'bg-[#6D28D9] text-white shadow-lg shadow-purple-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>Mis Favoritos ({favorites.length})</span>
          </button>
        </div>

        {/* CONTENIDO DE LA PESTAÑA 1: CONFIGURACIÓN DE PERFIL PÚBLICO */}
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Columna Izquierda: Formulario de Datos */}
            <div className="lg:col-span-7 bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-purple-400" />
                  <span>Completar Información para el Perfil Público</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Esta información es la que verán los compradores al consultar por tus anuncios o directorio.
                </p>
              </div>

              {saveSuccess && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-fadeIn">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="font-bold">¡Tu perfil fue actualizado correctamente en la plataforma!</span>
                </div>
              )}

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-5">
                
                {/* 0. Plan y Membresía Actual (Control de Cobros) */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-purple-950/40 border border-purple-500/30 space-y-3 shadow-lg">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl border ${getBadgeColor()}`}>
                        <TypeIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Plan y Membresía Actual</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black">Activo</span>
                        </div>
                        <h4 className="text-base font-black text-white mt-0.5">
                          {userType === 'agencia' ? 'Plan Agencia Pro' : userType === 'negocio_automotor' ? 'Plan Comercio Automotor' : 'Plan Particular Standard'}
                        </h4>
                        <p className="text-xs text-slate-400">
                          {userType === 'agencia' && '$45.000 / mes • Publicaciones Ilimitadas + Insignia Verificada'}
                          {userType === 'negocio_automotor' && '$25.000 / mes • Ficha destacada en Mundo Automotor'}
                          {userType === 'particular' && '$15.000 / publicación • 30 días de visibilidad'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowUpgradeModal(true)}
                      className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-md shadow-purple-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span>Cambiar / Upgradear Plan</span>
                    </button>
                  </div>
                </div>

                {/* 1. Datos Personales / Nombre Fantasía */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Nombre Completo del Responsable *</label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">WhatsApp Comercial de Contacto *</label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 5491134567890"
                      value={formData.phoneWhatsApp}
                      onChange={(e) => handleChange('phoneWhatsApp', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Si es Agencia o Negocio: Nombre de Fantasía y Rubro */}
                {userType !== 'particular' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        {userType === 'agencia' ? 'Nombre Comercial de la Concesionaria *' : 'Nombre del Comercio / Negocio *'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={userType === 'agencia' ? 'Ej. Mendoza Automotores' : 'Ej. Repuestos El Rayo'}
                        value={formData.businessName}
                        onChange={(e) => handleChange('businessName', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>

                    {userType === 'negocio_automotor' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rubro Principal *</label>
                        <select
                          value={formData.rubro}
                          onChange={(e) => handleChange('rubro', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none cursor-pointer"
                        >
                          <option value="repuestos">Repuestos</option>
                          <option value="accesorios">Accesorios</option>
                          <option value="gomerias">Gomerías y neumáticos</option>
                          <option value="talleres">Talleres mecánicos</option>
                          <option value="lubricentros">Lubricentros</option>
                          <option value="electricidad">Electricidad</option>
                          <option value="chapa-pintura">Chapa y pintura</option>
                          <option value="detailing">Detailing y lavaderos</option>
                          <option value="seguros">Seguros</option>
                          <option value="financiacion">Financiación</option>
                          <option value="gruas">Grúas y auxilio</option>
                          <option value="gestorias">Gestorías</option>
                          <option value="otro">Otro (Especificar)</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Si es negocio y eligió "otro" */}
                {userType === 'negocio_automotor' && formData.rubro === 'otro' && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1.5 animate-fadeIn">
                    <label className="block text-xs font-extrabold text-amber-300">
                      Aclaración Obligatoria del Rubro *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Ploteo, Wrap, polarizados y calcomanías"
                      value={formData.customRubro}
                      onChange={(e) => handleChange('customRubro', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-amber-500/50 rounded-xl text-xs text-white focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                )}

                {/* 2. Ubicación con desplegables dinámicos */}
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <label className="block text-xs font-bold text-slate-300">Ubicación y Cobertura Geográfica *</label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLocationType('single')}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        locationType === 'single'
                          ? 'bg-purple-900/60 border border-purple-500 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Lugar Específico
                    </button>
                    <button
                      type="button"
                      onClick={() => setLocationType('multiple')}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        locationType === 'multiple'
                          ? 'bg-purple-900/60 border border-purple-500 text-white shadow-md'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      Varias Ubicaciones / Online
                    </button>
                  </div>

                  {locationType === 'single' ? (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-purple-300 mb-1">1. Provincia *</label>
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
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none cursor-pointer"
                          >
                            {PROVINCES_LIST.map((prov) => (
                              <option key={prov} value={prov}>{prov}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-purple-300 mb-1">2. Ciudad / Localidad *</label>
                          <select
                            value={formData.city}
                            onChange={(e) => handleChange('city', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none cursor-pointer"
                          >
                            {(ARGENTINA_LOCATION_DATA[formData.province] || ['Otra ciudad / localidad']).map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {(formData.city.startsWith('Otra') || formData.city.startsWith('Otro')) && (
                        <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-1 animate-fadeIn">
                          <label className="block text-[11px] font-bold text-purple-300">
                            Especificá el nombre de tu ciudad o localidad *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Villa General Belgrano, El Chaltén..."
                            value={formData.customCity}
                            onChange={(e) => handleChange('customCity', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-950 border border-purple-500/50 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2 pt-1 animate-fadeIn">
                      <label className="block text-xs font-extrabold text-purple-300">
                        Aclaración de lugares donde te ubicas o vendes *
                      </label>
                      <textarea
                        rows={2}
                        required
                        placeholder="Ej. Sucursales en Rosario, Córdoba y CABA / Atendemos todo el país online"
                        value={formData.locationDetails}
                        onChange={(e) => handleChange('locationDetails', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-purple-500/50 rounded-xl text-xs text-white focus:border-purple-400 focus:outline-none"
                      ></textarea>
                    </div>
                  )}
                </div>

                {/* 3. Dirección Física, Horarios y Redes (para Agencias y Negocios) */}
                {userType !== 'particular' && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dirección Física de Atención</label>
                        <input
                          type="text"
                          placeholder="Ej. Av. Pellegrini 1420"
                          value={formData.address}
                          onChange={(e) => handleChange('address', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1.5">Horarios de Atención</label>
                        <input
                          type="text"
                          placeholder="Ej. Lun a Vie de 9 a 19 hs, Sáb 9 a 13 hs"
                          value={formData.businessHours}
                          onChange={(e) => handleChange('businessHours', e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Sitio Web Oficial</label>
                        <input
                          type="url"
                          placeholder="https://tuagencia.com.ar"
                          value={formData.websiteUrl}
                          onChange={(e) => handleChange('websiteUrl', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Usuario de Instagram</label>
                        <input
                          type="text"
                          placeholder="@tuagencia.oficial"
                          value={formData.instagramUrl}
                          onChange={(e) => handleChange('instagramUrl', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Página de Facebook</label>
                        <input
                          type="text"
                          placeholder="facebook.com/tuagencia"
                          value={formData.facebookUrl}
                          onChange={(e) => handleChange('facebookUrl', e.target.value)}
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. Bio / Descripción Breve */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    {userType === 'agencia' ? 'Descripción Institucional de la Agencia' : userType === 'negocio_automotor' ? 'Descripción de Servicios y Productos' : 'Presentación / Bio'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={userType === 'agencia' ? 'Somos una concesionaria con 15 años de trayectoria en la venta de 0km y usados seleccionados con garantía...' : 'Nos especializamos en servicios mecánicos de precisión, reparación de inyección electrónica y alineación 3D...'}
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                  ></textarea>
                </div>

                {/* 5. Imágenes (Logo / Avatar & Portada Banner) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL de Logo / Foto de Perfil</label>
                    <input
                      type="url"
                      placeholder="https://ejemplo.com/logo.jpg"
                      value={formData.avatarUrl}
                      onChange={(e) => handleChange('avatarUrl', e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {userType !== 'particular' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">URL de Imagen de Portada Banner</label>
                      <input
                        type="url"
                        placeholder="https://ejemplo.com/banner.jpg"
                        value={formData.bannerUrl}
                        onChange={(e) => handleChange('bannerUrl', e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Profile Save Button */}
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-xl shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-purple-200" />
                      <span>Guardando cambios en el servidor...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Guardar Perfil y Mostrar en Público</span>
                    </>
                  )}
                </button>

              </form>
            </div>

            {/* Columna Derecha: Vista Previa en Vivo del Perfil Público */}
            <div className="lg:col-span-5 bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-black text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Vista Previa en Vivo
                </span>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-full">
                  Vista de Clientes
                </span>
              </div>

              {/* Ficha Pública Interactiva */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
                {/* Banner de Portada (para agencia/negocio) */}
                <div className="h-24 bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 relative">
                  {formData.bannerUrl ? (
                    <img src={formData.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full opacity-30 bg-[radial-gradient(#6D28D9_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  )}
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-slate-950/80 text-[10px] text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-purple-400" /> Verificado
                  </div>
                </div>

                {/* Avatar y Contenido Ficha */}
                <div className="p-5 relative pt-0">
                  <div className="flex items-end justify-between -mt-8 mb-3">
                    <div className="w-16 h-16 rounded-2xl bg-[#6D28D9] border-4 border-[#0F172A] shadow-xl text-white flex items-center justify-center font-black text-xl overflow-hidden">
                      {formData.avatarUrl ? (
                        <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span>{(formData.businessName || formData.fullName || 'U').charAt(0)}</span>
                      )}
                    </div>

                    <span className={`text-[10px] font-black border px-2.5 py-0.5 rounded-lg ${getBadgeColor()}`}>
                      {userType === 'agencia' ? 'Agencia' : userType === 'negocio_automotor' ? 'Comercio' : 'Particular'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white leading-tight">
                      {formData.businessName || formData.fullName || 'Nombre de Fantasía'}
                    </h4>

                    {userType === 'negocio_automotor' && (
                      <span className="text-[11px] font-extrabold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded-md inline-block">
                        Rubro: {formData.rubro === 'otro' ? formData.customRubro || 'Otro' : formData.rubro}
                      </span>
                    )}

                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {formData.bio || 'Sin descripción ingresada aún.'}
                    </p>

                    <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <span>
                          {locationType === 'multiple' 
                            ? (formData.locationDetails || 'Varias ubicaciones / Online') 
                            : `${formData.province}, ${formData.city.startsWith('Otra') ? formData.customCity || 'Otra ciudad' : formData.city}`}
                        </span>
                      </div>

                      {formData.address && userType !== 'particular' && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          <span>{formData.address}</span>
                        </div>
                      )}

                      {formData.businessHours && userType !== 'particular' && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                          <span>{formData.businessHours}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-1 font-mono text-emerald-400 font-bold">
                        <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>WhatsApp: {formData.phoneWhatsApp || 'No ingresado'}</span>
                      </div>
                    </div>

                    {/* Social networks if added */}
                    {(formData.websiteUrl || formData.instagramUrl || formData.facebookUrl) && (
                      <div className="pt-3 flex items-center gap-2">
                        {formData.websiteUrl && (
                          <a href={formData.websiteUrl} target="_blank" rel="noreferrer" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-purple-300">
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                        {formData.instagramUrl && (
                          <span className="p-2 rounded-xl bg-slate-800 text-purple-300 text-xs font-bold flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            <span>{formData.instagramUrl}</span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* CONTENIDO DE LA PESTAÑA 2: MIS VEHÍCULOS */}
        {activeTab === 'vehicles' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#0F172A] border border-slate-800 p-6 rounded-3xl">
              <div>
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Car className="w-5 h-5 text-purple-400" />
                  <span>Mis Vehículos Publicados ({myVehicles.length})</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Gestioná tus avisos activos, pausados o marcados como vendidos.
                </p>
              </div>

              <button
                onClick={onOpenPublishModal}
                className="px-4 py-2.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Nueva Publicación</span>
              </button>
            </div>

            {myVehicles.length === 0 ? (
              <div className="p-12 text-center bg-[#0F172A] border border-slate-800 rounded-3xl space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 mx-auto flex items-center justify-center">
                  <Car className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-bold text-white">No tenés vehículos cargados aún</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Publicá tu vehículo en Sitio Automotor para que aparezca en el feed principal y recibas consultas en tu WhatsApp.
                </p>
                <button
                  onClick={onOpenPublishModal}
                  className="px-5 py-3 rounded-2xl bg-[#6D28D9] text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-lg"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Publicar Mi Primer Auto</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-video">
                        <img src={vehicle.image} alt={vehicle.title} className="w-full h-full object-cover" />
                        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-[10px] shadow-md">
                          Activo (30 días)
                        </span>
                      </div>

                      <div className="p-5 space-y-2">
                        <span className="text-xs font-mono font-black text-purple-400 block">{vehicle.formattedPrice}</span>
                        <h4 className="text-base font-black text-white line-clamp-1">{vehicle.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                          <span>{vehicle.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenDetailModal(vehicle)}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Aviso
                      </button>

                      <button
                        onClick={() => onWhatsAppContact(vehicle)}
                        className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" /> WhatsApp
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CONTENIDO DE LA PESTAÑA 3: MI FICHA EN MUNDO AUTOMOTOR (Para Negocios) */}
        {activeTab === 'business' && userType === 'negocio_automotor' && (
          <div className="bg-[#0F172A] border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                  <Store className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Ficha en Mundo Automotor</h3>
                  <p className="text-xs text-slate-400">
                    Tu negocio está registrado y visible en el directorio destacado.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-extrabold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Visible en Directorio
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-bold block">Rubro Principal</span>
                <span className="text-base font-black text-amber-400 capitalize">
                  {formData.rubro === 'otro' ? formData.customRubro || 'Otro' : formData.rubro}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-bold block">Ubicación / Operación</span>
                <span className="text-sm font-bold text-white truncate block">
                  {locationType === 'multiple' ? (formData.locationDetails || 'Varias ubicaciones') : `${formData.province}, ${formData.city}`}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400 font-bold block">Calificación Destacada</span>
                <span className="text-base font-black text-emerald-400 flex items-center gap-1">
                  ⭐ 5.0 / 5.0 (Comercio Verificado)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CONTENIDO DE LA PESTAÑA 4: MIS FAVORITOS */}
        {activeTab === 'favorites' && (
          <div className="space-y-6">
            <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span>Mis Vehículos Favoritos ({favorites.length})</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Vehículos guardados para comparar o consultar más tarde.
              </p>
            </div>

            {favorites.length === 0 ? (
              <div className="p-12 text-center bg-[#0F172A] border border-slate-800 rounded-3xl space-y-3">
                <p className="text-sm text-slate-400">No tenés vehículos guardados en tus favoritos.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vehicles.filter(v => favorites.includes(v.id)).map(vehicle => (
                  <div key={vehicle.id} className="bg-[#0F172A] border border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between">
                    <div>
                      <div className="relative aspect-video">
                        <img src={vehicle.image} alt={vehicle.title} className="w-full h-full object-cover" />
                        <button
                          onClick={() => onToggleFavorite(vehicle.id)}
                          className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-rose-500 shadow-md"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <div className="p-5 space-y-2">
                        <span className="text-xs font-mono font-black text-purple-400 block">{vehicle.formattedPrice}</span>
                        <h4 className="text-base font-black text-white line-clamp-1">{vehicle.title}</h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-purple-400" />
                          <span>{vehicle.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between gap-2">
                      <button
                        onClick={() => onOpenDetailModal(vehicle)}
                        className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Ver Detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL DE CAMBIO Y UPGRADE DE PLANES */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-4xl bg-[#0F172A] border border-purple-900/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Control de Suscripciones & Membresías
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Elegí el Plan Ideal para tu Operación
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Los cambios de cuenta comercial o particular están regulados para garantizar las ventajas y cobros correspondientes a cada rubro.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* PLAN 1: PARTICULAR */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between space-y-6 transition-all ${
                userType === 'particular'
                  ? 'bg-slate-900 border-blue-500/50 ring-2 ring-blue-500/30 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-blue-500/20 text-blue-300 text-xs font-black flex items-center gap-1 border border-blue-500/30">
                      <Car className="w-3.5 h-3.5" /> Particular
                    </span>
                    {userType === 'particular' && (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Plan Actual
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">$15.000</span>
                      <span className="text-xs text-slate-400 font-bold">/ publicación</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Para vendedores particulares de 1 auto o moto.</p>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>30 días de publicación visible</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Consultas directas a tu WhatsApp</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <span>Galería de fotos y ficha técnica</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled={userType === 'particular'}
                  onClick={() => {
                    const msg = `Hola! Soy ${formData.fullName || 'Usuario'} (Email: ${currentUser?.user?.email}) y solicito pasar mi plan a Particular.`;
                    window.open(`https://wa.me/5491134567890?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className={`w-full py-3 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
                    userType === 'particular'
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : 'bg-slate-800 hover:bg-slate-700 text-white cursor-pointer'
                  }`}
                >
                  {userType === 'particular' ? 'Tu Plan Actual' : 'Solicitar Plan Particular'}
                </button>
              </div>

              {/* PLAN 2: AGENCIA PRO (RECOMENDADO) */}
              <div className={`rounded-3xl p-6 border relative flex flex-col justify-between space-y-6 transition-all ${
                userType === 'agencia'
                  ? 'bg-gradient-to-b from-purple-950/60 to-slate-900 border-purple-500 ring-2 ring-purple-500/50 shadow-2xl'
                  : 'bg-slate-900/80 border-purple-900/50 hover:border-purple-500/40'
              }`}>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#6D28D9] text-white text-[10px] font-black tracking-wider shadow-md uppercase">
                  ⭐ Más Popular Concesionarias
                </div>

                <div className="space-y-4 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-black flex items-center gap-1 border border-purple-500/30">
                      <Building2 className="w-3.5 h-3.5" /> Agencia Pro
                    </span>
                    {userType === 'agencia' && (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Plan Actual
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">$45.000</span>
                      <span className="text-xs text-slate-400 font-bold">/ mes</span>
                    </div>
                    <p className="text-xs text-purple-300 mt-1">Suscripción mensual para concesionarias y agencias.</p>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="font-extrabold text-white">Publicaciones Ilimitadas</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Insignia de Agencia Verificada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Perfil público con Banner y Logo</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>Link institucional de inventario</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const msg = `Hola! Soy ${formData.businessName || formData.fullName || 'Usuario'} (Email: ${currentUser?.user?.email}) y quiero contratar/upgradear al plan AGENCIA PRO ($45.000/mes).`;
                    window.open(`https://wa.me/5491134567890?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                    userType === 'agencia'
                      ? 'bg-purple-900/60 text-purple-200 border border-purple-500/50'
                      : 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white shadow-purple-900/50'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{userType === 'agencia' ? 'Mantener / Renovar Plan Agencia' : 'Solicitar Upgrade Agencia Pro'}</span>
                </button>
              </div>

              {/* PLAN 3: NEGOCIO AUTOMOTOR */}
              <div className={`rounded-3xl p-6 border flex flex-col justify-between space-y-6 transition-all ${
                userType === 'negocio_automotor'
                  ? 'bg-slate-900 border-amber-500/50 ring-2 ring-amber-500/30 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 text-xs font-black flex items-center gap-1 border border-amber-500/30">
                      <Wrench className="w-3.5 h-3.5" /> Negocio Automotor
                    </span>
                    {userType === 'negocio_automotor' && (
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Plan Actual
                      </span>
                    )}
                  </div>

                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">$25.000</span>
                      <span className="text-xs text-slate-400 font-bold">/ mes</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Para talleres, repuestos, detailing y servicios.</p>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="font-extrabold text-white">Ficha en Mundo Automotor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>Rubro específico o aclaración personalizada</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>Ubicaciones múltiples o venta online</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span>Buscador y mapa por ciudad/provincia</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    const msg = `Hola! Soy ${formData.businessName || formData.fullName || 'Usuario'} (Email: ${currentUser?.user?.email}) y quiero contratar/upgradear al plan NEGOCIO AUTOMOTOR ($25.000/mes).`;
                    window.open(`https://wa.me/5491134567890?text=${encodeURIComponent(msg)}`, '_blank');
                  }}
                  className={`w-full py-3.5 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    userType === 'negocio_automotor'
                      ? 'bg-amber-900/60 text-amber-200 border border-amber-500/50'
                      : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg'
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>{userType === 'negocio_automotor' ? 'Mantener / Renovar Plan Negocio' : 'Solicitar Upgrade Negocio'}</span>
                </button>
              </div>

            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <p className="text-xs text-slate-400">
                💡 <strong className="text-white">¿Tenés dudas o querés una factura A/B para tu empresa?</strong> Escribinos por WhatsApp o llamanos al área comercial para habilitar tu plan al instante.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
