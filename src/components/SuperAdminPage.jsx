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
  Globe, Bell, Lock, EyeOff, Save
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PLAN_INFO } from '../lib/planUtils';

// ── SuperAdmin Emails ────────────────────────────────────────────────────────
const SUPER_ADMIN_EMAILS = [
  'loggia.1996@gmail.com',
  'admin@sitioautomotor.com',
  'kevdev@sitioautomotor.com',
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
  const colors = {
    violet:  'from-violet-950/60 border-violet-700/40 text-violet-300',
    emerald: 'from-emerald-950/60 border-emerald-700/40 text-emerald-300',
    amber:   'from-amber-950/60 border-amber-700/40 text-amber-300',
    blue:    'from-blue-950/60 border-blue-700/40 text-blue-300',
    rose:    'from-rose-950/60 border-rose-700/40 text-rose-300',
  };
  const cls = colors[color];
  return (
    <div className={`bg-gradient-to-br ${cls} to-[#0F172A] border rounded-2xl p-5 flex flex-col gap-3 shadow-xl`}>
      <div className={`p-2.5 rounded-xl bg-[#0F172A]/60 border border-white/5 w-fit`}>
        <Icon className={`w-5 h-5 ${cls.split(' ')[2]}`} />
      </div>
      <div>
        <div className="text-2xl font-black text-white">
          {value !== null && value !== undefined ? value : <Loader2 className="w-5 h-5 animate-spin inline" />}
        </div>
        <div className="text-xs font-bold text-slate-400 mt-0.5">{label}</div>
      </div>
    </div>
  );
}

// ── Section Header ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, sub, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div>
        <h2 className="text-xl font-black text-white flex items-center gap-2.5">
          <Icon className="w-5 h-5 text-violet-400" />
          {title}
        </h2>
        {sub && <p className="text-xs text-slate-400 mt-0.5 ml-7">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── ReloadBtn ────────────────────────────────────────────────────────────────
function ReloadBtn({ onClick, loading }) {
  return (
    <button onClick={onClick} disabled={loading}
      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50">
      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
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
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-400" /> Distribución de Usuarios
        </h3>
        {[
          { label: 'Particulares', val: stats?.totalParticulares, color: 'bg-blue-500' },
          { label: 'Agencias',     val: stats?.totalAgencias,     color: 'bg-purple-500' },
          { label: 'Negocios',     val: stats?.totalNegocios,     color: 'bg-amber-500' },
        ].map(({ label, val, color }) => {
          const pct = stats?.totalUsers > 0 ? Math.round(((val ?? 0) / stats.totalUsers) * 100) : 0;
          return (
            <div key={label} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-bold">{label}</span>
                <span className="text-slate-400 font-mono">{val ?? 0} ({pct}%)</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Estado de pagos */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-400" /> Estado de Solicitudes de Pago
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pendientes',      val: stats?.pendingRequests,  color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Aprobados',       val: stats?.approvedRequests, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Rechazados',      val: stats?.rejectedRequests, color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20' },
            { label: 'Total',           val: stats?.totalRequests,    color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/20' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`rounded-xl border p-3 text-center ${bg}`}>
              <div className={`text-2xl font-black ${color}`}>{val ?? 0}</div>
              <div className="text-[10px] text-slate-400 font-bold mt-0.5">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
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
                    {/* Acciones admin */}
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">Tipo:</span>
                        {['particular', 'agencia', 'negocio_automotor'].map(t => (
                          <button key={t} onClick={() => changeType(user.id, t)} disabled={saving || user.user_type === t}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black cursor-pointer transition-all ${user.user_type === t ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} disabled:opacity-50`}>
                            {USER_TYPE_STYLES[t]?.label}
                          </button>
                        ))}
                      </div>
                      {user.plan_status !== 'active' && user.current_plan && (
                        <button onClick={() => activatePlan(user.id, user.current_plan)} disabled={saving}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-[10px] font-black flex items-center gap-1 cursor-pointer hover:bg-emerald-600/50 disabled:opacity-50">
                          <Zap className="w-3 h-3" /> Activar Plan
                        </button>
                      )}
                      {user.plan_status === 'active' && (
                        <button onClick={() => cancelPlan(user.id)} disabled={saving}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-black flex items-center gap-1 cursor-pointer hover:bg-rose-500/30 disabled:opacity-50">
                          <Ban className="w-3 h-3" /> Cancelar Plan
                        </button>
                      )}
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
function SectionPagos({ toast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [saving, setSaving] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('plan_payment_requests')
      .select('*')
      .order('created_at', { ascending: false });
    setRequests(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const approve = async (req) => {
    setSaving(req.id);
    const now = new Date().toISOString();
    await supabase.from('plan_payment_requests').update({ status: 'approved', updated_at: now }).eq('id', req.id);
    await supabase.from('profiles').update({ plan_status: 'active', current_plan: req.plan_key, updated_at: now }).eq('id', req.user_id);
    toast.show(`✅ Plan "${req.plan_label}" activado para ${req.user_name}`);
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
                    <span className="text-slate-500">{req.payment_method?.replace(/_/g, ' ')}</span>
                    <span className="text-slate-600">{timeAgo(req.created_at)}</span>
                  </div>
                  {req.notes && (
                    <div className="p-2 rounded-lg bg-slate-800/60 text-[10px] text-slate-300 border border-slate-700/50">
                      {req.notes}
                    </div>
                  )}
                </div>
                {req.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => approve(req)} disabled={saving === req.id}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50">
                      {saving === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Aprobar
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
// SECTION 5: HERO / BANNER — conectado a Supabase site_settings
// =============================================================================
function SectionHero({ toast }) {
  const [heroUrl, setHeroUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('/hero_daylight_fleet.png');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingCurrent, setLoadingCurrent] = useState(true);

  useEffect(() => {
    (async () => {
      const val = await getSetting('hero_image_url');
      if (val) { setHeroUrl(val); setPreviewUrl(val); }
      setLoadingCurrent(false);
    })();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { uploadVehicleImage } = await import('../lib/supabase');
      const url = await uploadVehicleImage(file);
      setHeroUrl(url);
      setPreviewUrl(url);
      toast.show('Imagen subida. Guardá para aplicar.');
    } catch (err) {
      toast.show('Error al subir: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!heroUrl.trim()) return toast.show('Ingresá una URL válida', 'error');
    setSaving(true);
    await setSetting('hero_image_url', heroUrl.trim());
    // También sync localStorage para que HeroSection lo lea inmediatamente
    localStorage.setItem('sa_hero_image_url', heroUrl.trim());
    toast.show('✅ Imagen del hero guardada en Supabase. Recargá la home para verlo.');
    setSaving(false);
  };

  const handleReset = async () => {
    await setSetting('hero_image_url', '');
    localStorage.removeItem('sa_hero_image_url');
    setHeroUrl('');
    setPreviewUrl('/hero_daylight_fleet.png');
    toast.show('Hero restaurado a la imagen original');
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon={Image} title="Imagen del Hero / Banner"
        sub="Cambia la imagen de fondo del hero de la home — guardado en Supabase" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-violet-400" /> Configurar imagen
          </h3>

          {loadingCurrent ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-violet-400" /> Cargando imagen actual desde Supabase...
            </div>
          ) : heroUrl && (
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-700/30 text-[10px] text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
              Imagen actual cargada desde Supabase
            </div>
          )}

          {/* Upload */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">Subir imagen</label>
            <label className="flex items-center justify-center gap-3 w-full py-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-violet-500/50 bg-slate-900/50 cursor-pointer transition-all group">
              <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
              {uploading
                ? <><Loader2 className="w-4 h-4 text-violet-400 animate-spin" /><span className="text-xs text-violet-300 font-bold">Subiendo...</span></>
                : <><Upload className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" /><span className="text-xs text-slate-400 group-hover:text-violet-300 font-bold">JPG, PNG, WebP — Mínimo 1920×1080</span></>
              }
            </label>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[10px] text-slate-500 font-bold">O ingresá una URL</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">URL de la imagen</label>
            <input type="url" value={heroUrl}
              onChange={e => { setHeroUrl(e.target.value); setPreviewUrl(e.target.value); }}
              placeholder="https://ejemplo.com/banner.jpg"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none" />
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving || !heroUrl}
              className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-lg shadow-violet-900/30">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Guardar en Supabase
            </button>
            <button onClick={handleReset}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all">
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" /> Vista Previa
          </h3>
          <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-700/50">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover"
              onError={e => { e.target.src = '/hero_daylight_fleet.png'; }} />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 flex items-center px-6">
              <div className="space-y-1.5">
                <div className="h-3 w-32 bg-white/90 rounded-sm" />
                <div className="h-2 w-48 bg-white/60 rounded-sm" />
                <div className="flex gap-2 mt-2">
                  <div className="h-5 w-20 bg-violet-600 rounded-md" />
                  <div className="h-5 w-20 bg-white/10 border border-white/20 rounded-md" />
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 text-center">Vista con overlay simulado</p>
        </div>
      </div>
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
      <SectionHeader icon={Wrench} title="Directorio de Negocios"
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
    { key: 'contact_email',       label: 'Email de contacto',            type: 'email', placeholder: 'contacto@sitioautomotor.com.ar' },
    { key: 'contact_whatsapp',    label: 'WhatsApp de soporte (sin +)',   type: 'tel',   placeholder: '5491112345678' },
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

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const sections = [
    { id: 'dashboard', label: 'Dashboard',     icon: LayoutDashboard },
    { id: 'usuarios',  label: 'Usuarios',       icon: Users,        badge: null },
    { id: 'pagos',     label: 'Pagos / Planes', icon: CreditCard,   badge: stats?.pendingPayments || null },
    { id: 'vehiculos', label: 'Vehículos',      icon: Car },
    { id: 'hero',      label: 'Hero / Banner',  icon: Image },
    { id: 'negocios',  label: 'Directorio',     icon: Wrench },
    { id: 'leads',     label: 'Leads WA',       icon: MessageSquare },
    { id: 'config',    label: 'Configuración',  icon: Settings },
  ];

  // ── Acceso denegado ─────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-white">Acceso Restringido</h2>
          <p className="text-slate-400 text-sm">Iniciá sesión para continuar.</p>
          <button onClick={onBackToHome} className="px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm cursor-pointer">Volver</button>
        </div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm mx-4">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto">
            <Lock className="w-10 h-10 text-rose-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Acceso Denegado</h2>
          <p className="text-slate-400 text-sm">No tenés permisos de SuperAdmin.</p>
          <p className="text-[11px] text-slate-600 font-mono bg-slate-900 rounded-xl p-3 border border-slate-800">
            Email: {userEmail}
          </p>
          <button onClick={onBackToHome} className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm cursor-pointer transition-all">Volver</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col">
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
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0B0F1A]/95 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBackToHome}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold cursor-pointer transition-all">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Volver al Sitio</span>
            </button>
            <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-rose-500 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <span className="text-sm font-black text-white">Panel SuperAdmin</span>
                <div className="text-[9px] text-violet-300 font-bold uppercase tracking-wider">Sitio Automotor</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {(stats?.pendingPayments ?? 0) > 0 && (
              <button onClick={() => setActiveSection('pagos')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black cursor-pointer hover:bg-amber-500/30 transition-all">
                <Bell className="w-3.5 h-3.5" />
                {stats.pendingPayments} pago{stats.pendingPayments !== 1 ? 's' : ''} pendiente{stats.pendingPayments !== 1 ? 's' : ''}
              </button>
            )}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-rose-500 flex items-center justify-center font-black text-white text-[10px]">
                {userEmail.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-white max-w-[150px] truncate">{userEmail}</span>
                <span className="text-[8px] font-black text-violet-300 uppercase tracking-wider">Super Admin</span>
              </div>
            </div>
            <button onClick={onSignOut}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* Sidebar desktop */}
        <aside className="hidden lg:flex flex-col w-60 xl:w-64 border-r border-slate-800 py-6 px-3 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto flex-shrink-0">
          <nav className="space-y-1">
            {sections.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSection === id
                    ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}>
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${activeSection === id ? 'text-white' : 'text-slate-500'}`} />
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
            <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-700/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-300" />
                <span className="text-[10px] font-black text-violet-300">Acceso Total</span>
              </div>
              <p className="text-[9px] text-slate-500 mt-1">Todas las operaciones impactan directo en Supabase.</p>
            </div>
          </div>
        </aside>

        {/* Nav mobile */}
        <div className="lg:hidden border-b border-slate-800 bg-[#0B0F1A]/95 sticky top-16 z-30 w-full overflow-x-auto">
          <div className="flex gap-1 px-3 py-2 min-w-max">
            {sections.map(({ id, label, icon: Icon, badge }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer relative ${
                  activeSection === id ? 'bg-violet-600 text-white' : 'text-slate-400 hover:bg-slate-800'
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
          {activeSection === 'pagos'     && <SectionPagos toast={toast} />}
          {activeSection === 'vehiculos' && <SectionVehiculos toast={toast} />}
          {activeSection === 'hero'      && <SectionHero toast={toast} />}
          {activeSection === 'negocios'  && <SectionNegocios toast={toast} />}
          {activeSection === 'leads'     && <SectionLeads toast={toast} />}
          {activeSection === 'config'    && <SectionConfiguracion toast={toast} />}
        </main>
      </div>
    </div>
  );
}
