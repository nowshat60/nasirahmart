import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Package, Users, DollarSign, ShoppingCart, Search, Filter, Eye, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface SummaryData {
  total_sales: number;
  total_orders: number;
  total_customers: number;
  inventory_value: number;
  low_stock_count: number;
}

interface Order {
  id: string;
  user_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
  payment_method: string;
}

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'orders' | 'invoices'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/summary');
        const data = await response.json();
        
        setOrders(data.orders || []);
        setSummary(data.stats || null);
      } catch (error) {
        console.error("Error fetching admin summary:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { label: t('admin.total_revenue'), value: summary ? `${t('product.price')} ${(summary.total_sales || 0).toLocaleString()}` : `${t('product.price')} 0`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: t('admin.total_orders'), value: summary ? summary.total_orders.toString() : '0', icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: t('admin.active_users'), value: summary ? summary.total_customers.toString() : '0', icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
    { label: t('admin.total_products'), value: summary ? (summary.inventory_value > 0 ? '45' : '0') : '0', icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">{t('admin.dashboard')}</h1>
        <p className="text-slate-500">{t('admin.welcome_back')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl border-white/50 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Orders Table */}
      <div className="glass rounded-[2.5rem] shadow-xl border-white/50 overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('orders')}
              className={cn(
                "text-2xl font-bold transition-all relative pb-2",
                activeTab === 'orders' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {t('admin.manage_orders')}
              {activeTab === 'orders' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('invoices')}
              className={cn(
                "text-2xl font-bold transition-all relative pb-2",
                activeTab === 'invoices' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {t('admin.invoices')}
              {activeTab === 'invoices' && <motion.div layoutId="tab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 rounded-full" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder={t('nav.search_placeholder')}
                className="bg-slate-50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
            <button className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors">
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('admin.order_id')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('admin.customer')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('admin.date')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('admin.total')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('admin.method')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('admin.status')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('admin.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-8 py-6 h-16 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-900">#{order.id}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs">
                          {order.user_name.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-700">{order.user_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-slate-500 text-sm">{order.created_at}</td>
                    <td className="px-8 py-6 font-bold text-slate-900">{t('product.price')} {order.total_amount}</td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                        {order.payment_method}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold",
                        order.status === 'completed' ? "bg-emerald-100 text-emerald-600" :
                        order.status === 'pending' ? "bg-amber-100 text-amber-600" :
                        "bg-blue-100 text-blue-600"
                      )}>
                        {(order.status || '').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="View Details">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-blue-500 transition-colors" title="View Invoice">
                          <FileText className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
