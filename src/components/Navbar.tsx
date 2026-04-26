import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  LogOut, 
  Menu, 
  X, 
  MapPin, 
  ChevronDown, 
  Globe,
  Package,
  Settings,
  HelpCircle,
  Percent,
  Gift,
  Store,
  Briefcase
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from '../types';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { user, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [location, setLocation] = useState(() => localStorage.getItem('userLocation') || 'Bangladesh');
  const [searchQuery, setSearchQuery] = useState('');
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState({ id: 'all', name: 'All', slug: 'all' });
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  const [latestOrder, setLatestOrder] = useState<any>(null);

  const categoriesList = [{ id: 'all', name: 'All', slug: 'all' }, ...(Array.isArray(dbCategories) ? dbCategories : [])];

  // Fetch true categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) throw new Error('API failed');
        const data = await response.json();
        setDbCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching navbar categories:", error);
        setDbCategories([]);
      }
    };
    fetchCats();
  }, []);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'bn', name: 'বাংলা', flag: '🇧🇩' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  const currentLanguage = languages.find(l => l.code === i18n.language) || languages[0];

  // Handle click outside search suggestions and language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live Autocomplete Logic
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.length < 1) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch('/api/products');
        const allProducts = await response.json();
        
        const filtered = (allProducts || []).filter((p: any) => 
          (p.item_name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) &&
          (selectedCategory.slug === 'all' || p.category === selectedCategory.slug)
        ).slice(0, 6);

        setSuggestions(filtered);
        setShowSuggestions(true);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCategory]);

  // Sync latest order dynamically (Simplified for MySQL)
  useEffect(() => {
    if (isAuthenticated && user?.id) {
       // Fetch once on mount/auth change
       fetch(`/api/orders/latest?userId=${user.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.id) setLatestOrder(data);
          else setLatestOrder(null);
        })
        .catch(err => {
          console.error("Error fetching latest order:", err);
          setLatestOrder(null);
        });
    }
  }, [isAuthenticated, user?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() || selectedCategory.slug !== 'all') {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery);
      if (selectedCategory.slug !== 'all') params.append('category', selectedCategory.slug);
      navigate(`/?${params.toString()}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId: number) => {
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
    setSearchQuery('');
  };

  const handleLocationSelect = (loc: string) => {
    setLocation(loc);
    localStorage.setItem('userLocation', loc);
    setIsLocationOpen(false);
    showToast(`${t('nav.deliver_to')} updated to ${loc}`, 'success');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 shadow-xl">
      {/* Top Header Row - Dark Slate Gray Theme */}
      <div className="bg-[#1F2937] text-white px-4 py-3 flex items-center justify-between gap-4 md:gap-8 h-20">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group shrink-0">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
            N
          </div>
          <span className="text-2xl font-bold tracking-tight hidden sm:block">
            Nasirah<span className="text-emerald-400">Mart</span>
          </span>
        </Link>

        {/* Delivery Location */}
        <div 
          onClick={() => setIsLocationOpen(true)}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer shrink-0"
        >
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <MapPin className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('nav.deliver_to')}</span>
            <span className="text-sm font-bold text-white">{location}</span>
          </div>
        </div>

        {/* Search Bar with Autocomplete */}
        <div ref={searchRef} className="flex-1 relative max-w-lg mx-4 hidden md:block">
          <form onSubmit={handleSearch} className="flex items-center h-12">
            <div className="flex w-full h-full rounded-2xl overflow-hidden bg-white shadow-inner focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
              <div className="relative h-full bg-slate-100 border-r border-slate-200">
                <select
                  value={selectedCategory.slug}
                  onChange={(e) => {
                    const catObj = categoriesList.find(c => c.slug === e.target.value);
                    if (catObj) setSelectedCategory(catObj);
                  }}
                  className="h-full bg-transparent text-slate-700 text-xs font-bold px-4 focus:outline-none cursor-pointer hover:bg-slate-200 transition-colors appearance-none pr-8"
                >
                  {categoriesList.map(cat => (
                    <option key={cat.id} value={cat.slug}>{cat.name === 'All' ? t('nav.all_categories') : cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
                placeholder={t('nav.search_placeholder')}
                className="flex-1 bg-transparent border-none py-2 px-4 focus:ring-0 text-slate-900 text-sm font-medium"
              />
              <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 transition-all flex items-center justify-center group">
                <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </form>

          {/* Autocomplete Suggestions */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[60]"
              >
                <div className="p-2">
                  {suggestions.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleSuggestionClick(product.id)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-emerald-50 rounded-xl transition-colors text-left group"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img 
                          src={product.image} 
                          alt={product.item_name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-slate-900 line-clamp-1">{product.item_name}</p>
                        <p className="text-xs text-slate-500">{product.category_name}</p>
                      </div>
                      <p className="text-sm font-bold text-emerald-600">${product.price}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          {/* Language Dropdown */}
          <div ref={langRef} className="hidden lg:block relative">
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer group"
              onClick={() => setIsLangOpen(!isLangOpen)}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{currentLanguage.flag}</span>
                <span className="text-sm font-bold uppercase">{currentLanguage.code}</span>
              </div>
              <ChevronDown className={cn("w-3 h-3 text-slate-400 transition-transform", isLangOpen && "rotate-180")} />
            </div>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-3 z-[100] border border-slate-100 overflow-hidden"
                >
                  <div className="px-4 pb-2 mb-2 border-b border-slate-50">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Language</p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          i18n.changeLanguage(lang.code);
                          setIsLangOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2.5 text-sm font-bold transition-all",
                          i18n.language === lang.code 
                            ? "text-emerald-600 bg-emerald-50" 
                            : "text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{lang.flag}</span>
                          <span>{lang.name}</span>
                        </div>
                        {i18n.language === lang.code && (
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sign Up Button (Beside Language) */}
          {!isAuthenticated && (
            <Link 
              to="/signup" 
              className="hidden xl:flex flex-col px-3 py-2 rounded-xl hover:bg-white/10 transition-colors shrink-0"
            >
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                {t('nav.new_customer')}
              </span>
              <span className="text-sm font-bold leading-none">{t('nav.sign_up')}</span>
            </Link>
          )}

          {/* Account */}
          <div className="relative group">
            <div 
              className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              onMouseEnter={() => setIsProfileOpen(true)}
              onMouseLeave={() => setIsProfileOpen(false)}
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                <User className="w-4 h-4 md:w-5 md:h-5 text-emerald-400" />
              </div>
              <div className="hidden lg:flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
                  {isAuthenticated ? `${t('nav.welcome')}, ${user?.firstName}` : t('nav.account')}
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold leading-none">{t('nav.account')}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </div>
              </div>
            </div>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onMouseEnter={() => setIsProfileOpen(true)}
                  onMouseLeave={() => setIsProfileOpen(false)}
                  className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl py-4 z-50 border border-slate-100 overflow-hidden"
                >
                  <div className="px-6 pb-4 border-b border-slate-100">
                    {!isAuthenticated ? (
                      <Link 
                        to="/login" 
                        className="block w-full bg-emerald-500 text-white text-center py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all"
                      >
                        {t('nav.sign_in')}
                      </Link>
                    ) : (
                      <div className="text-slate-900">
                        <p className="text-sm font-bold">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      </div>
                    )}
                  </div>
                  <div className="px-4 pt-4 space-y-1">
                    <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 rounded-lg transition-colors">
                      <User className="w-4 h-4 text-emerald-500" /> {t('nav.profile')}
                    </Link>
                    <Link to="/orders" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Package className="w-4 h-4 text-emerald-500" /> {t('nav.orders')}
                    </Link>
                    <Link to="/wishlist" className="flex items-center gap-3 px-3 py-2.5 text-sm text-slate-700 hover:bg-emerald-50 rounded-lg transition-colors">
                      <Heart className="w-4 h-4 text-emerald-500" /> {t('nav.wishlist')}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm text-emerald-600 font-bold hover:bg-emerald-50 rounded-lg transition-colors">
                        <Settings className="w-4 h-4" /> {t('nav.admin')}
                      </Link>
                    )}
                    {isAuthenticated && (
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileOpen(false);
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-50 rounded-lg transition-colors mt-2 border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" /> {t('nav.sign_out')}
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Returns & Orders */}
          <Link to="/orders" className="hidden sm:flex flex-col px-3 py-2 rounded-xl hover:bg-white/10 transition-colors shrink-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">
              {latestOrder ? latestOrder.status : t('nav.returns')}
            </span>
            <span className="text-sm font-bold leading-none">& {t('nav.orders')}</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="flex items-center gap-3 px-4 py-2 bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-all shrink-0 shadow-lg shadow-emerald-500/30 group">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              {cartCount > 0 && (
                <span className="absolute -top-3 -right-3 bg-white text-emerald-600 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-emerald-500">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-sm font-bold text-white hidden md:block">{t('nav.cart')}</span>
          </Link>

          {/* Wishlist Icon */}
          <Link to="/wishlist" className="hidden lg:flex relative p-3 rounded-xl hover:bg-white/10 transition-colors shrink-0 group">
            <Heart className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
            {wishlist.length > 0 && (
              <span className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#0f172a]">
                {wishlist.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Second Navigation Bar - Emerald Theme */}
      <div className="bg-emerald-600 text-white px-4 py-2 flex items-center gap-6 overflow-x-auto no-scrollbar shadow-inner">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all font-bold text-sm shrink-0"
        >
          <Menu className="w-5 h-5" />
          {t('nav.all_categories')}
        </button>
        <Link to="/deals" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all text-sm font-medium shrink-0">
          <Percent className="w-4 h-4" /> {t('nav.deals')}
        </Link>
        <Link to="/gift-cards" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all text-sm font-medium shrink-0">
          <Gift className="w-4 h-4" /> {t('nav.gift_cards')}
        </Link>
        <Link to="/sell" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all text-sm font-medium shrink-0">
          <Store className="w-4 h-4" /> {t('nav.sell')}
        </Link>
        <Link to="/services" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all text-sm font-medium shrink-0">
          <Briefcase className="w-4 h-4" /> {t('nav.services')}
        </Link>
        <Link to="/support" className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/20 transition-all text-sm font-medium shrink-0">
          <HelpCircle className="w-4 h-4" /> {t('nav.support')}
        </Link>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white z-[70] overflow-y-auto shadow-2xl"
            >
              <div className="bg-[#0f172a] text-white p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-lg font-bold leading-none mb-1">{t('nav.welcome')}, {isAuthenticated ? user?.firstName : t('nav.guest')}</p>
                  <p className="text-xs text-slate-400 font-medium">Nasirah Mart Premium</p>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="ml-auto p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-8">
                {/* Mobile Location & Language */}
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsLocationOpen(true)}
                    className="flex flex-col items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all"
                  >
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{t('nav.deliver_to')}</span>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-900">{location}</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => setIsLangOpen(true)}
                    className="flex flex-col items-start p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-all"
                  >
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Language</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{currentLanguage.flag}</span>
                      <span className="text-sm font-bold text-slate-900">{currentLanguage.name}</span>
                    </div>
                  </button>
                </div>

                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trending Now</h3>
                  <ul className="space-y-4">
                    <li><Link to="/best-sellers" className="flex items-center gap-3 text-slate-700 font-bold hover:text-emerald-600 transition-colors"><Percent className="w-4 h-4" /> Best Sellers</Link></li>
                    <li><Link to="/new-arrivals" className="flex items-center gap-3 text-slate-700 font-bold hover:text-emerald-600 transition-colors"><Package className="w-4 h-4" /> New Arrivals</Link></li>
                  </ul>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t('nav.all_categories')}</h3>
                  <ul className="space-y-4">
                    {dbCategories.map(cat => (
                      <li key={cat.id}>
                        <Link to={`/category/${cat.slug}`} className="flex items-center justify-between text-slate-700 font-bold hover:text-emerald-600 transition-colors">
                          {cat.name}
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account & Support</h3>
                  <ul className="space-y-4">
                    <li><Link to="/profile" className="flex items-center gap-3 text-slate-700 font-bold hover:text-emerald-600 transition-colors"><User className="w-4 h-4" /> {t('nav.profile')}</Link></li>
                    <li><Link to="/orders" className="flex items-center gap-3 text-slate-700 font-bold hover:text-emerald-600 transition-colors"><Package className="w-4 h-4" /> {t('nav.orders')}</Link></li>
                    <li><Link to="/support" className="flex items-center gap-3 text-slate-700 font-bold hover:text-emerald-600 transition-colors"><HelpCircle className="w-4 h-4" /> {t('nav.support')}</Link></li>
                    {isAuthenticated ? (
                      <li><button onClick={logout} className="flex items-center gap-3 text-rose-500 font-bold"><LogOut className="w-4 h-4" /> {t('nav.sign_out')}</button></li>
                    ) : (
                      <li><Link to="/login" className="flex items-center gap-3 text-emerald-600 font-bold"><User className="w-4 h-4" /> {t('nav.sign_in')}</Link></li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Location Modal */}
      <AnimatePresence>
        {isLocationOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="bg-[#1F2937] p-8 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold">Choose Location</h3>
                </div>
                <button onClick={() => setIsLocationOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <p className="text-sm text-slate-500">Select a delivery location to see product availability and delivery options.</p>
                <div className="space-y-3">
                  {['Bangladesh', 'USA', 'UK', 'Canada', 'Australia'].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => handleLocationSelect(loc)}
                      className={cn(
                        "w-full flex items-center justify-between px-6 py-4 rounded-2xl font-bold transition-all border-2",
                        location === loc 
                          ? "border-emerald-500 bg-emerald-50 text-emerald-700" 
                          : "border-slate-100 hover:border-emerald-200 hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      {loc}
                      {location === loc && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};
