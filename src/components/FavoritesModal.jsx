import React from 'react';
import { X, Heart, Trash2, ExternalLink, MessageCircle } from 'lucide-react';

export default function FavoritesModal({ isOpen, onClose, favorites, allVehicles, onRemoveFavorite, onOpenDetailModal, onWhatsAppContact }) {
  if (!isOpen) return null;

  const favoriteVehicles = allVehicles.filter(v => favorites.includes(v.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-[#131B2E] border border-slate-700 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-[#0B0F17]/80">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 fill-indigo-500 text-indigo-500" />
            <h3 className="text-xl font-bold text-white">Mis Vehículos Favoritos</h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
              {favoriteVehicles.length}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {favoriteVehicles.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-3">
              <Heart className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-medium">Aún no agregaste vehículos a tus favoritos.</p>
              <p className="text-xs text-slate-500">
                Haz clic en el ícono de corazón en cualquier tarjeta para guardarlo aquí.
              </p>
            </div>
          ) : (
            favoriteVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-[#0B0F17] border border-slate-800 hover:border-indigo-500/50 transition-all"
              >
                <img
                  src={vehicle.image}
                  alt={vehicle.title}
                  className="w-full sm:w-32 h-24 object-cover rounded-xl border border-slate-800"
                />

                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-bold text-white text-base line-clamp-1">{vehicle.title}</h4>
                  <span className="text-xs text-slate-400 block mb-1">{vehicle.location} • {vehicle.year}</span>
                  <span className="text-base font-black text-indigo-400 font-mono">{vehicle.formattedPrice}</span>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDetailModal(vehicle);
                    }}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1"
                    title="Ver detalle"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onWhatsAppContact(vehicle)}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 fill-emerald-100 text-emerald-900" />
                  </button>

                  <button
                    onClick={() => onRemoveFavorite(vehicle.id)}
                    className="p-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-600 text-rose-300 hover:text-white transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
