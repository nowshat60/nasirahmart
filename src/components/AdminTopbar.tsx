import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Bell, User, LogOut, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

interface AdminTopbarProps {
  onMenuClick: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ onMenuClick }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 print:hidden">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-600 hover:text-emerald-500 hover:bg-slate-50 rounded-xl transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold text-slate-900 hidden md:block">{t('admin.dashboard_overview')}</h2>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              if (!isNotificationsOpen) markAllAsRead();
            }}
            className="relative p-2 text-slate-600 hover:text-emerald-500 transition-colors bg-slate-50 rounded-xl"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl py-2 overflow-hidden max-h-96 overflow-y-auto border border-slate-100"
              >
                <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-900">{t('admin.notifications')}</h3>
                  <span className="text-xs text-slate-500">{t('admin.total_notifications', { count: notifications.length })}</span>
                </div>
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div key={n.id} className={cn("px-4 py-3 border-b border-slate-50/50 hover:bg-slate-50 transition-colors", !n.read && "bg-emerald-50/30")}>
                      <p className="text-sm font-semibold text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2">{n.created_at ? new Date(n.created_at).toLocaleString() : 'N/A'}</p>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center">
                    <p className="text-sm text-slate-500">{t('admin.no_notifications')}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1 pr-3 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold">
              {user?.firstName?.[0]}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{user?.role}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl py-2 overflow-hidden border border-slate-100"
              >
                <div className="px-4 py-2 border-b border-slate-100 md:hidden">
                  <p className="text-sm font-bold text-slate-900">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 flex items-center gap-2 transition-colors font-bold"
                >
                  <LogOut className="w-4 h-4" /> {t('nav.sign_out')}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
