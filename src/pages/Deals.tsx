import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Timer, Zap, ShoppingCart, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Deal {
  id: string;
  item_name: string;
  price: number;
  cutprice: number;
  discount: number;
  quantity: number;
  remaining: number;
  end_time: string;
  image: string;
}

const CountdownTimer = ({ endTime }: { endTime: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const difference = new Date(endTime).getTime() - new Date().getTime();
      if (difference <= 0) {
        clearInterval(timer);
        return;
      }
      setTimeLeft({
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex gap-2 text-white font-mono">
      <div className="bg-slate-800 px-2 py-1 rounded">{String(timeLeft.hours).padStart(2, '0')}h</div>
      <div className="bg-slate-800 px-2 py-1 rounded">{String(timeLeft.minutes).padStart(2, '0')}m</div>
      <div className="bg-slate-800 px-2 py-1 rounded">{String(timeLeft.seconds).padStart(2, '0')}s</div>
    </div>
  );
};

export const Deals: React.FC = () => {
  const { t } = useTranslation();
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const response = await fetch('/api/products');
        const allProducts = await response.json();
        
        // Filter products that have a discount as "deals"
        const discounted = (allProducts || [])
          .filter((p: any) => p.discount > 0)
          .map((p: any) => ({
             ...p,
             remaining: Math.floor(Math.random() * 20) + 1,
             quantity: 50,
             end_time: new Date(Date.now() + 86400000).toISOString() // 24h from now
          }));
        setDeals(discounted);
      } catch (error) {
        console.error("Error fetching deals:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDeals();
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 py-12 mt-20"
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Zap className="text-amber-500 fill-amber-500" /> Flash Sale
          </h1>
          <p className="text-slate-500 mt-2">Limited time offers on premium products. Grab them before they're gone!</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-100 px-6 py-4 rounded-2xl flex items-center gap-4">
          <span className="text-emerald-700 font-bold uppercase text-sm tracking-wider">Ends In:</span>
          <CountdownTimer endTime={deals[0]?.end_time || new Date().toISOString()} />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {deals.map((deal) => (
            <motion.div 
              key={deal.id}
              whileHover={{ y: -10 }}
              className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="relative h-64 overflow-hidden">
                <img src={deal.image} alt={deal.item_name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                  -{deal.discount}% OFF
                </div>
                <div className="absolute bottom-4 right-4">
                  <CountdownTimer endTime={deal.end_time} />
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{deal.item_name}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl font-bold text-emerald-600">TK {deal.price}</span>
                  <span className="text-slate-400 line-through text-sm">TK {deal.cutprice}</span>
                </div>

                <div className="mb-6">
                  <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Stock Remaining</span>
                    <span className={deal.remaining < 10 ? "text-red-500" : "text-emerald-500"}>
                      {deal.remaining} left
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(deal.remaining / deal.quantity) * 100}%` }}
                      className={cn(
                        "h-full rounded-full transition-all",
                        (deal.remaining / deal.quantity) < 0.2 ? "bg-red-500" : "bg-emerald-500"
                      )}
                    />
                  </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all group">
                  Add to Cart <ShoppingCart className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
