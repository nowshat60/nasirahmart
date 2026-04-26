import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { BarChart3, TrendingUp, Download, Calendar, Filter } from 'lucide-react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, AreaChart, Area
} from 'recharts';

export const Reports = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/reports/sales');
        const orders = response.data || [];

        // Group by month
        const monthlyData = orders.reduce((acc, order) => {
          const date = new Date(order.date);
          const month = date.toLocaleString('default', { month: 'short' });
          
          if (!acc[month]) {
            acc[month] = { name: month, sales: 0, profit: 0 };
          }
          
          acc[month].sales += Number(order.sales) || 0;
          acc[month].profit += (Number(order.sales) || 0) * 0.3;
          
          return acc;
        }, {});

        const chartData = Object.values(monthlyData);
        setData(chartData.length > 0 ? chartData : [
          { name: 'Jan', sales: 0, profit: 0 },
          { name: 'Feb', sales: 0, profit: 0 },
          { name: 'Mar', sales: 0, profit: 0 },
        ]);
      } catch (error) {
        console.error("Fetch reports error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen pt-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('dashboard.reports.title')}</h1>
          <p className="text-slate-500">{t('dashboard.reports.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Calendar className="w-4 h-4" />
            {t('dashboard.reports.last_30_days')}
          </button>
          <button className="flex items-center gap-2 bg-emerald-500 px-4 py-2 rounded-xl text-white text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
            <Download className="w-4 h-4" />
            {t('dashboard.reports.download_report')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[2.5rem] border-white/50 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500 rounded-2xl text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{t('dashboard.reports.sales_overview')}</h2>
            </div>
            <Filter className="w-5 h-5 text-slate-400 cursor-pointer" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '1rem', border: 'none'}} />
                <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-8 rounded-[2.5rem] border-white/50 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-2xl text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{t('dashboard.reports.revenue')}</h2>
            </div>
            <Filter className="w-5 h-5 text-slate-400 cursor-pointer" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '1rem', border: 'none'}} />
                <Bar dataKey="profit" fill="#3b82f6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
