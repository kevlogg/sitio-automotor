import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Save, 
  Sparkles, 
  Building2, 
  Zap, 
  Star, 
  CheckCircle2, 
  RefreshCw,
  Info,
  Layers,
  Award,
  CreditCard,
  Check,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { 
  fetchPlanPrices, 
  savePlanPrices, 
  formatPrice, 
  DEFAULT_PLAN_PRICES 
} from '../../lib/planUtils';
import MercadoPagoConnectCard from './MercadoPagoConnectCard';

export default function PlansManager({ toast }) {
  const [prices, setPrices] = useState(DEFAULT_PLAN_PRICES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const data = await fetchPlanPrices();
      setPrices(data);
    } catch (e) {
      console.warn('Error al cargar precios de planes:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, []);

  const handlePriceChange = (key, val) => {
    const cleanNum = Math.max(0, parseInt(val, 10) || 0);
    setPrices((prev) => ({
      ...prev,
      [key]: cleanNum,
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      await savePlanPrices(prices);
      const msg = '¡Valores de los planes guardados exitosamente! Se actualizaron en todo el sitio con vigencia inmediata.';
      setFeedback({ type: 'success', message: msg });
      if (toast?.show) toast.show(msg);
    } catch (err) {
      const errMsg = 'Error al guardar los nuevos precios: ' + (err.message || 'Error de conexión');
      setFeedback({ type: 'error', message: errMsg });
      if (toast?.show) toast.show(errMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const planCards = [
    {
      key: 'base',
      title: 'Plan Base',
      subtitle: 'Comercios y Agencias Virtuales',
      accentColor: 'border-amber-500/40 bg-amber-500/5',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      badgeText: '1 Aviso Activo',
      icon: Building2,
      target: 'Comercios relacionados con el automotor y agencias virtuales',
    },
    {
      key: 'premium',
      title: 'Plan Premium',
      subtitle: 'Agencias Multimarca',
      accentColor: 'border-violet-500/50 bg-violet-500/5 ring-1 ring-violet-500/30',
      badgeColor: 'bg-violet-600 text-white',
      badgeText: 'MÁS ELEGIDO • Hasta 20 Avisos',
      icon: Star,
      target: 'Agencias multimarca y grandes comercios del automotor',
    },
    {
      key: 'super_premium',
      title: 'Plan Súper Premium',
      subtitle: 'Agencias Oficiales VIP',
      accentColor: 'border-yellow-500/50 bg-yellow-500/5 ring-1 ring-yellow-500/30',
      badgeColor: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black',
      badgeText: 'MÁXIMA VISIBILIDAD • Hasta 50 Avisos',
      icon: Award,
      target: 'Agencias oficiales y comercios Súper Premium con banners',
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#2E1065] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-violet-500/30">
        <div className="absolute top-0 right-0 -translate-y-8 translate-x-8 w-72 h-72 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              <span>Gestión Comercial • Precios Oficiales de Membresías</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Administrador de Valores de Planes
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed">
              Modificá el valor mensual de los planes. El nuevo valor se impacta <strong className="text-amber-300 font-extrabold">de inmediato</strong> tanto en la página pública de Planes como en el cobro por Mercado Pago y transferencias bancarias.
            </p>
          </div>

          <button
            type="button"
            onClick={loadPrices}
            disabled={loading}
            className="self-start md:self-center bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all border border-white/20 flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Recargar Precios</span>
          </button>
        </div>
      </div>

      {/* Mercado Pago Official Connection Card */}
      <MercadoPagoConnectCard toast={toast} />

      {/* Editor de Planes y Valores */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-600" />
              <span>Valores Mensuales de Suscripción</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Ajustá los valores en pesos argentinos (ARS). Los cambios se aplican de inmediato en todo el sitio.
            </p>
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 animate-fadeIn ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-rose-50 border-rose-300 text-rose-800'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{feedback.message}</span>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="w-8 h-8 text-violet-600 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {planCards.map(({ key, title, subtitle, accentColor, badgeColor, badgeText, icon: Icon, target }) => {
                const price = Number(prices[key] || 0);

                return (
                  <div
                    key={key}
                    className={`bg-white rounded-3xl p-6 border-2 ${accentColor} shadow-md flex flex-col justify-between space-y-5 text-left relative overflow-hidden`}
                  >
                    <div className="space-y-4">
                      {/* Header Card */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black shadow-sm">
                            <Icon className="w-5 h-5 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="text-base font-black text-slate-950 uppercase">{title}</h4>
                            <span className="text-[11px] text-slate-500 font-bold block">{subtitle}</span>
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 border ${badgeColor}`}>
                          {badgeText}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 min-h-[32px] leading-relaxed">
                        {target}
                      </p>

                      {/* Input de Precio */}
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
                        <label className="block text-[11px] uppercase tracking-wider font-extrabold text-slate-600">
                          Valor Mensual (ARS):
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-base">
                            $
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={prices[key] ?? 0}
                            onChange={(e) => handlePriceChange(key, e.target.value)}
                            className="w-full pl-8 pr-4 py-3 rounded-xl bg-white border border-slate-300 font-mono font-black text-lg text-slate-900 focus:outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-600/20"
                          />
                        </div>
                        <div className="text-[11px] font-bold text-violet-700 text-right">
                          Equivale a: {formatPrice(price)} / mes
                        </div>
                      </div>

                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between">
                        <span className="font-semibold text-slate-600">Total Facturación:</span>
                        <span className="font-mono font-black text-slate-950">{formatPrice(price)}</span>
                      </div>
                    </div>

                    <div className="pt-2 text-[11px] text-slate-500 font-medium">
                      ✓ Actualiza la tarjeta pública de planes y el link de pago oficial.
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-purple-900/25 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Guardando precios en Supabase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Nuevos Valores de Planes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
