import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  Sparkles, 
  X, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Star, 
  Zap, 
  ShieldCheck, 
  QrCode,
  ArrowRight,
  Info
} from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

export default function PwaInstallCard({ 
  variant = 'banner', // 'banner' | 'modal'
  isOpen = true, 
  onClose,
  cardTheme 
}) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePwaInstall();
  const [showIosSteps, setShowIosSteps] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosSteps(true);
      return;
    }

    const res = await promptInstall();
    if (res.success && res.outcome === 'accepted') {
      setInstallSuccess(true);
    } else if (res.isIOS) {
      setShowIosSteps(true);
    } else {
      // In desktop/browser where beforeinstallprompt isn't fired yet or already dismissed:
      setShowIosSteps(true);
    }
  };

  // If already installed and it's a modal, don't show the modal
  if (variant === 'modal' && !isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://sitio-automotor.com';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}&color=6D28D9&bgcolor=FFFFFF`;

  // Inner card JSX
  const cardNode = (
    <div 
      className="relative overflow-hidden rounded-3xl bg-white border border-rose-100/90 shadow-2xl shadow-rose-950/10 transition-all text-left"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Decorative gradient accents */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-gradient-to-br from-violet-200/40 via-rose-200/30 to-transparent rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-gradient-to-tr from-rose-200/40 via-purple-100/20 to-transparent rounded-full blur-2xl pointer-events-none" />

      {/* Close button for modal */}
      {variant === 'modal' && onClose && (
        <button
          id="close-pwa-modal-btn"
          type="button"
          onClick={onClose}
          aria-label="Cerrar cartel"
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="relative z-10 p-6 sm:p-8 lg:p-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left: App Icon & Info */}
          <div className="flex-1 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 lg:gap-6">
            
            {/* App Icon Badge */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0B0F17] border-2 border-violet-500/30 shadow-xl shadow-purple-900/20 p-2 flex items-center justify-center overflow-hidden">
                <img
                  src="/android-chrome-192x192.png"
                  alt="Sitio Automotor App Icon"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    e.currentTarget.src = '/apple-touch-icon.png';
                  }}
                />
              </div>
              <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#6D28D9] to-pink-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                PWA
              </span>
            </div>

            {/* Texts and rating */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-50 border border-violet-200/60 text-violet-700 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  App Oficial para Celular
                </span>
                <span className="inline-flex items-center gap-1 text-amber-500 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  4.9 • +10k usuarios
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Descargá la App de <span className="bg-gradient-to-r from-[#6D28D9] to-[#8B5CF6] bg-clip-text text-transparent">Sitio Automotor</span>
              </h3>

              <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                Acceso directo instantáneo en tu pantalla de inicio. Recibí alertas de nuevos autos, cotizaciones y chateá por WhatsApp con agencias al instante.
              </p>

              {/* Benefits Pills */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs font-medium">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Ultra liviana (&lt;1 MB)</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs font-medium">
                  <Smartphone className="w-3.5 h-3.5 text-[#6D28D9]" />
                  <span>Android & iOS</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 border border-slate-200/70 text-slate-700 text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sin ocupar memoria</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions & QR */}
          <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col items-center gap-4 w-full sm:w-auto">
            
            {/* Install Button */}
            {isInstalled || installSuccess ? (
              <div className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold flex items-center justify-center gap-2 text-sm shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ¡App instalada correctamente!
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#6D28D9] via-[#7C3AED] to-[#8B5CF6] hover:from-[#5B21B6] hover:to-[#7C3AED] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-xl shadow-purple-900/25 hover:shadow-purple-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer group"
                >
                  <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                  <span>Instalar App en el Celular</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowIosSteps(!showIosSteps)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline underline-offset-4 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>¿Tenés iPhone o problemas al instalar? Clic acá</span>
                </button>
              </div>
            )}

            {/* Desktop QR code (visible in bottom banner for convenience) */}
            {variant === 'banner' && (
              <div className="hidden xl:flex items-center gap-3 p-2.5 pl-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="w-14 h-14 bg-white rounded-xl p-1 border border-slate-200 shadow-sm shrink-0">
                  <img
                    src={qrUrl}
                    alt="Escanear QR para instalar Sitio Automotor"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="text-left pr-2">
                  <span className="block text-xs font-bold text-slate-900 flex items-center gap-1">
                    <QrCode className="w-3.5 h-3.5 text-[#6D28D9]" />
                    Escaneá con tu celular
                  </span>
                  <span className="block text-[11px] text-slate-500">
                    Abrí la cámara y apuntá aquí
                  </span>
                </div>
              </div>
            )}

            {/* Dismiss button in modal */}
            {variant === 'modal' && onClose && (
              <button
                id="dismiss-pwa-modal-btn"
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-slate-700 font-medium transition-colors cursor-pointer py-1"
              >
                Quizás más tarde, continuar en la web
              </button>
            )}
          </div>

        </div>

        {/* Expandable Step-by-Step Instructions (iOS Safari & Manual Android) */}
        {showIosSteps && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-fadeIn">
            <div className="flex items-center justify-between pb-3">
              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#6D28D9]" />
                Cómo instalar en iPhone (Safari) o Android manualmente:
              </h4>
              <button 
                type="button"
                onClick={() => setShowIosSteps(false)}
                className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
              >
                Ocultar
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
              <div className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-[#6D28D9] text-white flex items-center justify-center font-black shrink-0">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-900">En iPhone (Safari):</p>
                  <p className="text-slate-600 mt-0.5">
                    Tocá el botón <span className="font-bold inline-flex items-center gap-0.5 text-violet-700"><Share className="w-3 h-3 inline" /> Compartir</span> en la barra inferior de Safari.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-violet-50/60 border border-violet-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-[#6D28D9] text-white flex items-center justify-center font-black shrink-0">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-900">Seleccionar opción:</p>
                  <p className="text-slate-600 mt-0.5">
                    Bajá en el menú y elegí <span className="font-bold inline-flex items-center gap-0.5 text-violet-700"><PlusSquare className="w-3 h-3 inline" /> "Agregar a pantalla de inicio"</span>.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black shrink-0">
                  3
                </div>
                <div>
                  <p className="font-bold text-emerald-950">¡Listo para usar!</p>
                  <p className="text-emerald-800 mt-0.5">
                    Tocá "Agregar" arriba a la derecha. El icono de Sitio Automotor aparecerá en tu teléfono.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render as Floating Modal / Cartel Dinámico
  if (variant === 'modal') {
    return (
      <div 
        id="pwa-install-modal-backdrop"
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      >
        <div className="w-full max-w-4xl max-h-[92vh] overflow-y-auto">
          {cardNode}
        </div>
      </div>
    );
  }

  // Render as Bottom of the Page Banner ("al fondo de la pagina como banner fijo")
  return (
    <section className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        {cardNode}
      </div>
    </section>
  );
}
