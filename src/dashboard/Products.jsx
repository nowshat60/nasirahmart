import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Plus, Search, Filter, Pencil, Trash2, 
  Package, Tag, AlertCircle, MoreVertical,
  ArrowUpDown, Download, X, Check, Image as ImageIcon
} from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';

export const Products = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formData, setFormData] = useState({
    item_name: '',
    sku: '',
    category: '',
    price: '',
    cutprice: '',
    cost_price: '',
    quantity: '',
    min_stock_level: 5,
    image: '',
    star: 5,
    discount_percentage: 0,
    status: 'published',
    unit: 'Pieces (pc)',
    short_description: ''
  });
  const [imagePreview, setImagePreview] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axios.get('/api/products'),
        axios.get('/api/categories')
      ]);
      
      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
    } catch (error) {
      console.error("Fetch products error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setFormData({
        item_name: product.item_name || '',
        sku: product.sku || '',
        category: product.category || '',
        price: product.price || '',
        cutprice: product.cutprice || '',
        cost_price: product.cost_price || '',
        quantity: product.quantity || '',
        min_stock_level: product.min_stock_level || 5,
        image: product.image || '',
        star: product.star || 5,
        discount_percentage: product.discount_percentage || 0,
        status: product.status || 'published',
        unit: product.unit || 'Pieces (pc)',
        short_description: product.short_description || ''
      });
      setImagePreview(product.image);
    } else {
      setCurrentProduct(null);
      setFormData({
        item_name: '',
        sku: '',
        category: categories.length > 0 ? categories[0].id : '',
        price: '',
        cutprice: '',
        cost_price: '',
        quantity: '',
        min_stock_level: 5,
        image: '',
        star: 5,
        discount_percentage: 0,
        status: 'published',
        unit: 'Pieces (pc)',
        short_description: ''
      });
      setImagePreview(null);
    }
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // For now, we'll use a placeholder or base64 since we don't have storage upload logic here
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Find category name for syncing
    const selectedCat = categories.find(c => c.id === formData.category);

    const productData = {
      ...formData,
      category_name: selectedCat ? selectedCat.name || selectedCat.category_name : 'Uncategorized',
      price: Number(formData.price),
      cutprice: Number(formData.cutprice) || 0,
      cost_price: Number(formData.cost_price) || 0,
      quantity: Number(formData.quantity) || 0,
      min_stock_level: Number(formData.min_stock_level) || 5
    };

    try {
      if (currentProduct) {
        await axios.put(`/api/products/${currentProduct.id}`, productData);
        showToast(t('dashboard.products.update_success'), 'success');
      } else {
        await axios.post('/api/products', {
          ...productData,
          createdAt: new Date().toISOString()
        });
        showToast(t('dashboard.products.add_success'), 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Save product error:", error);
      showToast('Failed to save product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    setLoading(true);
    try {
      await axios.delete(`/api/products/${itemToDelete}`);
      showToast(t('dashboard.products.delete_success'), 'success');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      fetchData();
    } catch (error) {
      console.error("Delete product error:", error);
      showToast('Failed to delete product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleExport = () => {
    const headers = ["ID", "Product Name", "SKU", "Category", "Price", "Quantity", "Status"];
    const rows = products.map(p => [
      p.id,
      `"${p.item_name}"`,
      p.sku || '',
      `"${p.category_name || 'Uncategorized'}"`,
      p.price,
      p.quantity,
      p.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `products_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredProducts = products.filter(p => 
    (p.item_name || '')?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.sku && p.sku?.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (p.category_name && p.category_name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 min-h-screen pt-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t('dashboard.products.title')}</h1>
          <p className="text-sm text-slate-500">{t('dashboard.products.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleExport}
            className="flex-1 sm:flex-none bg-white text-slate-900 border border-slate-200 px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all text-sm"
          >
            <Download className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.products.export')}
          </button>
          <button 
            onClick={() => handleOpenModal()}
            className="flex-1 sm:flex-none bg-emerald-500 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 text-sm"
          >
            <Plus className="w-4 h-4 md:w-5 h-5" /> {t('dashboard.products.add_product')}
          </button>
        </div>
      </div>

      <div className="glass rounded-[2rem] md:rounded-[2.5rem] shadow-xl border-white/50 overflow-hidden">
        <div className="p-4 md:p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder={t('dashboard.products.search_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-emerald-500 w-full"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          </div>
          <div className="text-sm font-bold text-slate-500">
            {t('dashboard.products.total_products')}: <span className="text-blue-600">{products.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.products.sl')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.products.product')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.products.sku')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.products.price_per_unit')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('dashboard.products.stock_status')}</th>
                <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t('dashboard.products.actions')}</th>
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
                filteredProducts.map((product, index) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6 text-sm font-bold text-slate-400">
                      {(index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-100 bg-white shadow-sm">
                          <img 
                            src={product.image || 'https://picsum.photos/seed/product/200'} 
                            alt={product.item_name} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer" 
                          />
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{product.item_name}</p>
                          <span className="text-[10px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
                            {product.category_name || 'Uncategorized'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-slate-500">{product.sku || 'N/A'}</td>
                    <td className="px-8 py-6">
                      <p className="font-black text-blue-600 text-sm">{t('product.price')} {(product.price || 0).toLocaleString()} / {product.unit || 'kg'}</p>
                      {product.cutprice > 0 && (
                        <p className="text-[10px] text-slate-400 line-through">{t('product.price')} {(product.cutprice || 0).toLocaleString()}</p>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className={cn(
                          "text-xs font-bold px-2 py-0.5 rounded-full w-fit",
                          product.quantity <= product.min_stock_level ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                        )}>
                          {product.quantity} {t('dashboard.products.in_stock')}
                        </span>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-tighter">
                          {product.status === 'published' ? t('dashboard.products.published') : product.status || 'PUBLISHED'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleOpenModal(product)}
                          className="p-2 bg-emerald-50 text-emerald-500 rounded-lg hover:bg-emerald-100 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => confirmDelete(product.id)}
                          className="p-2 bg-rose-50 text-rose-500 rounded-lg hover:bg-rose-100 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl overflow-hidden my-8"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h2 className="text-2xl font-black text-slate-900">
                  {currentProduct ? t('dashboard.products.edit') : t('dashboard.products.add')}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[70vh] overflow-y-auto">
                <div className="md:col-span-2 space-y-8">
                  {/* Basic Information */}
                  <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {t('dashboard.products.basic_info')}
                    </h3>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">{t('dashboard.products.name')} *</label>
                      <input
                        type="text"
                        required
                        value={formData.item_name}
                        onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. Premium Wireless Headphones"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">{t('dashboard.products.category')} *</label>
                        <select
                          required
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">{t('dashboard.products.select_category')}</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name || cat.category_name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">{t('dashboard.products.status')}</label>
                        <select
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="published">{t('dashboard.products.published')}</option>
                          <option value="draft">{t('dashboard.products.draft')}</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Pricing & Inventory */}
                  <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {t('dashboard.products.pricing_inventory')}
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">{t('dashboard.products.regular_price')} ({t('product.price')}) *</label>
                        <input
                          type="number"
                          required
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">{t('dashboard.products.sale_price')} ({t('product.price')})</label>
                        <input
                          type="number"
                          value={formData.cutprice}
                          onChange={(e) => setFormData({ ...formData, cutprice: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">{t('dashboard.products.unit')} *</label>
                        <select
                          value={formData.unit}
                          onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Pieces (pc)">Pieces (pc)</option>
                          <option value="Kilogram (kg)">Kilogram (kg)</option>
                          <option value="Litre (l)">Litre (l)</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500">{t('dashboard.products.stock_qty')} *</label>
                        <input
                          type="number"
                          required
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Descriptions */}
                  <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {t('dashboard.products.descriptions')}
                    </h3>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500">{t('dashboard.products.short_description')}</label>
                      <textarea
                        value={formData.short_description}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        placeholder="Brief overview of the product"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {/* Product Image */}
                  <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6">
                    <h3 className="text-sm font-bold text-slate-900">{t('dashboard.products.image')}</h3>
                    <div className="aspect-square bg-white border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative group">
                      {imagePreview ? (
                        <img src={imagePreview || undefined} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center p-4">
                          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                          <p className="text-[10px] font-bold text-slate-400">Image Preview</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="cursor-pointer bg-blue-50 text-blue-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-100 transition-all text-center">
                        {t('dashboard.products.choose_file')}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-slate-400 text-center">
                        {formData.image ? formData.image.name : t('dashboard.products.no_file')}
                      </p>
                    </div>
                  </div>

                  {/* Product Identity */}
                  <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-6">
                    <h3 className="text-sm font-bold text-slate-900">{t('dashboard.products.identity')}</h3>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">{t('dashboard.products.sku')} (Stock Keeping Unit)</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g. RICE-MIN-001"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-50 transition-all"
                    >
                      {t('common.cancel')}
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                    >
                      {t('dashboard.products.save')}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
