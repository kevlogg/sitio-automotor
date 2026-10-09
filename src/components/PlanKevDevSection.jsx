import React, { useState } from 'react';
import { 
  Zap, Database, CreditCard, Activity, TrendingUp, CheckCircle2, 
  Info, ExternalLink, Code, Layers, RefreshCw, RefreshCcw
} from 'lucide-react';

export default function PlanKevDevSection() {
  const [activeTab, setActiveTab] = useState('estado');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#00388A] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative z-10 flex-1 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-900/50 border border-blue-500/30 text-[10px] font-black text-blue-300 uppercase tracking-wider w-fit">
            <Code className="w-3.5 h-3.5" /> Desarrollador Oficial • KevDev
          </div>
          <h2 className="text-3xl font-black text-white">Plan KevDev & Acuerdo Técnico</h2>
          <p className="text-blue-100/90 text-sm md:text-base max-w-3xl leading-relaxed font-medium">
            Gestión transparente del abono mensual, matriz de escalabilidad técnica por cantidad de comercios, soporte SLA y control de pagos sincronizado con Firebase KevDev.
          </p>
          
          <div className="flex flex-wrap gap-2 pt-4">
            <button onClick={() => setActiveTab('estado')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'estado' ? 'bg-white text-[#00388A] shadow-lg shadow-black/10' : 'bg-[#002660] text-blue-200 hover:bg-[#002B6D]'
              }`}>
              <Activity className="w-4 h-4" /> Estado & Plan Activo
            </button>
            <button onClick={() => setActiveTab('matriz')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'matriz' ? 'bg-white text-[#00388A] shadow-lg shadow-black/10' : 'bg-[#002660] text-blue-200 hover:bg-[#002B6D]'
              }`}>
              <Layers className="w-4 h-4" /> Matriz de Inversión & Tramos
            </button>
            <button onClick={() => setActiveTab('historial')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'historial' ? 'bg-white text-[#00388A] shadow-lg shadow-black/10' : 'bg-[#002660] text-blue-200 hover:bg-[#002B6D]'
              }`}>
              <CreditCard className="w-4 h-4" /> Historial de Pagos
            </button>
          </div>
        </div>

        <div className="relative z-10 flex-shrink-0">
          <div className="bg-[#002660]/80 backdrop-blur-md border border-[#0047B3] rounded-2xl p-5 text-center shadow-2xl">
            <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">
              Plan Activo: Tramo 1
            </div>
            <div className="text-4xl font-black text-white flex items-end justify-center gap-1">
              $39.000 <span className="text-sm text-blue-300 font-bold mb-1">ARS/mes</span>
            </div>
            <div className="text-xs text-blue-200 font-bold mt-2 pt-2 border-t border-[#0047B3]">
              Modalidad 1: Abono Mensual
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'estado' && <TabEstado />}
        {activeTab === 'matriz' && <TabMatriz />}
        {activeTab === 'historial' && <TabHistorial />}
      </div>
    </div>
  );
}

function TabEstado() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {/* Card 1 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
            <Zap className="w-5 h-5 text-teal-500" />
          </div>
          <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-[10px] font-black">ACTIVO</span>
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">TRAMO DE CAPACIDAD</div>
        <h3 className="text-2xl font-black text-slate-900 mb-3">Tramo 1: Semilla</h3>
        <p className="text-sm text-slate-600 mb-6 flex-1">
          Suscripción actual para inicio ágil con hasta <strong>15 comercios</strong> activos.
        </p>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-500 font-bold">Capacidad Máxima:</span>
          <span className="text-blue-700 font-black">15 Comercios</span>
        </div>
      </div>

      {/* Card 2 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <span className="text-blue-500 font-black text-xl">$</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black">MENSUAL</span>
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ABONO VIGENTE</div>
        <div className="text-2xl font-black text-slate-900 mb-3 flex items-end gap-1">
          $39.000 ARS <span className="text-sm text-slate-500 font-bold mb-1">/ mes</span>
        </div>
        <p className="text-sm text-slate-600 mb-6 flex-1">
          Setup inicial bonificado de <strong>$39.000 ARS</strong> (cubre mes 1 de operación).
        </p>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-500 font-bold">Setup Inicial:</span>
          <span className="text-emerald-600 font-black">BONIFICADO ($0)</span>
        </div>
      </div>

      {/* Card 3 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-500" />
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black">PRÓXIMO TRAMO</span>
        </div>
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">ESCALA FUTURA</div>
        <h3 className="text-2xl font-black text-slate-900 mb-3">Tramo 2: Crecimiento</h3>
        <p className="text-sm text-slate-600 mb-6 flex-1">
          Al superar los 15 comercios (16 a 40), el abono pasa automáticamente a <strong>$68.000 ARS/mes</strong>.
        </p>
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-sm">
          <span className="text-slate-500 font-bold">Recaudación Estimada:</span>
          <span className="text-slate-900 font-black">$800.000 ARS / mes</span>
        </div>
      </div>
    </div>
  );
}

function TabMatriz() {
  const tramos = [
    {
      id: 1, name: 'Semilla', limits: 'Hasta 15 comercios', isCurrent: true,
      recaudacion: '$300.000 ARS / mes', margen: '84%',
      abono: '$39.000 ARS / mes', abonoSub: '$39.000 ARS (Bonificado)',
      licencia: '$336.000 ARS', anual: '$96.000 ARS / año'
    },
    {
      id: 2, name: 'Crecimiento', limits: '16 a 40 comercios',
      recaudacion: '$800.000 ARS / mes', margen: '89%',
      abono: '$68.000 ARS / mes', abonoSub: '',
      licencia: '+$208.000 ARS', licenciaSub: '(Acum. $544k)', anual: '$152.000 ARS / año'
    },
    {
      id: 3, name: 'Expansión', limits: '41 a 80 comercios',
      recaudacion: '$1.600.000 ARS / mes', margen: '91%',
      abono: '$112.000 ARS / mes', abonoSub: '(Tope Abono)',
      licencia: '+$304.000 ARS', licenciaSub: '(Acum. $848k)', anual: '$224.000 ARS / año'
    },
    {
      id: 4, name: 'Escala Regional', limits: '81 a 200 comercios',
      recaudacion: '$4.000.000 ARS / mes', margen: 'Facturación Masiva',
      abono: 'Exclusivo Licencia Perpetua', abonoSub: '',
      licencia: '+$520.000 ARS', licenciaSub: '(Acum. $1.368k)', anual: '$360.000 ARS / año'
    },
    {
      id: 5, name: 'Consolidación', limits: '201 a 500 comercios',
      recaudacion: '$10.000.000 ARS / mes', margen: 'Líder Regional',
      abono: 'Exclusivo Licencia Perpetua', abonoSub: '',
      licencia: '+$1.000.000 ARS', licenciaSub: '(Acum. $2.368k)', anual: '$680.000 ARS / año'
    },
    {
      id: 6, name: 'Macro Provincial', limits: '501 a 1.000 comercios',
      recaudacion: '$20.000.000 ARS / mes', margen: 'Portal Referente',
      abono: 'Exclusivo Licencia Perpetua', abonoSub: '',
      licencia: '+$1.560.000 ARS', licenciaSub: '(Acum. $3.928k)', anual: '$1.280.000 ARS / año'
    }
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">Matriz Maestra de Inversión & Escala Provincial</h3>
          <p className="text-xs text-slate-500 mt-1">
            Estructurada en Modalidad 1 (Abono Mensual hasta 80 comercios) y Modalidad 2 (Licencia Perpetua hasta 1.000 comercios).
          </p>
        </div>
        <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-[10px] font-black flex items-center gap-1 flex-shrink-0">
          <Activity className="w-3.5 h-3.5" /> Escalabilidad Garantizada
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-left border-collapse">
          <thead>
            <tr className="bg-[#0F172A] text-white">
              <th className="px-4 py-3 rounded-tl-xl text-[10px] font-black uppercase tracking-wider">Tramo / Capacidad</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider">Recaudación Estimada Cliente</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider">Modalidad 1: Abono Mensual</th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-wider">Modalidad 2: Licencia Perpetua</th>
              <th className="px-4 py-3 rounded-tr-xl text-[10px] font-black uppercase tracking-wider">Renovación Anual (Año 2+)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tramos.map((t) => (
              <tr key={t.id} className={t.isCurrent ? 'bg-teal-50/50' : 'hover:bg-slate-50 transition-colors'}>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-900">Tramo {t.id}: {t.name}</span>
                    {t.isCurrent && <span className="px-2 py-0.5 rounded bg-teal-500 text-white text-[9px] font-black">ACTUAL</span>}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">{t.limits}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-bold text-slate-900">{t.recaudacion}</div>
                  <div className="text-xs text-emerald-600 font-bold mt-0.5">Margen: {t.margen}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-bold text-slate-900">{t.abono}</div>
                  {t.abonoSub && (
                    <div className={t.isCurrent ? "text-xs text-slate-400 line-through mt-0.5" : "text-xs text-slate-500 mt-0.5"}>
                      {t.abonoSub}
                    </div>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-bold text-slate-900">{t.licencia}</div>
                  {t.licenciaSub && <div className="text-xs text-slate-500 mt-0.5">{t.licenciaSub}</div>}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-bold text-slate-900">{t.anual}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-3">
          <Database className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-blue-900">Lógica Financiera:</strong> Cada upgrade de capacidad representa menos del <strong>10% de un solo mes</strong> de facturación del titular. La modalidad de pago único garantiza propiedad total del software de por vida sin comisiones ocultas.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 flex gap-3">
          <RefreshCcw className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-amber-900">Ajuste de Valores (IPC):</strong> Todos los valores acordados (abonos mensuales, upgrades de tramo y renovaciones) se ajustan semestralmente según la variación oficial del <strong>Índice de Precios al Consumidor (IPC)</strong> de servicios.
          </p>
        </div>
      </div>
    </div>
  );
}

function TabHistorial() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900">Historial de Pagos & Estado de Cuenta</h3>
          <p className="text-xs text-slate-500 mt-1">
            Sincronizado en tiempo real con la base de datos de KevDev
          </p>
        </div>
        <div className="flex items-center gap-3">
          <RefreshCw className="w-4 h-4 text-slate-400" />
          <div className="px-3 py-1.5 rounded-lg bg-[#006633] text-white text-[10px] font-black flex items-center gap-1.5 shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Conectado a Firebase KevDev
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Ref. / Periodo</th>
              <th className="py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Concepto</th>
              <th className="py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Monto</th>
              <th className="py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Vencimiento</th>
              <th className="py-3 text-[10px] font-black text-slate-500 uppercase tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr>
              <td className="py-4">
                <div className="text-xs font-black text-blue-700">2026-09-18</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">8s1HuHDM5QlZybyf6BhL</div>
              </td>
              <td className="py-4 text-xs font-bold text-slate-700">
                Cuota Mensual
              </td>
              <td className="py-4 text-xs font-black text-slate-900">
                $39.000 ARS
              </td>
              <td className="py-4 text-xs font-medium text-slate-600">
                2026-09-18
              </td>
              <td className="py-4">
                <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-[9px] font-black flex items-center gap-1 w-fit">
                  <CheckCircle2 className="w-3 h-3" /> AL DÍA / PAGADO
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
