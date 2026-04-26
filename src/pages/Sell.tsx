import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Store, Upload, User, Building2, MapPin, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import axios from '../axios/AxiosInstance';

export const Sell: React.FC = () => {
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    shopName: '',
    shopCategory: '',
    address: '',
    phone: '',
  });
  const [idFile, setIdFile] = useState<File | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setLoading(true);
    try {
      // In a real app, we would upload the file to a cloud storage like S3 or local disk via API
      await axios.post('/api/seller/apply', {
        ...formData,
        idProofPlaceholder: idFile ? idFile.name : null
      });

      showToast('Application submitted! Our team will review it within 48 hours.', 'success');
      setStep(4);
    } catch (error) {
      console.error("Seller application error:", error);
      showToast('Failed to submit application', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12 mt-20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
        <div>
          <span className="text-emerald-500 font-bold tracking-widest uppercase text-sm mb-4 block">Grow your business</span>
          <h1 className="text-5xl font-bold text-slate-900 mb-6 leading-tight">Start Selling on Nasirah Mart Today</h1>
          <p className="text-slate-500 text-lg mb-8">Join thousands of successful vendors and reach millions of customers across the country. We provide the tools, you provide the products.</p>
          
          <div className="space-y-6">
            {[
              { icon: <Store className="w-6 h-6" />, title: "Low Commission", desc: "Keep more of your profits with our competitive rates." },
              { icon: <ShieldCheck className="w-6 h-6" />, title: "Secure Payments", desc: "Get paid on time, every time, directly to your bank account." },
              { icon: <MapPin className="w-6 h-6" />, title: "Nationwide Delivery", desc: "Leverage our logistics network to ship anywhere." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{item.title}</h3>
                  <p className="text-slate-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl relative overflow-hidden">
          {/* Progress Bar */}
          <div className="flex justify-between mb-12 relative z-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  step >= s ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400"
                }`}>
                  {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Step {s}</span>
              </div>
            ))}
          </div>

          {step === 4 ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Application Received!</h2>
              <p className="text-slate-500 mb-8">We've sent a confirmation email to {formData.email}. Our team will review your shop details and get back to you within 2 business days.</p>
              <button onClick={() => setStep(1)} className="text-emerald-600 font-bold hover:underline">Submit another application</button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              {step === 1 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Personal Information</h2>
                  <div className="space-y-4">
                    <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input type="text" name="fullName" required placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none" />
                    </div>
                    <div className="relative">
                      <Store className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input type="email" name="email" required placeholder="Email Address" value={formData.email} onChange={handleInputChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Shop Details</h2>
                  <div className="space-y-4">
                    <div className="relative">
                      <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                      <input type="text" name="shopName" required placeholder="Shop Name" value={formData.shopName} onChange={handleInputChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none" />
                    </div>
                    <select name="shopCategory" required value={formData.shopCategory} onChange={handleInputChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none appearance-none">
                      <option value="">Select Shop Category</option>
                      <option value="fashion">Fashion & Apparel</option>
                      <option value="electronics">Electronics</option>
                      <option value="home">Home & Living</option>
                      <option value="beauty">Beauty & Health</option>
                    </select>
                    <textarea name="address" required placeholder="Business Address" value={formData.address} onChange={handleInputChange} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none h-32 resize-none" />
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900 mb-6">Verification</h2>
                  <p className="text-slate-500 text-sm">Please upload a clear photo of your National ID or Trade License for verification.</p>
                  <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center hover:border-emerald-500 transition-all cursor-pointer relative">
                    <input type="file" required onChange={(e) => setIdFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 font-bold">{idFile ? idFile.name : "Click to upload ID Proof"}</p>
                    <p className="text-slate-400 text-xs mt-2">JPG, PNG or PDF (Max 5MB)</p>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-4">
                {step > 1 && (
                  <button type="button" onClick={() => setStep(step - 1)} className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-2xl font-bold hover:bg-slate-200 transition-all">
                    Back
                  </button>
                )}
                <button type="submit" disabled={loading} className="flex-[2] bg-emerald-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30">
                  {loading ? "Submitting..." : (
                    <>
                      {step === 3 ? "Submit Application" : "Continue"} <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </motion.div>
  );
};
