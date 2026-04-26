import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { io } from 'socket.io-client';
import { MessageSquare, Send, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const LiveChat = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      socketRef.current = io();

      socketRef.current.on('chat_message', (msg) => {
        setMessages(prev => [...prev, msg]);
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && socketRef.current) {
      const msg = {
        id: Date.now() + Math.random(),
        text: input,
        sender: user?.firstName || t('nav.guest'),
        senderId: user?.id || 'guest',
        timestamp: new Date().toISOString()
      };
      socketRef.current.emit('chat_message', msg);
      setInput('');
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[60]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 glass rounded-[2.5rem] shadow-2xl overflow-hidden border-white/50"
          >
            <div className="bg-emerald-500 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold">{t('helpline.live_support')}</h3>
                  <p className="text-xs text-white/80">{t('helpline.online_help')}</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={scrollRef} className="h-96 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/30">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-emerald-500 mx-auto mb-4 shadow-sm">
                    <User className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-slate-500">{t('helpline.chat_welcome')}</p>
                </div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%]",
                    msg.senderId === (user?.id || 'guest') ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <span className="text-[10px] text-slate-400 mb-1 px-1">{msg.sender}</span>
                  <div className={cn(
                    "px-4 py-2 rounded-2xl text-sm shadow-sm",
                    msg.senderId === (user?.id || 'guest') 
                      ? "bg-emerald-500 text-white rounded-tr-none" 
                      : "bg-white text-slate-700 rounded-tl-none border border-slate-100"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={sendMessage} className="p-4 bg-white border-t border-slate-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('helpline.chat_placeholder')}
                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="bg-emerald-500 text-white p-2 rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-all active:scale-95"
      >
        <MessageSquare className="w-8 h-8" />
      </button>
    </div>
  );
};
