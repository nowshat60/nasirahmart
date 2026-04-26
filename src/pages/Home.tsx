import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Hero } from '../components/Hero';
import { BentoCategories } from '../components/BentoCategories';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight, ShoppingBag, Filter, Search as SearchIcon } from 'lucide-react';
import { cn } from '../lib/utils';

interface CategorySectionProps {
  category: string;
  slug: string;
  products: Product[];
  t: any;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, slug, products, t }) => {
  if (products.length === 0) return null;
  return (
    <section className="py-16 border-b border-slate-50 last:border-0">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-emerald-500 font-bold tracking-widest uppercase text-xs mb-2 block">{category}</span>
          <h2 className="text-3xl font-bold text-slate-900">{category}</h2>
        </div>
        <Link to={`/category/${slug}`} className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-4 transition-all text-sm">
          {t('product.view_all')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(10000);
  const location = useLocation();

  const categoriesList = [
    { id: 'all', name: 'All', slug: 'all' },
    ...(Array.isArray(dbCategories) ? dbCategories : []).map(c => ({ id: c.id, name: c.name, slug: c.slug }))
  ];

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const [productRes, categoryRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories')
      ]);
      
      const productData = await productRes.json();
      const allCategories = await categoryRes.json();
      
      // Deduplicate by name
      const safeCategories = Array.isArray(allCategories) ? allCategories : [];
      const uniqueCategories = safeCategories.filter((cat: any, index: number, self: any[]) => 
        index === self.findIndex((t) => t.name === cat.name)
      );
      setDbCategories(uniqueCategories);

      setProducts(Array.isArray(productData) ? productData : []);
      setFilteredProducts(Array.isArray(productData) ? productData : []);
    } catch (error) {
      console.error("Error fetching data from MySQL API:", error);
      setProducts([]);
      setDbCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = (searchParams.get('search') || '').toLowerCase();
    const categoryQuery = searchParams.get('category');

    let result = products;

    if (query) {
      result = result.filter(p => 
        (p.item_name || '').toLowerCase().includes(query) || 
        (p.short_description || '').toLowerCase().includes(query)
      );
    }

    if (categoryQuery) {
      const lowerCatQuery = (categoryQuery || '').toLowerCase();
      result = result.filter(p => (p.category || '').toLowerCase() === lowerCatQuery);
      const catObj = (Array.isArray(dbCategories) ? dbCategories : []).find(c => (c.slug || '').toLowerCase() === lowerCatQuery);
      if (catObj && selectedCategory !== catObj.name) {
        setSelectedCategory(catObj.name);
      }
    } else if (selectedCategory !== 'All') {
      const selectedCatObj = (Array.isArray(dbCategories) ? dbCategories : []).find(c => c.name === selectedCategory);
      if (selectedCatObj) {
        result = result.filter(p => p.category === selectedCatObj.slug);
      }
    }

    result = result.filter(p => p.price <= priceRange);

    setFilteredProducts(result);
  }, [location.search, products, selectedCategory, priceRange, dbCategories]);

  const recommendations = products.slice(0, 6);

  return (
    <div className="max-w-[98%] mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <Hero />
      <BentoCategories />

      {/* Search & Filter Bar */}
      <section className="py-12 border-b border-slate-100">
        <div className="flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            {categoriesList.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-bold transition-all",
                  selectedCategory === cat.name 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30" 
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                )}
              >
                {cat.name === 'All' ? t('nav.all_categories') : cat.name}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex-1 md:w-64">
              <div className="flex justify-between text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
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
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Category Sections or Search Results */}
      {loading ? (
        <section className="py-20">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl h-[350px] animate-pulse border border-slate-100" />
            ))}
          </div>
        </section>
      ) : selectedCategory !== 'All' || new URLSearchParams(location.search).get('search') ? (
        <section className="py-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-2 block">{t('product.curated_selection')}</span>
              <h2 className="text-4xl font-bold text-slate-900">
                {new URLSearchParams(location.search).get('search') ? t('home.search_results') : selectedCategory}
              </h2>
            </div>
          </div>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('product.no_products')}</h3>
              <p className="text-slate-500">{t('product.try_adjusting')}</p>
            </div>
          )}
        </section>
      ) : (
        <div className="space-y-8">
          {dbCategories.map(cat => (
            <CategorySection 
              key={cat.id} 
              category={cat.name} 
              slug={cat.slug}
              products={products.filter(p => p.category === cat.slug).slice(0, 12)} 
              t={t}
            />
          ))}
        </div>
      )}

      {/* Recommendations - "You May Also Like" */}
      {products.length > 0 && (
        <section className="py-20 bg-slate-50/50 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="max-w-[98%] mx-auto">
            <div className="mb-12">
              <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-2 block">{t('product.personalized')}</span>
              <h2 className="text-4xl font-bold text-slate-900">{t('product.you_may_like')}</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {recommendations.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section className="relative overflow-hidden rounded-[3rem] bg-slate-900 py-20 px-8 md:px-20">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-emerald-500/10 blur-[100px] -z-10" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-blue-500/10 blur-[100px] -z-10" />
        
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-emerald-500/30">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-6">{t('home.newsletter_title')}</h2>
          <p className="text-slate-400 mb-10 text-lg">
            {t('home.newsletter_desc')}
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder={t('home.email_placeholder')}
              className="flex-1 bg-slate-800 border-none rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <button className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
              {t('home.subscribe')} <ShoppingBag className="w-5 h-5" />
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
