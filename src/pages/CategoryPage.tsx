import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Filter, ChevronRight, Search as SearchIcon, SlidersHorizontal } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from '../components/ProductCard';
import { cn } from '../lib/utils';

export const CategoryPage: React.FC = () => {
  const { t } = useTranslation();
  const { categoryName } = useParams<{ categoryName: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState(10000);
  const [sortBy, setSortBy] = useState('featured');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        const allProducts = await response.json();
        
        const categoryProducts = (allProducts || []).filter((p: any) => 
          (p.category || '').toLowerCase() === (categoryName || '').toLowerCase()
        );
        setProducts(categoryProducts);
        setFilteredProducts(categoryProducts);
      } catch (error) {
        console.error("Error fetching category products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
    window.scrollTo(0, 0);
  }, [categoryName]);

  useEffect(() => {
    let result = [...products];

    // Filter by price
    result = result.filter(p => p.price <= priceRange);

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.star - a.star);
    }

    setFilteredProducts(result);
  }, [products, priceRange, sortBy]);

  return (
    <div className="max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-8">
        <button onClick={() => navigate('/')} className="hover:text-emerald-500">{t('nav.home')}</button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium capitalize">{categoryName}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="lg:w-64 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Filter className="w-5 h-5 text-emerald-500" /> {t('product.filters')}
            </h3>
            
            <div className="space-y-8">
              {/* Price Range */}
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                  <span>{t('home.price_range')}</span>
                  <span className="text-emerald-500">{t('home.up_to')} {t('product.price')} {priceRange}</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10000" 
                  step="100"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold">
                  <span>{t('product.price')} 0</span>
                  <span>{t('product.price')} 10,000+</span>
                </div>
              </div>

              {/* Other filters could go here */}
              <div className="pt-8 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-4 uppercase tracking-widest">{t('product.availability')}</h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-emerald-500 focus:ring-emerald-500" defaultChecked />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{t('product.in_stock')}</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-200 text-emerald-500 focus:ring-emerald-500" />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">{t('product.on_sale')}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 capitalize mb-2">{categoryName}</h1>
              <p className="text-slate-500 text-sm">{t('product.products_found', { count: filteredProducts.length })}</p>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="flex items-center gap-2 bg-white border border-slate-100 px-4 py-2 rounded-2xl shadow-sm">
                <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none text-sm font-bold text-slate-700 focus:ring-0 cursor-pointer"
                >
                  <option value="featured">{t('product.featured')}</option>
                  <option value="price-low">{t('product.price_low_high')}</option>
                  <option value="price-high">{t('product.price_high_low')}</option>
                  <option value="rating">{t('product.highest_rated')}</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl h-[350px] animate-pulse border border-slate-100" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center bg-white rounded-[3rem] border border-slate-100 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('product.no_products')}</h3>
              <p className="text-slate-500 mb-8">{t('product.try_adjusting')}</p>
              <button 
                onClick={() => {
                  setPriceRange(10000);
                  setSortBy('featured');
                }}
                className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
              >
                {t('product.reset_filters')}
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
