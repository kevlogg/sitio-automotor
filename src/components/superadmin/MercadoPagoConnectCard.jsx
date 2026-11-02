import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Unplug, 
  Check, 
  Copy,
  Info,
  KeyRound,
  ArrowRight
} from 'lucide-react';
import { 
  getMercadoPagoSettings, 
  saveMercadoPagoSettings, 
  disconnectMercadoPago, 
  connectMercadoPagoManual, 
  getOAuthAuthorizationUrl,
  createTestPaymentPreference,
  MP_MARKETPLACE_CONFIG
} from '../../lib/mercadopago';

export default function MercadoPagoConnectCard({ toast }) {
  const [loading, setLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState(false);
  const [connected, setConnected] = useState(false);
  const [sellerId, setSellerId] = useState(null);
  const [connectedAt, setConnectedAt] = useState(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);
  const [authUrl, setAuthUrl] = useState('');
  const [callbackUrl, setCallbackUrl] = useState('');
  const [manualToken, setManualToken] = useState('');
  const [connectingManual, setConnectingManual] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [testingPayment, setTestingPayment] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const settings = await getMercadoPagoSettings();
      setConnected(Boolean(settings.connected));
      setSellerId(settings.seller_id || null);
      setConnectedAt(settings.connected_at || null);

      if (typeof window !== 'undefined') {
        const origin = window.location.origin;
        const cb = origin.includes('localhost') 
          ? `${origin}/api/superadmin/mp/callback`
          : 'https://sitioautomotor.com.ar/api/superadmin/mp/callback';
        setCallbackUrl(cb);
        setAuthUrl(getOAuthAuthorizationUrl(cb));
      }
    } catch (e) {
      console.warn('Error cargando estado de Mercado Pago:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();

    // Escuchar eventos de actualización
    const handleUpdate = (e) => {
      const updated = e.detail;
      if (updated) {
        setConnected(Boolean(updated.connected));
        setSellerId(updated.seller_id || null);
        setConnectedAt(updated.connected_at || null);
      }
    };
    window.addEventListener('sa_mp_settings_updated', handleUpdate);

    // Revisar query params en la URL por retornos de OAuth
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mp_connected') === 'true') {
        setStatusMessage({
          type: 'success',
          text: '¡Cuenta oficial de Mercado Pago vinculada exitosamente! Los cobros automáticos de planes ya están activos.',
        });
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.get('test_mp') === 'approved') {
        setStatusMessage({
          type: 'success',
          text: '¡Checkout de prueba validado y aprobado con éxito en Mercado Pago!',
        });
        window.history.replaceState({}, '', window.location.pathname);
      } else if (params.get('mp_error')) {
        setStatusMessage({
          type: 'error',
          text: `No se pudo conectar la cuenta: ${params.get('mp_error')}`,
        });
      }
    }

    return () => window.removeEventListener('sa_mp_settings_updated', handleUpdate);
  }, []);

  const handleManualConnect = async (e) => {
    e.preventDefault();
    if (!manualToken.trim()) return;

    setConnectingManual(true);
    try {
      const res = await connectMercadoPagoManual(manualToken.trim());
      if (res.success) {
        setConnected(true);
        setSellerId(res.sellerId);
        setConnectedAt(new Date().toISOString());
        setManualToken('');
        setShowManualInput(false);
        setStatusMessage({
          type: 'success',
          text: res.message,
        });
        if (toast?.show) toast.show(res.message);
      } else {
        setStatusMessage({
          type: 'error',
          text: res.message || 'No se pudo conectar la cuenta con el token ingresado.',
        });
      }
    } catch (err) {
      setStatusMessage({
        type: 'error',
        text: err.message || 'Error de conexión con Mercado Pago.',
      });
    } finally {
      setConnectingManual(false);
    }
  };

  const handleRunTestPayment = async () => {
    setTestingPayment(true);
    try {
      const res = await createTestPaymentPreference('admin@sitioautomotor.com.ar');
      if (res.init_point) {
        window.location.href = res.init_point;
      } else {
        alert('No se pudo generar el checkout de prueba.');
      }
    } catch (err) {
      alert(err.message || 'Error al conectar con Mercado Pago.');
    } finally {
      setTestingPayment(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('¿Estás seguro de que deseas desconectar la cuenta de Mercado Pago? El cobro automático de suscripciones quedará pausado hasta que se reconecte.')) {
      return;
    }

    setDisconnecting(true);
    try {
      await disconnectMercadoPago();
      setConnected(false);
      setSellerId(null);
      setConnectedAt(null);
      setStatusMessage({ type: 'info', text: 'Cuenta de Mercado Pago desvinculada.' });
      if (toast?.show) toast.show('Cuenta de Mercado Pago desvinculada');
    } catch (e) {
      alert(e.message || 'Error al desconectar');
    } finally {
      setDisconnecting(false);
    }
  };

  const copyCallbackToClipboard = () => {
    if (callbackUrl) {
      navigator.clipboard.writeText(callbackUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2500);
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#2E1065] text-white rounded-3xl p-6 sm:p-8 border-2 border-violet-500/40 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 border border-violet-400/40 text-violet-100 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            <CreditCard className="w-3.5 h-3.5 text-amber-300" />
            <span>Pasarela Oficial • Mercado Pago</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 mt-1">
            <span>Cobro Automático de Planes</span>
          </h3>
          <p className="text-xs text-slate-300 font-medium max-w-2xl leading-relaxed">
            Conectá la cuenta oficial de Mercado Pago para recibir los cobros automáticos de las suscripciones mensuales de tus clientes directamente en tu cuenta.
          </p>
        </div>

        {/* Status Badge */}
        <div className="shrink-0 flex items-center gap-2">
          {loading ? (
            <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Verificando...</span>
            </div>
          ) : connected ? (
            <div className="inline-flex items-center gap-1.5 bg-emerald-500/25 border border-emerald-400/60 text-emerald-300 px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CUENTA CONECTADA Y ACTIVA</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 bg-amber-500/25 border border-amber-400/60 text-amber-300 px-3.5 py-1.5 rounded-2xl text-xs font-black shadow-md">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>SIN VINCULAR</span>
            </div>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 animate-fadeIn ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/25 border-emerald-400/50 text-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-500/25 border-rose-400/50 text-rose-200'
              : 'bg-blue-500/25 border-blue-400/50 text-blue-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          {connected ? (
            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider block">
                    Cuenta Oficial Conectada (ID de Vendedor)
                  </span>
                  <span className="text-lg font-black text-white font-mono">
                    {sellerId ? String(sellerId) : 'Activa'}
                  </span>
                </div>

                {connectedAt && (
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider block">
                      Fecha de Sincronización
                    </span>
                    <span className="text-xs font-bold text-slate-200">
                      {new Date(connectedAt).toLocaleDateString('es-AR', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Informative block */}
              <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-black text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Cobros Online Habilitados</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  Las agencias y comercios pueden contratar o renovar sus planes (Base, Premium, Súper Premium) abonando con tarjeta o saldo en Mercado Pago con acreditación inmediata.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleRunTestPayment}
                  disabled={testingPayment}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{testingPayment ? 'Generando checkout...' : 'Probar Checkout de $10 ARS'}</span>
                </button>

                <a
                  href={authUrl || '#'}
                  className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reconectar con OAuth</span>
                </a>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                  className="inline-flex items-center gap-2 bg-rose-500/25 hover:bg-rose-500/40 text-rose-200 border border-rose-400/40 px-4 py-2.5 rounded-xl text-xs font-black transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Unplug className="w-3.5 h-3.5" />
                  <span>{disconnecting ? 'Desconectando...' : 'Desconectar Cuenta'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 border border-white/15 rounded-2xl p-5 sm:p-6 space-y-5 backdrop-blur-md">
              <div className="space-y-2">
                <h4 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Sincronizá tu cuenta en 1 paso</span>
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  Al conectar tu cuenta, se activará el botón oficial de pago con Mercado Pago en la sección de planes y en los paneles de clientes para cobrar de forma automática.
                </p>
              </div>

              {/* Botón OAuth oficial */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                <a
                  href={authUrl || '#'}
                  className="inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white px-7 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-purple-950/40 transition-all active:scale-95 cursor-pointer border border-violet-400/40 text-center"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Conectar Cuenta con Mercado Pago (OAuth)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowManualInput(!showManualInput)}
                  className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs border border-white/15 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-300" />
                  <span>{showManualInput ? 'Ocultar conexión por Token' : 'O conectar con Access Token'}</span>
                </button>
              </div>

              {/* Conexión manual con Access Token */}
              {showManualInput && (
                <form onSubmit={handleManualConnect} className="p-4 rounded-2xl bg-black/40 border border-white/15 space-y-3 animate-fadeIn">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-200">
                      Access Token de Producción (APP_USR-...):
                    </label>
                    <p className="text-[11px] text-slate-400">
                      Lo podés obtener de la sección "Credenciales de producción" en tu cuenta de Mercado Pago Developers.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="password"
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      placeholder="APP_USR-5679645126166390-..."
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="submit"
                      disabled={connectingManual || !manualToken.trim()}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
                    >
                      {connectingManual ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                      <span>Vincular Token</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Integration details */}
        <div className="bg-black/35 border border-white/15 rounded-2xl p-5 space-y-3.5 flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              <span>Detalles de la Pasarela</span>
            </span>
            <div className="space-y-2 text-[11px] text-slate-300 leading-relaxed font-medium">
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400">Client ID Oficial:</span>
                <span className="font-mono font-bold text-amber-300">{MP_MARKETPLACE_CONFIG.clientId}</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-slate-400">Estado de Pasarela:</span>
                <span className="font-bold text-emerald-400">Activa y Verificada</span>
              </div>
            </div>

            <div className="pt-2 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 block">
                URL de Retorno Autorizada (Redirect URI):
              </span>
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-white/15 text-[10px] font-mono break-all text-violet-200 flex items-center justify-between gap-2">
                <span className="truncate">{callbackUrl || 'Cargando...'}</span>
                <button
                  type="button"
                  onClick={copyCallbackToClipboard}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copiar URL de Retorno"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-slate-400 leading-normal border-t border-white/10">
            Asegurate de que esta URL esté agregada en los Redirect URLs de tu aplicación en el portal de desarrolladores de Mercado Pago.
          </div>
        </div>

      </div>
    </div>
  );
}
