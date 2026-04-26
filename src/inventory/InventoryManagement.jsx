import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Search, Filter, Warehouse, 
  Package, AlertTriangle, ArrowRight,
  Download, BarChart2, History, X, Save
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

export const InventoryManagement = () => {
  const { t } = useTranslation();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [adjustmentData, setAdjustmentData] = useState({ quantity: 0, type: 'add', reason: '' });
  const { showToast } = useToast();

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/products');
      setInventory(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error("Fetch inventory error:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAdjustment = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    try {
      const currentQty = Number(selectedItem.quantity || 0);
      const adjustmentQty = Number(adjustmentData.quantity);
      const newQty = adjustmentData.type === 'add' ? currentQty + adjustmentQty : currentQty - adjustmentQty;

      if (newQty < 0) {
        showToast(t('dashboard.inventory.insufficient_stock'), 'error');
        return;
      }

      await axios.put(`/api/products/${selectedItem.id}`, {
        quantity: newQty
      });

      // Log adjustment
      await axios.post('/api/inventory/logs', {
        productId: selectedItem.id,
        itemName: selectedItem.item_name,
        type: adjustmentData.type,
        quantity: adjustmentQty,
        previousQty: currentQty,
        newQty: newQty,
        reason: adjustmentData.reason
      });

      showToast(t('dashboard.inventory.adjustment_success'), 'success');
      setIsAdjustmentModalOpen(false);
      setAdjustmentData({ quantity: 0, type: 'add', reason: '' });
      fetchInventory();
    } catch (error) {
      console.error("Adjustment error:", error);
      showToast('Failed to adjust stock', 'error');
    }
  };

  const filteredInventory = inventory.filter(item => 
    (item.item_name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (item.sku && String(item.sku).toLowerCase().includes((searchTerm || '').toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen pt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('dashboard.inventory.title')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.inventory.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setIsWarehouseModalOpen(true)}
            className="flex-1 sm:flex-none bg-white text-slate-900 border border-slate-200 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm"
          >
            <Warehouse className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.inventory.warehouses')}
          </button>
          <button 
            onClick={() => setIsAdjustmentModalOpen(true)}
            className="flex-1 sm:flex-none bg-emerald-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-sm"
          >
            <Plus className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.inventory.adjustment')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass p-6 rounded-[1.5rem] md:rounded-[2rem] border-white/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Package className="w-5 h-5 md:w-6 h-6" />
            </div>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.inventory.total_stock')}</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900">
            {inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="glass p-6 rounded-[1.5rem] md:rounded-[2rem] border-white/50 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
              <AlertTriangle className="w-5 h-5 md:w-6 h-6" />
            </div>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.inventory.low_stock_alerts')}</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-rose-600">
            {t('dashboard.inventory.items_count', { count: inventory.filter(i => (i.quantity || 0) <= (i.min_stock_level || 5)).length })}
          </p>
        </div>
        <div className="glass p-6 rounded-[1.5rem] md:rounded-[2rem] border-white/50 shadow-sm sm:col-span-2 md:col-span-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Warehouse className="w-5 h-5 md:w-6 h-6" />
            </div>
            <p className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.inventory.active_warehouses')}</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-blue-600">{t('dashboard.inventory.locations_count', { count: 1 })}</p>
        </div>
      </div>

      <div className="glass rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-white/50 overflow-hidden">
        <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:flex-none">
              <input
                type="text"
                placeholder={t('dashboard.inventory.search_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 w-full md:w-64"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => showToast('Viewing inventory history...', 'info')}
              className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <History className="w-5 h-5" />
            </button>
            <button 
              onClick={() => showToast('Opening inventory analytics...', 'info')}
              className="p-2 bg-slate-50 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <BarChart2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.inventory.product')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.inventory.sku')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.inventory.warehouse')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.inventory.quantity')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.inventory.min_level')}</th>
                <th className="px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.inventory.actions')}</th>
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
                Array.isArray(filteredInventory) && filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 bg-white">
                          <img 
                            src={item.image || 'https://picsum.photos/seed/inv/200'} 
                            alt={item.item_name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="font-bold text-slate-900">{item.item_name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-500">{item.sku || 'N/A'}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-600">{item.warehouse_name || t('dashboard.inventory.main_warehouse')}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "font-black text-lg",
                        item.quantity <= item.min_stock_level ? "text-rose-500" : "text-slate-900"
                      )}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="px-8 py-6 font-bold text-slate-400">{item.min_stock_level}</td>
                    <td className="px-8 py-6">
                      <button 
                        onClick={() => {
                          setSelectedItem(item);
                          setAdjustmentData({ quantity: 0, type: 'add', reason: '' });
                          setIsAdjustmentModalOpen(true);
                        }}
                        className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      <AnimatePresence>
        {isAdjustmentModalOpen && (
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
                  <div>
                    <h3 className="text-xl font-bold">{t('dashboard.inventory.adjustment_modal_title')}</h3>
                    <p className="text-white/80 text-sm">{selectedItem?.item_name || t('dashboard.inventory.select_product')}</p>
                  </div>
                </div>
                <button onClick={() => setIsAdjustmentModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdjustment} className="p-8 space-y-6">
                {!selectedItem && (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.inventory.select_product')}</label>
                    <select
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      onChange={(e) => setSelectedItem(inventory.find(i => i.id === Number(e.target.value)))}
                    >
                      <option value="">{t('dashboard.inventory.choose_product')}</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>{item.item_name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.inventory.type')}</label>
                    <select
                      value={adjustmentData.type}
                      onChange={(e) => setAdjustmentData({ ...adjustmentData, type: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="add">{t('dashboard.inventory.add_stock')}</option>
                      <option value="remove">{t('dashboard.inventory.remove_stock')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.inventory.quantity')}</label>
                    <input
                      type="number"
                      value={adjustmentData.quantity}
                      onChange={(e) => setAdjustmentData({ ...adjustmentData, quantity: Number(e.target.value) })}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      min="1"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.inventory.reason')}</label>
                  <textarea
                    value={adjustmentData.reason}
                    onChange={(e) => setAdjustmentData({ ...adjustmentData, reason: e.target.value })}
                    placeholder={t('dashboard.inventory.reason_placeholder')}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdjustmentModalOpen(false)}
                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    {t('dashboard.inventory.save_adjustment')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Warehouse Modal */}
      <AnimatePresence>
        {isWarehouseModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-blue-500 p-8 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                    <Warehouse className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{t('dashboard.inventory.manage_warehouses')}</h3>
                </div>
                <button onClick={() => setIsWarehouseModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-4">
                  {[
                    { name: t('dashboard.inventory.main_warehouse'), location: 'Chattogram', capacity: '85%' },
                    { name: 'Dhaka Hub', location: 'Uttara, Dhaka', capacity: '42%' },
                    { name: 'Sylhet Depot', location: 'Sylhet', capacity: '12%' },
                  ].map((wh, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{wh.name}</p>
                        <p className="text-xs text-slate-500">{wh.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-400">{t('dashboard.inventory.capacity')}</p>
                        <p className="font-black text-blue-600">{wh.capacity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => showToast(t('dashboard.inventory.warehouse_restricted'), 'warning')}
                  className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl font-bold hover:bg-blue-100 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" /> {t('dashboard.inventory.add_new_warehouse')}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
