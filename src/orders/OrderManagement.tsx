import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Eye, CheckCircle, Clock, Truck, AlertCircle, X, 
  ShoppingBag, User, Mail, Calendar, CreditCard, Download, 
  MapPin, Phone, MoreVertical, FileText, Trash2, Printer, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ TypeScript Interface aligned with backend
interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_id: number;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  subtotal: number;
  tax: number;
  shipping_fee: number;
  total_amount: number;      // ✅ matches backend 'total_amount'
  status: string;
  payment_method: string;
  created_at: string;
  items: OrderItem[];
  tracking_number: string;
}

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    try {
      // ✅ Fetch from standardized endpoint
      const response = await axios.get('http://localhost/nasirah-mart/api-php/orders/get_all_orders.php');
      setOrders(response.data || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      const response = await axios.post('http://localhost/nasirah-mart/api-php/orders/update_status.php', {
        id: orderId,
        status: newStatus
      });
      
      if (response.data.success) {
        alert(`Order marked as ${newStatus}`);
        fetchOrders();
        setSelectedOrder(null);
      } else {
        alert("Update failed: " + response.data.message);
      }
    } catch (error) {
      alert("Server error!");
    }
  };

  const getStatusStyle = (status: string) => {
    const styles: Record<string, string> = {
      delivered: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      cancelled: 'bg-rose-100 text-rose-700 border-rose-200',
      shipped: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return styles[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.order_number?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return <div className="p-8 text-center">Loading orders...</div>;
  }

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Order Dashboard</h1>
          <p className="text-slate-500 text-sm">Real-time order tracking & invoice management</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search by ID or Name..."
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none text-sm font-semibold"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-[11px] uppercase font-bold text-slate-400">Order & Date</th>
              <th className="p-4 text-[11px] uppercase font-bold text-slate-400">Customer</th>
              <th className="p-4 text-[11px] uppercase font-bold text-slate-400">Payment</th>
              <th className="p-4 text-[11px] uppercase font-bold text-slate-400 text-center">Status</th>
              <th className="p-4 text-[11px] uppercase font-bold text-slate-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-slate-50/50 transition-all">
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">#{order.order_number}</span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="p-4">
                  <div>
                    <span className="text-sm font-semibold text-slate-700">{order.customer_name}</span>
                    <p className="text-[10px] text-slate-400">{order.customer_email}</p>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900">৳{order.total_amount.toLocaleString()}</span>
                    <span className="text-[10px] font-bold text-blue-500 uppercase">{order.payment_method}</span>
                  </div>
                </td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setSelectedOrder(order)} className="p-2 text-slate-400 hover:text-blue-600 rounded-lg">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-[2px]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-4xl rounded-[2rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
                    <ShoppingBag className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 leading-none">Order #{selectedOrder.order_number}</h2>
                    <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-tighter">
                      Placed on {new Date(selectedOrder.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-white rounded-full text-slate-400 hover:text-rose-500">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <div>
                    <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                      <ChevronRight className="w-4 h-4 text-blue-600" /> Items Summary
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl">
                          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-[10px]">IMG</div>
                          <div className="flex-1">
                            <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                            <p className="text-xs text-slate-400 font-bold">Qty: {item.quantity} × ৳{item.price}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900">৳{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
                      <ChevronRight className="w-4 h-4 text-blue-600" /> Order Journey
                    </h3>
                    <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                      <div className="relative flex items-center gap-4">
                        <div className="absolute -left-8 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center text-white text-[8px]">✓</div>
                        <div><p className="text-sm font-bold text-slate-900">Order Placed</p></div>
                      </div>
                      <div className="relative flex items-center gap-4">
                        <div className={`absolute -left-8 w-6 h-6 ${selectedOrder.status !== 'pending' ? 'bg-emerald-500' : 'bg-slate-200'} rounded-full border-4 border-white shadow-sm`}></div>
                        <div><p className="text-sm font-bold text-slate-900">Processing</p></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-4">Customer Details</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-bold text-slate-800">{selectedOrder.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-slate-600">{selectedOrder.customer_email}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-blue-600" />
                        <span className="text-xs text-slate-600">{selectedOrder.customer_phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100">
                    <h4 className="text-[11px] font-black text-blue-400 uppercase tracking-widest mb-4">Shipping Info</h4>
                    <div className="flex gap-3 text-blue-900">
                      <MapPin className="w-4 h-4" />
                      <p className="text-xs font-bold">{selectedOrder.customer_address}</p>
                    </div>
                    <div className="pt-3 border-t border-blue-100 mt-3">
                      <p className="text-[10px] font-black text-blue-400 uppercase mb-1">Tracking ID</p>
                      <p className="text-xs font-black text-blue-900">{selectedOrder.tracking_number}</p>
                    </div>
                  </div>

                  <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100">
                    <h4 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest mb-4">Amount Summary</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Subtotal:</span>
                        <span className="font-bold">৳{selectedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Tax (5%):</span>
                        <span className="font-bold">৳{selectedOrder.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Shipping:</span>
                        <span className="font-bold">{selectedOrder.shipping_fee === 0 ? 'FREE' : `৳${selectedOrder.shipping_fee}`}</span>
                      </div>
                      <div className="flex justify-between text-lg font-black text-slate-900 pt-2 border-t border-emerald-200">
                        <span>Total:</span>
                        <span>৳{selectedOrder.total_amount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <button 
                  onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                  className="flex items-center gap-2 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl font-bold text-sm"
                >
                  <Trash2 className="w-4 h-4" /> Cancel Order
                </button>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelectedOrder(null)} className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-sm font-bold">Close</button>
                  <button 
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200"
                  >
                    Mark as Shipped
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;