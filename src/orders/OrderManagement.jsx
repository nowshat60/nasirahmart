import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Search, Filter, Eye, FileText, 
  Truck, CheckCircle, Clock, AlertCircle,
  Download, MoreVertical, MapPin, Phone, Mail, X,
  Printer
} from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const OrderManagement = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateData, setUpdateData] = useState({ status: '', courier: '', tracking_number: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const { showToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/orders');
      const ordersList = (response.data || []).map(o => ({
        ...o,
        created_at: o.createdAt
      }));
      setOrders(ordersList);
    } catch (error) {
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/orders/${selectedOrder.id}/status`, {
        status: updateData.status
      });
      showToast(t('dashboard.orders.update_success'), 'success');
      setIsUpdateModalOpen(false);
      fetchOrders();
    } catch (error) {
      console.error("Update order error:", error);
      showToast(t('dashboard.orders.update_error'), 'error');
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + [t('dashboard.orders.order_id'), t('dashboard.orders.customer'), "Email", t('dashboard.orders.date'), t('dashboard.orders.amount'), t('dashboard.orders.status'), t('dashboard.orders.payment')].join(",") + "\n"
      + orders.map(o => `${o.id},${o.customerName || 'Guest'},${o.email || ''},${o.created_at},${o.totalAmount || 0},${o.status},${o.paymentStatus || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "orders_report.csv");
    document.body.appendChild(link);
    link.click();
  };

  const filteredOrders = orders.filter(o => {
    const name = (o.customerName || '').toLowerCase();
    const email = (o.email || '').toLowerCase();
    const matchesSearch = String(o.id || '').includes(searchTerm) || 
                         name.includes((searchTerm || '').toLowerCase()) ||
                         email.includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || o.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusIcon = (status) => {
    switch((status || '').toLowerCase()) {
      case 'pending': return Clock;
      case 'processing': return AlertCircle;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      default: return Clock;
    }
  };

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const handlePrintInvoice = () => {
    window.print();
  };

  const InvoicePrint = ({ order, isModalLayout = false }) => {
    if (!order) return null;
    return (
      <div className={cn(
        "bg-white p-4 md:p-12 text-slate-900 border-2 border-slate-900",
        isModalLayout ? "block shadow-2xl rounded-3xl" : "hidden print:block fixed inset-0 z-[200] overflow-visible border-none"
      )}>
        {/* Background Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none overflow-hidden">
          <div className="text-[25rem] font-black rotate-[-35deg] tracking-tighter">INVOICE</div>
        </div>

        <div className="relative max-w-4xl mx-auto space-y-10">
          {/* Header Section */}
          <div className="flex justify-between items-start border-b-[3px] border-slate-900 pb-10">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-slate-900 flex items-center justify-center text-white font-black text-4xl shadow-2xl rounded-2xl">N</div>
              <div>
                <h1 className="text-3xl font-black uppercase tracking-tighter leading-none mb-2">Nasirah Mart Ltd.</h1>
                <p className="text-sm font-black text-emerald-600 uppercase tracking-[0.3em] mb-4">Premium Retail Network</p>
                <div className="text-[10px] font-bold text-slate-500 space-y-1 leading-tight">
                  <p>Elite Tower, Floor 12, Agrabad C/A, Chattogram</p>
                  <p>Support: +880 1234 567 890 | help@nasirahmart.com</p>
                  <p>BIN: 0092211-12 | VAT Registry: #V-88291</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-block bg-slate-900 text-white px-6 py-2 rounded-full mb-6 shadow-xl">
                <span className="text-xs font-black uppercase tracking-[0.2em]">Official Invoice</span>
              </div>
              <div className="space-y-2 text-right">
                <p className="flex justify-end gap-4"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Invoice Number:</span> <span className="font-black text-xl text-slate-900">#{String(order.id || '').substring(0, 8).toUpperCase()}</span></p>
                <p className="flex justify-end gap-4"><span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Issue Date:</span> <span className="font-black text-slate-900">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
                <p className="flex justify-end gap-4 font-black"><span className="text-[10px] uppercase text-slate-400 tracking-widest">Payment:</span> <span className={cn("uppercase px-2 rounded", order.payment_status === 'paid' ? "text-emerald-600" : "text-rose-600")}>{order.payment_status?.toUpperCase()}</span></p>
              </div>
            </div>
          </div>

          {/* Parties Section */}
          <div className="grid grid-cols-2 gap-16">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative group">
              <div className="absolute -top-3 left-6 bg-white px-3 border border-slate-200 rounded-full">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Billing Info</span>
              </div>
              <p className="font-black text-slate-900 text-xl mb-2">{order.customerName || 'Guest Customer'}</p>
              <div className="space-y-1 text-sm font-bold text-slate-600">
                <p className="flex items-center gap-2"><span>Email:</span> <span className="text-slate-900">{order.email}</span></p>
                <p className="flex items-center gap-2"><span>Phone:</span> <span className="text-slate-900">{order.phone || 'N/A'}</span></p>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 relative">
              <div className="absolute -top-3 left-6 bg-white px-3 border border-slate-200 rounded-full">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Shipping Destination</span>
              </div>
              <div className="space-y-1 text-sm font-bold text-slate-700 leading-relaxed">
                <p className="font-black text-slate-900 mb-1">{order.shippingDetails?.fullName || order.customerName}</p>
                <p>{order.shippingDetails?.address}</p>
                <p>{order.shippingDetails?.city}, {order.shippingDetails?.zipCode}</p>
                <p className="text-emerald-600 mt-2">Mobile: {order.shippingDetails?.phone}</p>
              </div>
            </div>
          </div>

          {/* Order Details Table */}
          <div className="border-[3px] border-slate-900 overflow-hidden shadow-2xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] border-r border-white/20">Description of Goods</th>
                  <th className="px-6 py-5 text-center text-[10px] font-black uppercase tracking-[0.2em] w-20 border-r border-white/20">Qty</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] w-32 border-r border-white/20">Unit</th>
                  <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] w-32">Total (TK)</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100">
                {order.items?.map((item, idx) => (
                  <tr key={idx} className="bg-white">
                    <td className="px-6 py-6 border-r border-slate-100">
                      <p className="font-black text-slate-900 text-base">{item.item_name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Item Ref: SKU-{String(order.id || '').substring(0, 4)}-{idx}</p>
                    </td>
                    <td className="px-6 py-6 text-center font-black text-slate-900 border-r border-slate-100">{item.quantity}</td>
                    <td className="px-6 py-6 text-right font-bold text-slate-600 border-r border-slate-100">{(Number(item.price) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                    <td className="px-6 py-6 text-right font-black text-slate-900 text-base">{((Number(item.price) || 0) * (Number(item.quantity) || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
                {/* Visual Spacing Rows */}
                {[...Array(Math.max(0, 3 - (order.items?.length || 0)))].map((_, i) => (
                  <tr key={`fill-${i}`} className="h-12 bg-white"><td className="border-r border-slate-100"></td><td className="border-r border-slate-100"></td><td className="border-r border-slate-100"></td><td></td></tr>
                ))}
              </tbody>
              <tfoot className="border-t-[3px] border-slate-900">
                <tr className="bg-slate-50">
                  <td colSpan={2} rowSpan={4} className="px-8 py-8 align-top border-r border-slate-200">
                    <div className="space-y-4">
                      <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest">Payment Logic</p>
                        <div className="flex gap-4">
                          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl">
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Method</p>
                            <p className="text-xs font-black text-slate-900 uppercase">{order.payment_method}</p>
                          </div>
                          <div className="px-4 py-2 bg-white border border-slate-200 rounded-xl">
                            <p className="text-[8px] font-bold text-slate-400 uppercase mb-0.5">Net Status</p>
                            <p className="text-xs font-black text-emerald-600 uppercase">{order.payment_status}</p>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <p className="text-[8px] font-bold text-slate-400 uppercase leading-relaxed italic">
                          Thank you for choosing Nasirah Mart. For help with your order, please visit nasirahmart.com/support or call us directly.
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-r border-slate-100">Order Subtotal</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">{((order.totalAmount || 0) - (order.shippingCost || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="bg-slate-50">
                  <td className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] border-r border-slate-100">Logistic Fees</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">{(order.shippingCost || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
                <tr className="bg-slate-900 text-white shadow-2xl">
                  <td className="px-6 py-6 text-right text-xs font-black uppercase tracking-[0.3em] border-r border-white/20">Total Payable</td>
                  <td className="px-6 py-6 text-right text-2xl font-black">TK {(order.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal Section */}
          <div className="grid grid-cols-2 gap-16 pt-10">
            <div>
              <h3 className="text-[10px] font-black uppercase text-slate-900 mb-4 tracking-widest border-b-2 border-slate-100 pb-2">Compliance Notice</h3>
              <ul className="text-[9px] text-slate-500 font-bold space-y-2 leading-relaxed">
                <li className="flex gap-2"><span>•</span> <span>This is a digital transaction receipt generated by Nasirah ERP.</span></li>
                <li className="flex gap-2 text-rose-500 italic"><span>•</span> <span>Warranty is applicable as per manufacturer policy.</span></li>
                <li className="flex gap-2"><span>•</span> <span>Subject to Chattogram Jurisdictional Laws.</span></li>
              </ul>
            </div>
            <div className="flex flex-col items-center justify-end">
              <div className="w-48 h-1 bg-slate-900 mb-4 shadow-xl"></div>
              <p className="text-[10px] font-black uppercase text-slate-900 tracking-[0.3em]">Authorized Corporate Seal</p>
              <div className="mt-4 flex items-center justify-center">
                <div className="w-16 h-16 border-2 border-slate-100 bg-slate-50/50 rounded-2xl flex items-center justify-center opacity-30 italic font-black text-[6px] text-center p-2 uppercase select-none">NM Digital Security Verification</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen pt-24 print:p-0 print:bg-white print:pt-0">
      <InvoicePrint order={selectedOrder} />
      {/* Invoice Preview Modal */}
      <AnimatePresence>
        {isInvoiceModalOpen && selectedOrder && (
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
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Invoice Preview</h3>
                    <p className="text-sm text-slate-500">Order #{String(selectedOrder.id || '').substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-all text-sm"
                  >
                    <Printer className="w-4 h-4" /> Print Invoice
                  </button>
                  <button 
                    onClick={() => {
                      setIsInvoiceModalOpen(false);
                      setSelectedOrder(null);
                    }}
                    className="p-2.5 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 md:p-12 bg-white">
                <InvoicePrint order={selectedOrder} isModalLayout={true} />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden", selectedOrder && "print:hidden")}>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('dashboard.orders.title')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.orders.subtitle')}</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleExport}
            className="flex-1 sm:flex-none bg-white text-slate-900 border border-slate-200 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm"
          >
            <Download className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.orders.export')}
          </button>
        </div>
      </div>

      <div className={cn("glass rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-white/50 overflow-hidden print:hidden", selectedOrder && "print:hidden")}>
        <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1 sm:flex-none">
              <input
                type="text"
                placeholder={t('dashboard.orders.search_placeholder')}
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
              <option value="all">{t('dashboard.orders.all_status')}</option>
              <option value="pending">{t('dashboard.orders.pending')}</option>
              <option value="processing">{t('dashboard.orders.processing')}</option>
              <option value="shipped">{t('dashboard.orders.shipped')}</option>
              <option value="delivered">{t('dashboard.orders.delivered')}</option>
              <option value="cancelled">{t('dashboard.orders.cancelled')}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.orders.order_id')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.orders.customer')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.orders.date')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.orders.amount')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.orders.status')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.orders.payment')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.orders.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-8 py-6 h-16 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : (
                Array.isArray(filteredOrders) && filteredOrders.map((order) => {
                  const StatusIcon = getStatusIcon(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6 font-bold text-slate-900">#{String(order.id || '').substring(0, 8)}</td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700">{order.customerName || 'Guest'}</span>
                          <span className="text-xs text-slate-400 font-medium">{order.email}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-slate-500 text-sm font-medium">
                        {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-8 py-6 font-black text-slate-900">{t('product.price')} {(order.totalAmount || 0).toLocaleString()}</td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold w-fit",
                          (order.status || '').toLowerCase() === 'delivered' ? "bg-emerald-100 text-emerald-600" :
                          (order.status || '').toLowerCase() === 'pending' ? "bg-amber-100 text-amber-600" :
                          (order.status || '').toLowerCase() === 'shipped' ? "bg-blue-100 text-blue-600" :
                          "bg-slate-100 text-slate-600"
                        )}>
                          <StatusIcon className="w-3 h-3" />
                          {(order.status || 'pending').toUpperCase()}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1">
                          <span className="text-xs font-bold text-slate-500">{order.payment_method}</span>
                          <span className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-bold w-fit",
                            (order.payment_status || '').toLowerCase() === 'paid' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                          )}>
                            {(order.payment_status || 'pending').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setUpdateData({ status: order.status, courier: order.courier || '', tracking_number: order.tracking_number || '' });
                              setIsUpdateModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" 
                            title={t('dashboard.orders.update_status')}
                          >
                            <Truck className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsInvoiceModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-blue-500 transition-colors" 
                            title={t('dashboard.orders.view_invoice')}
                          >
                            <FileText className="w-5 h-5" />
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

      {/* Update Status Modal */}
      <AnimatePresence>
        {isUpdateModalOpen && (
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
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{t('dashboard.orders.update_modal_title')}</h3>
                    <p className="text-white/80 text-sm">{t('orders.order_number')}{selectedOrder?.id}</p>
                  </div>
                </div>
                <button onClick={() => setIsUpdateModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdateStatus} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.orders.status')}</label>
                  <select
                    value={updateData.status}
                    onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="pending">{t('dashboard.orders.pending')}</option>
                    <option value="processing">{t('dashboard.orders.processing')}</option>
                    <option value="shipped">{t('dashboard.orders.shipped')}</option>
                    <option value="delivered">{t('dashboard.orders.delivered')}</option>
                    <option value="cancelled">{t('dashboard.orders.cancelled')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.orders.courier_partner')}</label>
                  <input
                    type="text"
                    value={updateData.courier}
                    onChange={(e) => setUpdateData({ ...updateData, courier: e.target.value })}
                    placeholder="e.g. Pathao, RedX"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.orders.tracking_number')}</label>
                  <input
                    type="text"
                    value={updateData.tracking_number}
                    onChange={(e) => setUpdateData({ ...updateData, tracking_number: e.target.value })}
                    placeholder="NM-TRK-XXXXXX"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    {t('dashboard.orders.update_order')}
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
