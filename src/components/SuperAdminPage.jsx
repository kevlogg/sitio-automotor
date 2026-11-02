/**
 * SuperAdminPage.jsx — Panel de Administración Total
 *
 * TODAS las secciones conectadas a Supabase real:
 *   ✅ Dashboard   → profiles, vehicles, plan_payment_requests, leads
 *   ✅ Usuarios    → profiles (CRUD completo)
 *   ✅ Pagos       → plan_payment_requests + profiles (aprobar/rechazar)
 *   ✅ Vehículos   → vehicles (ver todos, pausar, eliminar)
 *   ✅ Hero/Banner → site_settings (key: 'hero_image_url') + Storage
 *   ✅ Negocios    → services_directory (verificar, eliminar)
 *   ✅ Leads       → leads LEFT JOIN vehicles
 *   ✅ Config      → site_settings (banco, contacto, instrucciones)
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, Car, CreditCard, Image, Wrench,
  MessageSquare, Settings, LogOut, ArrowLeft, Shield, ShieldCheck,
  CheckCircle2, XCircle, Clock, Loader2, Search, Eye,
  Edit3, Trash2, RefreshCw, TrendingUp, TrendingDown,
  AlertCircle, ChevronDown, ChevronUp, Upload, ExternalLink,
  Building2, MapPin, Phone, Mail, Ban, Check, Zap,
  BarChart3, Activity, DollarSign, UserCheck, FileText,
  Globe, Bell, Lock, EyeOff, Save, Plus, ArrowUp, ArrowDown,
  ChevronLeft, ChevronRight, Layers, ArrowRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PLAN_INFO } from '../lib/planUtils';
import PlanKevDevSection from './PlanKevDevSection';
import PlansManager from './superadmin/PlansManager';

// ── SuperAdmin Emails ────────────────────────────────────────────────────────
const SUPER_ADMIN_EMAILS = [
  'loggia.1996@gmail.com',
  'admin@sitioautomotor.com',
  'kevdev@sitioautomotor.com',
  'arielcariati@gmail.com',
  'gestioncobranzasbv@gmail.com',
];

// ── Estilos ──────────────────────────────────────────────────────────────────
const USER_TYPE_STYLES = {
  particular:       { label: 'Particular', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  agencia:          { label: 'Agencia',    color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  negocio_automotor:{ label: 'Negocio',   color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
};

const PLAN_STATUS_STYLES = {
  null:      { label: 'Sin plan',   color: 'bg-slate-700/50 text-slate-400 border-slate-600/30' },
  pending:   { label: 'Pendiente',  color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  active:    { label: 'Activo',     color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  rejected:  { label: 'Rechazado', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  cancelled: { label: 'Cancelado', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) => typeof n === 'number' ? n.toLocaleString('es-AR') : (n ?? '—');

const timeAgo = (dateStr) => {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d}d`;
};

const fmtDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString('es-AR', { day:'2-digit', month:'2-digit', year:'numeric' }) : '—';

// ── site_settings helpers ─────────────────────────────────────────────────────
async function getSetting(key) {
  const { data } = await supabase.from('site_settings').select('value').eq('id', key).maybeSingle();
  return data?.value ?? '';
}
async function setSetting(key, value) {
  await supabase.from('site_settings').upsert({ id: key, value, updated_at: new Date().toISOString() });
}

// ── Badge ────────────────────────────────────────────────────────────────────
function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${className}`}>
      {children}
    </span>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, color = 'violet' }) {
  const colorConfigs = {
    violet:  {
      bgIcon: 'bg-purple-100 text-[#6D28D9] border-purple-200/80',
      glow: 'hover:border-purple-300 hover:shadow-purple-500/10'
    },
    emerald: {
      bgIcon: 'bg-emerald-100 text-emerald-700 border-emerald-200/80',
      glow: 'hover:border-emerald-300 hover:shadow-emerald-500/10'
    },
    amber:   {
      bgIcon: 'bg-amber-100 text-amber-700 border-amber-200/80',
      glow: 'hover:border-amber-300 hover:shadow-amber-500/10'
    },
    blue:    {
      bgIcon: 'bg-blue-100 text-blue-700 border-blue-200/80',
      glow: 'hover:border-blue-300 hover:shadow-blue-500/10'
    },
    rose:    {
      bgIcon: 'bg-rose-100 text-rose-700 border-rose-200/80',
      glow: 'hover:border-rose-300 hover:shadow-rose-500/10'
    },
  };
  const cfg = colorConfigs[color] || colorConfigs.violet;
  return (
    <div className={`group bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md ${cfg.glow} transition-all duration-300 relative overflow-hidden`}>
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl border ${cfg.bgIcon} shadow-2xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          {value !== null && value !== undefined ? value : <Loader2 className="w-5 h-5 animate-spin text-slate-400 inline" />}
        </div>
        <div className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-wider">{label}</div>
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-100 text-[#6D28D9] border border-purple-200/80 shadow-2xs">
            <Icon className="w-5 h-5" />
          </div>
          {title}
        </h2>
        {sub && <p className="text-xs font-semibold text-slate-500 mt-1 ml-11">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── ReloadBtn ────────────────────────────────────────────────────────────────
function ReloadBtn({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-slate-900 text-xs font-extrabold transition-all shadow-xs hover:shadow-sm cursor-pointer disabled:opacity-50">
      <RefreshCw className={`w-3.5 h-3.5 text-[#6D28D9] ${loading ? 'animate-spin' : ''}`} />
      Recargar
    </button>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}

// =============================================================================
// SECTION 1: DASHBOARD
// =============================================================================
function SectionDashboard({ stats, loading, onRefresh }) {
  return (
    <div className="space-y-8">
      <SectionHeader icon={LayoutDashboard} title="Dashboard General"
        sub="Métricas globales del sitio en tiempo real"
        action={<ReloadBtn onClick={onRefresh} loading={loading} />} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users}      label="Usuarios Totales"    value={stats?.totalUsers}    color="blue" />
        <KpiCard icon={Car}        label="Vehículos"            value={stats?.totalVehicles} color="violet" />
        <KpiCard icon={CreditCard} label="Pagos Pendientes"     value={stats?.pendingPayments} color="amber" />
        <KpiCard icon={DollarSign} label="Ingresos Aprobados"
          value={stats?.estimatedRevenue != null ? `$${fmt(stats.estimatedRevenue)}` : null} color="emerald" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard icon={UserCheck}    label="Planes Activos"   value={stats?.activePlans}       color="emerald" />
        <KpiCard icon={Clock}        label="Solicitudes Pend." value={stats?.pendingRequests}  color="amber" />
        <KpiCard icon={MessageSquare}label="Leads WA"          value={stats?.totalLeads}        color="blue" />
        <KpiCard icon={Building2}    label="Agencias"          value={stats?.totalAgencias}     color="violet" />
        <KpiCard icon={Wrench}       label="Negocios"          value={stats?.totalNegocios}     color="amber" />
        <KpiCard icon={Activity}     label="Particulares"      value={stats?.totalParticulares} color="blue" />
      </div>

      {/* Barras de distribución */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#6D28D9]" /> Distribución de Usuarios
        </h3>
        {[
          { label: 'Particulares', val: stats?.totalParticulares, color: 'bg-blue-600' },
          { label: 'Agencias',     val: stats?.totalAgencias,     color: 'bg-purple-600' },
          { label: 'Negocios',     val: stats?.totalNegocios,     color: 'bg-amber-500' },
        ].map(({ label, val, color }) => {
          const pct = stats?.totalUsers > 0 ? Math.round(((val ?? 0) / stats.totalUsers) * 100) : 0;
          return (
            <div key={label} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-700 font-bold">{label}</span>
                <span className="text-slate-500 font-mono font-bold">{val ?? 0} ({pct}%)</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200/50">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado de pagos */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-600" /> Estado de Solicitudes de Pago
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pendientes',      val: stats?.pendingRequests,  color: 'text-amber-700',   bg: 'bg-amber-50/70 border-amber-200/80' },
            { label: 'Aprobados',       val: stats?.approvedRequests, color: 'text-emerald-700', bg: 'bg-emerald-50/70 border-emerald-200/80' },
            { label: 'Rechazados',      val: stats?.rejectedRequests, color: 'text-rose-700',    bg: 'bg-rose-50/70 border-rose-200/80' },
            { label: 'Total',           val: stats?.totalRequests,    color: 'text-blue-700',    bg: 'bg-blue-50/70 border-blue-200/80' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`rounded-xl border p-4 text-center ${bg} shadow-2xs`}>
              <div className={`text-2xl font-black ${color}`}>{val ?? 0}</div>
              <div className="text-xs text-slate-600 font-bold mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </div>
      </div>    </div>
  );
}

// =============================================================================
// SECTION 2: USUARIOS
// =============================================================================
function SectionUsuarios({ toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const activatePlan = async (userId, planKey) => {
    if (!planKey) return toast.show('Este usuario no tiene un plan seleccionado', 'error');
    setSaving(true);
    const now = new Date().toISOString();
    await supabase.from('profiles').update({ plan_status: 'active', current_plan: planKey, updated_at: now }).eq('id', userId);
    await supabase.from('plan_payment_requests').update({ status: 'approved', updated_at: now }).eq('user_id', userId).eq('status', 'pending');
    toast.show('✅ Plan activado');
    setSaving(false);
    fetch();
  };

  const rejectPlan = async (userId) => {
    setSaving(true);
    const now = new Date().toISOString();
    await supabase.from('profiles').update({ plan_status: 'rejected', updated_at: now }).eq('id', userId);
    await supabase.from('plan_payment_requests').update({ status: 'rejected', updated_at: now }).eq('user_id', userId).eq('status', 'pending');
    toast.show('Solicitud rechazada', 'error');
    setSaving(false);
    fetch();
  };

  const changeType = async (userId, newType) => {
    setSaving(true);
    await supabase.from('profiles').update({ user_type: newType, updated_at: new Date().toISOString() }).eq('id', userId);
    toast.show('Tipo de usuario actualizado');
    setSaving(false);
    fetch();
  };

  const cancelPlan = async (userId) => {
    setSaving(true);
    await supabase.from('profiles').update({ plan_status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', userId);
    toast.show('Plan cancelado');
    setSaving(false);
    fetch();
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchS = !q || [u.full_name, u.email, u.business_name, u.city].some(v => v?.toLowerCase().includes(q));
    const matchT = filterType === 'all' || u.user_type === filterType;
    const matchP = filterPlan === 'all' || u.plan_status === filterPlan || (filterPlan === 'none' && !u.plan_status);
    return matchS && matchT && matchP;
  });

  return (
    <div className="space-y-6">
      <SectionHeader icon={Users} title="Gestión de Usuarios"
        sub={`${filtered.length} de ${users.length} usuarios`}
        action={<ReloadBtn onClick={fetch} loading={loading} />} />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, email, negocio, ciudad..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none" />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-violet-500 focus:outline-none cursor-pointer">
          <option value="all">Todos los tipos</option>
          <option value="particular">Particular</option>
          <option value="agencia">Agencia</option>
          <option value="negocio_automotor">Negocio</option>
        </select>
        <select value={filterPlan} onChange={e => setFilterPlan(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-violet-500 focus:outline-none cursor-pointer">
          <option value="all">Todos los planes</option>
          <option value="none">Sin plan</option>
          <option value="pending">Pendiente</option>
          <option value="active">Activo</option>
          <option value="rejected">Rechazado</option>
          <option value="cancelled">Cancelado</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-center py-16 text-slate-500 text-sm">Sin resultados.</p>}
          {filtered.map(user => {
            const ts = USER_TYPE_STYLES[user.user_type] || USER_TYPE_STYLES.particular;
            const ps = PLAN_STATUS_STYLES[user.plan_status] || PLAN_STATUS_STYLES.null;
            const isExp = expanded === user.id;
            return (
              <div key={user.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden">
                <div className="flex items-center gap-3 p-4">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-700 flex items-center justify-center font-black text-white text-sm flex-shrink-0 overflow-hidden">
                    {user.avatar_url
                      ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      : (user.full_name?.charAt(0) || '?')}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-black text-white truncate">{user.full_name || 'Sin nombre'}</span>
                      <Badge className={ts.color}>{ts.label}</Badge>
                      <Badge className={ps.color}>{ps.label}</Badge>
                      {user.current_plan && (
                        <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/30">
                          {PLAN_INFO[user.current_plan]?.label || user.current_plan}
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-0.5 text-[10px] text-slate-400">
                      {user.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>}
                      {user.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.city}{user.province ? `, ${user.province}` : ''}</span>}
                      {user.phone_whatsapp && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone_whatsapp}</span>}
                      <span className="text-slate-600">{timeAgo(user.created_at)}</span>
                    </div>
                  </div>
                  {/* Acciones rápidas */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {user.plan_status === 'pending' && (
                      <>
                        <button onClick={() => activatePlan(user.id, user.current_plan)} disabled={saving}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button onClick={() => rejectPlan(user.id)} disabled={saving}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-[10px] font-black flex items-center gap-1 cursor-pointer border border-rose-500/30 transition-all disabled:opacity-50">
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </>
                    )}
                    <button onClick={() => setExpanded(isExp ? null : user.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer">
                      {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExp && (
                  <div className="border-t border-slate-800 p-5 space-y-4 bg-slate-900/40">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                      {[
                        { label: 'ID',          val: user.id,           mono: true },
                        { label: 'Negocio',     val: user.business_name },
                        { label: 'Rubro',       val: user.rubro },
                        { label: 'Dirección',   val: user.address },
                        { label: 'Web',         val: user.website_url,  link: true },
                        { label: 'Instagram',   val: user.instagram_url,link: true },
                        { label: 'Facebook',    val: user.facebook_url, link: true },
                        { label: 'Registrado',  val: fmtDate(user.created_at) },
                        { label: 'Actualizado', val: fmtDate(user.updated_at) },
                        { label: 'Horarios',    val: user.business_hours },
                      ].map(({ label, val, mono, link }) => (
                        <div key={label} className="space-y-0.5">
                          <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{label}</div>
                          {link && val
                            ? <a href={val} target="_blank" rel="noopener noreferrer" className={`text-blue-400 hover:underline ${mono ? 'font-mono text-[10px] break-all' : ''}`}>{val}</a>
                            : <div className={`text-white ${mono ? 'font-mono text-[10px] break-all' : ''}`}>{val || '—'}</div>}
                        </div>
                      ))}
                    </div>
                    {user.bio && (
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 text-xs text-slate-300">
                        <span className="text-[9px] font-bold text-slate-500 uppercase block mb-1">Bio</span>
                        {user.bio}
                      </div>
                    )}
                    {/* Información de Cuenta y Plan */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Tipo de cuenta:</span>
                          <span className="font-extrabold text-white">{USER_TYPE_STYLES[user.user_type]?.label || user.user_type}</span>
                        </div>
                        <div className="w-px h-3 bg-slate-800 hidden sm:block" />
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span className="text-[10px] uppercase font-bold text-slate-500">Plan:</span>
                          <span className="font-extrabold text-violet-300">
                            {user.current_plan ? (PLAN_INFO[user.current_plan]?.label || user.current_plan) : 'Sin plan contratado'}
                          </span>
                          <Badge className={PLAN_STATUS_STYLES[user.plan_status]?.color || PLAN_STATUS_STYLES.null.color}>
                            {PLAN_STATUS_STYLES[user.plan_status]?.label || 'Inactivo'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-500 italic">
                        🔒 El tipo de negocio y plan lo determina el pago registrado (gestionable en "Pagos / Planes").
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SECTION 3: PAGOS
// =============================================================================
function SectionPagos({ toast, initialSubTab = 'planes' }) {
  const [subTab, setSubTab] = useState(initialSubTab); // 'planes' | 'solicitudes'
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    if (initialSubTab) setSubTab(initialSubTab);
  }, [initialSubTab]);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('plan_payment_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { 
    fetch(); 

    // Suscripción en tiempo real para actualización inmediata de solicitudes
    const channel = supabase
      .channel('section_pagos_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'plan_payment_requests' },
        (payload) => {
          fetch();
          if (payload.eventType === 'INSERT' && payload.new?.status === 'pending') {
            toast.show(`🔔 ¡Nuevo aviso "Ya pagué" de ${payload.new.user_name || 'un usuario'} (${payload.new.plan_label || 'Plan'})!`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetch, toast]);

  const approve = async (req) => {
    setSaving(req.id);
    const now = new Date().toISOString();
    await supabase.from('plan_payment_requests').update({ status: 'approved', updated_at: now }).eq('id', req.id);
    
    const profileUpdate = {
      plan_status: 'active',
      current_plan: req.plan_key,
      updated_at: now,
    };
    // Si un particular contrató un plan de agencia, promoverlo automáticamente a agencia
    if (req.user_type === 'particular' && (req.plan_key === 'premium' || req.plan_key === 'super_premium')) {
      profileUpdate.user_type = 'agencia';
    }
    await supabase.from('profiles').update(profileUpdate).eq('id', req.user_id);
    toast.show(`✅ Pago confirmado y Plan "${req.plan_label}" activado para ${req.user_name}`);
    setSaving(null);
    fetch();
  };

  const reject = async (req) => {
    setSaving(req.id);
    const now = new Date().toISOString();
    await supabase.from('plan_payment_requests').update({ status: 'rejected', updated_at: now }).eq('id', req.id);
    await supabase.from('profiles').update({ plan_status: 'rejected', updated_at: now }).eq('id', req.user_id);
    toast.show('Solicitud rechazada', 'error');
    setSaving(null);
    fetch();
  };

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);
  const pendingCount = requests.filter(r => r.status === 'pending').length;

  const statusBadge = {
    pending:  'bg-amber-500/20 text-amber-300 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    rejected: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  return (
    <div className="space-y-6">
      {/* Sub-Tabs: Valores de Planes & MP vs Validación de Pagos */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setSubTab('planes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'planes'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5 text-amber-400" />
          <span>Valores de Planes & Mercado Pago</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab('solicitudes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            subTab === 'solicitudes'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Validación de Pagos</span>
          {pendingCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black animate-pulse">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {subTab === 'planes' ? (
        <PlansManager toast={toast} />
      ) : (
        <>
          <SectionHeader icon={CreditCard} title="Validación de Pagos"
            sub={`${pendingCount} solicitudes pendientes`}
            action={<ReloadBtn onClick={fetch} loading={loading} />} />

          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'pending',  label: 'Pendientes' },
              { key: 'approved', label: 'Aprobados' },
              { key: 'rejected', label: 'Rechazados' },
              { key: 'all',      label: 'Todos' },
            ].map(({ key, label }) => (
              <button key={key} onClick={() => setFilterStatus(key)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${filterStatus === key ? 'bg-violet-600 text-white' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
                {label} <span className="opacity-60 ml-1">({requests.filter(r => key === 'all' ? true : r.status === key).length})</span>
              </button>
            ))}
          </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <p className="text-center py-16 text-slate-500 text-sm">
              {filterStatus === 'pending' ? '🎉 No hay solicitudes pendientes.' : 'Sin registros en esta categoría.'}
            </p>
          )}
          {filtered.map(req => (
            <div key={req.id}
              className={`bg-[#0F172A] border rounded-2xl p-5 transition-all ${req.status === 'pending' ? 'border-amber-700/40 shadow-lg shadow-amber-950/20' : 'border-slate-800'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-white">{req.user_name || 'Sin nombre'}</span>
                    <Badge className={statusBadge[req.status] || 'bg-slate-700/50 text-slate-400'}>
                      {req.status === 'pending' ? '⏳ Pendiente' : req.status === 'approved' ? '✓ Aprobado' : '✗ Rechazado'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{req.user_email}</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" />{req.user_type}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-[11px]">
                    <span className="text-violet-300 font-bold flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      {req.plan_label} — ${fmt(req.plan_price)}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-[10px]">
                      {req.payment_method === 'ya_pague_transferencia' ? '🏛️ Aviso "Ya pagué" (Transferencia)' : req.payment_method?.replace(/_/g, ' ')}
                    </span>
                    <span className="text-slate-600">{timeAgo(req.created_at)}</span>
                  </div>
                  {req.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-800/80 text-[11px] text-slate-200 border border-slate-700/60 font-mono">
                      {req.notes}
                    </div>
                  )}
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => approve(req)} disabled={saving === req.id}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50"
                      title="Confirmar recepción del pago y activar plan para este usuario"
                    >
                      {saving === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      <span>Confirmar Pago y Activar</span>
                    </button>
                    <button onClick={() => reject(req)} disabled={saving === req.id}
                      className="px-5 py-2.5 rounded-xl bg-rose-600/30 border border-rose-500/30 hover:bg-rose-600/50 text-rose-300 text-xs font-black flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50">
                      <XCircle className="w-3.5 h-3.5" /> Rechazar
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}

// =============================================================================
// SECTION 4: VEHÍCULOS
// =============================================================================
function SectionVehiculos({ toast }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCat, setFilterCat] = useState('all');
  const [saving, setSaving] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    // Sin filtro de status para ver TODOS (superadmin bypass)
    const { data } = await supabase
      .from('vehicles')
      .select('*')
      .order('created_at', { ascending: false });
    setVehicles(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleStatus = async (v) => {
    const next = v.status === 'active' ? 'paused' : 'active';
    setSaving(v.id);
    await supabase.from('vehicles').update({ status: next }).eq('id', v.id);
    toast.show(`Vehículo ${next === 'active' ? 'activado' : 'pausado'}`);
    setSaving(null);
    fetch();
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar esta publicación permanentemente?')) return;
    setSaving(id);
    await supabase.from('vehicles').delete().eq('id', id);
    toast.show('Publicación eliminada');
    setSaving(null);
    fetch();
  };

  const filtered = vehicles.filter(v => {
    const q = search.toLowerCase();
    const ms = !q || [v.title, v.seller_name, v.brand, v.model].some(x => x?.toLowerCase().includes(q));
    const mst = filterStatus === 'all' || v.status === filterStatus;
    const mc = filterCat === 'all' || v.category === filterCat;
    return ms && mst && mc;
  });

  const statusColors = { active: 'bg-emerald-500', paused: 'bg-amber-500', sold: 'bg-slate-500' };

  return (
    <div className="space-y-6">
      <SectionHeader icon={Car} title="Moderación de Vehículos"
        sub={`${filtered.length} de ${vehicles.length} publicaciones`}
        action={<ReloadBtn onClick={fetch} loading={loading} />} />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar título, marca, modelo, vendedor..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-violet-500 focus:outline-none cursor-pointer">
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="paused">Pausados</option>
          <option value="sold">Vendidos</option>
        </select>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-violet-500 focus:outline-none cursor-pointer">
          <option value="all">Todas las categorías</option>
          <option value="autos">Autos</option>
          <option value="camionetas">Camionetas</option>
          <option value="motos">Motos</option>
          <option value="camiones">Camiones</option>
          <option value="nautica">Náutica</option>
          <option value="agro">Agro</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-center py-16 text-slate-500 text-sm">Sin publicaciones.</p>}
          {filtered.map(v => (
            <div key={v.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden flex">
              <div className="w-24 h-24 sm:w-32 sm:h-28 flex-shrink-0 relative">
                <img src={v.image_url} alt={v.title} className="w-full h-full object-cover" onError={e => { e.target.src = 'https://placehold.co/200x150?text=Sin+imagen'; }} />
                <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-black text-white ${statusColors[v.status] || 'bg-slate-600'}`}>
                  {v.status || 'active'}
                </div>
              </div>
              <div className="flex-1 p-4 min-w-0 flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-white line-clamp-1">{v.title}</h4>
                  <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-slate-400">
                    <span className="font-mono font-black text-violet-300">{v.formatted_price || `${v.price_currency} ${fmt(Number(v.price))}`}</span>
                    <span>{v.location}</span>
                    <span className="text-slate-600">{timeAgo(v.created_at)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-0.5 text-[10px] text-slate-500">
                    <span>{v.seller_name}</span>
                    <span>·</span>
                    <span>{v.category_label || v.category}</span>
                    <span>·</span>
                    <span>{v.year} · {v.mileage}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleStatus(v)} disabled={saving === v.id}
                    className={`p-2 rounded-xl transition-all cursor-pointer ${v.status === 'active' ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}`}
                    title={v.status === 'active' ? 'Pausar' : 'Activar'}>
                    {saving === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : v.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => remove(v.id)} disabled={saving === v.id}
                    className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 cursor-pointer transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SECTION 5: HERO / BANNER — conectado a Supabase site_settings (Carrusel Dinámico)
// =============================================================================
function SectionHero({ toast }) {
  const [slides, setSlides] = useState([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [loadingCurrent, setLoadingCurrent] = useState(true);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [urlInput, setUrlInput] = useState('');
  const [showAddUrl, setShowAddUrl] = useState(false);

  useEffect(() => {
    (async () => {
      setLoadingCurrent(true);
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('id, value')
          .in('id', ['hero_slides', 'hero_image_url', 'hero_link_url']);

        const slidesRow = data?.find(r => r.id === 'hero_slides');
        const imgRow = data?.find(r => r.id === 'hero_image_url');
        const linkRow = data?.find(r => r.id === 'hero_link_url');

        if (slidesRow?.value?.trim()) {
          try {
            const parsed = JSON.parse(slidesRow.value);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSlides(parsed);
              setLoadingCurrent(false);
              return;
            }
          } catch (e) {
            console.warn('Error parsing hero_slides:', e);
          }
        }

        if (imgRow?.value?.trim()) {
          setSlides([{
            id: 'legacy-1',
            imageUrl: imgRow.value.trim(),
            linkUrl: linkRow?.value?.trim() || ''
          }]);
        } else {
          setSlides([]);
        }
      } catch (err) {
        console.error('Error cargando configuración del Hero:', err);
      } finally {
        setLoadingCurrent(false);
      }
    })();
  }, []);

  // Subir una o varias imágenes en lote
  const handleMultipleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(`Preparando ${files.length} archivo(s)...`);
    try {
      const { uploadVehicleImage } = await import('../lib/supabase');
      const newSlides = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Subiendo imagen ${i + 1} de ${files.length}...`);
        const url = await uploadVehicleImage(file);
        if (url) {
          newSlides.push({
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            imageUrl: url,
            linkUrl: ''
          });
        }
      }

      setSlides(prev => [...prev, ...newSlides]);
      toast.show(`Se subieron ${newSlides.length} imágenes exitosamente. Guardá para aplicar los cambios.`);
    } catch (err) {
      toast.show('Error al subir imágenes: ' + err.message, 'error');
    } finally {
      setUploading(false);
      setUploadProgress('');
      e.target.value = '';
    }
  };

  // Agregar imagen mediante URL directa
  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setSlides(prev => [
      ...prev,
      {
        id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        imageUrl: trimmed,
        linkUrl: ''
      }
    ]);
    setUrlInput('');
    setShowAddUrl(false);
    toast.show('Imagen agregada. Recordá hacer clic en Guardar.');
  };

  const handleUpdateSlideLink = (index, newLink) => {
    setSlides(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], linkUrl: newLink };
      return copy;
    });
  };

  const handleMoveSlide = (index, direction) => {
    setSlides(prev => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
    if (previewIdx === index) {
      setPreviewIdx(index + direction);
    } else if (previewIdx === index + direction) {
      setPreviewIdx(index);
    }
  };

  const handleDeleteSlide = (index) => {
    setSlides(prev => {
      const filtered = prev.filter((_, i) => i !== index);
      if (previewIdx >= filtered.length) {
        setPreviewIdx(Math.max(0, filtered.length - 1));
      }
      return filtered;
    });
    toast.show('Diapositiva eliminada. Recordá guardar para aplicar.');
  };

  const handleSave = async () => {
    if (slides.length === 0) {
      return toast.show('Subí al menos una imagen antes de guardar', 'error');
    }
    setSaving(true);
    try {
      const primaryUrl = slides[0]?.imageUrl || '';
      const primaryLink = slides[0]?.linkUrl || '';
      const slidesJson = JSON.stringify(slides);

      await Promise.all([
        setSetting('hero_slides', slidesJson),
        setSetting('hero_image_url', primaryUrl),
        setSetting('hero_link_url', primaryLink),
      ]);

      localStorage.setItem('sa_hero_slides', slidesJson);
      localStorage.setItem('sa_hero_image_url', primaryUrl);
      localStorage.setItem('sa_hero_link_url', primaryLink);

      toast.show(`✅ Carrusel guardado con ${slides.length} diapositiva(s).`);
    } catch (err) {
      toast.show('Error al guardar carrusel: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    await Promise.all([
      setSetting('hero_slides', ''),
      setSetting('hero_image_url', ''),
      setSetting('hero_link_url', ''),
    ]);
    localStorage.removeItem('sa_hero_slides');
    localStorage.removeItem('sa_hero_image_url');
    localStorage.removeItem('sa_hero_link_url');
    setSlides([]);
    setPreviewIdx(0);
    toast.show('Hero restaurado al banner original por defecto.');
  };

  const activePreviewSlide = slides[previewIdx] || slides[0];

  return (
    <div className="space-y-6">
      <SectionHeader 
        icon={Image} 
        title="Banner Principal / Carrusel del Hero"
        sub="Subí varias imágenes para crear un carrusel dinámico. Podés ordenarlas y asignar enlaces de redirección independientes." 
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Columna Izquierda: Gestión y Subida de Imágenes */}
        <div className="xl:col-span-7 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-violet-400" />
              <span>Imágenes del Carrusel ({slides.length})</span>
            </h3>
            <button
              onClick={() => setShowAddUrl(!showAddUrl)}
              className="text-[11px] font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {showAddUrl ? 'Cancelar URL' : 'Agregar por URL'}
            </button>
          </div>

          {/* Formulario rápido para URL externa */}
          {showAddUrl && (
            <div className="p-3.5 bg-slate-900/90 border border-violet-500/30 rounded-xl space-y-2">
              <label className="text-[11px] font-bold text-slate-300">Pegar URL de la imagen:</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://ejemplo.com/banner.jpg"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-3.5 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>
          )}

          {/* Zona de Subida Múltiple */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">
              Subir imágenes desde tu dispositivo (podés seleccionar varias a la vez)
            </label>
            <label className="flex flex-col items-center justify-center gap-2 w-full py-6 px-4 rounded-2xl border-2 border-dashed border-slate-700 hover:border-violet-500/60 bg-slate-900/40 hover:bg-slate-900/70 cursor-pointer transition-all group">
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleMultipleUpload} 
                className="hidden" 
                disabled={uploading}
              />
              {uploading ? (
                <>
                  <Loader2 className="w-7 h-7 text-violet-400 animate-spin" />
                  <span className="text-xs text-violet-300 font-bold">{uploadProgress}</span>
                  <span className="text-[10px] text-slate-500">Por favor esperá mientras se suben a Supabase Storage...</span>
                </>
              ) : (
                <>
                  <div className="p-3 rounded-xl bg-violet-600/10 text-violet-400 group-hover:bg-violet-600/20 group-hover:text-violet-300 transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-slate-200 group-hover:text-white font-bold text-center">
                    Hacé clic para seleccionar una o varias imágenes
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium text-center">
                    Formatos recomendados: JPG, PNG o WebP. Podés arrastrar o seleccionar varios archivos juntos.
                  </span>
                </>
              )}
            </label>
          </div>

          {/* Lista de Diapositivas cargadas */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-300">
              Orden y Redirecciones de cada diapositiva
            </label>

            {loadingCurrent ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-4 justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-violet-400" /> Cargando diapositivas actuales...
              </div>
            ) : slides.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 text-center">
                No hay imágenes personalizadas. Se muestra el banner predeterminado. Subí imágenes arriba para activar el carrusel dinámico.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id || idx}
                    className={`p-3 rounded-xl border transition-all ${
                      previewIdx === idx 
                        ? 'bg-violet-950/20 border-violet-500/50 shadow-md shadow-violet-900/20' 
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      
                      {/* Miniatura con Badge */}
                      <div 
                        onClick={() => setPreviewIdx(idx)}
                        className="relative w-full sm:w-28 h-16 rounded-lg overflow-hidden bg-black/60 border border-slate-700/60 shrink-0 cursor-pointer group/thumb"
                        title="Hacé clic para previsualizar"
                      >
                        <img 
                          src={slide.imageUrl} 
                          alt={`Banner ${idx + 1}`} 
                          className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" 
                          onError={e => { e.currentTarget.src = '/hero_daylight_fleet.png'; }}
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[9px] font-bold text-white">
                          #{idx + 1}
                        </div>
                      </div>

                      {/* Configuración de Enlace */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-200">
                            {idx === 0 ? '🌟 Diapositiva Inicial' : `Diapositiva ${idx + 1}`}
                          </span>
                          {slide.linkUrl && (
                            <span className="text-[10px] text-violet-400 flex items-center gap-1">
                              <ExternalLink className="w-3 h-3" /> Redirige al clic
                            </span>
                          )}
                        </div>
                        <input
                          type="url"
                          value={slide.linkUrl || ''}
                          onChange={e => handleUpdateSlideLink(idx, e.target.value)}
                          placeholder="https://ejemplo.com/promocion (opcional al hacer clic)"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700/70 rounded-lg text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
                        />
                      </div>

                      {/* Acciones de Orden y Eliminación */}
                      <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(idx, -1)}
                          disabled={idx === 0}
                          title="Subir orden"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveSlide(idx, 1)}
                          disabled={idx === slides.length - 1}
                          title="Bajar orden"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSlide(idx)}
                          title="Eliminar diapositiva"
                          className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 hover:text-rose-200 border border-rose-500/20 transition-colors ml-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleSave}
              disabled={saving || slides.length === 0}
              className="flex-1 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-lg shadow-violet-900/30"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar Carrusel ({slides.length} diapositivas)
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all"
            >
              <RefreshCw className="w-4 h-4" /> Restablecer
            </button>
          </div>
        </div>

        {/* Columna Derecha: Vista Previa en Tiempo Real del Carrusel */}
        <div className="xl:col-span-5 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span>Vista Previa del Carrusel</span>
              </h3>
              {slides.length > 0 && (
                <span className="text-[11px] font-bold text-slate-400">
                  {previewIdx + 1} de {slides.length}
                </span>
              )}
            </div>

            {/* Simulación del Hero tal como se verá en la Home */}
            <div className="relative rounded-2xl overflow-hidden bg-[#0B0F19] border border-slate-700/60 shadow-xl group/preview">
              
              {/* Contenedor con brillo ambiental */}
              <div className="relative w-full min-h-[180px] sm:min-h-[220px] flex items-center justify-center overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-2xl opacity-25 scale-110 pointer-events-none"
                  style={{ 
                    backgroundImage: `url(${activePreviewSlide?.imageUrl || '/hero_daylight_fleet.png'})` 
                  }}
                />

                {/* Imagen completa sin recortes */}
                <img
                  src={activePreviewSlide?.imageUrl || '/hero_daylight_fleet.png'}
                  alt="Vista previa del hero"
                  className="relative z-10 w-full h-auto max-h-[260px] object-contain mx-auto block brightness-105 contrast-105"
                  onError={e => { e.currentTarget.src = '/hero_daylight_fleet.png'; }}
                />

                {/* Badge de Redirección si tiene link */}
                {activePreviewSlide?.linkUrl && (
                  <div className="absolute top-2.5 right-2.5 z-20 px-2.5 py-1 rounded-lg bg-black/80 backdrop-blur-md text-[10px] text-violet-300 border border-violet-500/40 flex items-center gap-1.5 shadow-md">
                    <ExternalLink className="w-3 h-3 text-violet-400" />
                    <span className="truncate max-w-[160px]">{activePreviewSlide.linkUrl}</span>
                  </div>
                )}

                {/* Controles del Carrusel en Preview si hay más de 1 */}
                {slides.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setPreviewIdx(prev => (prev - 1 + slides.length) % slides.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-[#6D28D9] text-white border border-white/20 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewIdx(prev => (prev + 1) % slides.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-full bg-black/60 hover:bg-[#6D28D9] text-white border border-white/20 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Dots de Navegación */}
                    <div className="absolute bottom-2.5 inset-x-0 z-20 flex items-center justify-center gap-1.5">
                      {slides.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setPreviewIdx(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === previewIdx ? 'w-5 bg-violet-400' : 'w-1.5 bg-white/40'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

            </div>

            {/* Info complementaria */}
            <div className="space-y-1 text-center">
              <p className="text-[11px] text-slate-300 font-medium">
                {slides.length > 1 
                  ? `El carrusel rotará automáticamente cada 5 segundos entre las ${slides.length} diapositivas en la página principal.`
                  : slides.length === 1
                  ? 'Se mostrará esta imagen fija en el banner principal.'
                  : 'Se muestra el banner predeterminado del sistema.'}
              </p>
              <p className="text-[10px] text-emerald-400 font-bold">
                ✓ Ajuste de altura completa activo: La imagen se muestra 100% entera sin recortes en celulares, tablets o monitores grandes.
              </p>
            </div>
          </div>

          {/* Tips de Diseño */}
          <div className="p-3.5 rounded-xl bg-violet-950/20 border border-violet-800/30 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-violet-300 block">💡 Consejo para banners:</span>
            <span>
              Para una experiencia visual óptima, podés subir imágenes en resolución horizontal panorámica (por ejemplo, 1920×600 o 1600×500 píxeles).
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

// =============================================================================
// SECTION 5.5: PUBLICIDAD / BANNERS LATERALES (CARRUSEL ROTATIVO CADA 7 SEGUNDOS)
// =============================================================================
function SectionPublicidad({ toast }) {
  const [activeSide, setActiveSide] = useState('left'); // 'left' | 'right'
  const [leftBanners, setLeftBanners] = useState([]);
  const [rightBanners, setRightBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados de subida y guardado
  const [savingLeft, setSavingLeft] = useState(false);
  const [savingRight, setSavingRight] = useState(false);
  const [uploadingLeft, setUploadingLeft] = useState(false);
  const [uploadingRight, setUploadingRight] = useState(false);
  const [uploadProgressLeft, setUploadProgressLeft] = useState('');
  const [uploadProgressRight, setUploadProgressRight] = useState('');

  // Agregar por URL
  const [showAddUrlLeft, setShowAddUrlLeft] = useState(false);
  const [showAddUrlRight, setShowAddUrlRight] = useState(false);
  const [leftUrlInput, setLeftUrlInput] = useState('');
  const [rightUrlInput, setRightUrlInput] = useState('');

  // Vista previa interactiva
  const [previewLeftIdx, setPreviewLeftIdx] = useState(0);
  const [previewRightIdx, setPreviewRightIdx] = useState(0);

  // Rotación en vista previa cada 7 segundos
  useEffect(() => {
    if (leftBanners.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewLeftIdx(prev => (prev + 1) % leftBanners.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [leftBanners.length]);

  useEffect(() => {
    if (rightBanners.length <= 1) return;
    const timer = setInterval(() => {
      setPreviewRightIdx(prev => (prev + 1) % rightBanners.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [rightBanners.length]);

  // Carga inicial desde Supabase
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('id, value')
          .in('id', [
            'ad_left_banners', 'ad_left_image_url', 'ad_left_link_url',
            'ad_right_banners', 'ad_right_image_url', 'ad_right_link_url'
          ]);

        if (data) {
          const lBannersRow = data.find(r => r.id === 'ad_left_banners');
          const lImgRow = data.find(r => r.id === 'ad_left_image_url');
          const lLinkRow = data.find(r => r.id === 'ad_left_link_url');

          const rBannersRow = data.find(r => r.id === 'ad_right_banners');
          const rImgRow = data.find(r => r.id === 'ad_right_image_url');
          const rLinkRow = data.find(r => r.id === 'ad_right_link_url');

          // Left
          if (lBannersRow?.value) {
            try {
              const parsed = JSON.parse(lBannersRow.value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setLeftBanners(parsed);
              } else if (lImgRow?.value) {
                setLeftBanners([{ id: 'legacy-left', imageUrl: lImgRow.value, linkUrl: lLinkRow?.value || '' }]);
              }
            } catch (e) {
              if (lImgRow?.value) setLeftBanners([{ id: 'legacy-left', imageUrl: lImgRow.value, linkUrl: lLinkRow?.value || '' }]);
            }
          } else if (lImgRow?.value) {
            setLeftBanners([{ id: 'legacy-left', imageUrl: lImgRow.value, linkUrl: lLinkRow?.value || '' }]);
          } else {
            setLeftBanners([{ id: 'default-left-1', imageUrl: '/ad_left_banner.png', linkUrl: '/negocios', title: 'Repuestos y Accesorios' }]);
          }

          // Right
          if (rBannersRow?.value) {
            try {
              const parsed = JSON.parse(rBannersRow.value);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setRightBanners(parsed);
              } else if (rImgRow?.value) {
                setRightBanners([{ id: 'legacy-right', imageUrl: rImgRow.value, linkUrl: rLinkRow?.value || '' }]);
              }
            } catch (e) {
              if (rImgRow?.value) setRightBanners([{ id: 'legacy-right', imageUrl: rImgRow.value, linkUrl: rLinkRow?.value || '' }]);
            }
          } else if (rImgRow?.value) {
            setRightBanners([{ id: 'legacy-right', imageUrl: rImgRow.value, linkUrl: rLinkRow?.value || '' }]);
          } else {
            setRightBanners([{ id: 'default-right-1', imageUrl: '/ad_right_banner.png', linkUrl: '/planes', title: 'Publicá tu Vehículo' }]);
          }
        }
      } catch (err) {
        console.warn('Error loading ad banners in superadmin:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Subida masiva de imágenes
  const handleMultipleUpload = async (e, side) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (side === 'left') {
      setUploadingLeft(true);
      setUploadProgressLeft(`Preparando ${files.length} archivo(s)...`);
    } else {
      setUploadingRight(true);
      setUploadProgressRight(`Preparando ${files.length} archivo(s)...`);
    }

    try {
      const { uploadVehicleImage } = await import('../lib/supabase');
      const newBanners = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (side === 'left') setUploadProgressLeft(`Subiendo imagen ${i + 1} de ${files.length}...`);
        else setUploadProgressRight(`Subiendo imagen ${i + 1} de ${files.length}...`);

        const url = await uploadVehicleImage(file);
        if (url) {
          newBanners.push({
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            imageUrl: url,
            linkUrl: '',
            title: ''
          });
        }
      }

      if (newBanners.length > 0) {
        if (side === 'left') {
          setLeftBanners(prev => [...prev, ...newBanners]);
          toast.show(`Se agregaron ${newBanners.length} imagen(es) a la Publicidad Izquierda. Recordá hacer clic en Guardar.`);
        } else {
          setRightBanners(prev => [...prev, ...newBanners]);
          toast.show(`Se agregaron ${newBanners.length} imagen(es) a la Publicidad Derecha. Recordá hacer clic en Guardar.`);
        }
      }
    } catch (err) {
      toast.show('Error al subir imágenes: ' + err.message, 'error');
    } finally {
      if (side === 'left') {
        setUploadingLeft(false);
        setUploadProgressLeft('');
      } else {
        setUploadingRight(false);
        setUploadProgressRight('');
      }
      e.target.value = '';
    }
  };

  // Agregar por URL directa
  const handleAddUrl = (side) => {
    const input = side === 'left' ? leftUrlInput : rightUrlInput;
    const trimmed = input.trim();
    if (!trimmed) return;

    const newBanner = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      imageUrl: trimmed,
      linkUrl: '',
      title: ''
    };

    if (side === 'left') {
      setLeftBanners(prev => [...prev, newBanner]);
      setLeftUrlInput('');
      setShowAddUrlLeft(false);
      toast.show('Banner agregado a Publicidad Izquierda. Recordá guardar.');
    } else {
      setRightBanners(prev => [...prev, newBanner]);
      setRightUrlInput('');
      setShowAddUrlRight(false);
      toast.show('Banner agregado a Publicidad Derecha. Recordá guardar.');
    }
  };

  // Reordenar
  const handleMoveBanner = (side, index, direction) => {
    const updater = side === 'left' ? setLeftBanners : setRightBanners;
    updater(prev => {
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy;
    });
  };

  // Eliminar banner
  const handleDeleteBanner = (side, index) => {
    const updater = side === 'left' ? setLeftBanners : setRightBanners;
    updater(prev => prev.filter((_, i) => i !== index));
    toast.show('Banner eliminado. Recordá hacer clic en Guardar.');
  };

  // Actualizar enlace de destino
  const handleUpdateLink = (side, index, link) => {
    const updater = side === 'left' ? setLeftBanners : setRightBanners;
    updater(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], linkUrl: link };
      return copy;
    });
  };

  // Guardar en Supabase
  const handleSave = async (side) => {
    const banners = side === 'left' ? leftBanners : rightBanners;
    if (banners.length === 0) {
      toast.show('Subí al menos una imagen antes de guardar', 'error');
      return;
    }

    const bannersJson = JSON.stringify(banners);
    const primaryImg = banners[0]?.imageUrl || '';
    const primaryLink = banners[0]?.linkUrl || '';

    if (side === 'left') {
      setSavingLeft(true);
      try {
        await Promise.all([
          setSetting('ad_left_banners', bannersJson),
          setSetting('ad_left_image_url', primaryImg),
          setSetting('ad_left_link_url', primaryLink),
        ]);
        localStorage.setItem('sa_ad_left_banners', bannersJson);
        localStorage.setItem('sa_ad_left_image_url', primaryImg);
        localStorage.setItem('sa_ad_left_link_url', primaryLink);
        window.dispatchEvent(new CustomEvent('sa_ads_updated', { detail: { leftBanners: banners } }));
        toast.show(`✅ Publicidad izquierda guardada con ${banners.length} banner(s) rotativos cada 7s`);
      } catch (err) {
        toast.show('Error al guardar: ' + err.message, 'error');
      } finally {
        setSavingLeft(false);
      }
    } else {
      setSavingRight(true);
      try {
        await Promise.all([
          setSetting('ad_right_banners', bannersJson),
          setSetting('ad_right_image_url', primaryImg),
          setSetting('ad_right_link_url', primaryLink),
        ]);
        localStorage.setItem('sa_ad_right_banners', bannersJson);
        localStorage.setItem('sa_ad_right_image_url', primaryImg);
        localStorage.setItem('sa_ad_right_link_url', primaryLink);
        window.dispatchEvent(new CustomEvent('sa_ads_updated', { detail: { rightBanners: banners } }));
        toast.show(`✅ Publicidad derecha guardada con ${banners.length} banner(s) rotativos cada 7s`);
      } catch (err) {
        toast.show('Error al guardar: ' + err.message, 'error');
      } finally {
        setSavingRight(false);
      }
    }
  };

  // Restablecer por defecto
  const handleReset = async (side) => {
    if (!window.confirm('¿Restablecer esta publicidad al banner original por defecto?')) return;

    if (side === 'left') {
      await Promise.all([
        setSetting('ad_left_banners', ''),
        setSetting('ad_left_image_url', ''),
        setSetting('ad_left_link_url', ''),
      ]);
      localStorage.removeItem('sa_ad_left_banners');
      localStorage.removeItem('sa_ad_left_image_url');
      localStorage.removeItem('sa_ad_left_link_url');
      const def = [{ id: 'default-left-1', imageUrl: '/ad_left_banner.png', linkUrl: '/negocios', title: 'Repuestos y Accesorios' }];
      setLeftBanners(def);
      window.dispatchEvent(new CustomEvent('sa_ads_updated', { detail: { leftBanners: def } }));
      toast.show('Publicidad izquierda restaurada');
    } else {
      await Promise.all([
        setSetting('ad_right_banners', ''),
        setSetting('ad_right_image_url', ''),
        setSetting('ad_right_link_url', ''),
      ]);
      localStorage.removeItem('sa_ad_right_banners');
      localStorage.removeItem('sa_ad_right_image_url');
      localStorage.removeItem('sa_ad_right_link_url');
      const def = [{ id: 'default-right-1', imageUrl: '/ad_right_banner.png', linkUrl: '/planes', title: 'Publicá tu Vehículo' }];
      setRightBanners(def);
      window.dispatchEvent(new CustomEvent('sa_ads_updated', { detail: { rightBanners: def } }));
      toast.show('Publicidad derecha restaurada');
    }
  };

  // Helper para clasificar URL
  const classifyUrl = (url) => {
    if (!url || !url.trim()) return { label: 'Sin enlace (Acción predeterminada)', color: 'text-slate-400' };
    const trimmed = url.trim();
    if (/^https?:\/\/|^\/\/|^wa\.me\//i.test(trimmed)) {
      return { label: '🌐 Enlace Externo (Se abre en nueva pestaña)', color: 'text-cyan-400' };
    }
    return { label: '🏛️ Enlace Interno SPA (Navegación dentro del sitio)', color: 'text-purple-400' };
  };

  const currentBanners = activeSide === 'left' ? leftBanners : rightBanners;
  const currentPreviewIdx = activeSide === 'left' ? previewLeftIdx : previewRightIdx;
  const setPreviewIdx = activeSide === 'left' ? setPreviewLeftIdx : setPreviewRightIdx;
  const safePreviewIdx = currentPreviewIdx < currentBanners.length ? currentPreviewIdx : 0;
  const activePreviewBanner = currentBanners[safePreviewIdx] || currentBanners[0];
  const uploading = activeSide === 'left' ? uploadingLeft : uploadingRight;
  const uploadProgress = activeSide === 'left' ? uploadProgressLeft : uploadProgressRight;
  const saving = activeSide === 'left' ? savingLeft : savingRight;
  const showAddUrl = activeSide === 'left' ? showAddUrlLeft : showAddUrlRight;
  const setShowAddUrl = activeSide === 'left' ? setShowAddUrlLeft : setShowAddUrlRight;
  const urlInput = activeSide === 'left' ? leftUrlInput : rightUrlInput;
  const setUrlInput = activeSide === 'left' ? setLeftUrlInput : setRightUrlInput;

  return (
    <div className="space-y-6 animate-fadeIn">
      <SectionHeader 
        icon={Image} 
        title="Banners de Publicidad Lateral"
        sub="Subí varias imágenes para cada banner lateral. Rotan automáticamente cada 7 segundos y admiten enlaces de destino internos (/planes, /agencias) o externos (https://...)." 
      />

      {/* Selector de Pestaña: Izquierda vs Derecha */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setActiveSide('left')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeSide === 'left'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-violet-300" />
          <span>Publicidad Lateral Izquierda</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black">
            {leftBanners.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSide('right')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeSide === 'right'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-pink-300" />
          <span>Publicidad Lateral Derecha</span>
          <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black">
            {rightBanners.length}
          </span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Columna Izquierda: Gestión de Diapositivas y Subida */}
          <div className="xl:col-span-8 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-violet-400" />
                  <span>
                    Banners de Publicidad {activeSide === 'left' ? 'Izquierda' : 'Derecha'} ({currentBanners.length})
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cada banner se mostrará en pantalla durante <strong className="text-amber-400 font-extrabold">7 segundos</strong> antes de pasar al siguiente.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span>Rotación: 7s</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddUrl(!showAddUrl)}
                  className="text-xs font-bold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 cursor-pointer bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {showAddUrl ? 'Cancelar URL' : 'Agregar por URL'}
                </button>
              </div>
            </div>

            {/* Subida masiva desde computadora */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">
                Subir una o varias imágenes de publicidad:
              </label>
              <label className="flex flex-col items-center justify-center gap-2 w-full py-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-violet-500/60 bg-slate-900/40 cursor-pointer transition-all group">
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => handleMultipleUpload(e, activeSide)} 
                  disabled={uploading}
                  className="hidden" 
                />
                {uploading ? (
                  <>
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                    <span className="text-xs text-violet-300 font-black">{uploadProgress || 'Subiendo imágenes...'}</span>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Upload className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-slate-300 font-black group-hover:text-white transition-colors">
                      Hacé clic para seleccionar una o varias imágenes
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Formato vertical recomendado (160×520 px o similar proporción vertical)
                    </span>
                  </>
                )}
              </label>
            </div>

            {/* Input para agregar por URL directa */}
            {showAddUrl && (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/80 space-y-3 animate-fadeIn">
                <label className="block text-xs font-bold text-slate-300">
                  Pegar URL de imagen pública:
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://ejemplo.com/banner-publicidad.jpg"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddUrl(activeSide)}
                    className="px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-black cursor-pointer transition-all"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Banners Agregados */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider">
                Secuencia de Banners ({currentBanners.length}):
              </label>

              {currentBanners.length === 0 ? (
                <div className="text-center py-12 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-2">
                  <p className="text-sm font-bold text-slate-400">Sin imágenes configuradas.</p>
                  <p className="text-xs text-slate-500">Subí imágenes arriba para activar la rotación automática.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentBanners.map((banner, index) => {
                    const urlInfo = classifyUrl(banner.linkUrl);

                    return (
                      <div 
                        key={banner.id || index}
                        className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          index === safePreviewIdx
                            ? 'bg-slate-900 border-violet-500/60 shadow-lg shadow-violet-950/20 ring-1 ring-violet-500/30'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {/* Miniatura y Posición */}
                        <div className="flex items-center gap-3.5 shrink-0">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
                            index === 0 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {index + 1}
                          </span>

                          <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-slate-950 border border-slate-700 shrink-0">
                            <img
                              src={banner.imageUrl}
                              alt={`Banner ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.src = '/ad_left_banner.png'; }}
                            />
                            {index === safePreviewIdx && (
                              <span className="absolute bottom-0 inset-x-0 bg-violet-600 text-white text-[8px] font-black text-center py-0.5">
                                EN VIVO
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Configuración de Enlace de Destino */}
                        <div className="flex-1 min-w-0 space-y-1.5 w-full">
                          <div className="flex items-center justify-between flex-wrap gap-1">
                            <label className="text-[11px] font-black uppercase text-slate-300 tracking-wider">
                              URL de Destino (Interna o Externa):
                            </label>
                            <span className={`text-[10px] font-bold ${urlInfo.color}`}>
                              {urlInfo.label}
                            </span>
                          </div>

                          <input
                            type="text"
                            value={banner.linkUrl || ''}
                            onChange={(e) => handleUpdateLink(activeSide, index, e.target.value)}
                            placeholder="Ej: /planes, /agencias, /negocios o https://anunciante.com"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-violet-500 transition-colors"
                          />
                          <p className="text-[10px] text-slate-500">
                            💡 Si colocás <code className="text-violet-300">/planes</code> navegará dentro de la web; si colocás <code className="text-cyan-300">https://...</code> se abrirá en una pestaña nueva.
                          </p>
                        </div>

                        {/* Botones de Orden y Borrado */}
                        <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMoveBanner(activeSide, index, -1)}
                            disabled={index === 0}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Mover arriba"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBanner(activeSide, index, 1)}
                            disabled={index === currentBanners.length - 1}
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Mover abajo"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(activeSide, index)}
                            className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer ml-1"
                            title="Eliminar este banner"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Botones Principales de Guardado */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleSave(activeSide)}
                disabled={saving}
                className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:brightness-110 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xl shadow-violet-950/40 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando en Supabase...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Publicidad {activeSide === 'left' ? 'Izquierda' : 'Derecha'} ({currentBanners.length} banners)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleReset(activeSide)}
                className="px-5 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Restablecer</span>
              </button>
            </div>

          </div>

          {/* Columna Derecha: Vista Previa Fiel en Vivo (Rotación cada 7 segundos) */}
          <div className="xl:col-span-4 bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-black text-white">Vista Previa en Vivo</span>
                </div>
                {currentBanners.length > 0 && (
                  <span className="text-[11px] font-mono font-bold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded-full border border-purple-500/30">
                    {safePreviewIdx + 1} de {currentBanners.length}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400">
                Así se visualiza el banner lateral en la pantalla principal. Cambia cada <strong className="text-amber-400">7 segundos</strong> automáticamente:
              </p>

              {/* Simulación del Card Lateral de 176px x 520px */}
              <div className="flex justify-center py-2">
                <div className="w-40 xl:w-44 select-none">
                  <div className="group relative rounded-2xl overflow-hidden border border-purple-800/80 bg-[#0F111A] text-white shadow-2xl shadow-purple-950/60">
                    
                    <div className="relative w-full h-[460px] overflow-hidden bg-slate-950">
                      {currentBanners.length > 0 ? (
                        currentBanners.map((b, idx) => (
                          <div
                            key={b.id || idx}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                              idx === safePreviewIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                            }`}
                          >
                            <img
                              src={b.imageUrl}
                              alt="Publicidad"
                              className="w-full h-full object-cover object-center"
                              onError={(e) => { e.target.src = activeSide === 'left' ? '/ad_left_banner.png' : '/ad_right_banner.png'; }}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-slate-500">
                          Sin banner configurado
                        </div>
                      )}

                      {/* Top Label */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-20 pointer-events-none">
                        <span className="px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest text-slate-200 border border-white/20">
                          PUBLICIDAD
                        </span>
                        {activePreviewBanner?.linkUrl && (
                          <div className="p-1 rounded-full bg-purple-600/90 text-white backdrop-blur-md">
                            <ExternalLink className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>

                      {/* Dots (solo si hay más de 1 banner, sin sombreado sobre la imagen) */}
                      {currentBanners.length > 1 && (
                        <div className="absolute bottom-2.5 left-0 right-0 z-20 flex items-center justify-center pointer-events-none">
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm pointer-events-auto border border-white/10 shadow-sm">
                            {currentBanners.map((_, dotIdx) => (
                              <button
                                key={dotIdx}
                                type="button"
                                onClick={() => setPreviewIdx(dotIdx)}
                                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                                  dotIdx === safePreviewIdx ? 'w-5 bg-purple-400' : 'w-1.5 bg-white/40'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              </div>

              {/* Información del enlace activo en la vista previa */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider block">
                  Destino del banner visible #{safePreviewIdx + 1}:
                </span>
                <span className="font-mono text-violet-300 break-all block font-bold">
                  {activePreviewBanner?.linkUrl || '(Sin URL asignada - acción por defecto)'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-800/40 text-[11px] text-slate-400 space-y-1">
              <span className="font-black text-violet-300 block">💡 Nota técnica:</span>
              <span>
                Los cambios guardados se propagan instantáneamente en la Home sin requerir rebuild ni reiniciar el servidor.
              </span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// =============================================================================
// SECTION 6: NEGOCIOS / DIRECTORIO
// =============================================================================
const RUBROS = [
  { id: 'repuestos',   label: 'Repuestos' },
  { id: 'talleres',    label: 'Talleres Mecánicos' },
  { id: 'lubricentros',label: 'Lubricentros' },
  { id: 'gomerias',    label: 'Gomería / Alineación' },
  { id: 'carrocerias', label: 'Carrocerías' },
  { id: 'electricista',label: 'Electricista Automotriz' },
  { id: 'audio',       label: 'Audio y Alarmas' },
  { id: 'blindaje',    label: 'Blindaje' },
  { id: 'seguros',     label: 'Seguros' },
  { id: 'financiacion',label: 'Financiación' },
  { id: 'inspeccion',  label: 'Inspección / VTV' },
];

function SectionNegocios({ toast }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterRubro, setFilterRubro] = useState('all');
  const [saving, setSaving] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('services_directory').select('*').order('created_at', { ascending: false });
    setServices(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const toggleVerified = async (s) => {
    setSaving(s.id);
    await supabase.from('services_directory').update({ verified: !s.verified }).eq('id', s.id);
    toast.show(s.verified ? 'Verificación removida' : '✅ Negocio verificado');
    setSaving(null);
    fetch();
  };

  const remove = async (id) => {
    if (!window.confirm('¿Eliminar este negocio del directorio?')) return;
    setSaving(id);
    await supabase.from('services_directory').delete().eq('id', id);
    toast.show('Negocio eliminado');
    setSaving(null);
    fetch();
  };

  const filtered = services.filter(s => {
    const q = search.toLowerCase();
    const ms = !q || [s.name, s.city, s.province].some(v => v?.toLowerCase().includes(q));
    const mr = filterRubro === 'all' || s.rubro_id === filterRubro;
    return ms && mr;
  });

  return (
    <div className="space-y-6">
      <SectionHeader icon={Wrench} title="Negocios Automotores"
        sub={`${filtered.length} de ${services.length} negocios`}
        action={<ReloadBtn onClick={fetch} loading={loading} />} />

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, ciudad, provincia..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none" />
        </div>
        <select value={filterRubro} onChange={e => setFilterRubro(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-violet-500 focus:outline-none cursor-pointer">
          <option value="all">Todos los rubros</option>
          {RUBROS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-center py-16 text-slate-500 text-sm">Sin negocios registrados.</p>}
          {filtered.map(s => (
            <div key={s.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-black text-white">{s.name}</span>
                  {s.verified && <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"><Check className="w-2.5 h-2.5" /> Verificado</Badge>}
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                    {RUBROS.find(r => r.id === s.rubro_id)?.label || s.rubro_id}
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.city}, {s.province}</span>
                  {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>}
                  {s.whatsapp && <span className="flex items-center gap-1 text-emerald-400"><Phone className="w-3 h-3" />{s.whatsapp}</span>}
                  <span className="text-slate-600">⭐ {s.rating} · {timeAgo(s.created_at)}</span>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <button onClick={() => toggleVerified(s)} disabled={saving === s.id}
                  className={`p-2 rounded-xl transition-all cursor-pointer ${s.verified ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  title={s.verified ? 'Quitar verificación' : 'Verificar'}>
                  {saving === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                </button>
                <button onClick={() => remove(s.id)} disabled={saving === s.id}
                  className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 cursor-pointer transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SECTION 7: LEADS
// =============================================================================
function SectionLeads({ toast }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    // LEFT JOIN: si el vehículo fue eliminado, igual trae el lead
    const { data } = await supabase
      .from('leads')
      .select(`
        id, seller_whatsapp, created_at, user_id,
        vehicles ( id, title, brand, model, seller_name, price, price_currency, formatted_price )
      `)
      .order('created_at', { ascending: false })
      .limit(200);
    setLeads(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  // Agrupar por vehículo para ver cuáles generan más consultas
  const grouped = leads.reduce((acc, l) => {
    const key = l.vehicles?.id || 'deleted';
    if (!acc[key]) acc[key] = { vehicle: l.vehicles, count: 0, leads: [] };
    acc[key].count++;
    acc[key].leads.push(l);
    return acc;
  }, {});

  const topVehicles = Object.values(grouped).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="space-y-6">
      <SectionHeader icon={MessageSquare} title="Leads / Consultas WhatsApp"
        sub={`${leads.length} consultas registradas (últimas 200)`}
        action={<ReloadBtn onClick={fetch} loading={loading} />} />

      {/* Top vehículos */}
      {topVehicles.length > 0 && (
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-sm font-black text-white">🏆 Top vehículos con más consultas</h3>
          <div className="space-y-2">
            {topVehicles.map(({ vehicle, count }, i) => (
              <div key={vehicle?.id || i} className="flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-slate-500 font-mono w-4">{i + 1}.</span>
                  <span className="text-white font-bold truncate">{vehicle?.title || 'Vehículo eliminado'}</span>
                </div>
                <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 flex-shrink-0">
                  {count} consulta{count !== 1 ? 's' : ''}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
      ) : (
        <div className="space-y-2">
          {leads.length === 0 && <p className="text-center py-16 text-slate-500 text-sm">Sin leads registrados.</p>}
          {leads.map(lead => (
            <div key={lead.id} className="bg-[#0F172A] border border-slate-800 rounded-xl p-3 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-white line-clamp-1">
                  {lead.vehicles?.title || <span className="text-slate-500 italic">Vehículo eliminado</span>}
                </div>
                <div className="flex flex-wrap gap-3 mt-0.5 text-[10px] text-slate-400">
                  {lead.vehicles?.seller_name && <span>Vendedor: {lead.vehicles.seller_name}</span>}
                  <span className="font-mono text-emerald-400">WA: {lead.seller_whatsapp}</span>
                  <span className="text-slate-600">{timeAgo(lead.created_at)}</span>
                </div>
              </div>
              <a href={`https://wa.me/${lead.seller_whatsapp?.replace(/\D/g, '')}`}
                target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-all cursor-pointer flex-shrink-0">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// SECTION 8: CONFIGURACIÓN — conectado a Supabase site_settings
// =============================================================================
function SectionConfiguracion({ toast }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    contact_email: '',
    contact_whatsapp: '',
    bank_name: '',
    bank_alias: '',
    bank_cbu: '',
    bank_owner: '',
    payment_instructions: '',
  });

  const SETTING_KEYS = Object.keys(config);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase.from('site_settings').select('id, value').in('id', SETTING_KEYS);
      if (data) {
        const map = {};
        data.forEach(row => { map[row.id] = row.value || ''; });
        setConfig(prev => ({ ...prev, ...map }));
      }
      setLoading(false);
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const rows = SETTING_KEYS.map(key => ({ id: key, value: config[key], updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('site_settings').upsert(rows);
    if (error) {
      toast.show('Error al guardar: ' + error.message, 'error');
    } else {
      toast.show('✅ Configuración guardada en Supabase');
    }
    setSaving(false);
  };

  const fieldDefs = [
    { key: 'contact_whatsapp',    label: 'WhatsApp de soporte (sin +)',   type: 'tel',   placeholder: '5493426514889' },
    { key: 'bank_name',           label: 'Banco / Billetera',             type: 'text',  placeholder: 'Mercado Pago / Santander' },
    { key: 'bank_alias',          label: 'Alias CBU',                     type: 'text',  placeholder: 'SITIO.AUTOMOTOR.MP' },
    { key: 'bank_cbu',            label: 'CBU',                           type: 'text',  placeholder: '22 dígitos' },
    { key: 'bank_owner',          label: 'Titular de la cuenta',          type: 'text',  placeholder: 'Nombre y Apellido' },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader icon={Settings} title="Configuración del Sitio"
        sub="Datos de contacto y bancarios — guardado en Supabase site_settings" />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-violet-400 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Campos principales */}
          <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-400" /> Datos de Contacto y Cobro
            </h3>
            {fieldDefs.map(({ key, label, type, placeholder }) => (
              <div key={key} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">{label}</label>
                <input type={type} value={config[key]}
                  onChange={e => setConfig(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none" />
              </div>
            ))}
          </div>

          {/* Instrucciones de pago + seguridad */}
          <div className="space-y-4">
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> Instrucciones de Pago
              </h3>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Texto visible para usuarios al declarar pago
                </label>
                <textarea rows={5} value={config.payment_instructions}
                  onChange={e => setConfig(p => ({ ...p, payment_instructions: e.target.value }))}
                  placeholder="Instrucciones para transferir/depositar..."
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none resize-none" />
              </div>
            </div>

            {/* SuperAdmin emails */}
            <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-black text-violet-300 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5" /> Emails con Acceso SuperAdmin
              </h3>
              <div className="space-y-1.5">
                {SUPER_ADMIN_EMAILS.map(email => (
                  <div key={email} className="text-[10px] font-mono text-violet-300 bg-violet-950/40 px-3 py-1.5 rounded-lg border border-violet-800/30">
                    {email}
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-slate-500">Para modificar, editá el array SUPER_ADMIN_EMAILS en SuperAdminPage.jsx y hacé deploy.</p>
            </div>
          </div>
        </div>
      )}

      {!loading && (
        <button onClick={handleSave} disabled={saving}
          className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xl shadow-violet-900/30 disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Guardar Configuración en Supabase
        </button>
      )}
    </div>
  );
}

// =============================================================================
// MAIN: SuperAdminPage
// =============================================================================
export default function SuperAdminPage({ currentUser, onBackToHome, onSignOut }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [pagosSubTab, setPagosSubTab] = useState('planes');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const toast = useToast();

  const userEmail = (currentUser?.user?.email || currentUser?.profile?.email || '').toLowerCase();
  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [
        { count: totalUsers },
        { count: totalVehicles },
        { data: payRequests },
        { count: totalLeads },
        { data: profiles },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('plan_payment_requests').select('status, plan_price'),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('user_type, plan_status'),
      ]);

      const reqs = payRequests || [];
      const profileList = profiles || [];

      setStats({
        totalUsers:        totalUsers    || 0,
        totalVehicles:     totalVehicles || 0,
        totalLeads:        totalLeads    || 0,
        pendingPayments:   reqs.filter(r => r.status === 'pending').length,
        pendingRequests:   reqs.filter(r => r.status === 'pending').length,
        approvedRequests:  reqs.filter(r => r.status === 'approved').length,
        rejectedRequests:  reqs.filter(r => r.status === 'rejected').length,
        totalRequests:     reqs.length,
        estimatedRevenue:  reqs.filter(r => r.status === 'approved').reduce((s, r) => s + (r.plan_price || 0), 0),
        activePlans:       profileList.filter(p => p.plan_status === 'active').length,
        totalParticulares: profileList.filter(p => p.user_type === 'particular').length,
        totalAgencias:     profileList.filter(p => p.user_type === 'agencia').length,
        totalNegocios:     profileList.filter(p => p.user_type === 'negocio_automotor').length,
      });
    } catch (e) {
      console.warn('Stats error:', e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { 
    fetchStats(); 

    // Notificaciones en tiempo real para el SuperAdmin
    const channel = supabase
      .channel('superadmin_stats_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'plan_payment_requests' },
        (payload) => {
          fetchStats();
          if (payload.eventType === 'INSERT' && payload.new?.status === 'pending') {
            toast.show(`🔔 ¡Nuevo aviso "Ya pagué" de ${payload.new.user_name || 'un usuario'} (${payload.new.plan_label || 'Plan'})!`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchStats, toast]);

  const handleSelectSection = (id) => {
    if (id === 'pagos' && (stats?.pendingPayments ?? 0) > 0) {
      setPagosSubTab('solicitudes');
    }
    setActiveSection(id);
  };

  const sections = [
    { id: 'dashboard', label: 'Dashboard',     icon: LayoutDashboard },
    { id: 'usuarios',  label: 'Usuarios',       icon: Users,        badge: null },
    { id: 'pagos',     label: 'Pagos / Planes', icon: CreditCard,   badge: stats?.pendingPayments || null },
    { id: 'vehiculos', label: 'Vehículos',      icon: Car },
    { id: 'hero',      label: 'Hero / Banner',  icon: Image },
    { id: 'publicidad',label: 'Publicidad Ads', icon: Zap },
    { id: 'negocios',  label: 'Negocios',       icon: Wrench },
    { id: 'leads',     label: 'Leads WA',       icon: MessageSquare },
    { id: 'plankevdev',label: 'Plan KevDev',    icon: ShieldCheck },
  ];

  // ── Acceso denegado ─────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-home-canvas flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-4 max-w-sm w-full">
          <Shield className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-slate-900">Acceso Restringido</h2>
          <p className="text-slate-600 text-sm">Iniciá sesión para continuar.</p>
          <button onClick={onBackToHome} className="w-full px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm cursor-pointer shadow-md transition-all">Volver</button>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-home-canvas flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-4 max-w-sm w-full">
          <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-rose-600" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Acceso Denegado</h2>
          <p className="text-slate-600 text-sm">No tenés permisos de SuperAdmin.</p>
          <p className="text-[11px] text-slate-700 font-mono bg-slate-50 rounded-xl p-3 border border-slate-200">
            Email: {userEmail}
          </p>
          <button onClick={onBackToHome} className="w-full px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm cursor-pointer transition-all shadow-md">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-home-canvas text-slate-900 flex flex-col">
      {/* Toast */}
      {toast.toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl text-white font-bold text-xs shadow-2xl border animate-bounce ${
          toast.toast.type === 'error'
            ? 'bg-rose-600 border-rose-400/40 shadow-rose-900/30'
            : 'bg-violet-600 border-violet-400/40 shadow-violet-900/30'
        }`}>
          {toast.toast.msg}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBackToHome}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs font-bold cursor-pointer transition-all border border-slate-200 shadow-sm">
              <ArrowLeft className="w-3.5 h-3.5 text-violet-600" />
              <span className="hidden sm:inline">Volver al Sitio</span>
            </button>
            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-rose-500 flex items-center justify-center shadow-sm">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-black text-slate-900">Panel SuperAdmin</span>
                <div className="text-[9px] text-violet-700 font-bold uppercase tracking-wider">Sitio Automotor</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(stats?.pendingPayments ?? 0) > 0 && (
              <button 
                onClick={() => {
                  setPagosSubTab('solicitudes');
                  setActiveSection('pagos');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-800 text-[10px] font-black cursor-pointer hover:bg-amber-500/30 transition-all animate-pulse"
                title="Ver avisos 'Ya pagué' pendientes de validación"
              >
                <Bell className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                {stats.pendingPayments} aviso{stats.pendingPayments !== 1 ? 's' : ''} "Ya pagué" pendiente{stats.pendingPayments !== 1 ? 's' : ''}
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 shadow-sm rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-rose-500 flex items-center justify-center font-black text-white text-[10px]">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-900 max-w-[150px] truncate">{userEmail}</span>
                <span className="text-[8px] font-black text-violet-700 uppercase tracking-wider">Super Admin</span>
              </div>
            </div>
            <button onClick={onSignOut}
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 border-r border-slate-200 py-6 px-3 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex-shrink-0">
          <nav className="space-y-1">
            {sections.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => handleSelectSection(id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSection === id
                    ? 'bg-violet-600 text-white shadow-md'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${activeSection === id ? 'text-white' : 'text-slate-400'}`} />
                  {label}
                </div>
                {badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9px] font-black min-w-[20px] text-center">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          <div className="mt-auto pt-6">
            <div className="p-3 rounded-xl bg-violet-50 border border-violet-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-700" />
                <span className="text-[10px] font-black text-violet-800">Acceso Total</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1">Todas las operaciones impactan directo en Supabase.</p>
            </div>
          </div>
        </aside>

        {/* Nav mobile */}
        <div className="lg:hidden border-b border-slate-200 bg-white/95 sticky top-16 z-30 w-full overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            {sections.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => handleSelectSection(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer relative ${
                  activeSection === id ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
                }`}>
                <Icon className="w-3.5 h-3.5" />
                {label}
                {badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[8px] font-black flex items-center justify-center">
                    {badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido principal */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto min-w-0">
          {activeSection === 'dashboard' && <SectionDashboard stats={stats} loading={loadingStats} onRefresh={fetchStats} />}
          {activeSection === 'usuarios'  && <SectionUsuarios toast={toast} />}
          {activeSection === 'pagos'     && <SectionPagos toast={toast} initialSubTab={pagosSubTab} />}
          {activeSection === 'vehiculos' && <SectionVehiculos toast={toast} />}
          {activeSection === 'hero'      && <SectionHero toast={toast} />}
          {activeSection === 'publicidad'&& <SectionPublicidad toast={toast} />}
          {activeSection === 'negocios'  && <SectionNegocios toast={toast} />}
          {activeSection === 'leads'     && <SectionLeads toast={toast} />}
          
          {activeSection === 'plankevdev'&& <PlanKevDevSection />}
        </main>
      </div>
    </div>
  );
}
