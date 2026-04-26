import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const isWishlisted = isInWishlist(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    showToast(`${product.item_name} ${t('product.added_to_cart')}`, 'success');
  };

  const handleToggleWishlist = () => {
    toggleWishlist(product);
    if (!isWishlisted) {
      showToast(`${product.item_name} ${t('product.added_to_wishlist')}`, 'info');
    } else {
      showToast(`${product.item_name} ${t('product.removed_from_wishlist')}`, 'info');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-slate-100"
    >
      <Link to={`/product/${product.id}`} className="block relative aspect-square overflow-hidden">
        <img
          src={product.image || undefined}
          alt={product.item_name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.discount_percentage > 0 && (
          <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            -{product.discount_percentage}%
          </div>
        )}
      </Link>
      <div className="absolute top-4 right-4 flex flex-col gap-2 translate-x-12 group-hover:translate-x-0 transition-transform duration-500 z-10">
        <button
          onClick={handleToggleWishlist}
          className={cn(
            "p-3 rounded-full glass shadow-lg transition-all hover:scale-110",
            isWishlisted ? "text-rose-500 fill-rose-500" : "text-slate-600"
          )}
        >
          <Heart className="w-5 h-5" />
        </button>
        <button
          onClick={handleAddToCart}
          className="p-3 rounded-full glass shadow-lg text-emerald-500 transition-all hover:scale-110 hover:bg-emerald-500 hover:text-white"
        >
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <Link to={`/product/${product.id}`} className="block">
          <div className="flex items-center gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn(
                  "w-2.5 h-2.5",
                  i < product.star ? "text-amber-400 fill-amber-400" : "text-slate-200"
                )}
              />
            ))}
            <span className="text-[9px] text-slate-400 ml-1">(4.5)</span>
          </div>
          <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wider mb-0.5">{product.category}</p>
          <h3 className="text-sm font-bold text-slate-900 mb-1 truncate group-hover:text-emerald-600 transition-colors">
            {product.item_name}
          </h3>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base font-bold text-slate-900">{t('product.price')} {product.price}</span>
            {product.cutprice > product.price && (
              <span className="text-[10px] text-slate-400 line-through">{t('product.price')} {product.cutprice}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            className="text-xs font-bold text-emerald-500 hover:text-emerald-600 transition-colors"
          >
            {t('product.add')}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
