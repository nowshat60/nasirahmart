import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Gift, Mail, CreditCard, CheckCircle2, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const themes = [
  { id: 'birthday', name: 'Birthday', color: 'bg-pink-500', icon: '🎂' },
  { id: 'wedding', name: 'Wedding', color: 'bg-indigo-500', icon: '💍' },
  { id: 'holiday', name: 'Holiday', color: 'bg-red-500', icon: '🎄' },
  { id: 'general', name: 'General', color: 'bg-emerald-500', icon: '🎁' },
];

const amounts = [25, 50, 100, 250, 500];

export const GiftCards: React.FC = () => {
  const { showToast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState(themes[0]);
  const [amount, setAmount] = useState(50);
  const [customAmount, setCustomAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) return showToast('Please enter recipient email', 'error');
    
    setLoading(true);
    // Simulating a purchase
    setTimeout(() => {
      showToast('Gift card sent successfully!', 'success');
      setRecipientEmail('');
      setCustomAmount('');
      setLoading(false);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12 mt-20"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">Nasirah Mart Gift Cards</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">The perfect gift for any occasion. Send a digital gift card instantly to your loved ones.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Preview Section */}
        <div className="sticky top-32">
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" /> Live Preview
          </h2>
          <motion.div 
            key={selectedTheme.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`aspect-[1.6/1] rounded-[2.5rem] ${selectedTheme.color} p-12 text-white shadow-2xl relative overflow-hidden`}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="text-4xl">{selectedTheme.icon}</div>
                <div className="text-2xl font-bold italic">Nasirah Mart</div>
              </div>
              <div>
                <div className="text-sm uppercase tracking-widest opacity-80 mb-2">Gift Card Value</div>
                <div className="text-6xl font-bold">TK {customAmount || amount}</div>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-sm opacity-80">Valid for 1 year</div>
                <CreditCard className="w-8 h-8 opacity-50" />
              </div>
            </div>
          </motion.div>
          
          <div className="mt-8 bg-slate-50 rounded-3xl p-8 border border-slate-100">
            <h3 className="font-bold text-slate-900 mb-4">How it works:</h3>
            <ul className="space-y-4 text-slate-600">
              <li className="flex gap-3 items-start">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1">1</div>
                Choose a theme that fits the occasion.
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1">2</div>
                Select an amount or enter your own.
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-1">3</div>
                We'll email the digital card to the recipient instantly.
              </li>
            </ul>
          </div>
        </div>

        {/* Customization Section */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-sm">
          <form onSubmit={handlePurchase} className="space-y-10">
            {/* Theme Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">1. Choose a Theme</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {themes.map((theme) => (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSelectedTheme(theme)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedTheme.id === theme.id 
                        ? "border-emerald-500 bg-emerald-50" 
                        : "border-slate-100 hover:border-slate-200"
                    }`}
                  >
                    <span className="text-2xl">{theme.icon}</span>
                    <span className="text-xs font-bold text-slate-600">{theme.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">2. Select Amount (TK)</label>
              <div className="flex flex-wrap gap-3 mb-6">
                {amounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { setAmount(amt); setCustomAmount(''); }}
                    className={`px-6 py-3 rounded-xl font-bold transition-all ${
                      amount === amt && !customAmount
                        ? "bg-slate-900 text-white" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {amt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="number"
                  placeholder="Enter custom amount"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">TK</div>
              </div>
            </div>

            {/* Recipient Info */}
            <div>
              <label className="block text-sm font-bold text-slate-900 uppercase tracking-wider mb-6">3. Recipient Details</label>
              <div className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="email"
                    required
                    placeholder="Recipient's Email Address"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl pl-14 pr-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none"
                  />
                </div>
                <textarea
                  placeholder="Add a personal message (optional)"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-emerald-500 focus:bg-white transition-all outline-none h-32 resize-none"
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full bg-emerald-500 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50"
            >
              {loading ? "Processing..." : (
                <>
                  Purchase Gift Card <Send className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
};
