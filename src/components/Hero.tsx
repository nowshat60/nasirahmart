import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { cn } from '../lib/utils';

export const Hero: React.FC = () => {
  const { t } = useTranslation();
  const [current, setCurrent] = useState(0);

  const banners = [
    {
      id: 1,
      title: t('banners.winter.title'),
      subtitle: t('banners.winter.subtitle'),
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
      color: "bg-emerald-900",
      cta: t('banners.winter.cta'),
      link: "/category/fashion"
    },
    {
      id: 2,
      title: t('banners.tech.title'),
      subtitle: t('banners.tech.subtitle'),
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=2070&auto=format&fit=crop",
      color: "bg-slate-900",
      cta: t('banners.tech.cta'),
      link: "/category/electronics"
    },
    {
      id: 3,
      title: t('banners.home.title'),
      subtitle: t('banners.home.subtitle'),
      image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=2070&auto=format&fit=crop",
      color: "bg-amber-900",
      cta: t('banners.home.cta'),
      link: "/category/home-living"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const next = () => setCurrent(prev => (prev + 1) % banners.length);
  const prev = () => setCurrent(prev => (prev - 1 + banners.length) % banners.length);

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-3xl mt-28 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent z-10" />
          <img
            src={banners[current].image}
            alt={banners[current].title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 md:px-24">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-emerald-400 font-bold tracking-widest uppercase text-sm mb-4"
            >
              {t('hero.exclusive_offer')}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 max-w-2xl leading-tight"
            >
              {banners[current].title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-slate-200 mb-8 max-w-lg"
            >
              {banners[current].subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Link
                to={banners[current].link}
                className="bg-emerald-500 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 w-fit shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all hover:scale-105 active:scale-95"
              >
                <ShoppingBag className="w-5 h-5" />
                {banners[current].cta}
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <button
        onClick={prev}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full glass text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full glass text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {banners.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              current === i ? "w-8 bg-emerald-500" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
};
