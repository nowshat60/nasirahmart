import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ChevronDown, MessageCircle, Send, X, User, Headset, HelpCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../axios/AxiosInstance';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'support';
  timestamp: any;
}

export const Support: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await axios.get('/api/faqs');
        setFaqs(response.data || []);
      } catch (error) {
        console.error("Fetch FAQs error:", error);
      }
    };
    fetchFaqs();
  }, []);

  useEffect(() => {
    if (!showChat || !user?.id) return;

    const fetchHistory = async () => {
      try {
        const response = await axios.get(`/api/support/history?userId=${user.id}`);
        const history = response.data || [];
        
        if (history.length === 0) {
          setMessages([{ id: 'welcome', text: 'Hello! How can we help you today?', sender: 'support', timestamp: new Date() }]);
        } else {
          setMessages(history);
        }
      } catch (error) {
        console.error("Fetch chat history error:", error);
      }
    };

    fetchHistory();
    // Poll for new messages every 5 seconds since we are moving away from onSnapshot
    const interval = setInterval(fetchHistory, 5000);
    return () => clearInterval(interval);
  }, [showChat, user?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const filteredFaqs = faqs.filter(faq => 
    (faq.question || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
    (faq.answer || '').toLowerCase().includes((searchQuery || '').toLowerCase())
  );

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user?.id) return;

    const msgText = newMessage;
    setNewMessage('');

    try {
      const response = await axios.post('/api/support/message', {
        message_text: msgText,
        sender: 'user',
        userId: user.id,
        userName: user.firstName || 'User'
      });

      // Optimistically add user message
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        text: msgText,
        sender: 'user',
        timestamp: new Date()
      }]);

      if (response.data.reply) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
             id: (Date.now() + 1).toString(),
             text: response.data.reply,
             sender: 'support',
             timestamp: new Date()
          }]);
        }, 1000);
      }
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 py-12 mt-20"
    >
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">How can we help you?</h1>
        <p className="text-slate-500 mb-12">Search our knowledge base or start a live chat with our support team.</p>
        
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6" />
          <input 
            type="text" 
            placeholder="Search for answers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border-2 border-slate-100 rounded-[2rem] pl-16 pr-8 py-5 focus:border-emerald-500 shadow-sm transition-all outline-none text-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <HelpCircle className="text-emerald-500" /> Frequently Asked Questions
          </h2>
          {filteredFaqs.map((faq) => (
            <div 
              key={faq.id}
              className="bg-white border border-slate-100 rounded-3xl overflow-hidden transition-all"
            >
              <button 
                onClick={() => setOpenFaq(openFaq === faq.id ? null : faq.id)}
                className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-slate-50 transition-all"
              >
                <span className="font-bold text-slate-700">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === faq.id ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openFaq === faq.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-8 pb-6 text-slate-500 leading-relaxed"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          {filteredFaqs.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400">No results found for "{searchQuery}"</p>
            </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-10 -mt-10 blur-2xl" />
            <Headset className="w-12 h-12 text-emerald-400 mb-6" />
            <h3 className="text-2xl font-bold mb-4">Direct Support</h3>
            <p className="text-slate-400 mb-8">Can't find what you're looking for? Our team is available 24/7.</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Live Chat: Available Now
              </div>
              <button 
                onClick={() => setShowChat(true)}
                className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
              >
                Start Live Chat <MessageCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-6">Other Ways to Connect</h3>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Us</p>
                  <p className="font-bold text-slate-700">support@nasirahmart.com</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Call Us</p>
                  <p className="font-bold text-slate-700">+880 1234 567 890</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Chat UI */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 right-8 z-[100] w-full max-w-sm"
          >
            <div className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[500px]">
              <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Headset className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold">Nasirah Support</p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Online
                    </p>
                  </div>
                </div>
                <button onClick={() => setShowChat(false)} className="text-slate-400 hover:text-white transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-emerald-500 text-white rounded-tr-none' 
                        : 'bg-slate-100 text-slate-700 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 flex gap-2">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                />
                <button type="submit" className="bg-emerald-500 text-white p-3 rounded-xl hover:bg-emerald-600 transition-all">
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
