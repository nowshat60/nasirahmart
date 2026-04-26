import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Search, Filter, Download, 
  ArrowRight, BookOpen, Wallet, 
  TrendingUp, TrendingDown, Landmark, X,
  Printer, FileText, Pencil, Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

export const ChartOfAccounts = () => {
  const { t } = useTranslation();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLedgerOpen, setIsLedgerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);
  const tableRef = useRef(null);
  const [newAccount, setNewAccount] = useState({ code: '', name: '', type: 'Asset', balance: 0 });
  const { showToast } = useToast();

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/accounts');
      setAccounts(response.data || []);
    } catch (error) {
      console.error("Fetch accounts error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleAddAccount = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingAccount) {
        await axios.put(`/api/accounts/${editingAccount.id}`, newAccount);
        showToast(t('dashboard.chart_of_accounts.success_updated'), 'success');
      } else {
        await axios.post('/api/accounts', {
          ...newAccount,
          status: 'Active'
        });
        showToast(t('dashboard.chart_of_accounts.success_added'), 'success');
      }
      setIsModalOpen(false);
      setEditingAccount(null);
      setNewAccount({ code: '', name: '', type: 'Asset', balance: 0 });
      fetchAccounts();
    } catch (error) {
      console.error("Save account error:", error);
      showToast(t('dashboard.chart_of_accounts.error_save'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setNewAccount({ 
      code: account.code,
      name: account.name,
      type: account.type,
      balance: account.balance
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/accounts/${itemToDelete}`);
      showToast(t('dashboard.chart_of_accounts.success_deleted'), 'success');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchAccounts();
    } catch (error) {
      console.error("Delete account error:", error);
      showToast(t('dashboard.chart_of_accounts.error_delete'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewLedger = (account) => {
    setSelectedAccount(account);
    setIsLedgerOpen(true);
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [t('dashboard.chart_of_accounts.code'), t('dashboard.chart_of_accounts.account_name'), t('dashboard.chart_of_accounts.type'), t('dashboard.chart_of_accounts.balance')].join(",") + "\n"
      + (Array.isArray(accounts) ? accounts : []).map(a => `${a.code},${a.name},${a.type},${a.balance}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "chart_of_accounts.csv");
    document.body.appendChild(link);
    link.click();
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!tableRef.current) return;
    
    setExporting(true);
    try {
      const canvas = await html2canvas(tableRef.current, {
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
      pdf.save(`chart_of_accounts_${new Date().getTime()}.pdf`);
      showToast(t('dashboard.chart_of_accounts.success_pdf'), 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast(t('dashboard.chart_of_accounts.error_pdf'), 'error');
    } finally {
      setExporting(false);
    }
  };

  const filteredAccounts = Array.isArray(accounts) ? accounts.filter(acc => 
    (acc.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (acc.code || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  ) : [];

  const totals = {
    assets: Array.isArray(accounts) ? accounts.filter(a => a.type === 'Asset').reduce((sum, a) => sum + (a.balance || 0), 0) : 0,
    liabilities: Array.isArray(accounts) ? accounts.filter(a => a.type === 'Liability').reduce((sum, a) => sum + (a.balance || 0), 0) : 0,
    equity: Array.isArray(accounts) ? accounts.filter(a => a.type === 'Equity').reduce((sum, a) => sum + (a.balance || 0), 0) : 0,
    revenue: Array.isArray(accounts) ? accounts.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + (a.balance || 0), 0) : 0,
    expenses: Array.isArray(accounts) ? accounts.filter(a => a.type === 'Expense').reduce((sum, a) => sum + (a.balance || 0), 0) : 0,
  };

  const getIcon = (type) => {
    switch(type) {
      case 'Asset': return Landmark;
      case 'Liability': return Wallet;
      case 'Equity': return BookOpen;
      case 'Revenue': return TrendingUp;
      case 'Expense': return TrendingDown;
      default: return BookOpen;
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen pt-24 print:pt-0 print:bg-white print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('dashboard.chart_of_accounts.title')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.chart_of_accounts.subtitle')}</p>
        </div>
        <button 
          onClick={() => {
            setEditingAccount(null);
            setNewAccount({ code: '', name: '', type: 'Asset', balance: 0 });
            setIsModalOpen(true);
          }}
          className="flex-1 sm:flex-none bg-emerald-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-sm"
        >
          <Plus className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.chart_of_accounts.add_new_account')}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 print:hidden">
        {[
          { label: t('dashboard.chart_of_accounts.total_assets'), value: totals.assets, color: 'emerald', icon: Landmark },
          { label: t('dashboard.chart_of_accounts.total_liabilities'), value: totals.liabilities, color: 'rose', icon: Wallet },
          { label: t('dashboard.chart_of_accounts.total_equity'), value: totals.equity, color: 'blue', icon: BookOpen },
          { label: t('dashboard.chart_of_accounts.revenue_ytd'), value: totals.revenue, color: 'indigo', icon: TrendingUp },
          { label: t('dashboard.chart_of_accounts.expenses_ytd'), value: totals.expenses, color: 'amber', icon: TrendingDown },
        ].map((stat, i) => (
          <div key={i} className={cn(
            "bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow",
            i === 4 && "sm:col-span-2 lg:col-span-1"
          )}>
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-1">{stat.label}</p>
            <p className="text-lg md:text-xl font-black text-slate-900">{t('dashboard.finance.currency')} {(stat.value || 0).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="glass rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-white/50 overflow-hidden print:shadow-none print:border-none print:glass-none">
        <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder={t('dashboard.chart_of_accounts.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
            <button className="p-2.5 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors flex items-center justify-center">
              <Filter className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <Printer className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.chart_of_accounts.print')}
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4 md:w-5 h-5" /> {exporting ? t('dashboard.chart_of_accounts.exporting') : t('dashboard.chart_of_accounts.pdf')}
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <Download className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.chart_of_accounts.csv')}
            </button>
          </div>
        </div>

        <div ref={tableRef} className="overflow-x-auto print:overflow-visible">
          <div className="hidden print:block p-8 border-b border-slate-100 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">{t('dashboard.chart_of_accounts.title')}</h2>
            <p className="text-slate-500">{t('dashboard.chart_of_accounts.report_generated_on', { date: new Date().toLocaleDateString() })}</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.chart_of_accounts.code')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.chart_of_accounts.account_name')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.chart_of_accounts.type')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.chart_of_accounts.balance')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.chart_of_accounts.status')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.chart_of_accounts.actions')}</th>
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
                filteredAccounts.map((acc) => {
                  const Icon = getIcon(acc.type);
                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 font-bold text-slate-900">{acc.code}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-xl",
                            acc.type === 'Asset' ? "bg-emerald-50 text-emerald-600" :
                            acc.type === 'Liability' ? "bg-rose-50 text-rose-600" :
                            acc.type === 'Revenue' ? "bg-blue-50 text-blue-600" :
                            "bg-slate-50 text-slate-600"
                          )}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className="font-bold text-slate-700">{acc.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-bold",
                          acc.type === 'Asset' ? "bg-emerald-100 text-emerald-600" :
                          acc.type === 'Liability' ? "bg-rose-100 text-rose-600" :
                          acc.type === 'Revenue' ? "bg-blue-100 text-blue-600" :
                          "bg-slate-100 text-slate-600"
                        )}>
                          {t(`dashboard.chart_of_accounts.account_types.${(acc.type || '').toLowerCase()}`).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900">{t('dashboard.finance.currency')} {(acc.balance || 0).toLocaleString()}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            acc.status === 'Active' ? "bg-emerald-500" : "bg-slate-300"
                          )} />
                          <span className="text-xs font-bold text-slate-500">{t(`dashboard.chart_of_accounts.statuses.${(acc.status || 'Active').toLowerCase()}`)}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleViewLedger(acc)}
                            className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                            title={t('dashboard.chart_of_accounts.view_ledger')}
                          >
                            <ArrowRight className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleEdit(acc)}
                            className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                            title={t('dashboard.chart_of_accounts.edit_account')}
                          >
                            <Pencil className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => confirmDelete(acc.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                            title={t('dashboard.chart_of_accounts.delete_account')}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ledger Modal */}
      <AnimatePresence>
        {isLedgerOpen && selectedAccount && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-slate-900 p-8 text-white flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">{t('dashboard.chart_of_accounts.ledger_title', { name: selectedAccount.name })}</h3>
                  <p className="text-slate-400 text-sm">{t('dashboard.chart_of_accounts.account_code')}: {selectedAccount.code} • {t('dashboard.chart_of_accounts.type')}: {t(`dashboard.chart_of_accounts.account_types.${(selectedAccount.type || '').toLowerCase()}`)}</p>
                </div>
                <button onClick={() => setIsLedgerOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-8">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">{t('dashboard.chart_of_accounts.date')}</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">{t('dashboard.chart_of_accounts.reference')}</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">{t('dashboard.chart_of_accounts.description')}</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">{t('dashboard.chart_of_accounts.debit')}</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">{t('dashboard.chart_of_accounts.credit')}</th>
                        <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">{t('dashboard.chart_of_accounts.balance')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { date: '2026-04-01', ref: 'OB-001', desc: t('dashboard.chart_of_accounts.opening_balance'), debit: selectedAccount.balance, credit: 0, bal: selectedAccount.balance },
                        { date: '2026-04-05', ref: 'JV-002', desc: t('dashboard.finance.expense_categories.utilities'), debit: 0, credit: 1200, bal: selectedAccount.balance - 1200 },
                      ].map((row, i) => (
                        <tr key={i}>
                          <td className="px-6 py-4 text-sm text-slate-600">{row.date}</td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">{row.ref}</td>
                          <td className="px-6 py-4 text-sm text-slate-600">{row.desc}</td>
                          <td className="px-6 py-4 text-sm text-right text-emerald-600 font-bold">{row.debit > 0 ? (row.debit || 0).toLocaleString() : '-'}</td>
                          <td className="px-6 py-4 text-sm text-right text-rose-600 font-bold">{row.credit > 0 ? (row.credit || 0).toLocaleString() : '-'}</td>
                          <td className="px-6 py-4 text-sm text-right font-black text-slate-900">{(row.bal || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Account Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-emerald-500 p-8 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Plus className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{editingAccount ? t('dashboard.chart_of_accounts.edit_account') : t('dashboard.chart_of_accounts.add_new_account')}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddAccount} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.chart_of_accounts.account_code')}</label>
                    <input
                      type="text"
                      value={newAccount.code}
                      onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                      placeholder="e.g. 1000"
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.chart_of_accounts.type')}</label>
                    <select
                      value={newAccount.type}
                      onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Asset">{t('dashboard.chart_of_accounts.account_types.asset')}</option>
                      <option value="Liability">{t('dashboard.chart_of_accounts.account_types.liability')}</option>
                      <option value="Equity">{t('dashboard.chart_of_accounts.account_types.equity')}</option>
                      <option value="Revenue">{t('dashboard.chart_of_accounts.account_types.revenue')}</option>
                      <option value="Expense">{t('dashboard.chart_of_accounts.account_types.expense')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.chart_of_accounts.account_name')}</label>
                  <input
                    type="text"
                    value={newAccount.name}
                    onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="e.g. Cash in Hand"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.chart_of_accounts.initial_balance')}</label>
                  <input
                    type="number"
                    value={newAccount.balance}
                    onChange={(e) => setNewAccount({ ...newAccount, balance: Number(e.target.value) })}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    {t('dashboard.chart_of_accounts.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    {editingAccount ? t('dashboard.chart_of_accounts.update_account') : t('dashboard.chart_of_accounts.save_account')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
