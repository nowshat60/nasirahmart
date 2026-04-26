import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, ShoppingCart, Heart, ShieldCheck, Truck, RotateCcw, ChevronRight, Minus, Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import { ProductCard } from '../components/ProductCard';

export const ProductDetails: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/products/${id}`);
        if (!response.ok) {
          setProduct(null);
          return;
        }
        
        const productData = await response.json();
        setProduct(productData);
        
        // Fetch related products (same category)
        const relResponse = await fetch('/api/products');
        const allProducts = await relResponse.json();
        const related = (allProducts || [])
          .filter((p: any) => p.category === productData.category && p.id.toString() !== id.toString())
          .slice(0, 6);
        setRelatedProducts(related);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('product.no_products')}</h2>
        <button 
          onClick={() => navigate('/')}
          className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold"
        >
          {t('product.back_to_home')}
        </button>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    showToast(`${product.item_name} ${t('product.added_to_cart')}`, 'success');
  };

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  const images = product.images || [product.image];

  return (
    <div className="max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <button onClick={() => navigate('/')} className="hover:text-emerald-500">{t('nav.home')}</button>
        <ChevronRight className="w-4 h-4" />
        <button onClick={() => navigate(`/?category=${product.category_name}`)} className="hover:text-emerald-500">{product.category_name}</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium truncate">{product.item_name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Image Gallery */}
        <div className="lg:col-span-7 grid grid-cols-12 gap-4">
          <div className="col-span-2 space-y-4">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={cn(
                  "w-full aspect-square rounded-xl overflow-hidden border-2 transition-all",
                  selectedImage === idx ? "border-emerald-500 shadow-lg" : "border-transparent hover:border-slate-200"
                )}
              >
                <img src={img || undefined} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
          <div className="col-span-10 relative aspect-square rounded-3xl overflow-hidden bg-white border border-slate-100">
            <motion.img
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              src={images[selectedImage] || undefined}
              alt={product.item_name}
              className="w-full h-full object-contain p-8"
            />
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <p className="text-emerald-600 font-bold uppercase tracking-widest text-sm mb-2">{product.category_name}</p>
            <h1 className="text-4xl font-bold text-slate-900 mb-4 leading-tight">{product.item_name}</h1>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-4 h-4",
                      i < product.star ? "text-amber-400 fill-amber-400" : "text-slate-200"
                    )}
                  />
                ))}
                <span className="text-sm font-bold text-slate-900 ml-2">{product.star}.0</span>
              </div>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-slate-500 hover:text-emerald-500 cursor-pointer">128 {t('product.reviews')}</span>
              <span className="text-slate-300">|</span>
              <span className="text-sm text-emerald-500 font-bold">{t('product.stock')}</span>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-4xl font-bold text-slate-900">{t('product.price')} {product.price}</span>
              {product.cutprice > product.price && (
                <span className="text-xl text-slate-400 line-through">{t('product.price')} {product.cutprice}</span>
              )}
              {product.discount_percentage > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                  -{product.discount_percentage}% {t('product.off')}
                </span>
              )}
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {product.short_description || product.description || t('product.default_desc')}
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-slate-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold text-slate-900">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-3 hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => toggleWishlist(product)}
                  className={cn(
                    "p-3 rounded-xl border transition-all",
                    isInWishlist(product.id) 
                      ? "bg-rose-50 border-rose-100 text-rose-500" 
                      : "bg-white border-slate-200 text-slate-400 hover:border-emerald-500 hover:text-emerald-500"
                  )}
                >
                  <Heart className={cn("w-6 h-6", isInWishlist(product.id) && "fill-current")} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleAddToCart}
                  className="bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-5 h-5" /> {t('product.add_to_cart')}
                </button>
                <button
                  onClick={handleBuyNow}
                  className="bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                >
                  {t('product.buy_now')}
                </button>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-slate-100">
              <Truck className="w-6 h-6 text-emerald-500 mb-2" />
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{t('product.free_delivery')}</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-slate-100">
              <RotateCcw className="w-6 h-6 text-emerald-500 mb-2" />
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{t('product.return_policy')}</span>
            </div>
            <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-white border border-slate-100">
              <ShieldCheck className="w-6 h-6 text-emerald-500 mb-2" />
              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">{t('checkout.secure_payment')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-24">
        <div className="border-b border-slate-100 mb-12">
          <div className="flex gap-12">
            <button className="pb-4 border-b-2 border-emerald-500 text-emerald-600 font-bold">{t('product.description')}</button>
            <button className="pb-4 text-slate-400 font-bold hover:text-slate-600">{t('product.specifications')}</button>
            <button className="pb-4 text-slate-400 font-bold hover:text-slate-600">{t('product.reviews')} (128)</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            <div className="prose prose-slate max-w-none">
              <p className="text-slate-600 leading-relaxed text-lg">
                {product.description || t('product.default_long_desc')}
              </p>
              <ul className="mt-8 space-y-4 text-slate-600">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {t('product.feature_1')}
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {t('product.feature_2')}
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  {t('product.feature_3')}
                </li>
              </ul>
            </div>
            
            {/* Specifications Table */}
            <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden">
              <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
                <h3 className="font-bold text-slate-900">{t('product.technical_specs')}</h3>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                {[
                  { label: t('product.brand'), value: 'Nasirah Mart Exclusive' },
                  { label: t('product.model'), value: product.sku || 'NM-2026-PREM' },
                  { label: t('product.category'), value: product.category_name },
                  { label: t('product.material'), value: 'Premium Composite' },
                  { label: t('product.weight'), value: '450g' },
                  { label: t('product.dimensions'), value: '20 x 15 x 5 cm' },
                  { label: t('product.warranty'), value: '1 Year International' },
                  { label: t('product.origin'), value: 'Bangladesh' },
                ].map((spec, i) => (
                  <div key={i} className="flex justify-between border-b border-slate-50 pb-4">
                    <span className="text-slate-500 text-sm">{spec.label}</span>
                    <span className="text-slate-900 text-sm font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100">
              <h3 className="text-xl font-bold text-emerald-900 mb-4">{t('product.special_offer')}</h3>
              <p className="text-emerald-700 text-sm mb-6">{t('product.special_offer_desc')}</p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Bkash_logo.png/1200px-Bkash_logo.png" className="w-6" alt="bKash" />
                </div>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                  <img src="https://nagad.com.bd/wp-content/uploads/2021/03/nagad-logo.png" className="w-6" alt="Nagad" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-2 block">{t('product.more_to_explore')}</span>
              <h2 className="text-4xl font-bold text-slate-900">{t('product.related_products')}</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
