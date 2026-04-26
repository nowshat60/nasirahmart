import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, ShoppingCart, Package, 
  Users, DollarSign, Settings, LogOut,
  ChevronRight, BookOpen, Receipt, FileText, Tag, BarChart3, ShieldCheck, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { label: t('admin.dashboard'), icon: LayoutDashboard, path: '/admin' },
    { label: t('admin.view_store'), icon: ShoppingCart, path: '/' },
    { label: t('admin.reports'), icon: BarChart3, path: '/admin/reports' },
    { label: t('nav.orders'), icon: ShoppingCart, path: '/admin/orders' },
    { label: t('admin.categories'), icon: Tag, path: '/admin/categories' },
    { label: t('admin.products'), icon: Package, path: '/admin/products' },
    { label: t('admin.inventory'), icon: BarChart3, path: '/admin/inventory' },
    { label: t('admin.coupons'), icon: Tag, path: '/admin/coupons' },
    { label: t('admin.customers'), icon: Users, path: '/admin/customers' },
    { label: t('admin.staff_management'), icon: ShieldCheck, path: '/admin/users' },
    { label: t('admin.accounting'), icon: DollarSign, path: '/admin/finance', subItems: [
      { label: t('admin.dashboard'), icon: LayoutDashboard, path: '/admin/finance' },
      { label: t('admin.chart_of_accounts'), icon: BookOpen, path: '/admin/finance/coa' },
      { label: t('admin.financial_statements'), icon: FileText, path: '/admin/finance/statements' },
      { label: t('admin.expense_management'), icon: Receipt, path: '/admin/finance/expenses' },
      { label: t('admin.journal_entries'), icon: Receipt, path: '/admin/finance/journal' },
    ]},
    { label: t('admin.settings'), icon: Settings, path: '/admin/settings' },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={cn(
        "w-72 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 z-[70] flex flex-col p-6 transition-transform duration-300 lg:translate-x-0 print:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between mb-12 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center overflow-hidden">
              <img 
                src="https://i.ibb.co/v66m9hC/nasirahmart-logo.png" 
                alt="Nasirah Mart Logo" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-lg font-black text-slate-900 tracking-tight">Nasirah Mart <span className="text-emerald-500">ERP</span></span>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-50 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

      <div className="flex-1 space-y-2 overflow-y-auto no-scrollbar">
        {menuItems.map((item, i) => {
          const isActive = location.pathname === item.path || (item.subItems && item.subItems.some(s => location.pathname === s.path));
          return (
            <div key={i} className="space-y-1">
              <Link
                to={item.path}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-2xl transition-all group",
                  isActive ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900")} />
                  <span className="font-bold text-sm">{item.label}</span>
                </div>
                {item.subItems && <ChevronRight className={cn("w-4 h-4 transition-transform", isActive ? "rotate-90" : "")} />}
              </Link>
              
              {isActive && item.subItems && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pl-10 space-y-1"
                >
                  {item.subItems.map((sub, j) => (
                    <Link
                      key={j}
                      to={sub.path}
                      className={cn(
                        "block px-4 py-2 text-xs font-bold rounded-xl transition-all",
                        location.pathname === sub.path ? "text-emerald-600 bg-emerald-50" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 font-bold hover:bg-rose-50 rounded-2xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm">{t('nav.sign_out')}</span>
        </button>
      </div>
    </div>
  </>
);
};
