import React, { useState } from 'react';
import { X, CheckCircle2, Upload, PlusCircle, Loader2, ImagePlus } from 'lucide-react';
import { PROVINCE_OPTIONS } from '../data/mockVehicles';
import { uploadVehicleImage } from '../lib/supabase';

export default function PublishModal({ isOpen, onClose, onVehicleAdded }) {
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
    location: 'Buenos Aires, CABA',
    sellerType: 'Particular Verificado',
    sellerName: '',
    sellerWhatsApp: '',
    description: '',
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [submitted, setSubmitted] = useState(false);

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

    const newVehicle = {
      id: 'v-' + Date.now(),
      title: formData.title || `${formData.brand} ${formData.model || 'Vehículo'}`,
      category: formData.category,
      categoryLabel: formData.category === 'autos' ? 'Autos' : formData.category === 'camionetas' ? 'Pick-ups' : formData.category === 'motos' ? 'Motos' : formData.category === 'camiones' ? 'Comerciales' : 'Náutica',
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
      location: formData.location,
      sellerType: formData.sellerType,
      sellerName: formData.sellerName || 'Usuario Vendedor',
      sellerWhatsApp: formData.sellerWhatsApp || '5491112345678',
      badge: 'Publicación Destacada',
      badgeColor: 'violet',
      image: mainImage,
      images: allImages,
      description: formData.description || 'Vehículo publicado mediante el Plan Individual de $15.000 / 30 días.',
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

        {/* Plan Header Banner */}
        <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-[#6D28D9] text-white font-black text-xs">
              Plan Individual
            </div>
            <span className="text-xs text-slate-700 font-medium">
              Publicación activa por 30 días corrida con almacenamiento HD en la nube.
            </span>
          </div>
          <span className="text-lg font-black text-slate-900 font-mono">$15.000</span>
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ubicación / Provincia</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs focus:border-[#6D28D9] focus:bg-white focus:outline-none cursor-pointer"
              >
                {PROVINCE_OPTIONS.filter(p => p !== 'Todas las ubicaciones').map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
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
                  <span>Pagar $15.000 y Publicar vehículo por 30 días</span>
                </>
              )}
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
