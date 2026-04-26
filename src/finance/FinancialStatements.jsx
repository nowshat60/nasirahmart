import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  FileText, Download, Calendar, 
  Landmark, PieChart as PieChartIcon, ArrowRight,
  Printer, BarChart as BarChartIcon,
  Filter, TrendingUp, TrendingDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

export const FinancialStatements = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('pnl'); // pnl, balance, trial
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ 
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], 
    end: new Date().toISOString().split('T')[0] 
  });
  const [data, setData] = useState({
    pnl: [],
    balance: [],
    trial: [],
    totals: { revenue: 0, expenses: 0, netProfit: 0, assets: 0, liabilities: 0, equity: 0 }
  });
// Line 35 theke shuru koro
  const reportRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost/nasirah-mart/api-php/finance/get_statements.php?start=${dateRange.start}&end=${dateRange.end}`);
      
      // Ensure the data structure matches what the UI expects
      const { pnl, balance, trial, totals, orders, expenses, accounts, totalAssets, totalLiabilities, totalEquity } = res.data;

      // Logic to calculate totals if the API doesn't provide them directly
      const totalRevenue = (Array.isArray(orders) ? orders : []).reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const totalExps = (Array.isArray(expenses) ? expenses : []).reduce((sum, e) => sum + (e.amount || 0), 0);

      setData({
        pnl: pnl || [],
        balance: balance || [
          { name: 'Assets', value: totalAssets || 0 },
          { name: 'Liabilities', value: totalLiabilities || 0 },
          { name: 'Equity', value: totalEquity || 0 }
        ],
        trial: trial || (Array.isArray(accounts) ? accounts.map(a => ({
          code: a.code,
          name: a.name,
          dr: a.type === 'Asset' || a.type === 'Expense' ? (a.balance || 0) : 0,
          cr: a.type === 'Liability' || a.type === 'Equity' || a.type === 'Revenue' ? (a.balance || 0) : 0
        })) : []),
        totals: totals || {
          revenue: totalRevenue,
          expenses: totalExps,
          netProfit: totalRevenue - totalExps,
          assets: totalAssets || 0,
          liabilities: totalLiabilities || 0,
          equity: totalEquity || 0
        }
      });
    } catch (error) {
      console.error("Fetch financial statements error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]); // Removed activeTab to prevent unnecessary re-fetches when just switching tabs

  useEffect(() => {
    fetchData();
  }, []);

  const tabs = [
    { id: 'pnl', label: t('dashboard.finance_statements.profit_loss'), icon: TrendingUp },
    { id: 'balance', label: t('dashboard.finance_statements.balance_sheet'), icon: Landmark },
    { id: 'trial', label: t('dashboard.finance_statements.trial_balance'), icon: FileText },
  ];

  const pnlData = [
    { name: 'Jan', revenue: 320000, expenses: 210000 },
    { name: 'Feb', revenue: 380000, expenses: 240000 },
    { name: 'Mar', revenue: 450000, expenses: 280000 },
    { name: 'Apr', revenue: 462650, expenses: 350900 },
  ];

  const balanceData = [
    { name: 'Assets', value: 520600 },
    { name: 'Liabilities', value: 12500 },
    { name: 'Equity', value: 508100 },
  ];

  const COLORS = ['#10B981', '#F43F5E', '#3B82F6'];

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    setLoading(true);
    try {
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i];
            const style = window.getComputedStyle(el);
            
            // Helper to check for unsupported color functions
            const isUnsupported = (val) => val && (val.includes('oklch') || val.includes('oklab'));
            
            if (isUnsupported(style.color)) el.style.color = 'inherit';
            if (isUnsupported(style.backgroundColor)) el.style.backgroundColor = 'transparent';
            if (isUnsupported(style.borderColor)) el.style.borderColor = 'transparent';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`financial_statement_${activeTab}_${new Date().getTime()}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen pt-24 print:pt-0 print:bg-white print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('dashboard.finance_statements.title')}</h1>
          <p className="text-slate-500">{t('dashboard.finance_statements.subtitle')}</p>
        </div>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200">
            <Calendar className="w-4 h-4 text-slate-400" />
            <input 
              type="date" 
              value={dateRange.start} 
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="border-none bg-transparent text-sm font-bold focus:ring-0 p-0"
            />
            <span className="text-slate-300">to</span>
            <input 
              type="date" 
              value={dateRange.end} 
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="border-none bg-transparent text-sm font-bold focus:ring-0 p-0"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="bg-white text-slate-900 border border-slate-200 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all"
          >
            <Printer className="w-5 h-5" /> {t('dashboard.finance_statements.print')}
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={loading}
            className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Download className="w-5 h-5" /> {loading ? t('dashboard.finance_statements.exporting') : t('dashboard.finance_statements.export_pdf')}
          </button>
        </div>
      </div>

      <div className="flex gap-4 bg-white p-2 rounded-3xl shadow-sm border border-slate-100 w-fit print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all",
              activeTab === tab.id ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div ref={reportRef} className="glass rounded-[2.5rem] shadow-xl border-white/50 p-10 print:shadow-none print:border-none print:p-0 print:glass-none">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl">
              NM
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Nasirah Mart E-commerce</h2>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Financial Statement • {tabs.find(t => t.id === activeTab).label}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-500">{t('dashboard.finance_statements.period')}</p>
            <p className="text-xl font-black text-slate-900">
              {new Date(dateRange.start).toLocaleDateString()} - {new Date(dateRange.end).toLocaleDateString()}
            </p>
          </div>
        </div>

        {activeTab === 'pnl' && (
          <div className="space-y-12">
            {/* P&L Chart */}
            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 print:hidden">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">{t('dashboard.finance_statements.revenue_expenses_trend')}</h4>
              <div className="h-[300px] w-full">
                {Array.isArray(data.pnl) && data.pnl.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <BarChart data={data.pnl}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                      <Legend iconType="circle" />
                      <Bar dataKey="revenue" fill="#10B981" radius={[4, 4, 0, 0]} name="Revenue" />
                      <Bar dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Expenses" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 font-bold">
                    {t('common.no_data')}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <section className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-b-2 border-slate-900 pb-2 flex justify-between uppercase tracking-widest">
                  {t('dashboard.finance_statements.revenue')} <span>{t('dashboard.finance_statements.amount', { currency: t('dashboard.finance.currency') })}</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-600 font-bold">
                    <span>Total Revenue</span>
                    <span>{(data.totals.revenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600 font-black pt-4 border-t border-slate-100">
                    <span>{t('dashboard.finance_statements.total_revenue')}</span>
                    <span>{(data.totals.revenue || 0).toLocaleString()}</span>
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-b-2 border-slate-900 pb-2 flex justify-between uppercase tracking-widest">
                  {t('dashboard.finance_statements.expenses')} <span>{t('dashboard.finance_statements.amount', { currency: t('dashboard.finance.currency') })}</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-slate-600 font-bold">
                    <span>Total Expenses</span>
                    <span>{(data.totals.expenses || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-rose-600 font-black pt-4 border-t border-slate-100">
                    <span>{t('dashboard.finance_statements.total_expenses')}</span>
                    <span>{(data.totals.expenses || 0).toLocaleString()}</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Net Profit */}
            <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white flex justify-between items-center shadow-2xl">
              <div>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">{t('dashboard.finance_statements.net_profit')}</p>
                <h4 className="text-5xl font-black">{t('dashboard.finance.currency')} {(data.totals.netProfit || 0).toLocaleString()}</h4>
                <p className={cn(
                  "font-bold text-sm mt-2 flex items-center gap-1",
                  data.totals.netProfit >= 0 ? "text-emerald-400" : "text-rose-400"
                )}>
                  {data.totals.netProfit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {t('dashboard.finance_statements.margin', { margin: ((data.totals.netProfit / (data.totals.revenue || 1)) * 100).toFixed(2) })}
                </p>
              </div>
              <div className={cn(
                "w-24 h-24 rounded-full flex items-center justify-center shadow-lg",
                data.totals.netProfit >= 0 ? "bg-emerald-500 shadow-emerald-500/20" : "bg-rose-500 shadow-rose-500/20"
              )}>
                {data.totals.netProfit >= 0 ? <TrendingUp className="w-12 h-12 text-white" /> : <TrendingDown className="w-12 h-12 text-white" />}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'balance' && (
          <div className="space-y-12">
            {/* Balance Sheet Chart */}
            <div className="bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100 print:hidden flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 h-[300px] w-full">
                {Array.isArray(data.balance) && data.balance.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={data.balance}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {data.balance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none'}} />
                      <Legend verticalAlign="middle" align="right" layout="vertical" />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400 font-bold">
                    {t('common.no_data')}
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <h4 className="text-xl font-black text-slate-900">{t('dashboard.finance_statements.financial_health')}</h4>
                <p className="text-slate-500 font-medium">{t('dashboard.finance_statements.liquidity_desc', { ratio: ((data.totals.assets / (data.totals.liabilities || 1)) * 10).toFixed(1) })}</p>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('dashboard.finance_statements.solvency')}</p>
                    <p className="text-lg font-black text-slate-900">{((data.totals.equity / (data.totals.assets || 1)) * 100).toFixed(1)}%</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase">{t('dashboard.finance_statements.debt_ratio')}</p>
                    <p className="text-lg font-black text-slate-900">{((data.totals.liabilities / (data.totals.assets || 1)) * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <section className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 border-b-4 border-emerald-500 pb-2 uppercase tracking-widest">{t('dashboard.finance_statements.assets')}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Total Assets</span>
                    <span>{(data.totals.assets || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-emerald-600 pt-4 border-t-2 border-slate-100">
                    <span>{t('dashboard.finance_statements.total_assets')}</span>
                    <span>{(data.totals.assets || 0).toLocaleString()}</span>
                  </div>
                </div>
              </section>
              <section className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 border-b-4 border-rose-500 pb-2 uppercase tracking-widest">{t('dashboard.finance_statements.liabilities_equity')}</h3>
                <div className="space-y-4">
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Total Liabilities</span>
                    <span>{(data.totals.liabilities || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-600">
                    <span>Total Equity</span>
                    <span>{(data.totals.equity || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-black text-rose-600 pt-4 border-t-2 border-slate-100">
                    <span>{t('dashboard.finance_statements.total_liabilities_equity')}</span>
                    <span>{((data.totals.liabilities || 0) + (data.totals.equity || 0)).toLocaleString()}</span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'trial' && (
          <div className="space-y-8">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest">{t('dashboard.finance_statements.account_code')}</th>
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest">{t('dashboard.finance_statements.account_name')}</th>
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-right">{t('dashboard.finance_statements.debit', { currency: t('dashboard.finance.currency') })}</th>
                  <th className="px-8 py-4 text-xs font-black uppercase tracking-widest text-right">{t('dashboard.finance_statements.credit', { currency: t('dashboard.finance.currency') })}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.trial.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-4 font-bold text-slate-500">{row.code}</td>
                    <td className="px-8 py-4 font-black text-slate-900">{row.name}</td>
                    <td className="px-8 py-4 text-right font-bold text-emerald-600">{row.dr > 0 ? (row.dr || 0).toLocaleString() : '-'}</td>
                    <td className="px-8 py-4 text-right font-bold text-rose-600">{row.cr > 0 ? (row.cr || 0).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-4 border-slate-900">
                  <td colSpan={2} className="px-8 py-6 font-black text-slate-900 uppercase tracking-widest">{t('dashboard.finance_statements.total_trial_balance')}</td>
                  <td className="px-8 py-6 text-right font-black text-slate-900 text-xl">{t('dashboard.finance.currency')} {data.trial.reduce((sum, r) => sum + (r.dr || 0), 0).toLocaleString()}</td>
                  <td className="px-8 py-6 text-right font-black text-slate-900 text-xl">{t('dashboard.finance.currency')} {data.trial.reduce((sum, r) => sum + (r.cr || 0), 0).toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
