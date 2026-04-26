import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { ArrowRight, Smartphone, Watch, Shirt, Home, Sparkles, ShoppingBag, Tag } from 'lucide-react';
import { cn } from '../lib/utils';

const iconMap: { [key: string]: any } = {
  'Fashion': Shirt,
  'Electronics': Smartphone,
  'Home & Living': Home,
  'Beauty & Health': Sparkles,
  'Sports & Outdoors': ShoppingBag,
  'Groceries': ShoppingBag,
  'default': Tag
};

const colorMap: { [key: string]: string } = {
  'Fashion': 'bg-emerald-500',
  'Electronics': 'bg-blue-500',
  'Home & Living': 'bg-rose-500',
  'Beauty & Health': 'bg-pink-500',
  'Sports & Outdoors': 'bg-orange-500',
  'Groceries': 'bg-lime-500',
  'default': 'bg-slate-500'
};

export const BentoCategories: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) return <div className="py-20 text-center">{t('home.loading_categories')}</div>;

  return (
    <section className="py-20">
      <div className="flex items-end justify-between mb-12">
        <div>
          <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-2 block">{t('home.trending')}</span>
          <h2 className="text-4xl font-bold text-slate-900">{t('home.explore_categories')}</h2>
        </div>
        <Link to="/category/fashion" className="flex items-center gap-2 text-emerald-600 font-bold hover:gap-4 transition-all">
          {t('product.view_all')} <ArrowRight className="w-5 h-5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 min-h-[600px]">
        {categories.map((cat, i) => {
          const Icon = iconMap[cat.name] || iconMap['default'];
          const color = colorMap[cat.name] || colorMap['default'];
          const size = i === 0 || i === 3 ? "col-span-2 row-span-1" : "col-span-1 row-span-1";
          
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative group overflow-hidden rounded-[2.5rem] cursor-pointer min-h-[280px]",
                size
              )}
            >
              <Link to={`/category/${cat.slug}`} className="block w-full h-full">
                <img
                  src={cat.image || `https://picsum.photos/seed/${cat.slug}/800/600`}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex flex-col justify-end">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={cn("p-3 rounded-2xl text-white shadow-lg", color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{cat.name}</h3>
                      <p className="text-white/60 text-sm">{t('home.explore_collection')}</p>
                    </div>
                  </div>
                  <div className="w-full py-3 glass text-white rounded-2xl font-bold opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 flex items-center justify-center gap-2">
                    {t('home.explore_now')} <Sparkles className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};
