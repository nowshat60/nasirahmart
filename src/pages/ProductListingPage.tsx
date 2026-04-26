import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Filter, ChevronDown, Grid, List, Star, ShoppingCart, Heart } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Product } from '../types';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface ProductListingPageProps {
  title: string;
  subtitle: string;
  filterType: 'best-sellers' | 'new-arrivals';
}

export const ProductListingPage: React.FC<ProductListingPageProps> = ({ title, subtitle, filterType }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/products');
        let data = await response.json();
        
        if (filterType === 'best-sellers') {
          data = (data || []).sort((a: any, b: any) => (b.star || 0) - (a.star || 0)).slice(0, 20);
        } else {
          data = (data || []).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 20);
        }
        
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [filterType]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 mt-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">{title}</h1>
          <p className="text-slate-500">{subtitle}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-white p-1 rounded-xl border border-slate-100 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'grid' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-slate-600")}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg transition-all", viewMode === 'list' ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-400 hover:text-slate-600")}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          
          <button className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl border border-slate-100 shadow-sm font-bold text-sm text-slate-700 hover:border-emerald-500 transition-all">
            <Filter className="w-4 h-4" /> Filter
          </button>
          
          <div className="relative group">
            <button className="flex items-center gap-2 bg-white px-6 py-3 rounded-xl border border-slate-100 shadow-sm font-bold text-sm text-slate-700 hover:border-emerald-500 transition-all">
              Sort By <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="animate-pulse space-y-4">
              <div className="bg-slate-200 aspect-square rounded-[2rem]" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className={cn(
          "grid gap-8",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
        )}>
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500",
                viewMode === 'list' && "flex flex-col md:flex-row items-center p-6"
              )}
            >
              <div className={cn(
                "relative overflow-hidden bg-slate-50",
                viewMode === 'grid' ? "aspect-square" : "w-full md:w-64 aspect-square rounded-3xl"
              )}>
                <img 
                  src={product.image || undefined} 
                  alt={product.item_name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={() => toggleWishlist(product)}
                  className={cn(
                    "absolute top-6 right-6 p-3 rounded-2xl shadow-lg transition-all",
                    isInWishlist(product.id) ? "bg-rose-500 text-white" : "bg-white text-slate-400 hover:text-rose-500"
                  )}
                >
                  <Heart className="w-5 h-5" fill={isInWishlist(product.id) ? "currentColor" : "none"} />
                </button>
                {product.discount_percentage > 0 && (
                  <div className="absolute top-6 left-6 bg-emerald-500 text-white px-4 py-1.5 rounded-xl text-xs font-black shadow-lg shadow-emerald-500/30">
                    -{product.discount_percentage}%
                  </div>
                )}
              </div>

              <div className={cn("p-8", viewMode === 'list' && "flex-1")}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={cn("w-3 h-3", i < product.star ? "fill-current" : "text-slate-200")} />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category_name}</span>
                </div>
                
                <Link to={`/product/${product.id}`} className="block">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {product.item_name}
                  </h3>
                </Link>
                
                <p className="text-sm text-slate-500 mb-6 line-clamp-2">{product.short_description}</p>
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-black text-slate-900">TK {product.price}</span>
                    {product.cutprice > product.price && (
                      <span className="ml-2 text-sm text-slate-400 line-through font-bold">TK {product.cutprice}</span>
                    )}
                  </div>
                  <button 
                    onClick={() => addToCart(product)}
                    className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-emerald-500 transition-all shadow-lg hover:shadow-emerald-500/30 group/btn"
                  >
                    <ShoppingCart className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
