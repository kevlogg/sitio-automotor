import React, { useState, useEffect } from 'react';
import { 
  X, Check, Copy, CheckCircle2, Loader2, CreditCard, 
  MessageCircle, Building2, ShieldCheck, ArrowRight, Sparkles,
  ExternalLink, Zap
} from 'lucide-react';
import { 
  submitPaymentClaim, 
  getPlanInfo, 
  getCachedPlanPrices, 
  fetchPlanPrices,
  BANKING_INFO 
} from '../lib/planUtils';
import { 
  getMercadoPagoSettings, 
  createPlanSubscriptionPreference 
} from '../lib/mercadopago';

export default function PaymentClaimModal({
  isOpen,
  onClose,
  planKey = 'base',
  currentUser,
  onSuccess,
}) {
  const [activeTab, setActiveTab] = useState('mercadopago'); // 'mercadopago' | 'transferencia'
  const [prices, setPrices] = useState(getCachedPlanPrices);
  const [mpConnected, setMpConnected] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [creatingMpCheckout, setCreatingMpCheckout] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    fetchPlanPrices().then((loaded) => {
      if (loaded) setPrices(loaded);
    });

    getMercadoPagoSettings().then((settings) => {
      setMpConnected(Boolean(settings?.connected));
      if (!settings?.connected) {
        setActiveTab('transferencia');
      } else {
        setActiveTab('mercadopago');
      }
    });
  }, [isOpen]);

  if (!isOpen) return null;

  const plan = getPlanInfo(planKey, prices);
  const profile = currentUser?.profile || {};
  const userName = profile.business_name || profile.full_name || 'Usuario';
  const userType = profile.user_type || 'particular';
  const userEmail = currentUser?.user?.email || profile.email || 'usuario@sitioautomotor.com.ar';
  const userId = currentUser?.user?.id || profile.id;

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleMercadoPagoPay = async () => {
    setCreatingMpCheckout(true);
    setErrorMsg(null);

    try {
      const res = await createPlanSubscriptionPreference({
        planKey,
        planName: plan.label,
        price: plan.price,
        userId,
        userEmail,
        userName,
        baseUrl: typeof window !== 'undefined' ? window.location.origin : 'https://sitioautomotor.com.ar',
      });

      if (res && res.init_point) {
        window.location.href = res.init_point;
      } else {
        throw new Error('No se pudo generar el checkout de Mercado Pago.');
      }
    } catch (err) {
      console.error('Error al iniciar Mercado Pago:', err);
      setErrorMsg(err.message || 'Error al conectar con la pasarela de Mercado Pago. Podés abonar por transferencia.');
      setCreatingMpCheckout(false);
    }
  };

  const handleConfirmPayment = async (sendWhatsApp = false) => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await submitPaymentClaim({
        userId,
        userEmail,
        userName,
        userType,
        planKey,
        referenceNumber: referenceNumber.trim(),
        paymentMethod: 'ya_pague_transferencia',
      });

      if (sendWhatsApp) {
        const refText = referenceNumber.trim() ? ` (Nro de Comprobante / Ref: ${referenceNumber.trim()})` : '';
        const message = encodeURIComponent(
          `Hola Sitio Automotor, acabo de realizar la transferencia de $${Number(plan.price).toLocaleString('es-AR')} para el ${plan.label} de mi ${userType === 'agencia' ? 'Agencia' : userType === 'negocio_automotor' ? 'Negocio' : 'Cuenta'} "${userName}"${refText}. Ya notifiqué desde la plataforma con el botón "Ya pagué" y adjunto el comprobante para su verificación y activación.`
        );
        window.open(`https://wa.me/${BANKING_INFO.whatsappAdmin}?text=${message}`, '_blank');
      }

      setConfirmed(true);
      if (onSuccess) {
        onSuccess({
          planKey,
          referenceNumber: referenceNumber.trim(),
        });
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al notificar el pago. Por favor intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div 
        className="relative w-full max-w-xl rounded-3xl bg-[#0F172A] border border-slate-800 text-white shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">Abonar Membresía</h3>
              <p className="text-xs text-slate-400">Elegí abonar por Mercado Pago o confirmar que "Ya pagué" por transferencia</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center shadow-lg shadow-emerald-950/40 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase tracking-wider">
                Aviso "Ya pagué" Notificado con Éxito
              </span>
              <h4 className="text-xl font-black text-white">¡Muchas gracias, {userName}!</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Notificamos tu pago al <strong className="text-amber-300">Panel SuperAdmin</strong> para el <strong className="text-purple-300 font-bold">{plan.label}</strong>. El dueño de Sitio Automotor verificará la acreditación y activará tu cuenta de inmediato.
              </p>
              {referenceNumber.trim() && (
                <p className="text-xs font-mono text-slate-400 bg-slate-900 py-1.5 px-3 rounded-xl border border-slate-800 inline-block mt-1">
                  Comprobante: {referenceNumber.trim()}
                </p>
              )}
            </div>

            <div className="pt-3 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => {
                  const refText = referenceNumber.trim() ? ` (Nro Comprobante: ${referenceNumber.trim()})` : '';
                  const message = encodeURIComponent(
                    `Hola Sitio Automotor, acabo de informar mi pago en la web para el ${plan.label} de "${userName}"${refText}. Les comparto el comprobante bancario adjunto.`
                  );
                  window.open(`https://wa.me/${BANKING_INFO.whatsappAdmin}?text=${message}`, '_blank');
                }}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/30 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Adjuntar Comprobante por WhatsApp</span>
              </button>

              <button
                onClick={onClose}
                className="py-3.5 px-6 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-xs transition-all cursor-pointer"
              >
                Volver a Mi Panel
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {/* Resumen del Plan con Precio Dinámico */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900 border border-purple-800/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Plan Seleccionado</span>
                <h4 className="text-lg font-black text-white">{plan.label}</h4>
                <p className="text-xs text-slate-400">{plan.target || 'Abono mensual oficial'}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">{plan.priceLabel}</span>
                <span className="block text-[10px] font-bold text-slate-400">Total a abonar</span>
              </div>
            </div>

            {/* Selector de Método de Pago: Mercado Pago vs Ya Pagué (Transferencia) */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('mercadopago')}
                className={`py-3 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'mercadopago'
                    ? 'bg-gradient-to-r from-[#009EE3] to-[#007EB5] text-white shadow-lg shadow-cyan-950/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Mercado Pago</span>
                <span className="hidden sm:inline text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full uppercase">Online</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('transferencia')}
                className={`py-3 px-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  activeTab === 'transferencia'
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white shadow-lg shadow-emerald-950/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>"Ya pagué"</span>
                <span className="hidden sm:inline text-[9px] bg-white/20 px-1.5 py-0.5 rounded-full uppercase">Transferencia</span>
              </button>
            </div>

            {/* Pestaña: Mercado Pago */}
            {activeTab === 'mercadopago' && (
              <div className="space-y-4 animate-fadeIn">
                <div className="p-5 rounded-2xl bg-[#009EE3]/10 border border-[#009EE3]/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#00E5E8] flex items-center gap-1.5 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      Pago Online Protegido
                    </span>
                    <span className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Activación Automática
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    Aboná tu cuota mensual de forma segura a través del portal oficial de <strong>Mercado Pago</strong> utilizando tarjeta de crédito, tarjeta de débito o dinero disponible en cuenta.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-300">
                    <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">✓ Tarjetas de Crédito y Débito</span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">✓ Dinero en Cuenta MP</span>
                    <span className="px-2.5 py-1 rounded-lg bg-black/30 border border-white/10">✓ Cuotas disponibles</span>
                  </div>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                <button
                  type="button"
                  disabled={creatingMpCheckout}
                  onClick={handleMercadoPagoPay}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#00ADB5] via-[#009EE3] to-[#007EB5] hover:brightness-110 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-950/40 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                >
                  {creatingMpCheckout ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Conectando con Mercado Pago...</span>
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-5 h-5" />
                      <span>Pagar {plan.priceLabel} con Mercado Pago</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Pestaña: "Ya pagué" (Transferencia Bancaria) */}
            {activeTab === 'transferencia' && (
              <div className="space-y-5 animate-fadeIn">
                {/* Banner explicativo del aviso al SuperAdmin */}
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
                  <div className="flex items-center gap-2 text-indigo-300 font-black text-xs uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Aviso Inmediato al SuperAdmin</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Hacé tu transferencia por el importe del plan seleccionado. Al presionar el botón <strong className="text-emerald-400 font-extrabold">"¡Ya pagué! Notificar al Administrador"</strong>, el dueño de Sitio Automotor recibirá una notificación en tiempo real para verificar la acreditación y dar de alta tu cuenta al instante.
                  </p>
                </div>

                {/* Datos Bancarios Oficiales */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-purple-400" />
                      Datos de la Cuenta Bancaria Oficial
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Cuenta Oficial
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
                    <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800 text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Banco:</span>
                        <span className="font-bold text-white">{BANKING_INFO.bank}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Titular:</span>
                        <span className="font-bold text-white">{BANKING_INFO.accountHolder}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">CUIT:</span>
                        <span className="font-bold font-mono text-white">{BANKING_INFO.cuit}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Tipo:</span>
                        <span className="font-bold text-white">{BANKING_INFO.accountType}</span>
                      </div>
                    </div>

                    {/* CBU con botón copiar */}
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">CBU</span>
                        <span className="font-mono font-bold text-white tracking-wider">{BANKING_INFO.cbu}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(BANKING_INFO.cbu, 'cbu')}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedField === 'cbu' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'cbu' ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>

                    {/* Alias con botón copiar */}
                    <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Alias</span>
                        <span className="font-mono font-black text-amber-300 tracking-wider text-sm">{BANKING_INFO.alias}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(BANKING_INFO.alias, 'alias')}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        {copiedField === 'alias' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedField === 'alias' ? '¡Copiado!' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Input para referencia o Nro de comprobante */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    Número de Operación / Comprobante de Transferencia <span className="text-slate-400 font-normal">(Opcional)</span>:
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Ej: OP-983210 o últimos dígitos de tu transferencia"
                    className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <p className="text-[11px] text-slate-400">
                    Facilita la identificación rápida de tu transferencia por parte del SuperAdmin.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                    {errorMsg}
                  </div>
                )}

                {/* Botones de Acción */}
                <div className="space-y-2.5 pt-2">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleConfirmPayment(false)}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:brightness-110 text-white font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-emerald-950/40 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                    )}
                    <span>¡Ya pagué! Notificar al Administrador</span>
                  </button>

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => handleConfirmPayment(true)}
                    className="w-full py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-emerald-500/30 text-emerald-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Ya pagué y Enviar Comprobante por WhatsApp</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
