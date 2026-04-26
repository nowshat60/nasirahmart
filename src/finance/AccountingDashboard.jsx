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
import axios from 'axios';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#F43F5E', '#8B5CF6'];

export const AccountingDashboard = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);

  const modules = [
    { 
      title: t('dashboard.finance.coa'), 
      desc: t('dashboard.finance.coa_desc'), 
      icon: BookOpen, 
      path: '/admin/finance/coa',
      color: 'bg-emerald-500'
    },
    { 
      title: t('dashboard.finance.expenses'), 
      desc: t('dashboard.finance.expenses_desc'), 
      icon: Receipt, 
      path: '/admin/finance/expenses',
      color: 'bg-rose-500'
    },
    { 
      title: t('dashboard.finance.journal'), 
      desc: t('dashboard.finance.journal_desc'), 
      icon: FileText, 
      path: '/admin/finance/journal',
      color: 'bg-blue-500'
    },
    { 
      title: t('dashboard.finance.statements'), 
      desc: t('dashboard.finance.statements_desc'), 
      icon: PieChartIcon, 
      path: '/admin/finance/statements',
      color: 'bg-purple-500'
    }
  ];

  const [stats, setStats] = useState({
    totalAssets: 0,
    totalLiabilities: 0,
    totalEquity: 0,
    netProfit: 0,
    revenueGrowth: 0,
    expenseGrowth: 0
  });

  const [cashflowData, setCashflowData] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/finance/summary');
        const { totalAssets, totalLiabilities, totalEquity, netProfit, revenueGrowth, expenseGrowth, orders, expenses } = response.data || {};

        setStats({
          totalAssets,
          totalLiabilities,
          totalEquity,
          netProfit,
          revenueGrowth,
          expenseGrowth
        });

        // Group by month for cashflow
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyCashflow = {};
        
        (Array.isArray(orders) ? orders : []).forEach(order => {
          const date = new Date(order.createdAt);
          const month = months[date.getMonth()];
          if (!monthlyCashflow[month]) monthlyCashflow[month] = { name: month, inflow: 0, outflow: 0 };
          monthlyCashflow[month].inflow += order.totalAmount || 0;
        });

        (Array.isArray(expenses) ? expenses : []).forEach(exp => {
          const date = new Date(exp.expense_date);
          const month = months[date.getMonth()];
          if (!monthlyCashflow[month]) monthlyCashflow[month] = { name: month, inflow: 0, outflow: 0 };
          monthlyCashflow[month].outflow += exp.amount || 0;
        });

        const currentMonthIndex = new Date().getMonth();
        const last4Months = [];
        for (let i = 3; i >= 0; i--) {
          const m = months[(currentMonthIndex - i + 12) % 12];
          last4Months.push(monthlyCashflow[m] || { name: m, inflow: 0, outflow: 0 });
        }

        setCashflowData(last4Months);

        const safeExpenses = Array.isArray(expenses) ? expenses : [];
        const categories = [...new Set(safeExpenses.map(e => e.category))];
        setExpenseBreakdown(categories.map(cat => ({
          name: cat,
          value: safeExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + (e.amount || 0), 0)
        })));

      } catch (error) {
        console.error("Fetch finance summary error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen pt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('dashboard.finance.title')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.finance.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm self-start sm:self-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-bold text-slate-600">{t('dashboard.finance.months.apr')} 2026</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title={t('dashboard.finance.total_assets')} 
          value={stats.totalAssets} 
          icon={Landmark} 
          trend="+5.2%" 
          trendUp={true}
          color="emerald"
          currency={t('dashboard.finance.currency')}
        />
        <StatCard 
          title={t('dashboard.finance.net_profit')} 
          value={stats.netProfit} 
          icon={TrendingUp} 
          trend="+12.5%" 
          trendUp={true}
          color="blue"
          currency={t('dashboard.finance.currency')}
        />
        <StatCard 
          title={t('dashboard.finance.total_liabilities')} 
          value={stats.totalLiabilities} 
          icon={CreditCard} 
          trend="-2.1%" 
          trendUp={true}
          color="rose"
          currency={t('dashboard.finance.currency')}
        />
        <StatCard 
          title={t('dashboard.finance.total_equity')} 
          value={stats.totalEquity} 
          icon={Wallet} 
          trend="+8.4%" 
          trendUp={true}
          color="amber"
          currency={t('dashboard.finance.currency')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cashflow Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest text-xs">{t('dashboard.finance.cashflow_overview')}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-bold text-slate-500">{t('dashboard.finance.inflow')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <span className="text-xs font-bold text-slate-500">{t('dashboard.finance.outflow')}</span>
              </div>
            </div>
          </div>
          <div className="h-[350px] w-full">
            {cashflowData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <AreaChart data={cashflowData}>
                  <defs>
                    <linearGradient id="colorInflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorOutflow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="inflow" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorInflow)" />
                  <Area type="monotone" dataKey="outflow" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorOutflow)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-bold">
                {t('common.no_data')}
              </div>
            )}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-8 uppercase tracking-widest text-xs">{t('dashboard.finance.expense_breakdown')}</h3>
          <div className="h-[250px] w-full">
            {expenseBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-bold">
                {t('common.no_data')}
              </div>
            )}
          </div>
          <div className="mt-8 space-y-4">
            {expenseBreakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                  <span className="text-sm font-bold text-slate-500">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{t('dashboard.finance.currency')} {(item.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Module Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {modules.map((mod, i) => (
          <Link 
            key={i} 
            to={mod.path}
            className="group bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all"
          >
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 transition-transform group-hover:scale-110", mod.color)}>
              <mod.icon className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-black text-slate-900 mb-2">{mod.title}</h4>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">{mod.desc}</p>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
              {t('dashboard.finance.explore_module')} <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, trend, trendUp, color, currency }) => (
  <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <div className={cn(
        "w-12 h-12 rounded-2xl flex items-center justify-center",
        color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
        color === 'blue' ? "bg-blue-50 text-blue-600" :
        color === 'rose' ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"
      )}>
        <Icon className="w-6 h-6" />
      </div>
      <div className={cn(
        "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black",
        trendUp ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
      )}>
        {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
        {trend}
      </div>
    </div>
    <p className="text-slate-500 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
    <h4 className="text-2xl font-black text-slate-900">{currency} {(value || 0).toLocaleString()}</h4>
  </div>
);
