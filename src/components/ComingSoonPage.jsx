import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Building2, 
  Wrench, 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Zap, 
  Eye, 
  ChevronRight,
  PhoneCall
} from 'lucide-react';

export default function ComingSoonPage({ onGoToInicio }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Contador o tiempo regresivo simulado para darle dinamicidad
  const [timeLeft, setTimeLeft] = useState({
    days: 12,
    hours: 8,
    minutes: 45,
    seconds: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    try {
      const existing = localStorage.getItem('sa_newsletter_subscribers');
      const list = existing ? JSON.parse(existing) : [];
      if (!list.includes(email)) {
        list.push(email);
        localStorage.setItem('sa_newsletter_subscribers', JSON.stringify(list));
      }
    } catch (err) {
      console.warn('Err saving email:', err);
    }

    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 flex flex-col relative overflow-hidden font-sans selection:bg-[#6D28D9] selection:text-white">
      
      {/* Background Racing Pattern & Gradient Glows */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='36' height='36' viewBox='0 0 36 36' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h18v18H0V0zm18 18h18v18H18V18z' fill='%238B5CF6' fill-opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '32px 32px'
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-purple-900/30 via-indigo-900/10 to-transparent blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center">
          {!logoError ? (
            <img
              src="/logofrase.png"
              alt="Sitio Automotor"
              onError={() => setLogoError(true)}
              className="h-14 sm:h-[62px] w-auto object-contain drop-shadow-xl"
            />
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6D28D9] to-[#8B5CF6] flex items-center justify-center font-black text-white text-xl shadow-lg shadow-purple-900/50">
                SA
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-white">
                  SITIO <span className="text-[#8B5CF6]">AUTOMOTOR</span>
                </span>
                <span className="text-[10px] tracking-widest text-slate-400 font-bold uppercase -mt-1">
                  TODO EL MUNDO AUTOMOTOR EN UN SOLO SITIO
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Acceso para Desarrolladores / Equipo */}
        <button
          onClick={onGoToInicio}
          className="group px-4 py-2.5 rounded-2xl bg-slate-900/80 hover:bg-[#6D28D9] border border-purple-500/30 hover:border-purple-400 text-slate-200 hover:text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg cursor-pointer"
          title="Ver versión completa en desarrollo"
        >
          <Eye className="w-4 h-4 text-purple-400 group-hover:text-white transition-colors" />
          <span className="hidden sm:inline">Ver sitio web (/inicio)</span>
          <span className="sm:hidden">Ingresar</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </button>
      </header>

      {/* Hero Body Content */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center max-w-5xl mx-auto px-6 py-12 text-center">
        
        {/* Badge de Próximamente */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-950/70 border border-purple-500/40 text-purple-300 font-extrabold text-xs tracking-wider uppercase mb-8 shadow-xl shadow-purple-950/40 animate-pulse">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Lanzamiento Oficial Próximamente • sitioautomotor.com.ar</span>
        </div>

        {/* Headline Principal */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl">
          El Portal Automotor <br className="hidden sm:inline" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-violet-200 to-indigo-400">
            Más Completo de la Región
          </span> está en camino.
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl font-normal leading-relaxed">
          Estamos construyendo la plataforma definitiva para comprar y vender <strong className="text-white">autos, motos, náutica y pesados</strong>, además de conectar con agencias y servicios automotrices en un solo lugar.
        </p>

        {/* Reloj Contador de Lanzamiento */}
        <div className="mt-10 grid grid-cols-4 gap-3 sm:gap-6 max-w-xl w-full">
          {[
            { label: 'Días', value: timeLeft.days },
            { label: 'Horas', value: timeLeft.hours },
            { label: 'Minutos', value: timeLeft.minutes },
            { label: 'Segundos', value: timeLeft.seconds }
          ].map((item, idx) => (
            <div 
              key={idx} 
              className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-lg rounded-2xl p-3 sm:p-4 text-center shadow-xl shadow-purple-950/20"
            >
              <div className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {String(item.value).padStart(2, '0')}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-purple-400 mt-1">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* Formulario de Notificación por Email */}
        <div className="mt-10 max-w-md w-full">
          {!submitted ? (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Tu correo electrónico..."
                  required
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#6D28D9] to-[#7C3AED] hover:from-[#5B21B6] hover:to-[#6D28D9] text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all shadow-lg shadow-purple-900/50 border border-purple-400/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Avisarme</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-purple-950/80 border border-purple-500/50 text-purple-200 flex items-center justify-center gap-3 animate-fade-in shadow-xl">
              <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-left">
                ¡Gracias! Te avisaremos por email apenas abramos las puertas de Sitio Automotor.
              </span>
            </div>
          )}
        </div>

        {/* Feature Cards Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          
          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md hover:border-purple-500/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <Car className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Marketplace Completo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Catálogo masivo de autos, camionetas, motos, utilitarios y vehículos náuticos con filtros avanzados por precio, marca y año.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md hover:border-purple-500/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Red de Concesionarias</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Las mejores agencias verificadas de la región reunidas en un solo espacio con showrooms virtuales y stock actualizado.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md hover:border-purple-500/40 transition-all group shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Guía de Servicios</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Encontrá talleres mecánicos, casas de repuestos, lubricentros, detailing, grúas y seguros en tu zona.
            </p>
          </div>

        </div>

        {/* Banner para Agencias y Vendedores pioneros */}
        <div className="mt-12 w-full p-6 rounded-3xl bg-gradient-to-r from-purple-950/90 via-slate-900 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-left shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-400/40 flex items-center justify-center text-purple-300 flex-shrink-0">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">¿Sos agencia, concesionaria o taller automotor?</h4>
              <p className="text-xs text-slate-300">Sumate como socio pionero antes del lanzamiento oficial y obtené beneficios exclusivos.</p>
            </div>
          </div>
          <a
            href="https://wa.me/5493434556677?text=Hola,%20quisiera%20registrar%20mi%20agencia%20o%20servicio%20en%20SitioAutomotor.com.ar"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <span>Contacto WhatsApp</span>
          </a>
        </div>

      </main>

      {/* Footer minimalista */}
      <footer className="relative z-10 border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} <strong className="text-white">sitioautomotor.com.ar</strong> • Todos los derechos reservados.
          </div>
          
          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={onGoToInicio}
              className="text-purple-400 hover:text-purple-300 underline underline-offset-4 cursor-pointer"
            >
              Acceso a desarrollo (/inicio)
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
