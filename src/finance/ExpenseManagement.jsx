import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Search, Filter, Receipt, 
  DollarSign, Calendar, Download,
  ArrowRight, Trash2, Pencil, X,
  Printer, FileText, TrendingUp, TrendingDown
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import axios from 'axios';

export const ExpenseManagement = () => {
  const { t } = useTranslation();
  const [expenses, setExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const tableRef = useRef(null);
  const [newExpense, setNewExpense] = useState({ 
    expense_date: new Date().toISOString().split('T')[0], 
    category: 'Utilities', 
    description: '', 
    account_id: '', 
    amount: 0 
  });
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [expensesRes, accountsRes] = await Promise.all([
        axios.get('/api/expenses'),
        axios.get('/api/accounts')
      ]);
      
      setExpenses(Array.isArray(expensesRes.data) ? expensesRes.data : []);
      setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data.filter(a => a.type === 'Asset') : []);
    } catch (error) {
      console.error("Fetch finance data error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const account = accounts.find(a => String(a.id) === String(newExpense.account_id));
      const expenseData = { 
        ...newExpense, 
        account_name: account ? account.name : 'Unknown'
      };

      if (editingExpense) {
        await axios.put(`/api/expenses/${editingExpense.id}`, expenseData);
        showToast(t('dashboard.expense_management.success_updated'), 'success');
      } else {
        await axios.post('/api/expenses', expenseData);
        showToast(t('dashboard.expense_management.success_recorded'), 'success');
      }
      
      fetchData();
      setIsModalOpen(false);
      setEditingExpense(null);
      setNewExpense({ 
        expense_date: new Date().toISOString().split('T')[0], 
        category: 'Utilities', 
        description: '', 
        account_id: '', 
        amount: 0 
      });
    } catch (error) {
      console.error("Save expense error:", error);
      showToast('Failed to save expense', 'error');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setNewExpense({ 
      expense_date: expense.expense_date,
      category: expense.category,
      description: expense.description,
      account_id: expense.account_id,
      amount: expense.amount
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('dashboard.expense_management.delete_confirm'))) {
      try {
        await axios.delete(`/api/expenses/${id}`);
        setExpenses(expenses.filter(e => e.id !== id));
        showToast(t('dashboard.expense_management.success_deleted'), 'success');
      } catch (error) {
        console.error("Delete expense error:", error);
        showToast('Failed to delete expense', 'error');
      }
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [t('dashboard.expense_management.date'), t('dashboard.expense_management.category'), t('dashboard.expense_management.description'), t('dashboard.expense_management.account'), t('dashboard.expense_management.amount')].join(",") + "\n"
      + (Array.isArray(expenses) ? expenses : []).map(e => `${e.expense_date},${e.category},${e.description},${e.account_name},${e.amount}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses_report.csv");
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
      pdf.save(`expenses_report_${new Date().getTime()}.pdf`);
      showToast(t('dashboard.expense_management.success_pdf'), 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast(t('dashboard.expense_management.error_pdf'), 'error');
    } finally {
      setExporting(false);
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    (exp.description || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (exp.category || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  const categoryData = expenses.reduce((acc, exp) => {
    const existing = acc.find(i => i.name === exp.category);
    if (existing) {
      existing.value += exp.amount;
    } else {
      acc.push({ name: exp.category, value: exp.amount });
    }
    return acc;
  }, []);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  const totalThisMonth = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen pt-24 print:pt-0 print:bg-white print:p-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('dashboard.expense_management.title')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.expense_management.subtitle')}</p>
        </div>
        <button 
          onClick={() => {
            setEditingExpense(null);
            setNewExpense({ 
              expense_date: new Date().toISOString().split('T')[0], 
              category: 'Utilities', 
              description: '', 
              account_id: '', 
              amount: 0 
            });
            setIsModalOpen(true);
          }}
          className="flex-1 sm:flex-none bg-emerald-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-sm"
        >
          <Plus className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.expense_management.record_expense')}
        </button>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 print:hidden">
        <div className="lg:col-span-2 bg-white p-4 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px] md:text-xs">{t('dashboard.expense_management.expense_breakdown')}</h3>
          <div className="h-[250px] md:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col">
          <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-widest text-[10px] md:text-xs">{t('dashboard.expense_management.monthly_summary')}</h3>
          <div className="flex-1 flex flex-col justify-center items-center text-center py-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-4">
              <TrendingDown className="w-8 h-8 md:w-10 md:h-10 text-emerald-500" />
            </div>
            <p className="text-slate-500 font-bold text-xs md:text-sm mb-1">{t('dashboard.expense_management.total_spent')}</p>
            <h4 className="text-3xl md:text-4xl font-black text-slate-900 mb-2">{t('dashboard.finance.currency')} {(totalThisMonth || 0).toLocaleString()}</h4>
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs md:text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>{t('dashboard.expense_management.vs_last_month', { percent: 12 })}</span>
            </div>
          </div>
          <div className="mt-4 md:mt-8 pt-4 md:pt-8 border-t border-slate-100 space-y-3 md:space-y-4">
            {categoryData.slice(0, 3).map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-slate-500 text-xs md:text-sm font-bold">{cat.name}</span>
                <span className="text-slate-900 font-black text-xs md:text-sm">{t('dashboard.finance.currency')} {(cat.value || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-white/50 overflow-hidden print:shadow-none print:border-none print:glass-none">
        <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder={t('dashboard.expense_management.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <Printer className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.expense_management.print')}
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4 md:w-5 h-5" /> {exporting ? t('dashboard.expense_management.exporting') : t('dashboard.expense_management.pdf')}
            </button>
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <Download className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.expense_management.csv')}
            </button>
          </div>
        </div>

        <div ref={tableRef} className="overflow-x-auto print:overflow-visible">
          <div className="hidden print:block p-8 border-b border-slate-100 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">{t('dashboard.expense_management.expense_report')}</h2>
            <p className="text-slate-500">{t('dashboard.expense_management.report_generated_on', { date: new Date().toLocaleDateString() })}</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.expense_management.date')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.expense_management.category')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.expense_management.description')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.expense_management.account')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.expense_management.amount')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.expense_management.actions')}</th>
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
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Calendar className="w-4 h-4" />
                        {new Date(exp.expense_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        {(exp.category || '').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-700">{exp.description}</td>
                    <td className="px-8 py-6 text-slate-500 font-medium">{exp.account_name}</td>
                    <td className="px-8 py-6 font-black text-rose-600">{t('dashboard.finance.currency')} {(exp.amount || 0).toLocaleString()}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(exp)}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(exp.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
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

      {/* Record Expense Modal */}
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
                    <Receipt className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{editingExpense ? t('dashboard.expense_management.edit_expense') : t('dashboard.expense_management.record_expense')}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.expense_management.date')}</label>
                    <input
                      type="date"
                      value={newExpense.expense_date}
                      onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.expense_management.category')}</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Rent">{t('dashboard.expense_management.categories.rent')}</option>
                      <option value="Marketing">{t('dashboard.expense_management.categories.marketing')}</option>
                      <option value="Utilities">{t('dashboard.expense_management.categories.utilities')}</option>
                      <option value="Salaries">{t('dashboard.expense_management.categories.salaries')}</option>
                      <option value="Supplies">{t('dashboard.expense_management.categories.supplies')}</option>
                      <option value="Others">{t('dashboard.expense_management.categories.others')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.expense_management.description')}</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                    placeholder="e.g. Office Rent - April"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.expense_management.payment_account')}</label>
                    <select
                      value={newExpense.account_id}
                      onChange={(e) => setNewExpense({ ...newExpense, account_id: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      required
                    >
                      <option value="">{t('dashboard.expense_management.select_account')}</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.expense_management.amount')}</label>
                    <input
                      type="number"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    {t('dashboard.expense_management.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    {editingExpense ? t('dashboard.expense_management.update_expense') : t('dashboard.expense_management.save_expense')}
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
