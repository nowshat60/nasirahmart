import React, { useState, useEffect } from 'react';
import { 
  DollarSign, BookOpen, FileText, Receipt, 
  TrendingUp, TrendingDown, Landmark, 
  ArrowUpRight, ArrowDownRight, Calendar,
  ChevronRight, Wallet, CreditCard, PieChart as PieChartIcon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { cn } from '../lib/utils';
import AxiosInstance from '../api/AxiosInstance'; // Tomar existing AxiosInstance

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6'];

export const AccountingDashboard = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalAssets: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0
  });
  const [loading, setLoading] = useState(true);

  // Module configuration for easy navigation
  const modules = [
    { 
      title: t('dashboard.finance.coa'), 
      desc: t('dashboard.finance.coa_desc'), 
      icon: BookOpen, 
      path: '/admin/finance/coa',
      color: 'bg-emerald-500'
    },
    { 
      title: t('dashboard.finance.journal'), 
      desc: "Double-entry book-keeping entries", 
      icon: FileText, 
      path: '/admin/finance/journal',
      color: 'bg-blue-500'
    },
    { 
      title: t('dashboard.finance.expenses'), 
      desc: t('dashboard.finance.expenses_desc'), 
      icon: Receipt, 
      path: '/admin/finance/expenses',
      color: 'bg-rose-500'
    },
    { 
      title: "Financial Statements", 
      desc: "Balance Sheet & PnL Reports", 
      icon: Landmark, 
      path: '/admin/finance/statements',
      color: 'bg-amber-500'
    }
  ];
// AccountingDashboard.jsx e useEffect er bhetor
const fetchChartData = async () => {
  const res = await AxiosInstance.get('/finance/get_monthly_performance.php');
  setPerformanceData(res.data); // monthly revenue vs expense data
};
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await AxiosInstance.get('/finance/get_dashboard_stats.php');
        setStats(res.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching accounting stats", error);
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            {t('dashboard.finance.title')}
          </h1>
          <p className="text-slate-500 font-medium">Enterprise Resource Planning & Financial Oversight</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-2 rounded-3xl shadow-sm border border-slate-100">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <span className="pr-4 font-bold text-slate-700">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Revenue" value={stats.totalRevenue} icon={TrendingUp} color="emerald" trend="+12.5%" />
        <StatCard title="Total Expenses" value={stats.totalExpenses} icon={TrendingDown} color="rose" trend="+5.2%" />
        <StatCard title="Net Profit" value={stats.netProfit} icon={DollarSign} color="blue" trend="+18.1%" />
        <StatCard title="Total Assets" value={stats.totalAssets} icon={Landmark} color="amber" />
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Navigation Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((mod, i) => (
            <Link 
              to={mod.path} 
              key={i}
              className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 hover:-translate-y-1"
            >
              <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center mb-6 text-white shadow-lg", mod.color)}>
                <mod.icon className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">{mod.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed mb-6">{mod.desc}</p>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                Explore Module <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions / Recent Activity Side Column */}
        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
            <div className="relative z-10">
              <h3 className="text-xl font-black mb-2">Ready to Audit?</h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">Ensure all journal entries are balanced before generating monthly reports.</p>
              <Link to="/admin/finance/journal" className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-6 py-3 rounded-2xl font-bold transition-all">
                New Journal Entry <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <PieChartIcon className="w-32 h-32" />
            </div>
          </div>
          
          {/* Summary Mini-Table */}
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="font-black text-slate-900 mb-4">Account Summary</h4>
            <div className="space-y-4">
              <SummaryItem label="Cash in Hand" value="৳ 45,200" color="emerald" />
              <SummaryItem label="Bank Balance" value="৳ 1,20,500" color="blue" />
              <SummaryItem label="Pending Receivables" value="৳ 12,800" color="amber" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Reusable StatCard Component
const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center",
        color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
        color === 'rose' ? "bg-rose-50 text-rose-600" :
        color === 'blue' ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className={cn(
          "px-3 py-1 rounded-full text-xs font-black",
          color === 'rose' ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
        )}>{trend}</span>
      )}
    </div>
    <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-3xl font-black text-slate-900">৳ {value.toLocaleString()}</h3>
  </div>
);

const SummaryItem = ({ label, value, color }) => (
  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
    <div className="flex items-center gap-3">
      <div className={cn("w-2 h-2 rounded-full", `bg-${color}-500`)}></div>
      <span className="text-sm font-bold text-slate-600">{label}</span>
    </div>
    <span className="text-sm font-black text-slate-900">{value}</span>
  </div>
);