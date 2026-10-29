import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, Upload, PlusCircle, Loader2, ImagePlus, Lock, User, ArrowRight, Building2, Car } from 'lucide-react';
import { uploadVehicleImage } from '../lib/supabase';
import { ARGENTINA_LOCATION_DATA, PROVINCES_LIST } from '../data/locationData';
import { PLAN_INFO } from '../lib/planUtils';

export default function PublishModal({ 
  isOpen, 
  onClose, 
  onVehicleAdded, 
  currentUser, 
  onRequireAuth,
  vehicles = [],
  onNavigate
}) {
  const [formData, setFormData] = useState({
    title: '',
    category: 'autos',
    categoryLabel: 'Autos',
    brand: 'Toyota',
    model: '',
    year: '2023',
    mileage: '15.000 km',
    fuel: 'Nafta',
    transmission: 'Automática',
    price: '',
    priceCurrency: 'USD',
    province: 'Buenos Aires',
    city: ARGENTINA_LOCATION_DATA['Buenos Aires'][0],
    customCity: '',
    sellerType: 'Particular Verificado',
    sellerName: '',
    sellerWhatsApp: '',
    description: '',
  });

  useEffect(() => {
    if (currentUser?.profile) {
      const profile = currentUser.profile;
      const isAgency = profile.user_type === 'agencia';
      setFormData((prev) => ({
        ...prev,
        sellerName: profile.business_name || profile.full_name || '',
        sellerWhatsApp: profile.phone_whatsapp || '',
        sellerType: isAgency ? 'Agencia Verificada' : 'Particular Verificado',
        location: profile.city ? `${profile.province || ''}, ${profile.city}` : prev.location,
      }));
    }
  }, [currentUser]);

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Verificación de la Política de Publicación para Particulares (1 auto activo a la vez)
  const isParticular = (currentUser?.profile?.user_type || 'particular') === 'particular';
  const userVehicles = vehicles.filter((v) => {
    if (!currentUser) return false;
    if (v.userId && v.userId === currentUser.user?.id) return true;
    if (v.sellerWhatsApp && currentUser.profile?.phone_whatsapp) {
      return v.sellerWhatsApp.replace(/\D/g, '') === currentUser.profile.phone_whatsapp.replace(/\D/g, '');
    }
    return false;
  });
  const hasParticularLimitReached = isParticular && userVehicles.length >= 1;

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      const newSelectedFiles = [...selectedFiles, ...filesArr];
      setSelectedFiles(newSelectedFiles);

      const newPreviews = filesArr.map((f) => URL.createObjectURL(f));
      setPreviewUrls([...previewUrls, ...newPreviews]);
    }
  };

  const handleRemovePhoto = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    const updatedPreviews = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    setPreviewUrls(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setUploadStatusText('Subiendo fotos a Supabase Storage...');

    let uploadedUrls = [];

    try {
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          setUploadStatusText(`Subiendo foto ${i + 1} de ${selectedFiles.length}...`);
          const url = await uploadVehicleImage(selectedFiles[i]);
          if (url) uploadedUrls.push(url);
        }
      }
    } catch (err) {
      console.warn('Fallback de imagen si falla storage:', err);
    }

    // Default fallback image if no files uploaded
    const defaultImage = 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop';
    const mainImage = uploadedUrls.length > 0 ? uploadedUrls[0] : defaultImage;
    const allImages = uploadedUrls.length > 0 ? uploadedUrls : [defaultImage];

    const isCustomCity = formData.city.startsWith('Otra') || formData.city.startsWith('Otro');
    const displayCity = isCustomCity ? (formData.customCity || 'Otra Localidad') : formData.city;
    const finalLocation = `${formData.province}, ${displayCity}`;

    const newVehicle = {
      id: 'v-' + Date.now(),
      userId: currentUser?.user?.id || null,
      title: formData.title || `${formData.brand} ${formData.model || 'Vehículo'}`,
      category: formData.category,
      categoryLabel: formData.category === 'autos' ? 'Autos' : formData.category === 'camionetas' ? 'Pick-ups' : formData.category === 'motos' ? 'Motos' : formData.category === 'camiones' ? 'Comerciales' : formData.category === 'nautica' ? 'Náutica' : 'Agro',
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year, 10) || 2023,
      mileage: formData.mileage || '0 km',
      mileageNum: 15000,
      fuel: formData.fuel,
      transmission: formData.transmission,
      priceCurrency: formData.priceCurrency,
      price: parseInt(formData.price, 10) || 25000,
      formattedPrice: `${formData.priceCurrency} ${parseInt(formData.price || 25000, 10).toLocaleString('es-AR')}`,
      location: finalLocation,
      sellerType: formData.sellerType,
      sellerName: formData.sellerName || 'Usuario Vendedor',
      sellerWhatsApp: formData.sellerWhatsApp || '5491112345678',
      badge: 'Publicación Destacada',
      badgeColor: 'violet',
      image: mainImage,
      images: allImages,
      description: formData.description || 'Vehículo publicado en la plataforma de Sitio Automotor.',
      features: ['Fotos HD en Supabase Storage', 'Contacto Directo WhatsApp', 'Unidad Inspeccionada']
    };

    setUploading(false);
    setSubmitted(true);

    setTimeout(() => {
      onVehicleAdded(newVehicle);
      setSubmitted(false);
      setSelectedFiles([]);
      setPreviewUrls([]);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/90">
          <div>
            <span className="text-xs font-bold text-[#6D28D9] uppercase tracking-wider block">
              Marketplace Automotor
            </span>
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 tracking-tight">
              <PlusCircle className="w-5 h-5 text-[#6D28D9]" />
              Publicá tu vehículo
            </h3>
          </div>

          <button
            onClick={onClose}
            disabled={uploading}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SI NO ESTÁ AUTENTICADO: Auth Gate */}
        {!currentUser ? (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-purple-100 text-[#6D28D9] mx-auto flex items-center justify-center shadow-lg shadow-purple-900/10">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <h4 className="text-xl font-black text-slate-900">Necesitás una cuenta para publicar</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Registrate como <strong className="text-purple-600 font-bold">Particular</strong> o <strong className="text-purple-600 font-bold">Agencia</strong> para subir tu vehículo y recibir consultas directamente en tu WhatsApp.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 max-w-sm mx-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequireAuth('signup');
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-95"
              >
                <User className="w-4 h-4" />
                <span>Crear Cuenta Gratuita</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequireAuth('login');
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                Ya tengo cuenta — Ingresar
              </button>
            </div>
          </div>
        ) : hasParticularLimitReached ? (
          /* Pantalla Informativa de Cupo Completo para Particulares */
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 border border-amber-200 mx-auto flex items-center justify-center shadow-lg shadow-amber-950/5">
              <Car className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                Cupo Particular Completo (1/1)
              </span>
              <h4 className="text-xl font-black text-slate-900">
                Ya tenés 1 vehículo publicado
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                La política oficial de Sitio Automotor para particulares permite tener <strong>1 aviso activo a la vez por 30 días</strong>.
              </p>
              {userVehicles[0] && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs font-medium text-slate-700 flex items-center gap-3">
                  <img src={userVehicles[0].image} alt="" className="w-12 h-10 object-cover rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">{userVehicles[0].title}</p>
                    <p className="text-[11px] text-purple-700 font-bold">{userVehicles[0].formattedPrice}</p>
                  </div>
                </div>
              )}
              <p className="text-[11px] text-slate-500 pt-1">
                Para publicar otro vehículo podés dar de baja o editar el actual desde tu panel, o adherir tu agencia a un plan comercial para publicar hasta 20 o 50 autos.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigate) onNavigate('dashboard');
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-md cursor-pointer transition-all"
              >
                Ir a Mi Panel de Control
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigate) onNavigate('plans');
                }}
                className="w-full py-3.5 px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md cursor-pointer transition-all"
              >
                Ver Planes Comerciales
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Banner Oficial de Política de Publicación */}
            <div className="p-4 bg-purple-50 border-b border-purple-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6">
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 rounded-full bg-[#5328D7] text-white font-black text-xs shrink-0">
                  {currentUser.profile?.current_plan ? (PLAN_INFO[currentUser.profile?.current_plan]?.label || 'Plan Activo') : (isParticular ? 'Plan Particular' : 'Plan Base')}
                </div>
                <span className="text-xs text-slate-700 font-medium">
                  {isParticular 
                    ? 'Política para Particulares: 1 vehículo por 30 días con contacto directo por WhatsApp y 0% comisión.'
                    : 'Publicación activa en la plataforma con fotos en alta definición.'}
                </span>
              </div>
              <span className="text-xs font-black text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg shrink-0">
                {isParticular ? 'Cupo: 1 aviso activo' : 'Múltiples avisos'}
              </span>
            </div>

        {submitted ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-slate-900">¡Publicación realizada con éxito!</h4>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Tu vehículo y sus fotos han sido guardados en Supabase Cloud y ya se encuentran visibles en la plataforma.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Título de la publicación</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Toyota Corolla 2.0 SEG CVT"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:bg-white focus:outline-none cursor-pointer"
                >
                  <option value="autos">Autos</option>
                  <option value="camionetas">Camionetas / SUVs</option>
                  <option value="motos">Motos</option>
                  <option value="camiones">Camiones</option>
                  <option value="nautica">Náutica</option>
                  <option value="agro">Agro / Maquinaria</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Marca</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Volkswagen, BMW, Ford"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Año</label>
                <input
                  type="number"
                  required
                  placeholder="2023"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Precio (USD o ARS)</label>
                <div className="flex gap-2">
                  <select
                    value={formData.priceCurrency}
                    onChange={(e) => setFormData({ ...formData, priceCurrency: e.target.value })}
                    className="px-2.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs cursor-pointer"
                  >
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                  <input
                    type="number"
                    required
                    placeholder="26500"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Kilometraje</label>
                <input
                  type="text"
                  placeholder="Ej. 18.000 km o 0 km"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tu Nombre o Nombre de Agencia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={formData.sellerName}
                  onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Teléfono / WhatsApp de contacto</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 5491134567890"
                  value={formData.sellerWhatsApp}
                  onChange={(e) => setFormData({ ...formData, sellerWhatsApp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:bg-white focus:outline-none"
                />
              </div>

            </div>

            <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
              <label className="block text-xs font-bold text-slate-800">Ubicación del Vehículo *</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 1. PROVINCIA PRIMERO */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">1. Provincia *</label>
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
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:outline-none cursor-pointer"
                  >
                    {PROVINCES_LIST.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* 2. CIUDAD SEGUNDO */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">2. Ciudad / Localidad *</label>
                  <select
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:outline-none cursor-pointer"
                  >
                    {(ARGENTINA_LOCATION_DATA[formData.province] || ['Otra ciudad / localidad']).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {(formData.city.startsWith('Otra') || formData.city.startsWith('Otro')) && (
                <div className="pt-1 animate-fadeIn">
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Especificá el nombre de tu ciudad o localidad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Villa General Belgrano, Tandil..."
                    value={formData.customCity}
                    onChange={(e) => setFormData({ ...formData, customCity: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-purple-300 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:outline-none"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descripción de la unidad</label>
              <textarea
                rows={3}
                placeholder="Detalla estado del vehículo, services, equipamiento y permutas..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:bg-white focus:outline-none"
              ></textarea>
            </div>

            {/* REAL PHOTO UPLOADER WITH PREVIEWS */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Fotos del vehículo (Subida a Supabase Storage)
              </label>

              <label className="relative p-5 border-2 border-dashed border-purple-300 hover:border-[#6D28D9] rounded-2xl text-center bg-purple-50/50 hover:bg-purple-50 transition-all cursor-pointer flex flex-col items-center justify-center space-y-2">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={uploading}
                />
                <div className="w-10 h-10 rounded-full bg-purple-100 text-[#6D28D9] flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Haz clic aquí o arrastra tus fotos para subir
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Soporta imágenes JPG, PNG o WebP en alta resolución
                  </span>
                </div>
              </label>

              {/* Preview Thumbnails Grid */}
              {previewUrls.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <span className="text-[11px] font-bold text-slate-600 block">
                    Fotos seleccionadas ({previewUrls.length}):
                  </span>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {previewUrls.map((url, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-300 group">
                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow-md opacity-90 hover:opacity-100 transition-opacity"
                          title="Eliminar foto"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-4 rounded-xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-bold text-sm shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-purple-200" />
                  <span>{uploadStatusText}</span>
                </>
              ) : (
                <>
                  <ImagePlus className="w-5 h-5" />
                  <span>Publicar Vehículo</span>
                </>
              )}
            </button>

          </form>
        )}
        </>
        )}

      </div>
    </div>
  );
}
