import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Tag, Plus, Search, Filter, 
  Calendar, Trash2,  Pencil, CheckCircle, X
} from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const CouponManagement = () => {
  const { t } = useTranslation();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'percentage', expiry: '', status: 'active' });
  const { showToast } = useToast();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/coupons');
      setCoupons(response.data || []);
    } catch (error) {
      console.error("Fetch coupons error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const couponData = {
        ...newCoupon
      };

      if (newCoupon.id) {
        await axios.put(`/api/coupons/${newCoupon.id}`, couponData);
        showToast('Coupon updated successfully', 'success');
      } else {
        await axios.post('/api/coupons', {
          ...couponData,
          createdAt: new Date().toISOString()
        });
        showToast('Coupon created successfully', 'success');
      }
      setIsAddModalOpen(false);
      setNewCoupon({ code: '', discount: '', type: 'percentage', expiry: '', status: 'active' });
      fetchCoupons();
    } catch (error) {
      console.error("Save coupon error:", error);
      showToast('Failed to save coupon', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setNewCoupon(coupon);
    setIsAddModalOpen(true);
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await axios.delete(`/api/coupons/${itemToDelete}`);
      showToast('Coupon deleted successfully', 'success');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchCoupons();
    } catch (error) {
      console.error("Delete coupon error:", error);
      showToast('Failed to delete coupon', 'error');
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen pt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('dashboard.coupons.title')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.coupons.subtitle')}</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex-1 sm:flex-none bg-emerald-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 text-sm"
        >
          <Plus className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.coupons.create_coupon')}
        </button>
      </div>

      <div className="glass rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 md:px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.coupons.code')}</th>
                <th className="px-6 md:px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.coupons.discount')}</th>
                <th className="px-6 md:px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.coupons.type')}</th>
                <th className="px-6 md:px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">{t('dashboard.coupons.expiry')}</th>
                <th className="px-6 md:px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider">{t('dashboard.coupons.status')}</th>
                <th className="px-6 md:px-8 py-4 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">{t('dashboard.coupons.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 md:px-8 py-6 h-16 bg-slate-50/20"></td>
                  </tr>
                ))
              ) : (
                coupons.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 md:px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                          <Tag className="w-4 h-4 md:w-5 h-5" />
                        </div>
                        <span className="font-bold text-slate-900 text-sm md:text-base">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-6 md:px-8 py-6 font-bold text-slate-700 text-sm md:text-base">
                      {coupon.type === 'percentage' ? `${coupon.discount}%` : `${t('product.price')} ${coupon.discount}`}
                    </td>
                    <td className="px-6 md:px-8 py-6 text-slate-500 text-xs md:text-sm font-medium capitalize">{coupon.type}</td>
                    <td className="px-6 md:px-8 py-6 text-slate-500 text-xs md:text-sm font-medium hidden md:table-cell">{coupon.expiry}</td>
                    <td className="px-6 md:px-8 py-6">
                      <span className={cn(
                        "px-2 md:px-3 py-1 rounded-full text-[9px] md:text-[10px] font-bold uppercase",
                        coupon.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                      )}>
                        {coupon.status}
                      </span>
                    </td>
                    <td className="px-6 md:px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-1 md:gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(coupon)}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Pencil className="w-4 h-4 md:w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(coupon.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 h-5" />
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
              <h3 className="text-xl font-black text-slate-900 mb-2">{t('dashboard.categories.delete_confirm_title')}</h3>
              <p className="text-slate-500 mb-8">{t('dashboard.categories.delete_confirm_text')}</p>
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

      {/* Add Coupon Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
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
                    <Tag className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">{t('dashboard.coupons.add_new')}</h3>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCoupon} className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.coupons.code_label')}</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="E.G. SAVE20"
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.coupons.discount_value')}</label>
                    <input
                      type="number"
                      value={newCoupon.discount}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
                      placeholder="20"
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.coupons.type')}</label>
                    <select
                      value={newCoupon.type}
                      onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="percentage">{t('dashboard.coupons.percentage')}</option>
                      <option value="fixed">{t('dashboard.coupons.fixed')}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.coupons.expiry_date')}</label>
                  <input
                    type="date"
                    value={newCoupon.expiry}
                    onChange={(e) => setNewCoupon({ ...newCoupon, expiry: e.target.value })}
                    className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                  >
                    {t('dashboard.coupons.create_coupon')}
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
