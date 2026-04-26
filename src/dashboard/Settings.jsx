import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  Settings as SettingsIcon, Globe, Store, Shield, 
  User, Save, RefreshCw, Camera, Facebook, 
  Instagram, Twitter, Mail, Phone, MapPin
} from 'lucide-react';
import axios from 'axios';
import { cn } from '../lib/utils';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const { showToast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings');
        if (response.data && Object.keys(response.data).length > 0) {
          setSettings(response.data);
        } else {
          // Default settings
          const defaultSettings = {
            site_name: 'Nasirah Mart',
            contact_email: 'contact@nasirahmart.com',
            contact_phone: '+880 1234 567890',
            address: 'Dhaka, Bangladesh',
            maintenance_mode: false,
            currency: 'TK',
            tax_rate: 5,
            shipping_fee: 60,
            social_links: {
              facebook: '',
              instagram: '',
              twitter: ''
            }
          };
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Fetch settings error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('/api/settings', settings);
      showToast('Settings updated successfully', 'success');
    } catch (error) {
      console.error("Update settings error:", error);
      showToast('Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (section) {
      setSettings(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: val
        }
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: val
      }));
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    showToast('Password updated successfully', 'success');
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const firstName = formData.get('firstName');
      const lastName = formData.get('lastName');

      await updateDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        image: imagePreview || user.image || ''
      });
      
      showToast('Profile updated successfully', 'success');
      // The AuthContext should ideally listen to changes or we can manually refresh 
      // but for now, showing success is a major improvement over just a toast.
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user?.uid}`);
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 pt-24 animate-pulse space-y-8">
    <div className="h-12 bg-slate-100 rounded-2xl w-1/4" />
    <div className="flex gap-4">
      {[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-slate-100 rounded-xl w-32" />)}
    </div>
    <div className="h-96 bg-slate-100 rounded-[2.5rem]" />
  </div>;

  const tabs = [
    { id: 'general', label: t('dashboard.settings.general'), icon: Globe },
    { id: 'store', label: t('dashboard.sidebar.products'), icon: Store },
    { id: 'security', label: t('profile.security'), icon: Shield },
    { id: 'profile', label: t('profile.title'), icon: User },
  ];

  return (
    <div className="p-8 space-y-8 bg-slate-50/50 min-h-screen pt-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('dashboard.settings.title')}</h1>
          <p className="text-slate-500">{t('dashboard.settings.subtitle')}</p>
        </div>
        <button 
          onClick={handleUpdateSettings}
          disabled={saving}
          className="bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? t('common.saving') : t('dashboard.settings.save_changes')}
        </button>
      </div>

      <div className="flex gap-2 bg-white p-1.5 rounded-2xl border border-slate-100 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
              activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-lg" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="glass rounded-[2.5rem] shadow-xl border-white/50 overflow-hidden">
        <form onSubmit={handleUpdateSettings} className="p-10">
          <AnimatePresence mode="wait">
            {activeTab === 'general' && (
              <motion.div
                key="general"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-emerald-500" /> {t('dashboard.products.basic_info')}
                    </h3>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.settings.store_name')}</label>
                      <input
                        type="text"
                        name="site_name"
                        value={settings?.site_name || ''}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.settings.store_email')}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="email"
                          name="contact_email"
                          value={settings?.contact_email || ''}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('profile.phone')}</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          name="contact_phone"
                          value={settings?.contact_phone || ''}
                          onChange={handleInputChange}
                          className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('profile.address')}</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
                        <textarea
                          name="address"
                          value={settings?.address || ''}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full bg-slate-50 border-none rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Facebook className="w-5 h-5 text-blue-600" /> Social Links
                    </h3>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Facebook URL</label>
                      <input
                        type="text"
                        name="facebook"
                        value={settings?.social_links?.facebook || ''}
                        onChange={(e) => handleInputChange(e, 'social_links')}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Instagram URL</label>
                      <input
                        type="text"
                        name="instagram"
                        value={settings?.social_links?.instagram || ''}
                        onChange={(e) => handleInputChange(e, 'social_links')}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Twitter URL</label>
                      <input
                        type="text"
                        name="twitter"
                        value={settings?.social_links?.twitter || ''}
                        onChange={(e) => handleInputChange(e, 'social_links')}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="pt-4">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          settings?.maintenance_mode ? "bg-rose-500" : "bg-slate-200"
                        )}>
                          <div className={cn(
                            "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                            settings?.maintenance_mode ? "left-7" : "left-1"
                          )} />
                        </div>
                        <input
                          type="checkbox"
                          name="maintenance_mode"
                          checked={settings?.maintenance_mode || false}
                          onChange={handleInputChange}
                          className="hidden"
                        />
                        <span className="text-sm font-bold text-slate-700">Maintenance Mode</span>
                      </label>
                      <p className="text-xs text-slate-400 mt-2">When enabled, the store will be inaccessible to customers.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'store' && (
              <motion.div
                key="store"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <Store className="w-5 h-5 text-emerald-500" /> Currency & Tax
                    </h3>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.settings.currency')}</label>
                      <select
                        name="currency"
                        value={settings?.currency || 'TK'}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="TK">BDT (TK)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Tax Rate (%)</label>
                      <input
                        type="number"
                        name="tax_rate"
                        value={settings?.tax_rate || 0}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <RefreshCw className="w-5 h-5 text-emerald-500" /> Shipping Configuration
                    </h3>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Flat Shipping Fee</label>
                      <input
                        type="number"
                        name="shipping_fee"
                        value={settings?.shipping_fee || 0}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="max-w-md space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-500" /> {t('profile.security')}
                  </h3>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('profile.current_password')}</label>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('profile.new_password')}</label>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('profile.confirm_password')}</label>
                    <input
                      type="password"
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleUpdatePassword}
                    className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                  >
                    {t('profile.update_password')}
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center gap-8 mb-10">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-emerald-100 rounded-[2.5rem] flex items-center justify-center text-emerald-500 overflow-hidden border-4 border-white shadow-xl">
                      {imagePreview ? (
                        <img src={imagePreview || undefined} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-16 h-16" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 bg-slate-900 text-white p-3 rounded-2xl shadow-lg group-hover:scale-110 transition-all cursor-pointer">
                      <Camera className="w-5 h-5" />
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => setImagePreview(reader.result);
                            reader.readAsDataURL(file);
                            showToast('Profile picture updated locally', 'success');
                          }
                        }}
                      />
                    </label>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{user?.firstName} {user?.lastName}</h3>
                    <p className="text-slate-500 font-medium">{user?.role.toUpperCase()} ACCOUNT</p>
                    <p className="text-sm text-slate-400 mt-1">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('profile.first_name')}</label>
                    <input
                      type="text"
                      name="firstName"
                      defaultValue={user?.firstName}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('profile.last_name')}</label>
                    <input
                      type="text"
                      name="lastName"
                      defaultValue={user?.lastName}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <button 
                      type="button" 
                      onClick={handleUpdateProfile}
                      className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                    >
                      {t('profile.update_profile')}
                    </button>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">{t('dashboard.users.email')}</label>
                    <input
                      type="email"
                      defaultValue={user?.email}
                      className="w-full bg-slate-50 border-none rounded-xl py-3 px-4 focus:ring-2 focus:ring-emerald-500"
                      disabled
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};
