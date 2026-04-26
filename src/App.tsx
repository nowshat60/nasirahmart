/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ToastProvider } from './context/ToastContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Helpline } from './components/Helpline';
import { LiveChat } from './components/LiveChat';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { SignUp } from './pages/SignUp';
import { Cart } from './pages/Cart';
import { Wishlist } from './pages/Wishlist';
import { Checkout } from './pages/Checkout';
import { DashboardHome } from './dashboard/DashboardHome';
import { Products } from './dashboard/Products';
import { Categories } from './dashboard/Categories';
import { OrderManagement } from './orders/OrderManagement';
import { AccountingDashboard } from './finance/AccountingDashboard';
import { ChartOfAccounts } from './finance/ChartOfAccounts';
import { CustomerManagement } from './customer/CustomerManagement';
import { InventoryManagement } from './inventory/InventoryManagement';
import { FinancialStatements } from './finance/FinancialStatements';
import { ExpenseManagement } from './finance/ExpenseManagement';
import { JournalEntries } from './finance/JournalEntries';
import { CouponManagement } from './dashboard/CouponManagement';
import { Reports } from './dashboard/Reports';
import { Settings } from './dashboard/Settings';
import { UserManagement } from './dashboard/UserManagement';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminTopbar } from './components/AdminTopbar';
import { ProductDetails } from './pages/ProductDetails';
import { CategoryPage } from './pages/CategoryPage';
import { OrderHistory } from './pages/OrderHistory';
import { Profile } from './pages/Profile';
import { ProductListingPage } from './pages/ProductListingPage';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { Deals } from './pages/Deals';
import { GiftCards } from './pages/GiftCards';
import { Sell } from './pages/Sell';
import { Services } from './pages/Services';
import { Support } from './pages/Support';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/login');
      } else if (requireAdmin) {
        const isAdmin = user.role === 'admin' || user.role === 'staff' || user.email === 'jahannowrin60@gmail.com' || user.email === 'admin@gmail.com';
        if (!isAdmin) {
          navigate('/');
        }
      }
    }
  }, [user, loading, navigate, requireAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user || (requireAdmin && !(user.role === 'admin' || user.role === 'staff' || user.email === 'jahannowrin60@gmail.com' || user.email === 'admin@gmail.com'))) {
    return null;
  }

  return <>{children}</>;
};

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <ProtectedRoute requireAdmin>
      <div className="flex min-h-screen bg-slate-50/50">
        <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <div className="flex-1 lg:ml-72 flex flex-col min-w-0">
          <AdminTopbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="p-4 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  const { t } = React.useContext(React.createContext({ t: (s: string) => s })); // This is a placeholder, I should use useTranslation
  // Actually, I should use useTranslation inside the component
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <Navbar />
      <LiveChat />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="bg-slate-900 py-12 px-4 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              N
            </div>
            <span className="text-xl font-bold text-white">
              Nasirah <span className="text-emerald-500">Mart</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            {t('footer.about')}
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">{t('footer.shop')}</h4>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li><Link to="/new-arrivals" className="hover:text-emerald-500 transition-colors">{t('footer.new_arrivals')}</Link></li>
            <li><Link to="/best-sellers" className="hover:text-emerald-500 transition-colors">{t('footer.best_sellers')}</Link></li>
            <li><Link to="/deals" className="hover:text-emerald-500 transition-colors">{t('footer.winter_collection')}</Link></li>
            <li><Link to="/category/accessories" className="hover:text-emerald-500 transition-colors">{t('footer.accessories')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">{t('footer.support')}</h4>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li><Link to="/orders" className="hover:text-emerald-500 transition-colors">{t('footer.order_status')}</Link></li>
            <li><Link to="/support" className="hover:text-emerald-500 transition-colors">{t('footer.shipping_returns')}</Link></li>
            <li><Link to="/support" className="hover:text-emerald-500 transition-colors">{t('footer.privacy_policy')}</Link></li>
            <li><Link to="/support" className="hover:text-emerald-500 transition-colors">{t('footer.terms_of_service')}</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold mb-6">{t('footer.contact')}</h4>
          <ul className="space-y-4 text-slate-400 text-sm">
            <li>support@nasirahmart.com</li>
            <li>+880 1234 567 890</li>
            <li>Chattogram, Bangladesh</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-12 pt-8 text-center">
        <p className="text-slate-500 text-xs">
          {t('footer.rights', { year: 2026 })}
        </p>
      </div>
    </footer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <CartProvider>
            <WishlistProvider>
              <Router>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
                  <Route path="/shop" element={<PublicLayout><Home /></PublicLayout>} />
                  <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
                  <Route path="/signup" element={<PublicLayout><SignUp /></PublicLayout>} />
                  <Route path="/cart" element={<PublicLayout><Cart /></PublicLayout>} />
                  <Route path="/wishlist" element={<PublicLayout><Wishlist /></PublicLayout>} />
                  <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
                  <Route path="/product/:id" element={<PublicLayout><ProductDetails /></PublicLayout>} />
                  <Route path="/category/:categoryName" element={<PublicLayout><CategoryPage /></PublicLayout>} />
                  <Route path="/orders" element={<PublicLayout><OrderHistory /></PublicLayout>} />
                  <Route path="/profile" element={<PublicLayout><Profile /></PublicLayout>} />
                  <Route path="/best-sellers" element={<PublicLayout><ProductListingPage title="Best Sellers" subtitle="Our most popular products curated just for you." filterType="best-sellers" /></PublicLayout>} />
                  <Route path="/new-arrivals" element={<PublicLayout><ProductListingPage title="New Arrivals" subtitle="Check out the latest additions to our collection." filterType="new-arrivals" /></PublicLayout>} />
                  <Route path="/deals" element={<PublicLayout><Deals /></PublicLayout>} />
                  <Route path="/gift-cards" element={<PublicLayout><GiftCards /></PublicLayout>} />
                  <Route path="/sell" element={<PublicLayout><Sell /></PublicLayout>} />
                  <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
                  <Route path="/support" element={<PublicLayout><Support /></PublicLayout>} />
                  
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout><DashboardHome /></AdminLayout>} />
                  <Route path="/admin/products" element={<AdminLayout><Products /></AdminLayout>} />
                  <Route path="/admin/categories" element={<AdminLayout><Categories /></AdminLayout>} />
                  <Route path="/admin/orders" element={<AdminLayout><OrderManagement /></AdminLayout>} />
                  <Route path="/admin/customers" element={<AdminLayout><CustomerManagement /></AdminLayout>} />
                  <Route path="/admin/inventory" element={<AdminLayout><InventoryManagement /></AdminLayout>} />
                  <Route path="/admin/finance" element={<AdminLayout><AccountingDashboard /></AdminLayout>} />
                  <Route path="/admin/finance/coa" element={<AdminLayout><ChartOfAccounts /></AdminLayout>} />
                  <Route path="/admin/finance/statements" element={<AdminLayout><FinancialStatements /></AdminLayout>} />
                  <Route path="/admin/finance/expenses" element={<AdminLayout><ExpenseManagement /></AdminLayout>} />
                  <Route path="/admin/finance/journal" element={<AdminLayout><JournalEntries /></AdminLayout>} />
                  <Route path="/admin/coupons" element={<AdminLayout><CouponManagement /></AdminLayout>} />
                  <Route path="/admin/reports" element={<AdminLayout><Reports /></AdminLayout>} />
                  <Route path="/admin/users" element={<AdminLayout><UserManagement /></AdminLayout>} />
                  <Route path="/admin/settings" element={<AdminLayout><Settings /></AdminLayout>} />
                </Routes>
              </Router>
            </WishlistProvider>
          </CartProvider>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
