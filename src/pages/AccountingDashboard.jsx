import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, ShoppingCart,
  PlusCircle, Trash2, RefreshCw, FileText, Calendar,
  ArrowUpRight, ArrowDownRight, ChevronDown, X,
  Receipt, BarChart2, BookOpen, List, Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ───────────────────────────────────────────────
const API = 'http://localhost/nasirah-mart/api-php/accounting';

const PIE_COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'];

const TABS = [
  { id: 'dashboard',    label: 'Dashboard',       icon: BarChart2  },
  { id: 'revenue',      label: 'Revenue',          icon: TrendingUp },
  { id: 'expenses',     label: 'Expenses',         icon: Wallet     },
  { id: 'pnl',          label: 'Profit & Loss',    icon: FileText   },
  { id: 'transactions', label: 'Transactions',     icon: List       },
];

// ─── Helpers ─────────────────────────────────────────────────
const fmt  = (n) => Number(n||0).toLocaleString();
const fmtK = (n) => { const v = Number(n||0); return v >= 1000 ? (v/1000).toFixed(1)+'K' : v.toFixed(0); };
const fmtDate = (d) => new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── Shared UI ───────────────────────────────────────────────
const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl border border-slate-200 shadow-sm ${className}`}>{children}</div>
);

const SectionHeader = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-lg font-black text-slate-900">{title}</h2>
    {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: ৳{fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

// ─── KPI Card ────────────────────────────────────────────────
const KPICard = ({ label, value, sub, icon: Icon, color, trend }) => (
  <Card className="p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className={`text-2xl font-black mt-1 ${color}`}>৳{fmt(value)}</p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-2xl ${color.includes('emerald') ? 'bg-emerald-50' : color.includes('rose') ? 'bg-rose-50' : color.includes('blue') ? 'bg-blue-50' : 'bg-amber-50'}`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
    </div>
    {trend !== undefined && (
      <div className={`flex items-center gap-1 mt-3 text-xs font-bold ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
        {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {Math.abs(trend)}% vs last period
      </div>
    )}
  </Card>
);

// ─── Add Expense Modal ────────────────────────────────────────
const AddExpenseModal = ({ categories, onClose, onSaved }) => {
  const [form, setForm] = useState({ category_id: '', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0], note: '' });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.category_id || !form.amount) return alert('Category and amount required');
    setSaving(true);
    try {
      const { data } = await axios.post(`${API}/add_expense.php`, form);
      if (data.success) { onSaved(); onClose(); }
      else alert(data.message);
    } catch { alert('Server error'); }
    finally { setSaving(false); }
  };

  const fields = [
    { label: 'Category', type: 'select', key: 'category_id',
      options: categories.map(c => ({ value: c.id, label: c.name })) },
    { label: 'Description', type: 'text', key: 'description', placeholder: 'e.g. Monthly office rent' },
    { label: 'Amount (৳)', type: 'number', key: 'amount', placeholder: '0.00' },
    { label: 'Date', type: 'date', key: 'expense_date' },
    { label: 'Note (optional)', type: 'text', key: 'note', placeholder: 'Any additional note' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0, scale:0.95 }}
        className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="bg-rose-500 p-2.5 rounded-xl shadow-lg shadow-rose-200"><Wallet className="text-white w-5 h-5" /></div>
            <h3 className="text-lg font-black text-slate-900">Add Expense</h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:text-rose-500 hover:bg-white border border-transparent hover:border-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-1.5">{f.label}</label>
              {f.type === 'select' ? (
                <select value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-slate-50">
                  <option value="">Select category…</option>
                  {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              ) : (
                <input type={f.type} value={form[f.key]} onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 bg-slate-50" />
              )}
            </div>
          ))}
        </div>
        <div className="p-6 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-2xl font-bold text-sm hover:bg-slate-200">Cancel</button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-3 rounded-2xl font-bold text-sm shadow-lg shadow-rose-200 disabled:opacity-40 flex items-center justify-center gap-2">
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Add Expense'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Tab: Dashboard ──────────────────────────────────────────
const DashboardTab = ({ summary, loading }) => {
  if (loading) return <div className="flex items-center justify-center py-32 text-slate-400"><RefreshCw className="w-6 h-6 animate-spin mr-3" /> Loading…</div>;
  if (!summary) return null;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard label="Total Revenue"  value={summary.total_revenue}  color="text-blue-600"    icon={TrendingUp}   sub="All non-cancelled orders" />
        <KPICard label="Total Expenses" value={summary.total_expenses} color="text-rose-500"    icon={TrendingDown} sub="Recorded expenses" />
        <KPICard label="Net Profit"     value={summary.net_profit}     color={summary.net_profit >= 0 ? 'text-emerald-600' : 'text-rose-500'} icon={DollarSign} sub={`Margin: ${summary.profit_margin}%`} />
        <KPICard label="Orders Value"   value={summary.total_revenue}  color="text-amber-600"   icon={ShoppingCart} sub="Gross sales" />
      </div>

      {/* Revenue vs Expense Area Chart */}
      <Card className="p-6">
        <h3 className="font-black text-slate-900 mb-5">Revenue vs Expenses</h3>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={summary.chart_data}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#3b82f6" fill="url(#gRev)" strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="url(#gExp)" strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      {/* Profit Bar + Order Status Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-black text-slate-900 mb-5">Monthly Profit</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={summary.chart_data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="profit" name="Profit" radius={[6,6,0,0]}>
                {summary.chart_data.map((entry, i) => (
                  <Cell key={i} fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="font-black text-slate-900 mb-5">Order Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={summary.status_data} dataKey="count" nameKey="status" cx="50%" cy="50%"
                outerRadius={80} label={({ status, percent }) => `${status} ${(percent*100).toFixed(0)}%`}
                labelLine={false}>
                {summary.status_data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v + ' orders', n]} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ─── Tab: Revenue ────────────────────────────────────────────
const RevenueTab = ({ year, setYear }) => {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await axios.get(`${API}/get_summary.php`, { params: { period, year } });
      setData(d);
    } finally { setLoading(false); }
  }, [period, year]);

  useEffect(() => { fetch(); }, [fetch]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionHeader title="Revenue Report" subtitle="Sales performance over time" />
        <div className="flex items-center gap-3">
          {['daily','monthly','yearly'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${period===p ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 text-slate-400"><RefreshCw className="w-6 h-6 animate-spin mr-3" /></div>
      ) : data && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {[
              { l: 'Total Revenue',  v: data.total_revenue,  c: 'text-blue-600' },
              { l: 'Total Expenses', v: data.total_expenses, c: 'text-rose-500' },
              { l: 'Net Profit',     v: data.net_profit,     c: data.net_profit >= 0 ? 'text-emerald-600' : 'text-rose-500' },
            ].map(s => (
              <Card key={s.l} className="p-5 text-center">
                <p className="text-[11px] font-bold text-slate-400 uppercase">{s.l}</p>
                <p className={`text-xl font-black mt-1 ${s.c}`}>৳{fmt(s.v)}</p>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={data.chart_data}>
                <defs>
                  <linearGradient id="gR2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#3b82f6" fill="url(#gR2)" strokeWidth={2.5} dot={{ r:3, fill:'#3b82f6' }} />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" fill="none"       strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Revenue table */}
          <Card className="overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {['Period','Revenue','Expenses','Profit','Margin'].map(h => (
                  <th key={h} className="p-4 text-[11px] uppercase font-bold text-slate-400">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {data.chart_data.map((row, i) => {
                  const margin = row.revenue > 0 ? ((row.profit / row.revenue)*100).toFixed(1) : 0;
                  return (
                    <tr key={i} className="hover:bg-slate-50/70">
                      <td className="p-4 font-bold text-slate-900 text-sm">{row.label}</td>
                      <td className="p-4 text-sm text-blue-600 font-bold">৳{fmt(row.revenue)}</td>
                      <td className="p-4 text-sm text-rose-500 font-bold">৳{fmt(row.expenses)}</td>
                      <td className="p-4 text-sm font-black" style={{ color: row.profit >= 0 ? '#059669' : '#ef4444' }}>
                        ৳{fmt(row.profit)}
                      </td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${margin >= 20 ? 'bg-emerald-100 text-emerald-700' : margin >= 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
};

// ─── Tab: Expenses ───────────────────────────────────────────
const ExpensesTab = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterMonth, setFilterMonth] = useState(0);
  const year = new Date().getFullYear();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await axios.get(`${API}/get_expenses.php`, { params: { year, month: filterMonth } });
      setData(d);
    } finally { setLoading(false); }
  }, [filterMonth]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    await axios.post(`${API}/delete_expense.php`, { id });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionHeader title="Expense Manager" subtitle="Track and manage all business expenses" />
        <div className="flex items-center gap-3">
          <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none">
            <option value={0}>All Months</option>
            {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
          </select>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-rose-200 transition-colors">
            <PlusCircle className="w-4 h-4" /> Add Expense
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-32 text-slate-400"><RefreshCw className="w-6 h-6 animate-spin mr-3" /></div>
      ) : data && (
        <>
          {/* Total + Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="p-5 flex items-center gap-4">
              <div className="bg-rose-50 p-3 rounded-2xl"><Wallet className="w-6 h-6 text-rose-500" /></div>
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase">Total Expenses</p>
                <p className="text-2xl font-black text-rose-500 mt-0.5">৳{fmt(data.total)}</p>
              </div>
            </Card>
            <Card className="p-5 lg:col-span-2">
              <p className="text-xs font-bold text-slate-400 uppercase mb-3">By Category</p>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={data.breakdown} layout="vertical">
                  <XAxis type="number" tickFormatter={fmtK} tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip formatter={(v) => ['৳'+fmt(v),'Amount']} />
                  <Bar dataKey="value" radius={[0,4,4,0]}>
                    {data.breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Expense Table */}
          <Card className="overflow-hidden">
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {['Date','Category','Description','Amount','Note',''].map(h => (
                  <th key={h} className="p-4 text-[11px] uppercase font-bold text-slate-400">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {data.expenses.length === 0 ? (
                  <tr><td colSpan={6} className="p-12 text-center text-slate-400 text-sm">No expenses recorded</td></tr>
                ) : data.expenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/70">
                    <td className="p-4 text-sm text-slate-500">{fmtDate(e.expense_date)}</td>
                    <td className="p-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700">{e.category_name}</span>
                    </td>
                    <td className="p-4 text-sm font-semibold text-slate-700">{e.description || '—'}</td>
                    <td className="p-4 text-sm font-black text-rose-500">৳{fmt(e.amount)}</td>
                    <td className="p-4 text-xs text-slate-400">{e.note || '—'}</td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(e.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}

      <AnimatePresence>
        {showModal && data && (
          <AddExpenseModal categories={data.categories} onClose={() => setShowModal(false)} onSaved={fetchData} />
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Tab: Profit & Loss ──────────────────────────────────────
const PnLTab = ({ year }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [sumRes, expRes] = await Promise.all([
          axios.get(`${API}/get_summary.php`, { params: { period: 'monthly', year } }),
          axios.get(`${API}/get_expenses.php`, { params: { year } }),
        ]);
        setData({ summary: sumRes.data, expenses: expRes.data });
      } finally { setLoading(false); }
    })();
  }, [year]);

  const handlePrint = () => window.print();

  if (loading) return <div className="flex items-center justify-center py-32 text-slate-400"><RefreshCw className="w-6 h-6 animate-spin mr-3" /></div>;
  if (!data) return null;

  const { summary, expenses } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionHeader title={`Profit & Loss Statement — ${year}`} subtitle="Full year financial summary" />
        <button onClick={handlePrint} className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2 rounded-xl text-sm font-bold">
          <FileText className="w-4 h-4" /> Print Report
        </button>
      </div>

      <Card className="p-8">
        {/* Header */}
        <div className="text-center border-b border-slate-100 pb-6 mb-6">
          <h2 className="text-xl font-black text-slate-900">Nasirah Mart</h2>
          <p className="text-slate-400 text-sm mt-1">Profit & Loss Statement · January–December {year}</p>
        </div>

        {/* Revenue Section */}
        <div className="mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Revenue</h3>
          <div className="flex justify-between py-2 border-b border-slate-50">
            <span className="text-sm text-slate-700">Gross Sales</span>
            <span className="text-sm font-bold text-slate-900">৳{fmt(summary.total_revenue)}</span>
          </div>
          <div className="flex justify-between py-3 bg-blue-50 px-4 rounded-xl mt-2">
            <span className="text-sm font-black text-blue-900">Total Revenue</span>
            <span className="text-sm font-black text-blue-900">৳{fmt(summary.total_revenue)}</span>
          </div>
        </div>

        {/* Expenses Section */}
        <div className="mb-6">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Expenses</h3>
          {expenses.breakdown.map((cat, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-slate-50">
              <span className="text-sm text-slate-600">{cat.name}</span>
              <span className="text-sm font-semibold text-slate-700">৳{fmt(cat.value)}</span>
            </div>
          ))}
          <div className="flex justify-between py-3 bg-rose-50 px-4 rounded-xl mt-2">
            <span className="text-sm font-black text-rose-700">Total Expenses</span>
            <span className="text-sm font-black text-rose-700">৳{fmt(summary.total_expenses)}</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className={`flex justify-between py-4 px-6 rounded-2xl border-2 ${summary.net_profit >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
          <span className={`text-base font-black ${summary.net_profit >= 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
            {summary.net_profit >= 0 ? 'Net Profit' : 'Net Loss'}
          </span>
          <span className={`text-xl font-black ${summary.net_profit >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
            ৳{fmt(Math.abs(summary.net_profit))}
          </span>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Profit Margin: {summary.profit_margin}% · Generated on {new Date().toLocaleDateString()}
        </p>
      </Card>

      {/* Monthly breakdown chart */}
      <Card className="p-6">
        <h3 className="font-black text-slate-900 mb-5">Monthly P&L Breakdown</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={summary.chart_data} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tickFormatter={fmtK} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue"  name="Revenue"  fill="#3b82f6" radius={[4,4,0,0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#f87171" radius={[4,4,0,0]} />
            <Bar dataKey="profit"   name="Profit"   radius={[4,4,0,0]}>
              {summary.chart_data.map((e, i) => <Cell key={i} fill={e.profit >= 0 ? '#10b981' : '#ef4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ─── Tab: Transactions ───────────────────────────────────────
const TransactionsTab = ({ year }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const { data: d } = await axios.get(`${API}/get_transactions.php`, { params: { year, type: typeFilter, page, limit: LIMIT } });
      setData(d);
    } finally { setLoading(false); }
  }, [typeFilter, page, year]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [typeFilter]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / LIMIT)) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <SectionHeader title="Transaction Ledger" subtitle="All income and expense transactions" />
        <div className="flex items-center gap-2">
          {['all','income','expense'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${typeFilter===t ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {t === 'all' ? 'All' : t}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-400"><RefreshCw className="w-6 h-6 animate-spin mr-3" /></div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead><tr className="bg-slate-50 border-b border-slate-100">
                {['Date','Description','Reference','Type','Amount'].map(h => (
                  <th key={h} className="p-4 text-[11px] uppercase font-bold text-slate-400">{h}</th>
                ))}
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {!data?.transactions?.length ? (
                  <tr><td colSpan={5} className="p-12 text-center text-slate-400 text-sm">No transactions found</td></tr>
                ) : data.transactions.map(t => (
                  <tr key={t.id} className="hover:bg-slate-50/70">
                    <td className="p-4 text-sm text-slate-500">{fmtDate(t.trans_date)}</td>
                    <td className="p-4 text-sm font-semibold text-slate-700">{t.description || '—'}</td>
                    <td className="p-4 text-xs text-slate-400 font-mono">
                      {t.reference_type === 'order' ? `#ORD-${t.reference_id}` : t.reference_type || '—'}
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${t.type==='income' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className={`p-4 text-sm font-black ${t.type==='income' ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {t.type==='income' ? '+' : '-'}৳{fmt(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100">
                <p className="text-sm text-slate-400">Page {page} of {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                    className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50">←</button>
                  <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                    className="px-4 py-2 text-sm font-bold bg-white border border-slate-200 rounded-xl disabled:opacity-30 hover:bg-slate-50">→</button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
};

// ─── ROOT COMPONENT ──────────────────────────────────────────
export const AccountingModule = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const { data } = await axios.get(`${API}/get_summary.php`, { params: { period: 'monthly', year } });
      setSummary(data);
    } finally { setSummaryLoading(false); }
  }, [year]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Accounting</h1>
          <p className="text-slate-400 text-sm mt-0.5">Financial overview · Nasirah Mart</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={year} onChange={e => setYear(Number(e.target.value))}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-semibold outline-none">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={fetchSummary} className="p-2 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-blue-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-2xl p-1 mb-8 overflow-x-auto">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeTab===tab.id ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
              <Icon className="w-4 h-4" />{tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }} transition={{ duration:0.15 }}>
          {activeTab === 'dashboard'    && <DashboardTab summary={summary} loading={summaryLoading} />}
          {activeTab === 'revenue'      && <RevenueTab year={year} setYear={setYear} />}
          {activeTab === 'expenses'     && <ExpensesTab />}
          {activeTab === 'pnl'          && <PnLTab year={year} />}
          {activeTab === 'transactions' && <TransactionsTab year={year} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AccountingModule;