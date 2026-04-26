import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Filter, User, Mail, 
  ShoppingBag, DollarSign, Calendar,
  ArrowRight, Download, Star
} from 'lucide-react';
import AxiosInstance from '../axios/AxiosInstance';
import { cn } from '../lib/utils';

export const CustomerManagement = () => {
  const { t } = useTranslation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await AxiosInstance.get('customers/get_customers.php');
        setCustomers(Array.isArray(response.data) ? response.data : []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching customers:', error);
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [t('dashboard.customers.customer'), "Email", t('dashboard.customers.joined_date'), t('dashboard.customers.total_orders'), t('dashboard.customers.ltv')].join(",") + "\n"
      + customers.map(c => `${c.name},${c.email},${c.joined_at},${c.total_orders},${c.ltv}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "customers_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
                         (c.email || '').toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'vip' ? c.ltv > 5000 : c.ltv <= 5000);
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen pt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('dashboard.customers.title')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.customers.subtitle')}</p>
        </div>
        <button 
          onClick={handleExport}
          className="flex-1 sm:flex-none bg-white text-slate-900 border border-slate-200 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm"
        >
          <Download className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.customers.export')}
        </button>
      </div>

      <div className="glass rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-white/50 overflow-hidden">
        <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder={t('dashboard.customers.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 w-full sm:w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-slate-50 border-none rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t('dashboard.customers.all_customers')}</option>
              <option value="vip">{t('dashboard.customers.vip_only')}</option>
              <option value="regular">{t('dashboard.customers.regular_only')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.customers.customer')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.customers.joined_date')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.customers.total_orders')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.customers.ltv')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.customers.status')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.customers.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6 h-16 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : (
                Array.isArray(filteredCustomers) && filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          {(customer.name || '').charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{customer.name || 'Anonymous'}</p>
                          <p className="text-xs text-slate-400 font-medium">{customer.email || 'No Email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Calendar className="w-4 h-4" />
                        {new Date(customer.joined_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-700">{t('dashboard.customers.orders_count', { count: customer.total_orders })}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                        <span className="font-black text-slate-900">{t('product.price')} {(customer.ltv || 0).toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Star className={cn(
                          "w-4 h-4",
                          customer.ltv > 5000 ? "text-amber-400 fill-amber-400" : "text-slate-200"
                        )} />
                        <span className="text-xs font-bold text-slate-500">
                          {customer.ltv > 5000 ? t('dashboard.customers.vip') : t('dashboard.customers.regular')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </button>
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
