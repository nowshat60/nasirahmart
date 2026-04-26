import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Trash } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

export const Cart: React.FC = () => {
  const { t } = useTranslation();
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 pt-20">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-10 h-10 text-slate-400" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t('cart.empty')}</h2>
        <p className="text-slate-500 mb-8">{t('cart.empty_desc')}</p>
        <Link
          to="/"
          className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
        >
          {t('cart.start_shopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-bold text-slate-900">{t('nav.cart')}</h1>
        <button
          onClick={clearCart}
          className="text-rose-500 font-bold text-sm flex items-center gap-2 hover:text-rose-600 transition-colors"
        >
          <Trash className="w-4 h-4" /> {t('cart.clear')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-6">
          <AnimatePresence>
            {cart.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="glass p-6 rounded-[2rem] flex items-center gap-6 group"
              >
                <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                  <img src={item.image || undefined} alt={item.item_name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">{item.category}</p>
                  <h3 className="text-lg font-bold text-slate-900 truncate mb-2">{item.item_name}</h3>
                  <p className="text-emerald-600 font-bold">{t('product.price')} {item.price}</p>
                </div>

                <div className="flex items-center gap-4 bg-slate-100 rounded-2xl p-2">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:bg-white rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold w-4 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:bg-white rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.id)}
                  className="p-3 text-slate-400 hover:text-rose-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="glass p-8 rounded-[2.5rem] sticky top-32">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">{t('checkout.order_summary')}</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-slate-600">
                <span>{t('checkout.subtotal')}</span>
                <span className="font-bold">{t('product.price')} {cartTotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('checkout.shipping_fee')}</span>
                <span className="text-emerald-500 font-bold">{t('cart.free')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>{t('checkout.tax')}</span>
                <span className="font-bold">{t('product.price')} 0</span>
              </div>
              <div className="border-t border-slate-200 pt-4 flex justify-between text-xl font-bold text-slate-900">
                <span>{t('checkout.total')}</span>
                <span>{t('product.price')} {cartTotal}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
            >
              {t('checkout.confirm')} <ArrowRight className="w-5 h-5" />
            </button>
            
            <p className="text-center text-xs text-slate-400 mt-6">
              {t('checkout.secure_payment')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
