import React, { useState } from 'react';
import { X, CheckCircle2, Upload, PlusCircle, ShieldCheck, Tag, DollarSign, MapPin, Smartphone } from 'lucide-react';
import { BRAND_OPTIONS, PROVINCE_OPTIONS } from '../data/mockVehicles';

export default function PublishModal({ isOpen, onClose, onVehicleAdded }) {
  if (!isOpen) return null;

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
    image: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?q=80&w=1200&auto=format&fit=crop'
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newVehicle = {
      id: 'v-' + Date.now(),
      title: formData.title || `${formData.brand} ${formData.model || 'Vehículo'}`,
      category: formData.category,
      categoryLabel: formData.category === 'autos' ? 'Autos' : formData.category === 'camionetas' ? 'Pick-ups' : formData.category === 'motos' ? 'Motos' : formData.category === 'camiones' ? 'Comerciales' : 'Náutica',
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year) || 2023,
      mileage: formData.mileage,
      mileageNum: 15000,
      fuel: formData.fuel,
      transmission: formData.transmission,
      priceCurrency: formData.priceCurrency,
      price: parseInt(formData.price) || 25000,
      formattedPrice: `${formData.priceCurrency} ${parseInt(formData.price || 25000).toLocaleString('es-AR')}`,
      location: formData.location,
      sellerType: formData.sellerType,
      sellerName: formData.sellerName || 'Usuario Vendedor',
      sellerWhatsApp: formData.sellerWhatsApp || '5491112345678',
      badge: 'Publicación Destacada',
      badgeColor: 'violet',
      image: formData.image,
      images: [formData.image],
      description: formData.description || 'Vehículo publicado mediante el Plan Individual de $15.000 / 30 días.',
      features: ['Unidad Inspeccionada', 'Contacto Directo WhatsApp', 'Fotos HD']
    };

    setSubmitted(true);
    setTimeout(() => {
      onVehicleAdded(newVehicle);
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#131B2E] border border-indigo-500/40 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0B0F17]/80">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
              Marketplace Automotor
            </span>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              Publicá tu vehículo
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Header Banner */}
        <div className="p-4 bg-gradient-to-r from-indigo-900/40 via-violet-900/40 to-blue-900/40 border-b border-indigo-500/30 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-indigo-500 text-white font-black text-xs">
              Plan Individual
            </div>
            <span className="text-xs text-slate-300 font-medium">
              Publicación activa por 30 días corrida con visibilidad nacional.
            </span>
          </div>
          <span className="text-lg font-black text-white font-mono">$15.000</span>
        </div>

        {submitted ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-bold text-white">¡Publicación realizada con éxito!</h4>
            <p className="text-slate-300 text-sm max-w-md mx-auto">
              Tu vehículo ha sido dado de alta en la plataforma bajo la tarifa de $15.000 / 30 días y ya se encuentra visible en el catálogo principal.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            
            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Título de la publicación</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Toyota Corolla 2.0 SEG CVT"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                >
                  <option value="autos">Autos</option>
                  <option value="camionetas">Camionetas / SUVs</option>
                  <option value="motos">Motos</option>
                  <option value="camiones">Camiones</option>
                  <option value="nautica">Náutica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Marca</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Volkswagen, BMW, Ford"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Año</label>
                <input
                  type="number"
                  required
                  placeholder="2023"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Precio (USD o ARS)</label>
                <div className="flex gap-2">
                  <select
                    value={formData.priceCurrency}
                    onChange={(e) => setFormData({ ...formData, priceCurrency: e.target.value })}
                    className="px-2.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-white text-xs"
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
                    className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Kilometraje</label>
                <input
                  type="text"
                  placeholder="Ej. 18.000 km o 0 km"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tu Nombre o Nombre de Agencia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={formData.sellerName}
                  onChange={(e) => setFormData({ ...formData, sellerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Teléfono / WhatsApp de contacto</label>
                <input
                  type="tel"
                  required
                  placeholder="Ej. 5491134567890"
                  value={formData.sellerWhatsApp}
                  onChange={(e) => setFormData({ ...formData, sellerWhatsApp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Ubicación / Provincia</label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
              >
                {PROVINCE_OPTIONS.filter(p => p !== 'Todas las ubicaciones').map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Descripción de la unidad</label>
              <textarea
                rows={3}
                placeholder="Detalla estado del vehículo, services, equipamiento y permutas..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#0B0F17] border border-slate-800 rounded-xl text-white text-xs focus:border-indigo-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Photo Upload Simulator */}
            <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl text-center bg-[#0B0F17]/50">
              <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-300 block">Fotos ilimitadas en alta definición</span>
              <span className="text-[11px] text-slate-500">Formato JPG, PNG o WebP (Simulado automáticamente)</span>
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-blue-600 text-white font-black text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
            >
              <span>Pagar $15.000 y Publicar vehículo por 30 días</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
}
