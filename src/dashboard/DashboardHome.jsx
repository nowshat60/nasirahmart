import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { 
  Package, Users, DollarSign, ShoppingCart, 
  TrendingUp, TrendingDown, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, Calendar,
  Activity, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Legend, Cell
} from 'recharts';
import axios from 'axios';
import { cn } from '../lib/utils';

export const DashboardHome = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const response = await axios.get('/api/admin/summary');
        const { stats, orders } = response.data;
        
        // Mock sales trend for now
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const currentMonthIndex = new Date().getMonth();
        const salesTrend = [];
        for (let i = 5; i >= 0; i--) {
          const m = months[(currentMonthIndex - i + 12) % 12];
          salesTrend.push({ month: m, sales: Math.floor(Math.random() * 5000) + 1000 });
        }

        setSummary({
          total_sales: stats.total_sales,
          total_orders: stats.total_orders,
          total_customers: stats.total_customers,
          inventory_value: stats.inventory_value,
          low_stock_count: stats.low_stock_count,
          in_stock_percentage: 85,
          low_stock_percentage: 15,
          total_expenses: 5000,
          sales_trend: salesTrend,
          expense_breakdown: [
            { name: 'Rent', value: 2000 },
            { name: 'Salaries', value: 3000 }
          ]
        });
        setLoading(false);
      } catch (error) {
        console.error('Dashboard fetching error:', error);
        setLoading(false);
      }
    };
    fetchSummary();
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  const stats = [
    { label: t('dashboard.home.total_revenue'), value: `${t('product.price')} ${(summary?.total_sales || 0).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50', trend: '+12.5%', isUp: true },
    { label: t('dashboard.home.total_orders'), value: summary?.total_orders, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50', trend: '+5.2%', isUp: true },
    { label: t('dashboard.home.active_users'), value: summary?.total_customers, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50', trend: '+8.1%', isUp: true },
    { label: t('dashboard.home.inventory_value'), value: `${t('product.price')} ${(summary?.inventory_value || 0).toLocaleString()}`, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50', trend: '-2.4%', isUp: false },
  ];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('dashboard.home.title')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.home.subtitle')}</p>
        </div>
        <div className="flex items-center gap-4 self-start sm:self-auto">
          <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <Calendar className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-bold text-slate-700">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Bento Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-[2rem] border-white/50 shadow-sm hover:shadow-xl transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={cn("p-4 rounded-2xl transition-transform group-hover:scale-110", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg",
                stat.isUp ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
              )}>
                {stat.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {stat.trend}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] border-white/50 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{t('dashboard.home.sales_trend')}</h2>
            </div>
            <select className="bg-slate-50 border-none rounded-xl py-2 px-4 text-sm font-bold text-slate-600 focus:ring-2 focus:ring-emerald-500">
              <option>{t('dashboard.home.last_6_months')}</option>
              <option>{t('dashboard.reports.last_year')}</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={summary?.sales_trend}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  itemStyle={{fontWeight: 700}}
                />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory & Low Stock Alerts */}
        <div className="glass p-8 rounded-[2.5rem] border-white/50 shadow-sm flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-rose-500 rounded-2xl text-white shadow-lg shadow-rose-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t('dashboard.home.stock_alerts')}</h2>
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="p-6 bg-rose-50 rounded-3xl border border-rose-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-rose-900">{t('dashboard.home.low_stock')}</p>
                <p className="text-3xl font-black text-rose-600">{summary?.low_stock_count}</p>
              </div>
              <button 
                onClick={() => navigate('/admin/inventory')}
                className="p-3 bg-white rounded-2xl text-rose-500 shadow-sm hover:scale-110 transition-transform"
              >
                <ArrowUpRight className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.home.inventory_health')}</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">{t('dashboard.home.in_stock')}</span>
                  <span className="font-bold text-emerald-600">{summary?.in_stock_percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${summary?.in_stock_percentage}%` }} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 font-medium">{t('dashboard.home.out_of_stock')}</span>
                  <span className="font-bold text-rose-600">{summary?.low_stock_percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: `${summary?.low_stock_percentage}%` }} />
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/admin/inventory')}
            className="mt-8 w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            {t('dashboard.home.manage_inventory')}
          </button>
        </div>
      </div>

      {/* Finance Snapshot Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-[2.5rem] border-white/50 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-500 rounded-2xl text-white shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t('dashboard.home.financial_health')}</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-50 rounded-3xl">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">{t('dashboard.home.gross_profit')}</p>
              <p className="text-2xl font-bold text-slate-900">{t('product.price')} {((summary?.total_sales || 0) * 0.4).toLocaleString()}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">{t('dashboard.home.net_profit')}</p>
              <p className="text-2xl font-bold text-emerald-600">{t('product.price')} {((summary?.total_sales || 0) * 0.3).toLocaleString()}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">{t('dashboard.home.accounts_receivable')}</p>
              <p className="text-2xl font-bold text-blue-600">{t('product.price')} {((summary?.total_sales || 0) * 0.1).toLocaleString()}</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl">
              <p className="text-xs text-slate-400 font-bold uppercase mb-1">{t('dashboard.home.operational_expenses')}</p>
              <p className="text-2xl font-bold text-rose-600">{t('product.price')} {(summary?.total_expenses || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="glass p-8 rounded-[2.5rem] border-white/50 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-purple-500 rounded-2xl text-white shadow-lg shadow-purple-500/20">
              <PieChartIcon className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">{t('dashboard.home.expense_breakdown')}</h2>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={summary?.expense_breakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '1rem', border: 'none'}} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
