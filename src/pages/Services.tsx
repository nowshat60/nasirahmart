import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wrench, ShieldCheck, Hammer, Clock, CheckCircle2, X, Calendar, User, Phone, MapPin } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import axios from 'axios';

interface Service {
  id: string;
  title: string;
  description: string;
  price: number;
  icon: string;
}

const IconMap: Record<string, any> = {
  Wrench,
  ShieldCheck,
  Hammer
};

export const Services: React.FC = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get('/api/services');
        setServices(response.data || []);
      } catch (error) {
        console.error("Fetch services error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await axios.post('/api/services/book', {
        serviceId: selectedService?.id,
        serviceTitle: selectedService?.title,
        // Form data would be collected here in a real implementation
      });
      showToast('Service booked successfully! We will contact you shortly.', 'success');
      setSelectedService(null);
    } catch (error) {
      console.error("Book service error:", error);
      showToast('Failed to book service', 'error');
    } finally {
      setBookingLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12 mt-20"
    >
      <div className="text-center mb-16">
        <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-4 block">Expert Care</span>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Professional Services & Support</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">From installation to repairs, our certified experts are here to help you get the most out of your products.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-3xl" />)
        ) : (
          services.map((service) => {
            const Icon = IconMap[service.icon] || Wrench;
            return (
              <motion.div 
                key={service.id}
                whileHover={{ y: -10 }}
                className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col h-full"
              >
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{service.title}</h3>
                <p className="text-slate-500 mb-8 flex-1">{service.description}</p>
                <div className="flex items-center justify-between mt-auto">
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Starting from</span>
                    <span className="text-2xl font-bold text-emerald-600">TK {service.price}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedService(service)}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all"
                  >
                    Book Now
                  </button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedService(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-[3rem] w-full max-w-lg p-8 md:p-12 relative z-10 shadow-2xl"
            >
              <button 
                onClick={() => setSelectedService(null)}
                className="absolute top-8 right-8 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Book {selectedService.title}</h2>
                <p className="text-slate-500">Fill in your details and we'll schedule a visit.</p>
              </div>

              <form onSubmit={handleBooking} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="text" required placeholder="Your Name" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none" />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="tel" required placeholder="Phone Number" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none" />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="text" required placeholder="Service Address" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none" />
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input type="date" required className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none" />
                  </div>
                </div>

                <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-emerald-800">Total Estimate</span>
                    <span className="text-2xl font-bold text-emerald-600">TK {selectedService.price}</span>
                  </div>
                </div>

                <button 
                  disabled={bookingLoading}
                  className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
                >
                  {bookingLoading ? "Processing..." : (
                    <>
                      Confirm Booking <CheckCircle2 className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
