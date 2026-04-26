import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Truck, 
  AlertCircle, 
  Search, 
  RotateCcw, 
  ShoppingBag,
  ExternalLink,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

export const OrderHistory: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');
  const [searchQuery, setSearchQuery] = useState('');
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders?userId=${user?.id}`);
        const userOrders = await response.json();
        setOrders(userOrders || []);
        setFilteredOrders(userOrders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    let result = [...orders];
    
    if (activeTab === 'not-shipped') {
      result = result.filter(o => o.status?.toLowerCase() === 'pending');
    } else if (activeTab === 'cancelled') {
      result = result.filter(o => o.status?.toLowerCase() === 'cancelled');
    }

    if (searchQuery) {
      result = result.filter(o => 
        o.id?.toString().includes(searchQuery) || 
        o.items?.some((item: any) => (item.name || item.item_name || '')?.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredOrders(result);
  }, [orders, activeTab, searchQuery]);

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-blue-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'cancelled': return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default: return <AlertCircle className="w-5 h-5 text-slate-400" />;
    }
  };

  const handleReturn = (orderId: number) => {
    showToast(t('orders.return_request_sent', { id: orderId }), 'info');
  };

  const tabs = [
    { id: 'orders', label: t('orders.tabs.orders') },
    { id: 'buy-again', label: t('orders.tabs.buy_again') },
    { id: 'not-shipped', label: t('orders.tabs.not_shipped') },
    { id: 'cancelled', label: t('orders.tabs.cancelled') },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 pt-32 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{t('orders.title')}</h1>
          <p className="text-slate-500">{t('orders.subtitle')}</p>
        </div>
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder={t('orders.search_placeholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-8 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-6 py-4 text-sm font-bold transition-all whitespace-nowrap border-b-2",
              activeTab === tab.id 
                ? "border-emerald-500 text-emerald-600" 
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOrders.length > 0 ? (
        <div className="space-y-8">
          {filteredOrders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              {/* Card Header */}
              <div className="bg-slate-50 px-8 py-4 flex flex-wrap items-center justify-between gap-6 border-b border-slate-100">
                <div className="flex gap-10">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('orders.order_placed')}</p>
                    <p className="text-sm font-bold text-slate-700">{order.createdAt ? new Date(order.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('cart.total')}</p>
                    <p className="text-sm font-bold text-slate-700">{t('product.price')} {order.totalAmount}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('orders.ship_to')}</p>
                    <p className="text-sm font-bold text-emerald-600 hover:underline cursor-pointer">{user?.firstName} {user?.lastName}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t('orders.order_number')} {order.id}</p>
                  <div className="flex gap-3">
                    <button className="text-xs font-bold text-emerald-600 hover:underline">{t('orders.view_details')}</button>
                    <span className="text-slate-300">|</span>
                    <button className="text-xs font-bold text-emerald-600 hover:underline">{t('orders.invoice')}</button>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8">
                <div className="flex flex-col lg:flex-row gap-10">
                  <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <h3 className="text-xl font-bold text-slate-900">
                        {order.status === 'delivered' ? `${t('orders.status_delivered')} ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}` : `${t('orders.status_label')}: ${(order.status || '').charAt(0).toUpperCase() + (order.status || '').slice(1)}`}
                      </h3>
                    </div>

                    <div className="space-y-6">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-6">
                          <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shrink-0">
                            <img 
                              src={item.image || "https://picsum.photos/seed/order/200"} 
                              alt={item.item_name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <Link to={`/product/${item.id}`} className="text-emerald-600 font-bold hover:underline line-clamp-2 mb-1">
                              {item.item_name}
                            </Link>
                            <p className="text-xs text-slate-500 mb-4">{t('orders.return_window_closed', { date: order.createdAt ? new Date(new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() : 'N/A' })}</p>
                            <div className="flex flex-wrap gap-3">
                              <button 
                                onClick={() => navigate(`/product/${item.id}`)}
                                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-sm"
                              >
                                <ShoppingBag className="w-3 h-3" /> {t('orders.buy_it_again')}
                              </button>
                              <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all">
                                {t('orders.view_item')}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sidebar Actions */}
                  <div className="lg:w-64 space-y-3">
                    <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2">
                      <Truck className="w-4 h-4" /> {t('orders.track_package')}
                    </button>
                    <button 
                      onClick={() => handleReturn(order.id)}
                      className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <RotateCcw className="w-4 h-4" /> {t('orders.return_items')}
                    </button>
                    <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" /> {t('orders.write_review')}
                    </button>
                    <button className="w-full py-3 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm flex items-center justify-center gap-2">
                      <ExternalLink className="w-4 h-4" /> {t('orders.archive_order')}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('orders.no_orders')}</h3>
          <p className="text-slate-500 mb-8">{t('orders.no_orders_desc')}</p>
          <button 
            onClick={() => {
              setSearchQuery('');
              setActiveTab('orders');
            }}
            className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
          >
            {t('orders.clear_filters')}
          </button>
        </div>
      )}
    </div>
  );
};
