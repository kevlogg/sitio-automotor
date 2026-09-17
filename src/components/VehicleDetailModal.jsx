import React, { useState } from 'react';
import { X, Calendar, Gauge, Fuel, ShieldCheck, MapPin, MessageCircle, Heart, CheckCircle2, User } from 'lucide-react';

export default function VehicleDetailModal({ vehicle, onClose, isFavorite, onToggleFavorite, onWhatsAppContact }) {
  const [selectedImgState, setSelectedImg] = useState(null);

  if (!vehicle) return null;

  const selectedImg = selectedImgState || vehicle.image;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-white border border-slate-200 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 bg-slate-50/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-md bg-[#6D28D9] text-white text-xs font-bold uppercase tracking-wider">
              {vehicle.categoryLabel}
            </span>
            <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#6D28D9]" />
              {vehicle.location}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(vehicle.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-[#6D28D9] border-purple-500 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          
          {/* Main Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={selectedImg}
                alt={vehicle.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-white font-mono font-black text-xl border border-white/20">
                {vehicle.formattedPrice}
              </div>
            </div>

            {/* Thumbnail Row */}
            {vehicle.images && vehicle.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2">
                {vehicle.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImg(img)}
                    className={`relative w-24 h-16 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImg === img ? 'border-[#6D28D9] scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Vista ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & Key Specs */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4 tracking-tight">
              {vehicle.title}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Año</span>
                <span className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-1">
                  <Calendar className="w-4 h-4 text-[#6D28D9]" />
                  {vehicle.year}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Kilometraje</span>
                <span className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-1">
                  <Gauge className="w-4 h-4 text-[#6D28D9]" />
                  {vehicle.mileage}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Combustible</span>
                <span className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-1">
                  <Fuel className="w-4 h-4 text-[#6D28D9]" />
                  {vehicle.fuel}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">Transmisión</span>
                <span className="text-base font-extrabold text-slate-900">
                  {vehicle.transmission}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Descripción de la unidad</h3>
            <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {vehicle.description}
            </p>
          </div>

          {/* Features Checklist */}
          {vehicle.features && (
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-3">Equipamiento destacado</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vehicle.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller Card */}
          <div className="p-6 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#6D28D9] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-purple-500/20">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#6D28D9] block uppercase tracking-wider">
                  {vehicle.sellerType}
                </span>
                <h4 className="text-lg font-bold text-slate-900">{vehicle.sellerName}</h4>
                <span className="text-xs text-slate-600 flex items-center gap-1 mt-0.5 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Vendedor Verificado por Sitio Automotor
                </span>
              </div>
            </div>

            <button
              onClick={() => onWhatsAppContact(vehicle)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-emerald-100 text-emerald-900" />
              <span>Contactar por WhatsApp</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
