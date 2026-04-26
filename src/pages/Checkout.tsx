import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBag, ArrowRight, CheckCircle, MapPin, Phone, User, 
  CreditCard, ShieldCheck, Truck, Receipt, ArrowLeft, Info,
  Smartphone, Wallet, Building
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import axios from '../axios/AxiosInstance';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation' | 'success';

export const Checkout: React.FC = () => {
  const { t } = useTranslation();
  const { cart, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [shippingDetails, setShippingDetails] = useState({
    fullName: '',
    address: '',
    city: '',
    phone: '',
    zipCode: ''
  });
  const [billingDetails, setBillingDetails] = useState({
    address: '',
    sameAsShipping: true
  });
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'CARD'>('COD');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [showGateway, setShowGateway] = useState(false);
  const [gatewayStep, setGatewayStep] = useState<'number' | 'otp' | 'pin'>('number');
  const [gatewayData, setGatewayData] = useState({ number: '', otp: '', pin: '' });
  const [orderInfo, setOrderInfo] = useState<{ id: string; deliveryDate: string; invoiceUrl?: string } | null>(null);

  const shippingCost = 50;
  const tax = Math.round(cartTotal * 0.05);
  const discount = appliedCoupon 
    ? (appliedCoupon.type === 'percentage' ? (cartTotal * appliedCoupon.discount / 100) : appliedCoupon.discount)
    : 0;
  const grandTotal = cartTotal + shippingCost + tax - discount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
       // Ideally this would be an API call, for now we can mock it or just say invalid
       if (couponCode.toUpperCase() === 'NASIRAH10') {
          setAppliedCoupon({ id: 'nas-10', code: 'NASIRAH10', discount: 10, type: 'percentage', status: 'Active' });
          showToast(t('checkout.applied'), 'success');
       } else {
          showToast('Invalid or expired coupon', 'error');
       }
    } catch (error: any) {
      console.error('Error applying coupon:', error);
      showToast('Error applying coupon', 'error');
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      showToast('Please login to proceed with checkout', 'error');
      navigate('/login');
    }
    if (cart.length === 0 && step !== 'success') {
      navigate('/cart');
    }
  }, [isAuthenticated, cart, navigate, showToast, step, t]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const validateShipping = () => {
    if (!shippingDetails.fullName || !shippingDetails.address || !shippingDetails.city || !shippingDetails.phone || !shippingDetails.zipCode) {
      showToast('Please fill all shipping details', 'error');
      return false;
    }
    return true;
  };

  const handlePlaceOrder = async (transactionId?: string) => {
    setLoading(true);
    try {
      const orderData = {
        userId: user?.id || 'guest',
        email: user?.email || 'guest@example.com',
        customerName: shippingDetails.fullName || (user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Guest'),
        items: cart,
        shippingDetails,
        billingDetails: billingDetails.sameAsShipping ? shippingDetails : billingDetails,
        paymentMethod,
        transactionId: transactionId || null,
        subtotal: cartTotal,
        tax,
        shipping: shippingCost,
        discount,
        totalAmount: grandTotal,
        couponCode: appliedCoupon?.code || null,
        status: 'Pending',
        paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Paid'
      };

      const response = await axios.post('/api/orders', orderData);

      if (response.data.success) {
        setOrderInfo({
          id: response.data.orderId,
          deliveryDate: '3-5 Business Days'
        });
        clearCart();
        setStep('success');
        setShowGateway(false);
        showToast(t('checkout.order_placed'), 'success');
      } else {
        throw new Error(response.data.message || 'Failed to place order');
      }
    } catch (error: any) {
      console.error('Order placement error:', error);
      showToast(error.response?.data?.message || 'Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGatewaySubmit = () => {
    if (gatewayStep === 'number') {
      if (!gatewayData.number) return showToast('Please enter wallet number', 'error');
      setGatewayStep('otp');
    } else if (gatewayStep === 'otp') {
      if (!gatewayData.otp) return showToast('Please enter OTP', 'error');
      setGatewayStep('pin');
    } else {
      if (!gatewayData.pin) return showToast('Please enter PIN', 'error');
      // 2. Callback Processing / 3. Handshake
      const mockTransactionId = 'TRX' + Math.random().toString(36).substr(2, 9).toUpperCase();
      handlePlaceOrder(mockTransactionId);
    }
  };

  const renderGatewayModal = () => (
    <AnimatePresence>
      {showGateway && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className={cn(
              "p-8 text-white flex flex-col items-center gap-4",
              paymentMethod === 'BKASH' ? "bg-[#D12053]" : "bg-blue-600"
            )}>
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                {paymentMethod === 'BKASH' ? <Smartphone className="w-8 h-8" /> : <CreditCard className="w-8 h-8" />}
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-bold">{paymentMethod === 'BKASH' ? 'bKash Payment' : 'Card Payment'}</h3>
                <p className="text-white/80 text-sm">Amount: TK {grandTotal}</p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {gatewayStep === 'number' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <p className="text-slate-600 text-center text-sm">Enter your {paymentMethod === 'BKASH' ? 'bKash wallet number' : 'card number'}</p>
                  <input
                    type="text"
                    value={gatewayData.number}
                    onChange={(e) => setGatewayData({ ...gatewayData, number: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-center text-xl font-bold focus:border-emerald-500 transition-all outline-none"
                    placeholder={paymentMethod === 'BKASH' ? "01XXXXXXXXX" : "XXXX XXXX XXXX XXXX"}
                  />
                </motion.div>
              )}

              {gatewayStep === 'otp' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <p className="text-slate-600 text-center text-sm">Enter the 6-digit OTP sent to your phone</p>
                  <input
                    type="text"
                    value={gatewayData.otp}
                    onChange={(e) => setGatewayData({ ...gatewayData, otp: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-center text-2xl font-bold tracking-[0.5em] focus:border-emerald-500 transition-all outline-none"
                    placeholder="000000"
                    maxLength={6}
                  />
                </motion.div>
              )}

              {gatewayStep === 'pin' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <p className="text-slate-600 text-center text-sm">Enter your {paymentMethod === 'BKASH' ? 'bKash PIN' : '3D Secure PIN'}</p>
                  <input
                    type="password"
                    value={gatewayData.pin}
                    onChange={(e) => setGatewayData({ ...gatewayData, pin: e.target.value })}
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-center text-2xl font-bold tracking-[0.5em] focus:border-emerald-500 transition-all outline-none"
                    placeholder="****"
                    maxLength={5}
                  />
                </motion.div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setShowGateway(false)}
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGatewaySubmit}
                  disabled={loading}
                  className={cn(
                    "flex-[2] py-4 rounded-2xl font-bold text-white shadow-lg transition-all",
                    paymentMethod === 'BKASH' ? "bg-[#D12053] hover:bg-[#B01A45]" : "bg-blue-600 hover:bg-blue-700"
                  )}
                >
                  {loading ? "Verifying..." : "Confirm"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-12">
      {[
        { id: 'shipping', label: t('checkout.shipping'), icon: MapPin },
        { id: 'payment', label: t('checkout.payment'), icon: CreditCard },
        { id: 'confirmation', label: t('checkout.confirm'), icon: ShieldCheck },
      ].map((s, i, arr) => (
        <React.Fragment key={s.id}>
          <div className="flex flex-col items-center relative">
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg",
              step === s.id ? "bg-emerald-500 text-white scale-110 shadow-emerald-500/30" : 
              (arr.findIndex(x => x.id === step) > i ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400")
            )}>
              <s.icon className="w-6 h-6" />
            </div>
            <span className={cn(
              "absolute -bottom-7 text-xs font-bold whitespace-nowrap",
              step === s.id ? "text-emerald-600" : "text-slate-400"
            )}>{s.label}</span>
          </div>
          {i < arr.length - 1 && (
            <div className={cn(
              "w-20 h-1 mx-4 rounded-full",
              arr.findIndex(x => x.id === step) > i ? "bg-emerald-500" : "bg-slate-100"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (step === 'success' && orderInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass p-12 rounded-[3rem] shadow-2xl text-center max-w-2xl w-full border-white/50"
        >
          <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8 shadow-xl shadow-emerald-500/30">
            <CheckCircle className="w-12 h-12" />
          </div>
          
          <h2 className="text-4xl font-bold text-slate-900 mb-2">{t('checkout.thank_you')}</h2>
          <p className="text-xl text-emerald-600 font-bold mb-8">{t('checkout.order_placed')}</p>
          
          <div className="bg-slate-50/50 rounded-3xl p-8 mb-8 text-left border border-slate-100">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">{t('checkout.order_id')}</p>
                <p className="text-lg font-bold text-slate-900">{orderInfo.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">{t('checkout.delivery_date')}</p>
                <p className="text-lg font-bold text-emerald-600">{orderInfo.deliveryDate}</p>
              </div>
            </div>
            
            <div className="border-t border-slate-200 pt-6">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-4">{t('checkout.order_summary')}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Total Items</span>
                  <span className="font-bold text-slate-900">{cart.length}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900">
                  <span>Amount Paid</span>
                  <span className="text-emerald-600">{t('product.price')} {grandTotal}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            {orderInfo.invoiceUrl && (
              <a
                href={orderInfo.invoiceUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-emerald-100 text-emerald-700 py-4 rounded-2xl font-bold hover:bg-emerald-200 transition-all text-center"
              >
                {t('checkout.download_invoice')}
              </a>
            )}
            <button
              onClick={() => navigate('/admin')} // 12. Dashboard Redirection
              className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg"
            >
              {t('checkout.go_to_dashboard')}
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-bold hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/30"
            >
              {t('checkout.continue_shopping')}
            </button>
          </div>
          
          <p className="mt-8 text-slate-400 text-sm flex items-center justify-center gap-2">
            <Info className="w-4 h-4" /> 11. Invoice has been sent to your email.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
      {renderStepIndicator()}
      {renderGatewayModal()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {step === 'shipping' && (
              <motion.div
                key="shipping"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="glass p-8 rounded-[2.5rem] shadow-xl border-white/50">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <MapPin className="w-6 h-6 text-emerald-500" /> {t('checkout.shipping_billing_data')}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingDetails.fullName}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('checkout.shipping_address')}</label>
                      <input
                        type="text"
                        name="address"
                        value={shippingDetails.address}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="House #, Road #, Area"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('checkout.city')}</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingDetails.city}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="Chattogram"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('checkout.phone')}</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingDetails.phone}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="017XXXXXXXX"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{t('checkout.zip_code')}</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={shippingDetails.zipCode}
                        onChange={handleInputChange}
                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-4 focus:ring-2 focus:ring-emerald-500 transition-all"
                        placeholder="4000"
                        required
                      />
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                        billingDetails.sameAsShipping ? "bg-emerald-500 border-emerald-500" : "border-slate-300 group-hover:border-emerald-500"
                      )} onClick={() => setBillingDetails(prev => ({ ...prev, sameAsShipping: !prev.sameAsShipping }))}>
                        {billingDetails.sameAsShipping && <CheckCircle className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{t('checkout.billing_same_as_shipping')}</span>
                    </label>
                  </div>
                </div>

                <button
                  onClick={() => validateShipping() && setStep('payment')}
                  className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] font-bold text-xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3"
                >
                  {t('checkout.continue_to_payment')} <ArrowRight className="w-6 h-6" />
                </button>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                key="payment"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="glass p-8 rounded-[2.5rem] shadow-xl border-white/50">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-emerald-500" /> {t('checkout.payment_gateway')}
                  </h2>

                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { id: 'COD', label: t('checkout.cod'), icon: Truck, desc: 'Pay when you receive' },
                      { id: 'BKASH', label: t('checkout.bkash'), icon: Smartphone, desc: 'Instant mobile payment' },
                      { id: 'CARD', label: t('checkout.card'), icon: Building, desc: 'Visa, Mastercard, Amex' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={cn(
                          "p-6 rounded-3xl border-2 flex items-center justify-between transition-all text-left",
                          paymentMethod === m.id ? "bg-emerald-50 border-emerald-500" : "bg-white border-slate-100 hover:border-emerald-200"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center",
                            paymentMethod === m.id ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-500"
                          )}>
                            <m.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{m.label}</p>
                            <p className="text-xs text-slate-500">{m.desc}</p>
                          </div>
                        </div>
                        {paymentMethod === m.id && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                      </button>
                    ))}
                  </div>

                  {/* 16. Payment Instruction */}
                  {paymentMethod === 'BKASH' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6 p-6 bg-rose-50 rounded-3xl border border-rose-100"
                    >
                      <p className="text-sm font-bold text-rose-900 mb-2">{t('checkout.payment_instructions')}:</p>
                      <ol className="text-xs text-rose-800 space-y-1 list-decimal ml-4">
                        <li>Go to your bKash/Nagad App or dial *247#</li>
                        <li>Choose "Send Money" to 01700000000</li>
                        <li>Enter Amount: {t('product.price')} {grandTotal}</li>
                        <li>Enter Reference: NASIRAH-{Date.now().toString().slice(-4)}</li>
                        <li>Complete transaction and keep the Transaction ID</li>
                      </ol>
                    </motion.div>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('shipping')}
                    className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[2rem] font-bold text-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                  >
                    <ArrowLeft className="w-6 h-6" /> Back
                  </button>
                  <button
                    onClick={() => setStep('confirmation')}
                    className="flex-[2] bg-emerald-500 text-white py-5 rounded-[2rem] font-bold text-xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3"
                  >
                    {t('checkout.review_order')} <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'confirmation' && (
              <motion.div
                key="confirmation"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="glass p-8 rounded-[2.5rem] shadow-xl border-white/50">
                  <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-emerald-500" /> {t('checkout.confirmation_prompt')}
                  </h2>

                  <div className="space-y-6">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-slate-500 uppercase">Shipping To</p>
                        <button onClick={() => setStep('shipping')} className="text-xs font-bold text-emerald-600">Edit</button>
                      </div>
                      <p className="font-bold text-slate-900">{shippingDetails.address}</p>
                      <p className="text-sm text-slate-600">{shippingDetails.city}, {shippingDetails.zipCode}</p>
                      <p className="text-sm text-slate-600">Phone: {shippingDetails.phone}</p>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm font-bold text-slate-500 uppercase">Payment Method</p>
                        <button onClick={() => setStep('payment')} className="text-xs font-bold text-emerald-600">Edit</button>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                          {paymentMethod === 'COD' ? <Truck className="w-5 h-5" /> : <Smartphone className="w-5 h-5" />}
                        </div>
                        <p className="font-bold text-slate-900">
                          {paymentMethod === 'COD' ? t('checkout.cod') : paymentMethod === 'BKASH' ? t('checkout.bkash') : t('checkout.card')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep('payment')}
                    className="flex-1 bg-slate-100 text-slate-600 py-5 rounded-[2rem] font-bold text-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
                  >
                    <ArrowLeft className="w-6 h-6" /> Back
                  </button>
                  <button
                    onClick={() => {
                      if (paymentMethod === 'COD') {
                        handlePlaceOrder();
                      } else {
                        setGatewayStep('number');
                        setShowGateway(true);
                      }
                    }}
                    disabled={loading}
                    className="flex-[2] bg-emerald-500 text-white py-5 rounded-[2rem] font-bold text-xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {loading ? t('checkout.processing') : t('checkout.place_order')}
                    {!loading && <CheckCircle className="w-6 h-6" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="lg:col-span-1">
          <div className="glass p-8 rounded-[2.5rem] sticky top-32 shadow-xl border-white/50">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
              <Receipt className="w-6 h-6 text-emerald-500" /> {t('checkout.order_summary')}
            </h2>

            {/* Coupon Section */}
            <div className="mb-8 p-4 bg-slate-50 rounded-3xl border border-slate-100">
              <p className="text-xs font-bold text-slate-500 uppercase mb-3">{t('checkout.coupon_code')}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 bg-white border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500"
                  disabled={!!appliedCoupon}
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={!!appliedCoupon || !couponCode}
                  className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {appliedCoupon ? t('checkout.applied') : t('checkout.apply')}
                </button>
              </div>
              {appliedCoupon && (
                <p className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {appliedCoupon.code} applied (-{t('product.price')} {discount})
                </p>
              )}
            </div>
            
            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden border border-slate-100">
                      <img src={item.image || undefined} alt={item.item_name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold truncate max-w-[120px]">{item.item_name}</p>
                      <p className="text-xs text-slate-500">{item.quantity} x {t('product.price')} {item.price}</p>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">{t('product.price')} {item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-slate-600 text-sm">
                <span>{t('checkout.subtotal')}</span>
                <span className="font-bold">{t('product.price')} {cartTotal}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-sm">
                <span>{t('checkout.shipping_fee')}</span>
                <span className="text-emerald-500 font-bold">{t('product.price')} {shippingCost}</span>
              </div>
              <div className="flex justify-between text-slate-600 text-sm">
                <span>{t('checkout.tax')} (5%)</span>
                <span className="font-bold">{t('product.price')} {tax}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-500 text-sm">
                  <span>{t('checkout.discount')}</span>
                  <span className="font-bold">-{t('product.price')} {discount}</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-6 flex justify-between text-2xl font-bold text-slate-900">
                <span>{t('checkout.total')}</span>
                <span className="text-emerald-600">{t('product.price')} {grandTotal}</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-500 mt-0.5" />
              <p className="text-[10px] text-blue-700 leading-relaxed">
                {t('checkout.secure_payment')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
