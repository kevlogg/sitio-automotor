import React, { useState } from 'react';
import { 
  X, Check, Copy, CheckCircle2, Loader2, CreditCard, 
  MessageCircle, Building2, ShieldCheck, ArrowRight, Sparkles 
} from 'lucide-react';
import { submitPaymentClaim, PLAN_INFO, BANKING_INFO } from '../lib/planUtils';

export default function PaymentClaimModal({
  isOpen,
  onClose,
  planKey = 'base',
  currentUser,
  onSuccess,
}) {
  const [referenceNumber, setReferenceNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const plan = PLAN_INFO[planKey] || PLAN_INFO.base;
  const profile = currentUser?.profile || {};
  const userName = profile.business_name || profile.full_name || 'Usuario';
  const userType = profile.user_type || 'particular';

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleConfirmPayment = async (sendWhatsApp = true) => {
    setSubmitting(true);
    setErrorMsg(null);

    try {
      await submitPaymentClaim({
        userId: currentUser?.user?.id || profile.id,
        userEmail: currentUser?.user?.email || profile.email,
        userName,
        userType,
        planKey,
        referenceNumber: referenceNumber.trim(),
      });

      if (sendWhatsApp) {
        const refText = referenceNumber.trim() ? ` (Nro de Comprobante / Ref: ${referenceNumber.trim()})` : '';
        const message = encodeURIComponent(
          `Hola Sitio Automotor, acabo de realizar la transferencia de $${Number(plan.price).toLocaleString('es-AR')} para el ${plan.label} de mi ${userType === 'agencia' ? 'Agencia' : userType === 'negocio_automotor' ? 'Negocio' : 'Cuenta'} "${userName}"${refText}. Adjunto el comprobante para su validación.`
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
      setErrorMsg(err.message || 'Error al informar el pago. Por favor intenta de nuevo.');
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
              <h3 className="text-base font-black text-white">Informar Pago de Membresía</h3>
              <p className="text-xs text-slate-400">Datos bancarios y confirmación para activación inmediata</p>
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
                Pago Declarado Exitosamente
              </span>
              <h4 className="text-xl font-black text-white">¡Muchas gracias, {userName}!</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                Tu solicitud para el <strong className="text-purple-300 font-bold">{plan.label}</strong> quedó registrada en estado <strong className="text-amber-400 font-bold">Pendiente de Verificación</strong>. Nuestro equipo comercial confirmará el comprobante y activará tu cuenta en el día.
              </p>
              {referenceNumber.trim() && (
                <p className="text-xs font-mono text-slate-400 bg-slate-900 py-1.5 px-3 rounded-xl border border-slate-800 inline-block mt-1">
                  Comprobante: {referenceNumber.trim()}
                </p>
              )}
            </div>

            <div className="pt-3">
              <button
                onClick={onClose}
                className="w-full py-3.5 px-6 rounded-2xl bg-[#5328D7] hover:bg-[#431fb5] text-white font-black text-xs shadow-lg shadow-indigo-950/40 transition-all cursor-pointer"
              >
                Volver a Mi Panel
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            
            {/* Resumen del Plan */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/50 via-slate-900 to-slate-900 border border-purple-800/40 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-purple-400 tracking-wider">Plan Seleccionado</span>
                <h4 className="text-lg font-black text-white">{plan.label}</h4>
                <p className="text-xs text-slate-400">{plan.target || 'Abono mensual oficial'}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-white">{plan.priceLabel}</span>
                <span className="block text-[10px] font-bold text-slate-400">Total a transferir</span>
              </div>
            </div>

            {/* Datos Bancarios Oficiales */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Datos de Transferencia Bancaria Oficial
                </span>
                <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  Cuenta Verificada
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
                placeholder="Ej: OP-983210 o últimos 6 dígitos de la transferencia"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-purple-500 transition-colors"
              />
              <p className="text-[11px] text-slate-400">
                Si pegás el código de operación, agilizás la activación automática en el panel de control.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleConfirmPayment(true)}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageCircle className="w-4 h-4" />
                )}
                <span>Informar Pago y Enviar Comprobante por WhatsApp</span>
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleConfirmPayment(false)}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
              >
                <span>Solo Informar Pago en el Sistema</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
