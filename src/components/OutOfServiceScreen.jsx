import React, { useState } from 'react';

export default function OutOfServiceScreen({ config, onUnlock }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [keyError, setKeyError] = useState(false);

  const handleDevUnlock = (e) => {
    e.preventDefault();
    if (inputKey.trim() === config.BYPASS_SECRET_KEY) {
      sessionStorage.setItem('sa_dev_bypass', config.BYPASS_SECRET_KEY);
      if (onUnlock) {
        onUnlock();
      } else {
        window.location.reload();
      }
    } else {
      setKeyError(true);
      setTimeout(() => setKeyError(false), 2500);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] text-slate-100 flex flex-col justify-center items-center relative overflow-hidden select-none p-6 font-sans">
      {/* Resplandor sutil de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-b from-amber-500/10 via-rose-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Contenido único central */}
      <div className="text-center z-10 px-4">
        <h1
          onClick={() => setShowPrompt((prev) => !prev)}
          className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white uppercase cursor-default transition-transform hover:scale-[1.01]"
        >
          {config.TITLE || 'Fuera de servicio'}
        </h1>
      </div>

      {/* Modal discreto de acceso para ti (aparece al hacer clic en el texto o si usas ?dev_access=kevdev en la URL) */}
      {showPrompt && (
        <form
          onSubmit={handleDevUnlock}
          className="absolute bottom-8 p-3 bg-slate-900/95 border border-slate-800 rounded-xl shadow-2xl flex gap-2 items-center z-20 animate-in fade-in"
        >
          <input
            type="password"
            placeholder="Clave de acceso..."
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            autoFocus
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => setShowPrompt(false)}
            className="px-2 py-1.5 text-slate-500 hover:text-slate-300 text-xs"
          >
            ✕
          </button>
          {keyError && <span className="text-rose-400 text-xs ml-1">Clave incorrecta</span>}
        </form>
      )}
    </div>
  );
}
