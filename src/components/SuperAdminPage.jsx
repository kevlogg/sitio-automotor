/**
 * SuperAdminPage.jsx
 *
 * Panel de Administración Total — Solo accesible para el dueño/superadmin.
 * Protección: verifica email contra SUPER_ADMIN_EMAILS.
 *
 * Secciones:
 *   1. Dashboard General — KPIs, métricas globales
 *   2. Usuarios — Gestión completa de todos los perfiles
 *   3. Vehículos — Todos los avisos publicados con moderación
 *   4. Pagos / Planes — Validar pagos en efectivo/transferencia
 *   5. Hero / Banner — Cambiar imagen del hero de la home
 *   6. Negocios — Directorio de servicios automotores
 *   7. Leads — Consultas generadas por WhatsApp
 *   8. Configuración — Settings del sitio
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, Users, Car, CreditCard, Image, Wrench,
  MessageSquare, Settings, LogOut, ArrowLeft, Shield, ShieldCheck,
  CheckCircle2, XCircle, Clock, Loader2, Search, Filter, Eye,
  Edit3, Trash2, RefreshCw, TrendingUp, TrendingDown, Star,
  AlertCircle, ChevronDown, ChevronUp, Upload, ExternalLink,
  Building2, MapPin, Phone, Mail, Ban, Check, X, Zap,
  BarChart3, Activity, DollarSign, UserCheck, FileText,
  Globe, Bell, Lock, Database, Plus, Download, EyeOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PLAN_INFO } from '../lib/planUtils';

// ── Emails autorizados como SuperAdmin ──────────────────────────────────────
const SUPER_ADMIN_EMAILS = [
  'loggia.1996@gmail.com',
  'admin@sitioautomotor.com',
  'kevdev@sitioautomotor.com',
];

// ── Colores de tipos de usuario ──────────────────────────────────────────────
const USER_TYPE_STYLES = {
  particular: { label: 'Particular', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', dot: 'bg-blue-400' },
  agencia: { label: 'Agencia', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30', dot: 'bg-purple-400' },
  negocio_automotor: { label: 'Negocio', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
};

const PLAN_STATUS_STYLES = {
  null: { label: 'Sin plan', color: 'bg-slate-700/50 text-slate-400 border-slate-600/30' },
  pending: { label: 'Pendiente', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  active: { label: 'Activo', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  rejected: { label: 'Rechazado', color: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  cancelled: { label: 'Cancelado', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) {
  return typeof n === 'number' ? n.toLocaleString('es-AR') : (n ?? '—');
}

function timeAgo(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'ahora';
  if (m < 60) return `hace ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `hace ${h}h`;
  const d = Math.floor(h / 24);
  return `hace ${d} día${d !== 1 ? 's' : ''}`;
}

// ── Badge Component ──────────────────────────────────────────────────────────
function Badge({ children, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black border ${className}`}>
      {children}
    </span>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, sub, color = 'violet', trend }) {
  const colorMap = {
    violet: 'from-violet-950/60 border-violet-700/40 text-violet-300',
    emerald: 'from-emerald-950/60 border-emerald-700/40 text-emerald-300',
    amber: 'from-amber-950/60 border-amber-700/40 text-amber-300',
    blue: 'from-blue-950/60 border-blue-700/40 text-blue-300',
    rose: 'from-rose-950/60 border-rose-700/40 text-rose-300',
  };
  return (
    <div className={`bg-gradient-to-br ${colorMap[color]} to-[#0F172A] border rounded-2xl p-5 flex flex-col gap-3 shadow-xl`}>
      <div className="flex items-center justify-between">
        <div className={`p-2.5 rounded-xl bg-[#0F172A]/60 border border-white/5`}>
          <Icon className={`w-5 h-5 ${colorMap[color].split(' ')[2]}`} />
        </div>
        {trend !== undefined && (
          <span className={`text-[10px] font-black flex items-center gap-1 ${trend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-black text-white">{value ?? <Loader2 className="w-5 h-5 animate-spin inline" />}</div>
        <div className="text-xs font-bold text-slate-400 mt-0.5">{label}</div>
        {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
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

// ── Toast interno ─────────────────────────────────────────────────────────────
function useToast() {
  const [toast, setToast] = useState(null);
  const show = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);
  return { toast, show };
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: DASHBOARD GENERAL
// ─────────────────────────────────────────────────────────────────────────────
function SectionDashboard({ stats, loading, onRefresh }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        icon={LayoutDashboard}
        title="Dashboard General"
        sub="Métricas globales del sitio en tiempo real"
        action={
          <button onClick={onRefresh} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        }
      />

      {/* KPIs Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Users} label="Usuarios Totales" value={stats?.totalUsers} color="blue" />
        <KpiCard icon={Car} label="Vehículos Publicados" value={stats?.totalVehicles} color="violet" />
        <KpiCard icon={CreditCard} label="Pagos Pendientes" value={stats?.pendingPayments} color="amber" />
        <KpiCard icon={DollarSign} label="Ingresos Estimados" value={stats?.estimatedRevenue ? `$${fmt(stats.estimatedRevenue)}` : null} color="emerald" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard icon={UserCheck} label="Planes Activos" value={stats?.activePlans} color="emerald" />
        <KpiCard icon={Clock} label="Solicitudes Pendientes" value={stats?.pendingRequests} color="amber" />
        <KpiCard icon={MessageSquare} label="Leads WhatsApp" value={stats?.totalLeads} color="blue" />
        <KpiCard icon={Building2} label="Agencias" value={stats?.totalAgencias} color="violet" />
        <KpiCard icon={Wrench} label="Negocios Automotores" value={stats?.totalNegocios} color="amber" />
        <KpiCard icon={Activity} label="Particulares" value={stats?.totalParticulares} color="blue" />
      </div>

      {/* Distribución por tipo */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          Distribución de Usuarios por Tipo
        </h3>
        <div className="space-y-3">
          {[
            { key: 'particular', label: 'Particulares', val: stats?.totalParticulares, color: 'bg-blue-500', total: stats?.totalUsers },
            { key: 'agencia', label: 'Agencias', val: stats?.totalAgencias, color: 'bg-purple-500', total: stats?.totalUsers },
            { key: 'negocio_automotor', label: 'Negocios', val: stats?.totalNegocios, color: 'bg-amber-500', total: stats?.totalUsers },
          ].map(({ label, val, color, total }) => {
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;
            return (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
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
      </div>

      {/* Estado de solicitudes de pago */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-emerald-400" />
          Estado de Solicitudes de Pago
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pendientes', val: stats?.pendingRequests, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
            { label: 'Aprobados', val: stats?.approvedRequests, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
            { label: 'Rechazados', val: stats?.rejectedRequests, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
            { label: 'Total Solicitudes', val: stats?.totalRequests, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: USUARIOS
// ─────────────────────────────────────────────────────────────────────────────
function SectionUsuarios({ toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [expandedUser, setExpandedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setUsers(data || []);
    } catch (e) {
      console.warn('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleActivatePlan = async (userId, planKey) => {
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        plan_status: 'active',
        current_plan: planKey,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);

      await supabase.from('plan_payment_requests').update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId).eq('status', 'pending');

      toast.show('Plan activado correctamente ✓');
      fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  const handleRejectPlan = async (userId) => {
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        plan_status: 'rejected',
        updated_at: new Date().toISOString(),
      }).eq('id', userId);

      await supabase.from('plan_payment_requests').update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      }).eq('user_id', userId).eq('status', 'pending');

      toast.show('Solicitud rechazada', 'error');
      fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUserType = async (userId, newType) => {
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        user_type: newType,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
      toast.show('Tipo de usuario actualizado');
      fetchUsers();
      setEditingUser(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPlan = async (userId) => {
    setSaving(true);
    try {
      await supabase.from('profiles').update({
        plan_status: 'cancelled',
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
      toast.show('Plan cancelado');
      fetchUsers();
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = !searchTerm ||
      u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || u.user_type === filterType;
    const matchPlan = filterPlan === 'all' || u.plan_status === filterPlan || (filterPlan === 'none' && !u.plan_status);
    return matchSearch && matchType && matchPlan;
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Users}
        title="Gestión de Usuarios"
        sub={`${filtered.length} de ${users.length} usuarios`}
        action={
          <button onClick={fetchUsers} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre, email, negocio..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
          />
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm">No se encontraron usuarios con esos filtros.</div>
          )}
          {filtered.map(user => {
            const typeStyle = USER_TYPE_STYLES[user.user_type] || USER_TYPE_STYLES.particular;
            const planStyle = PLAN_STATUS_STYLES[user.plan_status] || PLAN_STATUS_STYLES.null;
            const isExpanded = expandedUser === user.id;

            return (
              <div key={user.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden transition-all">
                {/* Row principal */}
                <div className="flex items-center gap-4 p-4">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-700 flex items-center justify-center font-black text-white text-sm flex-shrink-0 overflow-hidden">
                    {user.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : (user.full_name?.charAt(0) || '?')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-white truncate">{user.full_name || 'Sin nombre'}</span>
                      <Badge className={typeStyle.color}>{typeStyle.label}</Badge>
                      <Badge className={planStyle.color}>{planStyle.label}</Badge>
                      {user.current_plan && <Badge className="bg-slate-700/50 text-slate-300 border-slate-600/30">{PLAN_INFO[user.current_plan]?.label || user.current_plan}</Badge>}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-slate-400">
                      {user.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user.email}</span>}
                      {user.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{user.city}{user.province ? `, ${user.province}` : ''}</span>}
                      {user.phone_whatsapp && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone_whatsapp}</span>}
                      <span className="text-slate-600">{timeAgo(user.created_at)}</span>
                    </div>
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {user.plan_status === 'pending' && (
                      <>
                        <button onClick={() => handleActivatePlan(user.id, user.current_plan)} disabled={saving}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprobar
                        </button>
                        <button onClick={() => handleRejectPlan(user.id)} disabled={saving}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/30 hover:bg-rose-600/50 text-rose-300 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all border border-rose-500/30">
                          <XCircle className="w-3.5 h-3.5" /> Rechazar
                        </button>
                      </>
                    )}
                    <button onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expansión */}
                {isExpanded && (
                  <div className="border-t border-slate-800 p-5 space-y-5 bg-slate-900/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                      <div className="space-y-1">
                        <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">ID</div>
                        <div className="font-mono text-slate-300 text-[10px] break-all">{user.id}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Negocio</div>
                        <div className="text-white">{user.business_name || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Rubro</div>
                        <div className="text-white">{user.rubro || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Dirección</div>
                        <div className="text-white">{user.address || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Web</div>
                        <div className="text-blue-400">{user.website_url || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Instagram</div>
                        <div className="text-pink-400">{user.instagram_url || '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Registrado</div>
                        <div className="text-white">{user.created_at ? new Date(user.created_at).toLocaleDateString('es-AR') : '—'}</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">Actualizado</div>
                        <div className="text-white">{user.updated_at ? new Date(user.updated_at).toLocaleDateString('es-AR') : '—'}</div>
                      </div>
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">Bio</div>
                        <p className="text-xs text-slate-300">{user.bio}</p>
                      </div>
                    )}

                    {/* Acciones admin */}
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-800/60">
                      {/* Cambiar tipo de usuario */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold">Cambiar tipo:</span>
                        {['particular', 'agencia', 'negocio_automotor'].map(type => (
                          <button key={type} onClick={() => handleUpdateUserType(user.id, type)} disabled={saving || user.user_type === type}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer ${user.user_type === type ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'} disabled:opacity-50`}>
                            {USER_TYPE_STYLES[type]?.label}
                          </button>
                        ))}
                      </div>

                      {/* Activar plan manualmente */}
                      {user.plan_status !== 'active' && user.current_plan && (
                        <button onClick={() => handleActivatePlan(user.id, user.current_plan)} disabled={saving}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all hover:bg-emerald-600/50">
                          <Zap className="w-3 h-3" /> Activar Plan
                        </button>
                      )}

                      {user.plan_status === 'active' && (
                        <button onClick={() => handleCancelPlan(user.id)} disabled={saving}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-black flex items-center gap-1 cursor-pointer transition-all hover:bg-rose-500/30">
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: PAGOS / PLANES
// ─────────────────────────────────────────────────────────────────────────────
function SectionPagos({ toast }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [saving, setSaving] = useState(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('plan_payment_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setRequests(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleApprove = async (req) => {
    setSaving(req.id);
    try {
      await supabase.from('plan_payment_requests').update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      }).eq('id', req.id);

      await supabase.from('profiles').update({
        plan_status: 'active',
        current_plan: req.plan_key,
        updated_at: new Date().toISOString(),
      }).eq('id', req.user_id);

      toast.show(`✅ Plan "${req.plan_label}" activado para ${req.user_name}`);
      fetchRequests();
    } finally {
      setSaving(null);
    }
  };

  const handleReject = async (req) => {
    setSaving(req.id);
    try {
      await supabase.from('plan_payment_requests').update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      }).eq('id', req.id);

      await supabase.from('profiles').update({
        plan_status: 'rejected',
        updated_at: new Date().toISOString(),
      }).eq('id', req.user_id);

      toast.show('Solicitud rechazada', 'error');
      fetchRequests();
    } finally {
      setSaving(null);
    }
  };

  const filtered = filterStatus === 'all' ? requests : requests.filter(r => r.status === filterStatus);

  const statusStyles = {
    pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    approved: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    rejected: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={CreditCard}
        title="Validación de Pagos"
        sub={`${pendingCount} solicitudes pendientes de verificación`}
        action={
          <button onClick={fetchRequests} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </button>
        }
      />

      {/* Filtro de estado */}
      <div className="flex gap-2 flex-wrap">
        {[
          { key: 'pending', label: 'Pendientes', count: requests.filter(r => r.status === 'pending').length },
          { key: 'approved', label: 'Aprobados', count: requests.filter(r => r.status === 'approved').length },
          { key: 'rejected', label: 'Rechazados', count: requests.filter(r => r.status === 'rejected').length },
          { key: 'all', label: 'Todos', count: requests.length },
        ].map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilterStatus(key)}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${filterStatus === key ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}>
            {label} <span className="ml-1 opacity-70">({count})</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm">
              {filterStatus === 'pending' ? '🎉 No hay solicitudes pendientes.' : 'No hay solicitudes en esta categoría.'}
            </div>
          )}
          {filtered.map(req => (
            <div key={req.id} className={`bg-[#0F172A] border rounded-2xl p-5 transition-all ${req.status === 'pending' ? 'border-amber-700/40 shadow-amber-950/30 shadow-lg' : 'border-slate-800'}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-white">{req.user_name || 'Sin nombre'}</span>
                    <Badge className={statusStyles[req.status] || 'bg-slate-700/50 text-slate-400'}>
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
                    <span className="text-slate-500">{req.payment_method?.replace('_', ' / ')}</span>
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
                    <button onClick={() => handleApprove(req)} disabled={saving === req.id}
                      className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-900/30 disabled:opacity-50">
                      {saving === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      Aprobar
                    </button>
                    <button onClick={() => handleReject(req)} disabled={saving === req.id}
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: VEHÍCULOS
// ─────────────────────────────────────────────────────────────────────────────
function SectionVehiculos({ toast }) {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [saving, setSaving] = useState(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setVehicles(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  const handleToggleStatus = async (vehicle) => {
    const newStatus = vehicle.status === 'active' ? 'paused' : 'active';
    setSaving(vehicle.id);
    try {
      await supabase.from('vehicles').update({ status: newStatus }).eq('id', vehicle.id);
      toast.show(`Vehículo ${newStatus === 'active' ? 'activado' : 'pausado'}`);
      fetchVehicles();
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (vehicleId) => {
    if (!window.confirm('¿Eliminar esta publicación? Esta acción no se puede deshacer.')) return;
    setSaving(vehicleId);
    try {
      await supabase.from('vehicles').delete().eq('id', vehicleId);
      toast.show('Publicación eliminada');
      fetchVehicles();
    } finally {
      setSaving(null);
    }
  };

  const filtered = vehicles.filter(v => {
    const matchSearch = !searchTerm ||
      v.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.seller_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.brand?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || v.status === filterStatus;
    const matchCategory = filterCategory === 'all' || v.category === filterCategory;
    return matchSearch && matchStatus && matchCategory;
  });

  const statusColors = {
    active: 'bg-emerald-500/90 text-white',
    paused: 'bg-amber-500/90 text-white',
    sold: 'bg-slate-600 text-white',
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Car}
        title="Moderación de Vehículos"
        sub={`${filtered.length} de ${vehicles.length} publicaciones`}
        action={
          <button onClick={fetchVehicles} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, marca, vendedor..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-violet-500 focus:outline-none cursor-pointer">
          <option value="all">Todos los estados</option>
          <option value="active">Activos</option>
          <option value="paused">Pausados</option>
          <option value="sold">Vendidos</option>
        </select>
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
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
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm">No se encontraron publicaciones.</div>
          )}
          {filtered.map(v => (
            <div key={v.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl overflow-hidden flex gap-0">
              {/* Thumbnail */}
              <div className="w-24 h-24 sm:w-32 sm:h-28 flex-shrink-0 relative overflow-hidden">
                <img src={v.image_url} alt={v.title} className="w-full h-full object-cover" />
                <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px] font-black ${statusColors[v.status] || 'bg-slate-600 text-white'}`}>
                  {v.status || 'active'}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 p-4 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="text-sm font-black text-white line-clamp-1">{v.title}</h4>
                    <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="font-mono font-black text-violet-300">{v.formatted_price || `${v.price_currency} ${fmt(v.price)}`}</span>
                      <span>{v.location}</span>
                      <span className="text-slate-600">{timeAgo(v.created_at)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1 text-[10px] text-slate-500">
                      <span>{v.seller_name}</span>
                      <span>·</span>
                      <span>{v.category_label}</span>
                      <span>·</span>
                      <span>{v.year} · {v.mileage}</span>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => handleToggleStatus(v)} disabled={saving === v.id}
                      className={`p-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${v.status === 'active' ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'}`}
                      title={v.status === 'active' ? 'Pausar' : 'Activar'}>
                      {saving === v.id ? <Loader2 className="w-4 h-4 animate-spin" /> : v.status === 'active' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(v.id)} disabled={saving === v.id}
                      className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all cursor-pointer"
                      title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: HERO / BANNER
// ─────────────────────────────────────────────────────────────────────────────
function SectionHero({ toast }) {
  const [heroUrl, setHeroUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Cargar URL actual del hero desde localStorage o configuración
  useEffect(() => {
    const stored = localStorage.getItem('sa_hero_image_url');
    if (stored) {
      setHeroUrl(stored);
      setPreviewUrl(stored);
    } else {
      setPreviewUrl('/hero_daylight_fleet.png');
    }
  }, []);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { uploadVehicleImage } = await import('../lib/supabase');
      const url = await uploadVehicleImage(file);
      setHeroUrl(url);
      setPreviewUrl(url);
      toast.show('Imagen cargada. Guardá los cambios para aplicar.');
    } catch (err) {
      toast.show('Error al subir la imagen: ' + err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!heroUrl.trim()) {
      toast.show('Ingresá una URL válida', 'error');
      return;
    }
    setSaving(true);
    try {
      // Guardar en localStorage para que el HeroSection lo use
      localStorage.setItem('sa_hero_image_url', heroUrl.trim());

      // También podría guardarse en Supabase en una tabla de configuración
      // Por ahora usamos localStorage como mecanismo simple
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      toast.show('✅ Imagen del hero actualizada. Recargá la página para ver el cambio.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('sa_hero_image_url');
    setHeroUrl('');
    setPreviewUrl('/hero_daylight_fleet.png');
    toast.show('Hero restaurado a la imagen original');
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Image}
        title="Imagen del Hero / Banner"
        sub="Cambiá la imagen de fondo de la sección principal (Hero) de la home"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-violet-400" />
            Configurar imagen
          </h3>

          {/* Upload directo */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">Subir imagen desde tu dispositivo</label>
            <label className="flex items-center justify-center gap-3 w-full py-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-violet-500/50 bg-slate-900/50 cursor-pointer transition-all group">
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              {uploading ? (
                <><Loader2 className="w-4 h-4 text-violet-400 animate-spin" /><span className="text-xs text-violet-300 font-bold">Subiendo...</span></>
              ) : (
                <><Upload className="w-4 h-4 text-slate-500 group-hover:text-violet-400 transition-colors" /><span className="text-xs text-slate-400 group-hover:text-violet-300 font-bold transition-colors">Seleccionar imagen (JPG, PNG, WebP)</span></>
              )}
            </label>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800"></div>
            <span className="text-[10px] text-slate-500 font-bold">O ingresá una URL</span>
            <div className="flex-1 h-px bg-slate-800"></div>
          </div>

          {/* URL manual */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300">URL de la imagen</label>
            <input
              type="url"
              value={heroUrl}
              onChange={e => { setHeroUrl(e.target.value); setPreviewUrl(e.target.value); }}
              placeholder="https://ejemplo.com/mi-hero-banner.jpg"
              className="w-full px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none"
            />
            <p className="text-[10px] text-slate-500">Recomendado: imagen horizontal de al menos 1920×1080px, optimizada para web.</p>
          </div>

          <div className="flex gap-3">
            <button onClick={handleSave} disabled={saving || !heroUrl}
              className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 shadow-lg shadow-violet-900/30">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              {saved ? '¡Guardado!' : 'Guardar Cambios'}
            </button>
            <button onClick={handleReset}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all">
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-700/30 text-[10px] text-amber-300">
            <AlertCircle className="w-3 h-3 inline mr-1" />
            <strong>Nota:</strong> Los cambios se guardan localmente. Para persistir en todos los dispositivos, configurar una tabla de site_settings en Supabase.
          </div>
        </div>

        {/* Preview */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-400" /> Vista Previa del Hero
          </h3>
          <div className="relative rounded-xl overflow-hidden aspect-video border border-slate-700/50">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview Hero" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                <Image className="w-10 h-10 text-slate-700" />
              </div>
            )}
            {/* Overlay simulado del hero */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/75 via-slate-900/40 to-transparent" />
            <div className="absolute inset-0 flex items-center px-6">
              <div className="space-y-1.5">
                <div className="h-3 w-32 bg-white/90 rounded-sm"></div>
                <div className="h-2 w-48 bg-white/60 rounded-sm"></div>
                <div className="h-2 w-40 bg-white/40 rounded-sm"></div>
                <div className="flex gap-2 mt-2">
                  <div className="h-5 w-20 bg-violet-600 rounded-md"></div>
                  <div className="h-5 w-20 bg-white/10 border border-white/20 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 text-center">Vista simulada del hero con overlay aplicado</p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: NEGOCIOS / DIRECTORIO
// ─────────────────────────────────────────────────────────────────────────────
function SectionNegocios({ toast }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRubro, setFilterRubro] = useState('all');
  const [saving, setSaving] = useState(null);

  const rubros = [
    { id: 'repuestos', label: 'Repuestos' },
    { id: 'talleres', label: 'Talleres Mecánicos' },
    { id: 'lubricentros', label: 'Lubricentros' },
    { id: 'gomerias', label: 'Gomería / Alineación' },
    { id: 'carrocerias', label: 'Carrocerías' },
    { id: 'electricista', label: 'Electricista Automotriz' },
    { id: 'audio', label: 'Audio y Alarmas' },
    { id: 'blindaje', label: 'Blindaje' },
    { id: 'seguros', label: 'Seguros' },
    { id: 'financiacion', label: 'Financiación' },
    { id: 'inspeccion', label: 'Inspección / VTV' },
  ];

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('services_directory')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error) setServices(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este negocio del directorio?')) return;
    setSaving(id);
    try {
      await supabase.from('services_directory').delete().eq('id', id);
      toast.show('Negocio eliminado del directorio');
      fetchServices();
    } finally {
      setSaving(null);
    }
  };

  const handleToggleVerified = async (service) => {
    setSaving(service.id);
    try {
      await supabase.from('services_directory').update({ verified: !service.verified }).eq('id', service.id);
      toast.show(service.verified ? 'Verificación removida' : 'Negocio verificado ✓');
      fetchServices();
    } finally {
      setSaving(null);
    }
  };

  const filtered = services.filter(s => {
    const matchSearch = !searchTerm ||
      s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRubro = filterRubro === 'all' || s.rubro_id === filterRubro;
    return matchSearch && matchRubro;
  });

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Wrench}
        title="Directorio de Negocios"
        sub={`${filtered.length} de ${services.length} negocios en el directorio`}
        action={
          <button onClick={fetchServices} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </button>
        }
      />

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o ciudad..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none" />
        </div>
        <select value={filterRubro} onChange={e => setFilterRubro(e.target.value)}
          className="px-3 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:border-violet-500 focus:outline-none cursor-pointer">
          <option value="all">Todos los rubros</option>
          {rubros.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm">No hay negocios en el directorio.</div>
          )}
          {filtered.map(s => (
            <div key={s.id} className="bg-[#0F172A] border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black text-white">{s.name}</span>
                  {s.verified && <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30"><Check className="w-2.5 h-2.5" /> Verificado</Badge>}
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">{rubros.find(r => r.id === s.rubro_id)?.label || s.rubro_id}</Badge>
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.city}, {s.province}</span>
                  {s.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</span>}
                  <span className="text-slate-600">⭐ {s.rating}</span>
                  <span className="text-slate-600">{timeAgo(s.created_at)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button onClick={() => handleToggleVerified(s)} disabled={saving === s.id}
                  className={`p-2 rounded-xl text-xs transition-all cursor-pointer ${s.verified ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                  title={s.verified ? 'Quitar verificación' : 'Verificar'}>
                  {saving === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(s.id)} disabled={saving === s.id}
                  className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all cursor-pointer">
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: LEADS
// ─────────────────────────────────────────────────────────────────────────────
function SectionLeads({ toast }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*, vehicles(title, brand, model, seller_name)')
        .order('created_at', { ascending: false })
        .limit(100);
      if (!error) setLeads(data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={MessageSquare}
        title="Leads / Consultas WhatsApp"
        sub={`${leads.length} consultas registradas (últimas 100)`}
        action={
          <button onClick={fetchLeads} disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Recargar
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-2">
          {leads.length === 0 && (
            <div className="text-center py-16 text-slate-500 text-sm">No hay leads registrados todavía.</div>
          )}
          {leads.map(lead => (
            <div key={lead.id} className="bg-[#0F172A] border border-slate-800 rounded-xl p-4 flex items-center gap-4">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-black text-white line-clamp-1">
                  {lead.vehicles?.title || 'Vehículo eliminado'}
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-[10px] text-slate-400">
                  <span>Vendedor: {lead.vehicles?.seller_name || '—'}</span>
                  <span className="font-mono text-emerald-400">WA: {lead.seller_whatsapp}</span>
                  <span className="text-slate-600">{timeAgo(lead.created_at)}</span>
                </div>
              </div>
              <a href={`https://wa.me/${lead.seller_whatsapp}`} target="_blank" rel="noopener noreferrer"
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: CONFIGURACIÓN
// ─────────────────────────────────────────────────────────────────────────────
function SectionConfiguracion({ toast }) {
  const [config, setConfig] = useState({
    siteName: 'Sitio Automotor',
    contactEmail: 'admin@sitioautomotor.com',
    contactWhatsApp: '5491112345678',
    bankName: '',
    bankAlias: '',
    bankCBU: '',
    bankOwner: '',
    paymentInstructions: 'Para activar tu plan, realizá el pago al CBU/alias indicado y hacé clic en "Ya pagué".',
    heroTitle: 'Todo el mundo automotor en un solo sitio.',
    footerText: 'Sitio Automotor © 2024',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sa_site_config');
      if (stored) setConfig(prev => ({ ...prev, ...JSON.parse(stored) }));
    } catch {}
  }, []);

  const handleSave = () => {
    localStorage.setItem('sa_site_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    toast.show('Configuración guardada ✓');
  };

  const fields = [
    { key: 'siteName', label: 'Nombre del sitio', type: 'text' },
    { key: 'contactEmail', label: 'Email de contacto', type: 'email' },
    { key: 'contactWhatsApp', label: 'WhatsApp de soporte (sin +)', type: 'tel' },
    { key: 'bankName', label: 'Banco / Billetera para cobros', type: 'text', placeholder: 'Ej. Mercado Pago / Santander' },
    { key: 'bankAlias', label: 'Alias CBU', type: 'text', placeholder: 'Ej. SITIO.AUTOMOTOR.MP' },
    { key: 'bankCBU', label: 'CBU', type: 'text', placeholder: '22 dígitos' },
    { key: 'bankOwner', label: 'Titular de la cuenta', type: 'text' },
  ];

  const textareaFields = [
    { key: 'paymentInstructions', label: 'Instrucciones de pago (visible para usuarios)', rows: 3 },
    { key: 'heroTitle', label: 'Texto principal del Hero', rows: 2 },
    { key: 'footerText', label: 'Texto del footer', rows: 2 },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={Settings}
        title="Configuración del Sitio"
        sub="Ajustes globales del sistema"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campos de texto */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-violet-400" /> Información General
          </h3>
          {fields.map(({ key, label, type, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">{label}</label>
              <input type={type} value={config[key]} onChange={e => setConfig(p => ({ ...p, [key]: e.target.value }))}
                placeholder={placeholder}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none" />
            </div>
          ))}
        </div>

        {/* Textos largos */}
        <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" /> Textos del Sitio
          </h3>
          {textareaFields.map(({ key, label, rows }) => (
            <div key={key} className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">{label}</label>
              <textarea rows={rows} value={config[key]} onChange={e => setConfig(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none resize-none" />
            </div>
          ))}

          {/* Seguridad */}
          <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-700/30 space-y-2">
            <h4 className="text-xs font-black text-violet-300 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" /> SuperAdmin Emails
            </h4>
            <p className="text-[10px] text-slate-400">Los siguientes emails tienen acceso total al panel:</p>
            <div className="space-y-1">
              {SUPER_ADMIN_EMAILS.map(email => (
                <div key={email} className="text-[10px] font-mono text-violet-300 bg-violet-950/50 px-2 py-1 rounded-lg">{email}</div>
              ))}
            </div>
            <p className="text-[10px] text-slate-500">Para agregar un email, editá el array SUPER_ADMIN_EMAILS en SuperAdminPage.jsx</p>
          </div>
        </div>
      </div>

      <button onClick={handleSave}
        className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-xl shadow-violet-900/30">
        {saved ? <><CheckCircle2 className="w-5 h-5" /> ¡Guardado!</> : <><Settings className="w-5 h-5" /> Guardar Configuración</>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN: SuperAdminPage
// ─────────────────────────────────────────────────────────────────────────────
export default function SuperAdminPage({ currentUser, onBackToHome, onSignOut }) {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const toast = useToast();

  // ── Verificar acceso ────────────────────────────────────────────────────────
  const userEmail = currentUser?.user?.email || currentUser?.profile?.email || '';
  const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(userEmail.toLowerCase());

  // ── Cargar estadísticas ─────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const [
        { count: totalUsers },
        { count: totalVehicles },
        { data: paymentRequests },
        { count: totalLeads },
        { data: profiles },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('vehicles').select('*', { count: 'exact', head: true }),
        supabase.from('plan_payment_requests').select('status, plan_price'),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('user_type, plan_status, current_plan'),
      ]);

      const pending = (paymentRequests || []).filter(r => r.status === 'pending');
      const approved = (paymentRequests || []).filter(r => r.status === 'approved');
      const rejected = (paymentRequests || []).filter(r => r.status === 'rejected');
      const estimatedRevenue = approved.reduce((sum, r) => sum + (r.plan_price || 0), 0);

      const profileList = profiles || [];
      const activePlans = profileList.filter(p => p.plan_status === 'active').length;

      setStats({
        totalUsers: totalUsers || 0,
        totalVehicles: totalVehicles || 0,
        totalLeads: totalLeads || 0,
        pendingPayments: pending.length,
        pendingRequests: pending.length,
        approvedRequests: approved.length,
        rejectedRequests: rejected.length,
        totalRequests: (paymentRequests || []).length,
        estimatedRevenue,
        activePlans,
        totalParticulares: profileList.filter(p => p.user_type === 'particular').length,
        totalAgencias: profileList.filter(p => p.user_type === 'agencia').length,
        totalNegocios: profileList.filter(p => p.user_type === 'negocio_automotor').length,
      });
    } catch (e) {
      console.warn('Stats error:', e);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Secciones del sidebar ────────────────────────────────────────────────────
  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'usuarios', label: 'Usuarios', icon: Users, badge: null },
    { id: 'pagos', label: 'Pagos / Planes', icon: CreditCard, badge: stats?.pendingPayments || null },
    { id: 'vehiculos', label: 'Vehículos', icon: Car },
    { id: 'hero', label: 'Hero / Banner', icon: Image },
    { id: 'negocios', label: 'Directorio', icon: Wrench },
    { id: 'leads', label: 'Leads WA', icon: MessageSquare },
    { id: 'config', label: 'Configuración', icon: Settings },
  ];

  // ── Acceso denegado ──────────────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="w-16 h-16 text-rose-500 mx-auto" />
          <h2 className="text-xl font-black text-white">Acceso Restringido</h2>
          <p className="text-slate-400 text-sm">Debés iniciar sesión para acceder.</p>
          <button onClick={onBackToHome} className="px-6 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm cursor-pointer">
            Volver al inicio
          </button>
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
          <p className="text-slate-400 text-sm">No tenés permisos para acceder al panel de SuperAdmin.</p>
          <p className="text-[11px] text-slate-600 font-mono bg-slate-900 rounded-xl p-3 border border-slate-800">
            Email actual: {userEmail}
          </p>
          <button onClick={onBackToHome} className="px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm cursor-pointer transition-all">
            Volver al inicio
          </button>
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
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs font-bold cursor-pointer">
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
            {stats?.pendingPayments > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-black">
                <Bell className="w-3.5 h-3.5" />
                {stats.pendingPayments} pago{stats.pendingPayments !== 1 ? 's' : ''} pendiente{stats.pendingPayments !== 1 ? 's' : ''}
              </div>
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
        {/* Sidebar */}
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

          {/* Info card */}
          <div className="mt-auto pt-6">
            <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-700/30 space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-violet-300" />
                <span className="text-[10px] font-black text-violet-300">Acceso Total</span>
              </div>
              <p className="text-[9px] text-slate-500">Todas las operaciones se registran y son irreversibles.</p>
            </div>
          </div>
        </aside>

        {/* Mobile Nav */}
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

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto min-w-0">
          {activeSection === 'dashboard' && (
            <SectionDashboard stats={stats} loading={loadingStats} onRefresh={fetchStats} />
          )}
          {activeSection === 'usuarios' && <SectionUsuarios toast={toast} />}
          {activeSection === 'pagos' && <SectionPagos toast={toast} />}
          {activeSection === 'vehiculos' && <SectionVehiculos toast={toast} />}
          {activeSection === 'hero' && <SectionHero toast={toast} />}
          {activeSection === 'negocios' && <SectionNegocios toast={toast} />}
          {activeSection === 'leads' && <SectionLeads toast={toast} />}
          {activeSection === 'config' && <SectionConfiguracion toast={toast} />}
        </main>
      </div>
    </div>
  );
}
