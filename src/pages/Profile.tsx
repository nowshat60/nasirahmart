import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { User, Mail, MapPin, Phone, Package, Heart, LogOut, Shield, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';

export const Profile: React.FC = () => {
  const { t } = useTranslation();
  const { user, logout, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'info' | 'address' | 'security'>('info');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    showToast(t('nav.logout_success'), 'success');
    navigate('/login');
  };

  const tabs = [
    { id: 'info', label: t('profile.personal_info'), icon: User },
    { id: 'address', label: t('profile.addresses'), icon: MapPin },
    { id: 'security', label: t('profile.security'), icon: Shield },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 text-center">
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4 shadow-lg shadow-emerald-500/20">
              {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{user?.firstName} {user?.lastName}</h2>
            <p className="text-sm text-slate-500 mb-6">{user?.email}</p>
            <div className="flex justify-center gap-4">
              <Link to="/orders" className="p-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all">
                <Package className="w-5 h-5" />
              </Link>
              <Link to="/wishlist" className="p-3 bg-slate-50 rounded-2xl text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all">
                <Heart className="w-5 h-5" />
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold transition-all",
                  activeTab === tab.id 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-6 py-4 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-50 transition-all mt-4 border-t border-slate-50 pt-6"
            >
              <LogOut className="w-5 h-5" />
              {t('nav.sign_out')}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100 min-h-[600px]"
          >
            {activeTab === 'info' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('profile.personal_info')}</h3>
                  <p className="text-slate-500">{t('profile.personal_info_desc')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('auth.first_name')}</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <User className="w-5 h-5 text-emerald-500" />
                      <span className="font-bold text-slate-700">{user?.firstName}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('auth.last_name')}</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <User className="w-5 h-5 text-emerald-500" />
                      <span className="font-bold text-slate-700">{user?.lastName}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('auth.email_label')}</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Mail className="w-5 h-5 text-emerald-500" />
                      <span className="font-bold text-slate-700">{user?.email}</span>
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('profile.phone_number')}</label>
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <Phone className="w-5 h-5 text-emerald-500" />
                      <span className="font-bold text-slate-700">+880 1700 000 000</span>
                    </div>
                  </div>
                </div>

                <button className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg">
                  {t('profile.edit_profile')}
                </button>
              </div>
            )}

            {activeTab === 'address' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('profile.my_addresses')}</h3>
                    <p className="text-slate-500">{t('profile.my_addresses_desc')}</p>
                  </div>
                  <button className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                    {t('profile.add_new')}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-3xl relative group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-500 rounded-lg text-white">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-emerald-700">{t('profile.default_shipping')}</span>
                    </div>
                    <p className="text-slate-700 font-bold mb-1">{t('profile.home')}</p>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      House #12, Road #5, Block C<br />
                      Halishahar, Chattogram 4000<br />
                      Bangladesh
                    </p>
                    <div className="flex gap-4">
                      <button className="text-xs font-bold text-emerald-600 hover:underline">{t('profile.edit')}</button>
                      <button className="text-xs font-bold text-slate-400 hover:text-rose-500">{t('profile.remove')}</button>
                    </div>
                  </div>

                  <div className="p-6 bg-white border-2 border-slate-100 rounded-3xl hover:border-emerald-200 transition-all relative group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-slate-100 rounded-lg text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-slate-400">{t('profile.office')}</span>
                    </div>
                    <p className="text-slate-700 font-bold mb-1">{t('profile.work')}</p>
                    <p className="text-sm text-slate-500 leading-relaxed mb-4">
                      Level 4, Agrabad Commercial Area<br />
                      Chattogram 4100<br />
                      Bangladesh
                    </p>
                    <div className="flex gap-4">
                      <button className="text-xs font-bold text-emerald-600 hover:underline">{t('profile.edit')}</button>
                      <button className="text-xs font-bold text-slate-400 hover:text-rose-500">{t('profile.remove')}</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('profile.security_settings')}</h3>
                  <p className="text-slate-500">{t('profile.security_settings_desc')}</p>
                </div>

                <div className="space-y-6">
                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-500">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{t('profile.change_password')}</p>
                        <p className="text-xs text-slate-500">{t('profile.last_changed', { time: '3 months ago' })}</p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-emerald-50 rounded-xl transition-all text-emerald-600">
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl shadow-sm text-blue-500">
                        <Shield className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{t('profile.two_factor')}</p>
                        <p className="text-xs text-slate-500 text-rose-500 font-bold">{t('profile.not_enabled')}</p>
                      </div>
                    </div>
                    <button className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20">
                      {t('profile.enable')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
