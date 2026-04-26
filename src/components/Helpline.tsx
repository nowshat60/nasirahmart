import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, X, Send, User } from 'lucide-react';
import { cn } from '../lib/utils';

export const Helpline: React.FC = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'bot'; text: string }[]>([
    { role: 'bot', text: t('helpline.welcome') }
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMsg = message;
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setMessage('');

    // Mock bot response
    setTimeout(() => {
      setChat(prev => [...prev, { role: 'bot', text: t('helpline.bot_response') }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 left-8 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-20 left-0 w-80 glass rounded-[2rem] shadow-2xl overflow-hidden border-white/50"
          >
            <div className="bg-emerald-500 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">{t('helpline.title')}</h3>
                  <p className="text-xs text-emerald-100">{t('helpline.status')}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-80 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
              {chat.map((msg, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm",
                    msg.role === 'user'
                      ? "bg-emerald-500 text-white ml-auto rounded-tr-none"
                      : "bg-white text-slate-700 mr-auto rounded-tl-none shadow-sm"
                  )}
                >
                  {msg.text}
                </div>
              ))}
            </div>

            <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t('helpline.placeholder')}
                className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
              <button type="submit" className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500",
          isOpen ? "bg-slate-900 text-white rotate-90" : "bg-emerald-500 text-white"
        )}
      >
        {isOpen ? <X className="w-8 h-8" /> : <MessageCircle className="w-8 h-8" />}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </motion.button>
    </div>
  );
};
