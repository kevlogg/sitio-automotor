import React, { useState } from 'react';
import { X, Calendar, Gauge, Fuel, ShieldCheck, MapPin, MessageCircle, Heart, CheckCircle2, User, Share2 } from 'lucide-react';

export default function VehicleDetailModal({ vehicle, onClose, isFavorite, onToggleFavorite, onWhatsAppContact }) {
  if (!vehicle) return null;

  const [selectedImg, setSelectedImg] = useState(vehicle.image);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-4xl rounded-3xl bg-[#131B2E] border border-slate-700 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0B0F17]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-md bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider">
              {vehicle.categoryLabel}
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" />
              {vehicle.location}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(vehicle.id)}
              className={`p-2.5 rounded-xl border transition-all ${
                isFavorite
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
          
          {/* Main Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={selectedImg}
                alt={vehicle.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-black/70 backdrop-blur-md text-white font-mono font-black text-xl border border-white/10">
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
                      selectedImg === img ? 'border-indigo-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
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
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-4">
              {vehicle.title}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Año</span>
                <span className="text-base font-extrabold text-white flex items-center justify-center gap-1">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  {vehicle.year}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Kilometraje</span>
                <span className="text-base font-extrabold text-white flex items-center justify-center gap-1">
                  <Gauge className="w-4 h-4 text-indigo-400" />
                  {vehicle.mileage}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Combustible</span>
                <span className="text-base font-extrabold text-white flex items-center justify-center gap-1">
                  <Fuel className="w-4 h-4 text-indigo-400" />
                  {vehicle.fuel}
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#0B0F17] border border-slate-800 text-center">
                <span className="text-[11px] font-bold text-slate-400 block mb-1">Transmisión</span>
                <span className="text-base font-extrabold text-white">
                  {vehicle.transmission}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-white mb-2">Descripción de la unidad</h3>
            <p className="text-slate-300 text-sm leading-relaxed bg-[#0B0F17]/60 p-4 rounded-xl border border-slate-800/80">
              {vehicle.description}
            </p>
          </div>

          {/* Features Checklist */}
          {vehicle.features && (
            <div>
              <h3 className="text-lg font-bold text-white mb-3">Equipamiento destacado</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {vehicle.features.map((feat, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seller Card & Direct Contact */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B0F17] to-[#131B2E] border border-indigo-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-lg">
                <User className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-bold text-indigo-400 block uppercase tracking-wider">
                  {vehicle.sellerType}
                </span>
                <h4 className="text-lg font-bold text-white">{vehicle.sellerName}</h4>
                <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Vendedor Verificado por Sitio Automotor
                </span>
              </div>
            </div>

            <button
              onClick={() => onWhatsAppContact(vehicle)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-900/40 transition-all flex items-center justify-center gap-2 border border-emerald-400/40"
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
