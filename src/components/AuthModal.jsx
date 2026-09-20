import React, { useState } from 'react';
import { X, Lock, Mail, User, Phone, MapPin, Building2, Wrench, Car, ArrowRight, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'signup' }) {
  const [mode, setMode] = useState(initialMode); // 'login' | 'signup'
  const [userType, setUserType] = useState('particular'); // 'particular' | 'agencia' | 'negocio_automotor'
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phoneWhatsApp: '',
    city: 'Buenos Aires',
    province: 'CABA',
    businessName: '',
    rubro: 'talleres',
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Intentar obtener el perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();

      setSuccessMsg('¡Sesión iniciada correctamente!');
      setTimeout(() => {
        onAuthSuccess({
          user: data.user,
          profile: profile || {
            id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name || 'Usuario',
            user_type: data.user.user_metadata?.user_type || 'particular',
          },
        });
        onClose();
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales inválidas. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const metadata = {
        user_type: userType,
        full_name: formData.fullName,
        phone_whatsapp: formData.phoneWhatsApp,
        city: formData.city,
        province: formData.province,
        business_name: userType !== 'particular' ? formData.businessName : undefined,
        rubro: userType === 'negocio_automotor' ? formData.rubro : undefined,
      };

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: { data: metadata },
      });

      if (error) throw error;

      if (data.user) {
        // Upsert en la tabla profiles
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: formData.email,
          full_name: formData.fullName,
          user_type: userType,
          phone_whatsapp: formData.phoneWhatsApp,
          city: formData.city,
          province: formData.province,
          business_name: formData.businessName || null,
          rubro: formData.rubro || null,
        });

        // Si es un negocio automotor, también lo registramos en services_directory
        if (userType === 'negocio_automotor' && formData.businessName) {
          await supabase.from('services_directory').insert([{
            rubro_id: formData.rubro,
            name: formData.businessName,
            city: formData.city,
            province: formData.province,
            whatsapp: formData.phoneWhatsApp,
            verified: true,
          }]);
        }

        setSuccessMsg('¡Cuenta creada exitosamente! Bienvenido a Sitio Automotor.');
        setTimeout(() => {
          onAuthSuccess({
            user: data.user,
            profile: {
              id: data.user.id,
              email: formData.email,
              full_name: formData.fullName,
              user_type: userType,
              phone_whatsapp: formData.phoneWhatsApp,
              business_name: formData.businessName,
              rubro: formData.rubro,
            },
          });
          onClose();
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div
        className="relative w-full max-w-xl rounded-3xl bg-[#0F172A] border border-slate-800 shadow-2xl overflow-hidden my-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-[#1E293B]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#6D28D9] to-purple-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'login' ? 'Accedé a tu panel de publicaciones y favoritos' : 'Seleccioná tu tipo de cuenta para registrarte'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Mode Switcher */}
        <div className="flex border-b border-slate-800 bg-slate-900/80 p-1.5 gap-2">
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
              mode === 'signup'
                ? 'bg-[#6D28D9] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Crear Cuenta Nueva
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs transition-all ${
              mode === 'login'
                ? 'bg-[#6D28D9] text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Ya tengo cuenta — Ingresar
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* MODO SIGNUP */}
          {mode === 'signup' ? (
            <form onSubmit={handleSignUp} className="space-y-5">
              {/* Selector de Tipo de Usuario */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  ¿Cómo vas a operar en el sitio? *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'particular', label: 'Particular', sub: 'Comprar / Vender mi auto', icon: Car, color: 'border-blue-500 bg-blue-950/40 text-blue-300' },
                    { id: 'agencia', label: 'Agencia', sub: 'Concesionaria o Stock', icon: Building2, color: 'border-purple-500 bg-purple-950/40 text-purple-300' },
                    { id: 'negocio_automotor', label: 'Negocio', sub: 'Talleres, repuestos, etc.', icon: Wrench, color: 'border-amber-500 bg-amber-950/40 text-amber-300' },
                  ].map((item) => {
                    const IconComp = item.icon;
                    const isSelected = userType === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setUserType(item.id)}
                        className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                          isSelected
                            ? `${item.color} shadow-lg ring-2 ring-purple-500/50 scale-[1.02]`
                            : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <IconComp className="w-4 h-4" />
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                        </div>
                        <div>
                          <span className="text-xs font-black block leading-tight">{item.label}</span>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{item.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Campos dinámicos del formulario */}
              <div className="space-y-3 pt-2">
                {/* Nombre de contacto o agencia */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tu Nombre Completo *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="Ej. Martín González"
                        value={formData.fullName}
                        onChange={(e) => handleChange('fullName', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp de Contacto *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="tel"
                        required
                        placeholder="Ej. 5491134567890"
                        value={formData.phoneWhatsApp}
                        onChange={(e) => handleChange('phoneWhatsApp', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Si es Agencia o Negocio Automotor: Nombre de Fantasía */}
                {userType !== 'particular' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        {userType === 'agencia' ? 'Nombre de la Agencia *' : 'Nombre del Negocio *'}
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          placeholder={userType === 'agencia' ? 'Ej. Mendoza Automotores' : 'Ej. Taller El Rayo'}
                          value={formData.businessName}
                          onChange={(e) => handleChange('businessName', e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    {userType === 'negocio_automotor' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Rubro Principal *</label>
                        <select
                          value={formData.rubro}
                          onChange={(e) => handleChange('rubro', e.target.value)}
                          className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none cursor-pointer"
                        >
                          <option value="repuestos">Repuestos</option>
                          <option value="accesorios">Accesorios</option>
                          <option value="gomerias">Gomerías y neumáticos</option>
                          <option value="talleres">Talleres mecánicos</option>
                          <option value="lubricentros">Lubricentros</option>
                          <option value="electricidad">Electricidad</option>
                          <option value="chapa-pintura">Chapa y pintura</option>
                          <option value="detailing">Detailing y lavaderos</option>
                          <option value="seguros">Seguros</option>
                          <option value="financiacion">Financiación</option>
                          <option value="gruas">Grúas y auxilio</option>
                          <option value="gestorias">Gestorías</option>
                        </select>
                      </div>
                    )}
                  </div>
                )}

                {/* Ubicación */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Ciudad *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Rosario"
                      value={formData.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Provincia *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Santa Fe"
                      value={formData.province}
                      onChange={(e) => handleChange('province', e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Email y Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="email"
                        required
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => handleChange('password', e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Registro */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creando cuenta en Supabase...</span>
                  </>
                ) : (
                  <>
                    <span>Registrarse como {userType === 'particular' ? 'Particular' : userType === 'agencia' ? 'Agencia' : 'Negocio'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* MODO LOGIN */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Correo Electrónico</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="tu@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#6D28D9] hover:bg-[#5B21B6] text-white font-extrabold text-xs shadow-lg shadow-purple-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verificando credenciales...</span>
                  </>
                ) : (
                  <>
                    <span>Ingresar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
