import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Search, Filter, Receipt, 
  Calendar, Download, ArrowRight, 
  CheckCircle2, Clock, AlertCircle, X,
  Printer, FileText, Pencil, Trash2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import axios from 'axios';

export const JournalEntries = () => {
  const { t } = useTranslation();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const tableRef = useRef(null);
  const [newEntry, setNewEntry] = useState({ 
    date: new Date().toISOString().split('T')[0], 
    reference: `JV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, 
    description: '', 
    status: 'Pending',
    items: [
      { account_id: '', debit: 0, credit: 0 },
      { account_id: '', debit: 0, credit: 0 }
    ]
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [entriesRes, accountsRes] = await Promise.all([
        axios.get('/api/journal_entries'),
        axios.get('/api/accounts')
      ]);
      
      const entriesData = (Array.isArray(entriesRes.data) ? entriesRes.data : []).map(e => ({
        ...e,
        items: typeof e.items === 'string' ? JSON.parse(e.items) : (Array.isArray(e.items) ? e.items : [])
      }));
      
      setEntries(entriesData);
      setAccounts(Array.isArray(accountsRes.data) ? accountsRes.data : []);
      
      setLoading(false);
    } catch (error) {
      console.error("Fetch journal data error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEntry = async (e) => {
    e.preventDefault();
    
    const totalDebit = newEntry.items.reduce((sum, item) => sum + Number(item.debit), 0);
    const totalCredit = newEntry.items.reduce((sum, item) => sum + Number(item.credit), 0);
    
    if (totalDebit !== totalCredit) {
      showToast(t('dashboard.journal_entries.error_balance'), 'error');
      return;
    }

    if (totalDebit === 0) {
      showToast(t('dashboard.journal_entries.error_zero'), 'error');
      return;
    }

    try {
      const entryData = {
        ...newEntry,
        amount: totalDebit
      };

      if (editingEntry) {
        await axios.put(`/api/journal_entries/${editingEntry.id}`, entryData);
        showToast(t('dashboard.journal_entries.success_updated'), 'success');
      } else {
        await axios.post('/api/journal_entries', entryData);
        showToast(t('dashboard.journal_entries.success_created'), 'success');
      }
      
      fetchData();
      setIsModalOpen(false);
      setEditingEntry(null);
      resetForm();
    } catch (error) {
      console.error("Save journal entry error:", error);
      showToast('Failed to save journal entry', 'error');
    }
  };

  const resetForm = () => {
    setNewEntry({ 
      date: new Date().toISOString().split('T')[0], 
      reference: `JV-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, 
      description: '', 
      status: 'Pending',
      items: [
        { account_id: '', debit: 0, credit: 0 },
        { account_id: '', debit: 0, credit: 0 }
      ]
    });
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setNewEntry({
      ...entry
    });
    setIsModalOpen(true);
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await axios.delete(`/api/journal_entries/${itemToDelete}`);
        showToast(t('dashboard.journal_entries.success_deleted'), 'success');
        fetchData();
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
      } catch (error) {
        console.error("Delete journal entry error:", error);
        showToast('Failed to delete entry', 'error');
      }
    }
  };

  const handlePost = async (id) => {
    try {
      await axios.put(`/api/journal_entries/${id}`, { status: 'Posted' });
      showToast(t('dashboard.journal_entries.success_posted'), 'success');
      fetchData();
    } catch (error) {
      console.error("Post journal entry error:", error);
      showToast('Failed to post entry', 'error');
    }
  };

  const addItem = () => {
    setNewEntry({
      ...newEntry,
      items: [...newEntry.items, { account_id: '', debit: 0, credit: 0 }]
    });
  };

  const removeItem = (index) => {
    if (newEntry.items.length <= 2) return;
    const items = [...newEntry.items];
    items.splice(index, 1);
    setNewEntry({ ...newEntry, items });
  };

  const updateItem = (index, field, value) => {
    const items = [...newEntry.items];
    items[index][field] = value;
    setNewEntry({ ...newEntry, items });
  };

  const handlePrint = () => {
    setIsReportModalOpen(true);
  };

  const VoucherPrint = ({ entry, isModalLayout = false }) => {
    if (!entry) return null;
    return (
      <div className={cn(
        "bg-white p-4 md:p-10 text-slate-900 border-[3px] border-slate-900",
        isModalLayout ? "block shadow-2xl rounded-3xl" : "hidden print:block fixed inset-0 z-[200] overflow-visible border-none bg-white p-12"
      )}>
        {/* Background Watermark/Seal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
          <div className="text-[30rem] font-black rotate-[-35deg] tracking-tighter">NASIRAH</div>
        </div>

        <div className="relative max-w-4xl mx-auto border-[3px] border-slate-900 p-10 space-y-10 bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,0.1)]">
          {/* Top Bar Decoration */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-slate-900"></div>

          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-slate-900 flex items-center justify-center text-white font-black text-4xl shadow-xl">N</div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">Nasirah Mart Ltd.</h1>
                <p className="text-xs font-black text-emerald-600 uppercase tracking-[0.3em] mb-3">Enterprise Accounting Division</p>
                <div className="text-[10px] font-bold text-slate-500 space-y-0.5 leading-tight">
                  <p>Corporate Office: 45/A Elite Tower, Chattogram, BD</p>
                  <p>Email: finance@nasirahmart.com | Web: www.nasirahmart.com</p>
                  <p>Tax ID: 556-990-221 | Trade License: #TR88922</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block bg-slate-100 px-4 py-1 rounded-full mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Official Document</span>
              </div>
              <h2 className="text-4xl font-black uppercase text-slate-900 tracking-tighter mb-4">Journal Voucher</h2>
              <div className="space-y-2 text-sm bg-slate-50 p-4 border border-slate-200">
                <p className="flex justify-between gap-8"><span className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">Voucher Ref:</span> <span className="font-black text-slate-900">{entry.reference}</span></p>
                <p className="flex justify-between gap-8"><span className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">Entry Date:</span> <span className="font-black text-slate-900">{new Date(entry.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
                <p className="flex justify-between gap-8"><span className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">Status:</span> <span className="font-black uppercase text-emerald-600 italic tracking-wider">{entry.status}</span></p>
              </div>
            </div>
          </div>

          {/* Core Particulars */}
          <div className="bg-slate-900 text-white p-6 shadow-lg">
            <p className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-[0.4em]">Transaction Narration</p>
            <p className="text-xl font-bold leading-tight">{entry.description}</p>
          </div>

          {/* Ledger Table */}
          <div className="border-x-2 border-slate-900">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-y-2 border-slate-900 bg-slate-50">
                  <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-slate-500 border-r border-slate-200">Ledger Account Title & Code</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 w-32 border-r border-slate-200">Debit (TK)</th>
                  <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500 w-32">Credit (TK)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {entry.items?.map((item, idx) => {
                  const account = accounts.find(a => a.id === item.account_id);
                  return (
                    <tr key={idx}>
                      <td className="px-6 py-5 border-r border-slate-100">
                        <p className="font-black text-slate-900 text-base">{account?.name || item.account_name || 'General Account'}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Account Code: <span className="text-slate-600">{account?.code || 'N/A'}</span></p>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-900 text-base border-r border-slate-100">
                        {item.debit > 0 ? (Number(item.debit) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-900 text-base italic">
                        {item.credit > 0 ? (Number(item.credit) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '-'}
                      </td>
                    </tr>
                  );
                })}
                {/* Empty rows to fill space for aesthetic */}
                {[...Array(Math.max(0, 4 - (entry.items?.length || 0)))].map((_, i) => (
                  <tr key={`empty-${i}`} className="h-16">
                    <td className="border-r border-slate-100"></td>
                    <td className="border-r border-slate-100"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900 bg-slate-900 text-white font-black">
                  <td className="px-6 py-5 text-right text-[10px] uppercase tracking-[0.3em] font-normal text-slate-400">Journal Totals</td>
                  <td className="px-6 py-5 text-right border-l-2 border-white/20 text-lg">
                    {(Number(entry.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-5 text-right border-l-2 border-white/20 text-lg italic">
                    {(Number(entry.amount) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Internal Control Section */}
          <div className="grid grid-cols-4 gap-6 pt-12 border-t-2 border-dotted border-slate-200">
            <div className="space-y-4">
              <div className="h-12 border-b-2 border-slate-900 flex items-center justify-center font-black text-slate-200 uppercase tracking-[0.2em] opacity-20 text-[8px]">Accountant</div>
              <p className="text-[9px] font-black uppercase text-slate-900 text-center tracking-widest">Entry By</p>
            </div>
            <div className="space-y-4">
              <div className="h-12 border-b-2 border-slate-900 flex items-center justify-center font-black text-slate-200 uppercase tracking-[0.2em] opacity-20 text-[8px]">Auditor</div>
              <p className="text-[9px] font-black uppercase text-slate-900 text-center tracking-widest">Verified By</p>
            </div>
            <div className="space-y-4">
              <div className="h-12 border-b-2 border-slate-900 flex items-center justify-center font-black text-slate-200 uppercase tracking-[0.2em] opacity-20 text-[8px]">Management</div>
              <p className="text-[9px] font-black uppercase text-slate-900 text-center tracking-widest">Approved By</p>
            </div>
            <div className="flex items-center justify-center pt-2">
              <div className="w-20 h-20 border-4 border-slate-900 rounded-full flex items-center justify-center flex-col p-1">
                <div className="text-[6px] font-bold uppercase leading-none mb-1">Company Seal</div>
                <div className="w-12 h-1 bg-slate-900"></div>
                <div className="text-[5px] font-black text-slate-400 uppercase mt-1">Chattogram</div>
              </div>
            </div>
          </div>

          {/* Dynamic Footer */}
          <div className="pt-8 flex justify-between items-end border-t border-slate-100">
            <div className="text-[8px] font-bold text-slate-400 uppercase space-y-1 tracking-widest">
              <p>System Timestamp: {new Date().toISOString()}</p>
              <p>Document Identification Hash: NM-ERP-{String(entry.id || '').substring(0, 12).toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] font-black text-slate-900 uppercase tracking-[0.2em]">© 2026 Nasirah Mart Enterprise</p>
              <p className="text-[7px] font-bold text-slate-400 italic">Strictly Confidential Internal Document</p>
            </div>
          </div>
        </div>
      </div>
    );
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
      pdf.save(`journal_entries_${new Date().getTime()}.pdf`);
      showToast(t('dashboard.journal_entries.success_pdf'), 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast(t('dashboard.journal_entries.error_pdf'), 'error');
    } finally {
      setExporting(false);
    }
  };

  const filteredEntries = Array.isArray(entries) ? entries.filter(entry => 
    (entry.description || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (entry.reference || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  ) : [];

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen pt-24 print:pt-0 print:bg-white print:p-0">
      <VoucherPrint entry={selectedEntry} />
      
      {/* Report Preview Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center p-0 md:p-8 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-6xl md:rounded-[2.5rem] shadow-2xl min-h-screen md:min-h-0 relative"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-slate-100 print:hidden">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                    <Printer className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Journal Report Preview</h3>
                    <p className="text-sm text-slate-500">Total {filteredEntries.length} Entries Found</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm"
                  >
                    <Printer className="w-4 h-4" /> Print Report
                  </button>
                  <button 
                    onClick={() => setIsReportModalOpen(false)}
                    className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 md:p-12 overflow-x-auto">
                <div className="min-w-[800px] border-[3px] border-slate-900 p-10 space-y-8 bg-white">
                  <div className="flex justify-between items-start border-b-[3px] border-slate-900 pb-8">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-900 flex items-center justify-center text-white font-black text-3xl">N</div>
                      <div>
                        <h1 className="text-2xl font-black uppercase">Nasirah Mart Ltd.</h1>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">General Ledger Journal Report</p>
                      </div>
                    </div>
                    <div className="text-right text-sm font-bold">
                      <p className="text-slate-400 uppercase text-[9px] tracking-widest mb-1">Generated On</p>
                      <p>{new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="px-4 py-4 text-left text-[10px] font-black uppercase w-32">Date</th>
                        <th className="px-4 py-4 text-left text-[10px] font-black uppercase w-32">Ref</th>
                        <th className="px-4 py-4 text-left text-[10px] font-black uppercase">Description</th>
                        <th className="px-4 py-4 text-right text-[10px] font-black uppercase w-32">Amount</th>
                        <th className="px-4 py-4 text-center text-[10px] font-black uppercase w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredEntries.map((entry) => (
                        <tr key={entry.id} className="text-sm">
                          <td className="px-4 py-4 font-bold text-slate-600">{new Date(entry.date).toLocaleDateString()}</td>
                          <td className="px-4 py-4 font-black">{entry.reference}</td>
                          <td className="px-4 py-4 text-slate-600 font-medium">{entry.description}</td>
                          <td className="px-4 py-4 text-right font-black">{(entry.amount || 0).toLocaleString()}</td>
                          <td className="px-4 py-4 text-center">
                            <span className={cn(
                              "text-[10px] font-black px-2 py-1 rounded uppercase",
                              entry.status === 'Posted' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            )}>
                              {entry.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  <div className="pt-12 flex justify-between">
                    <div className="text-center">
                      <div className="w-40 h-px bg-slate-900 mb-2"></div>
                      <p className="text-[9px] font-black uppercase text-slate-400">Prepared By</p>
                    </div>
                    <div className="text-center">
                      <div className="w-40 h-px bg-slate-900 mb-2"></div>
                      <p className="text-[9px] font-black uppercase text-slate-400">In-Charge</p>
                    </div>
                    <div className="text-center">
                      <div className="w-40 h-px bg-slate-900 mb-2"></div>
                      <p className="text-[9px] font-black uppercase text-slate-400">Managing Director</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <VoucherPrint entry={selectedEntry} />
      
      {/* Voucher Preview Modal */}
      <AnimatePresence>
        {isVoucherModalOpen && selectedEntry && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 md:p-8 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-5xl md:rounded-[2.5rem] shadow-2xl min-h-screen md:min-h-0 relative"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-white/80 backdrop-blur-md border-b border-slate-100 print:hidden">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Voucher Preview</h3>
                    <p className="text-sm text-slate-500">Ref: {selectedEntry.reference}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm"
                  >
                    <Printer className="w-4 h-4" /> Print Voucher
                  </button>
                  <button 
                    onClick={() => {
                      setIsVoucherModalOpen(false);
                      setSelectedEntry(null);
                    }}
                    className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 md:p-12 bg-white">
                <VoucherPrint entry={selectedEntry} isModalLayout={true} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden", selectedEntry && "print:hidden")}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('dashboard.journal_entries.title')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.journal_entries.subtitle')}</p>
        </div>
        <button 
          onClick={() => {
            setEditingEntry(null);
            resetForm();
            setIsModalOpen(true);
          }}
          className="flex-1 sm:flex-none bg-emerald-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-sm"
        >
          <Plus className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.journal_entries.new_entry')}
        </button>
      </div>

      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 print:hidden", selectedEntry && "print:hidden")}>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-2">{t('dashboard.journal_entries.total_entries')}</p>
          <p className="text-2xl md:text-3xl font-black text-slate-900">{entries.length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-2">{t('dashboard.journal_entries.posted')}</p>
          <p className="text-2xl md:text-3xl font-black text-emerald-600">{entries.filter(e => e.status === 'Posted').length}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-slate-500 font-bold text-[10px] md:text-xs uppercase tracking-wider mb-2">{t('dashboard.journal_entries.pending')}</p>
          <p className="text-2xl md:text-3xl font-black text-amber-500">{entries.filter(e => e.status === 'Pending').length}</p>
        </div>
      </div>

      <div className={cn(
        "glass rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-white/50 overflow-hidden print:shadow-none print:border-none print:glass-none",
        selectedEntry && "print:hidden"
      )}>
        <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder={t('dashboard.journal_entries.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors"
            >
              <Printer className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.journal_entries.print')}
            </button>
            <button 
              onClick={handleExportPDF}
              disabled={exporting}
              className="flex items-center gap-2 text-xs md:text-sm font-bold text-slate-600 hover:text-emerald-600 transition-colors disabled:opacity-50"
            >
              <FileText className="w-4 h-4 md:w-5 h-5" /> {exporting ? t('dashboard.journal_entries.exporting') : t('dashboard.journal_entries.pdf')}
            </button>
          </div>
        </div>

        <div ref={tableRef} className="overflow-x-auto print:overflow-visible">
          <div className="hidden print:block p-8 border-b border-slate-100 mb-8">
            <h2 className="text-2xl font-bold text-slate-900">{t('dashboard.journal_entries.report_title')}</h2>
            <p className="text-slate-500">{t('dashboard.journal_entries.report_generated_on', { date: new Date().toLocaleDateString() })}</p>
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.journal_entries.date')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.journal_entries.reference')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.journal_entries.description')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">{t('dashboard.journal_entries.amount')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-center">{t('dashboard.journal_entries.status')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">{t('dashboard.journal_entries.actions')}</th>
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
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                        <Calendar className="w-4 h-4" />
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-black text-slate-900">{entry.reference}</td>
                    <td className="px-8 py-6 font-bold text-slate-700">{entry.description}</td>
                    <td className="px-8 py-6 font-black text-slate-900 text-right">{t('dashboard.finance.currency')} {(entry.amount || 0).toLocaleString()}</td>
                    <td className="px-8 py-6 text-center">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        entry.status === 'Posted' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                      )}>
                        {entry.status === 'Posted' ? t('dashboard.journal_entries.statuses.posted') : t('dashboard.journal_entries.statuses.pending')}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {entry.status === 'Pending' && (
                          <button 
                            onClick={() => handlePost(entry.id)}
                            className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                            title={t('dashboard.journal_entries.post_entry')}
                          >
                            <CheckCircle2 className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          onClick={() => {
                            setSelectedEntry(entry);
                            setIsVoucherModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" 
                          title={t('dashboard.journal_entries.print')}
                        >
                          <Printer className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleEdit(entry)}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                          title={t('dashboard.journal_entries.edit_entry')}
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(entry.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                          title={t('dashboard.journal_entries.delete_entry')}
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

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{t('dashboard.journal_entries.delete_confirm_title') || 'Delete Entry'}</h3>
              <p className="text-slate-500 mb-8">{t('dashboard.journal_entries.delete_confirm')}</p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex-1 bg-rose-500 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/20"
                >
                  {t('common.delete')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* New Journal Entry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-emerald-500 p-8 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{editingEntry ? t('dashboard.journal_entries.edit_entry') : t('dashboard.journal_entries.new_entry')}</h3>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddEntry} className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.journal_entries.date')}</label>
                    <input
                      type="date"
                      value={newEntry.date}
                      onChange={(e) => setNewEntry({ ...newEntry, date: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.journal_entries.reference')}</label>
                    <input
                      type="text"
                      value={newEntry.reference}
                      onChange={(e) => setNewEntry({ ...newEntry, reference: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.journal_entries.status')}</label>
                    <select
                      value={newEntry.status}
                      onChange={(e) => setNewEntry({ ...newEntry, status: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="Pending">{t('dashboard.journal_entries.statuses.pending')}</option>
                      <option value="Posted">{t('dashboard.journal_entries.statuses.posted')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.journal_entries.description')}</label>
                  <input
                    type="text"
                    value={newEntry.description}
                    onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                    placeholder="e.g. Initial Capital Injection"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-900 uppercase tracking-widest text-xs">{t('dashboard.journal_entries.entry_details')}</h4>
                    <button 
                      type="button"
                      onClick={addItem}
                      className="text-emerald-600 font-bold text-xs flex items-center gap-1 hover:text-emerald-700"
                    >
                      <Plus className="w-4 h-4" /> {t('dashboard.journal_entries.add_line')}
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {newEntry.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-5">
                          <select
                            value={item.account_id}
                            onChange={(e) => updateItem(index, 'account_id', e.target.value)}
                            className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-emerald-500"
                            required
                          >
                            <option value="">{t('dashboard.journal_entries.select_account')}</option>
                            {accounts.map(acc => (
                              <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            placeholder={t('dashboard.journal_entries.debit')}
                            value={item.debit || ''}
                            onChange={(e) => updateItem(index, 'debit', Number(e.target.value))}
                            className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm text-right focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="col-span-3">
                          <input
                            type="number"
                            placeholder={t('dashboard.journal_entries.credit')}
                            value={item.credit || ''}
                            onChange={(e) => updateItem(index, 'credit', Number(e.target.value))}
                            className="w-full bg-slate-50 border-none rounded-xl py-2 px-3 text-sm text-right focus:ring-2 focus:ring-emerald-500"
                          />
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button 
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-12 gap-3 pt-4 border-t border-slate-100">
                    <div className="col-span-5 text-right font-bold text-slate-500 text-sm">{t('dashboard.journal_entries.totals')}:</div>
                    <div className="col-span-3 text-right font-black text-slate-900 text-sm">
                      {t('dashboard.finance.currency')} {(newEntry.items.reduce((sum, i) => sum + Number(i.debit), 0) || 0).toLocaleString()}
                    </div>
                    <div className="col-span-3 text-right font-black text-slate-900 text-sm">
                      {t('dashboard.finance.currency')} {(newEntry.items.reduce((sum, i) => sum + Number(i.credit), 0) || 0).toLocaleString()}
                    </div>
                    <div className="col-span-1"></div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    {t('dashboard.journal_entries.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    {editingEntry ? t('dashboard.journal_entries.update_entry') : t('dashboard.journal_entries.create_entry')}
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
