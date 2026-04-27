import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from 'react-i18next';
import {
  ShoppingBag,
  ArrowRight,
  CheckCircle,
  MapPin,
  Phone,
  User,
  CreditCard,
  ShieldCheck,
  Truck,
  Receipt,
  ArrowLeft,
  Info,
  Smartphone,
  Wallet,
  Building
} from 'lucide-react';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import axios from '../axios/AxiosInstance';

type CheckoutStep =
  | 'shipping'
  | 'payment'
  | 'confirmation'
  | 'success';

export const Checkout: React.FC = () => {
  const { t } = useTranslation();

  const { cart, cartTotal, clearCart } = useCart();

  const { user, isAuthenticated } = useAuth();

  const { showToast } = useToast();

  const navigate = useNavigate();

  const [step, setStep] =
    useState<CheckoutStep>('shipping');

  const [shippingDetails, setShippingDetails] =
    useState({
      fullName: '',
      address: '',
      city: '',
      phone: '',
      zipCode: ''
    });

  const [billingDetails, setBillingDetails] =
    useState({
      address: '',
      sameAsShipping: true
    });

  const [paymentMethod, setPaymentMethod] =
    useState<'COD' | 'BKASH' | 'CARD'>('COD');

  const [loading, setLoading] = useState(false);

  const [couponCode, setCouponCode] =
    useState('');

  const [appliedCoupon, setAppliedCoupon] =
    useState<any>(null);

  const [showGateway, setShowGateway] =
    useState(false);

  const [gatewayStep, setGatewayStep] =
    useState<'number' | 'otp' | 'pin'>(
      'number'
    );

  const [gatewayData, setGatewayData] =
    useState({
      number: '',
      otp: '',
      pin: ''
    });

  const [orderInfo, setOrderInfo] =
    useState<{
      id: string;
      deliveryDate: string;
      invoiceUrl?: string;
    } | null>(null);

  const shippingCost = 50;

  const tax = Math.round(cartTotal * 0.05);

  const discount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? (cartTotal * appliedCoupon.discount) /
        100
      : appliedCoupon.discount
    : 0;

  const grandTotal =
    cartTotal +
    shippingCost +
    tax -
    discount;

  useEffect(() => {
    if (!isAuthenticated) {
      showToast(
        'Please login to proceed with checkout',
        'error'
      );
      navigate('/login');
    }

    if (
      cart.length === 0 &&
      step !== 'success'
    ) {
      navigate('/cart');
    }
  }, [
    isAuthenticated,
    cart,
    navigate,
    showToast,
    step
  ]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setShippingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateShipping = () => {
    if (
      !shippingDetails.fullName ||
      !shippingDetails.address ||
      !shippingDetails.city ||
      !shippingDetails.phone ||
      !shippingDetails.zipCode
    ) {
      showToast(
        'Please fill all shipping details',
        'error'
      );
      return false;
    }

    return true;
  };

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;

    if (
      couponCode.toUpperCase() ===
      'NASIRAH10'
    ) {
      setAppliedCoupon({
        id: 'nas-10',
        code: 'NASIRAH10',
        discount: 10,
        type: 'percentage',
        status: 'Active'
      });

      showToast(
        'Coupon Applied Successfully',
        'success'
      );
    } else {
      showToast(
        'Invalid or expired coupon',
        'error'
      );
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      const orderData = {
  customer_id: user?.id,
  customer_name: shippingDetails.fullName,
  cart_items: cart,
  subtotal: cartTotal,
  tax: tax,
  total_amount: grandTotal,
  payment_method: paymentMethod
};

      const response =
        await axios.post(
          'orders/place_order.php',
          orderData
        );

      if (
        response.data.status ===
        'success'
      ) {
        setOrderInfo({
          id:
            response.data.order_id ||
            'N/A',

          deliveryDate:
            '3-5 Business Days'
        });

        clearCart();

        setStep('success');

        setShowGateway(false);

        showToast(
          'Order placed successfully!',
          'success'
        );
      } else {
        throw new Error(
          response.data.message ||
            'Failed to place order'
        );
      }
    } catch (error: any) {
  console.log('FULL ERROR:', error);
  console.log('RESPONSE:', error.response);
  console.log('DATA:', error.response?.data);

  showToast(
    error.response?.data?.message ||
    JSON.stringify(error.response?.data) ||
    'Server connection failed',
    'error'
  );
} finally {
      setLoading(false);
    }
  };
    const handleGatewaySubmit = () => {
    if (gatewayStep === 'number') {
      if (!gatewayData.number) {
        showToast(
          'Please enter wallet/card number',
          'error'
        );
        return;
      }

      setGatewayStep('otp');
      return;
    }

    if (gatewayStep === 'otp') {
      if (!gatewayData.otp) {
        showToast(
          'Please enter OTP',
          'error'
        );
        return;
      }

      setGatewayStep('pin');
      return;
    }

    if (!gatewayData.pin) {
      showToast(
        'Please enter PIN',
        'error'
      );
      return;
    }

    handlePlaceOrder();
  };

  const renderGatewayModal = () => (
    <AnimatePresence>
      {showGateway && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 20
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.9,
              y: 20
            }}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div
              className={cn(
                'p-8 text-white flex flex-col items-center gap-4',
                paymentMethod === 'BKASH'
                  ? 'bg-[#D12053]'
                  : 'bg-blue-600'
              )}
            >
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                {paymentMethod ===
                'BKASH' ? (
                  <Smartphone className="w-8 h-8" />
                ) : (
                  <CreditCard className="w-8 h-8" />
                )}
              </div>

              <div className="text-center">
                <h3 className="text-2xl font-bold">
                  {paymentMethod ===
                  'BKASH'
                    ? 'bKash Payment'
                    : 'Card Payment'}
                </h3>

                <p className="text-white/80 text-sm">
                  Amount: TK {grandTotal}
                </p>
              </div>
            </div>

            <div className="p-8 space-y-6">
              {gatewayStep ===
                'number' && (
                <div className="space-y-4">
                  <p className="text-slate-600 text-center text-sm">
                    Enter your{' '}
                    {paymentMethod ===
                    'BKASH'
                      ? 'bKash wallet number'
                      : 'card number'}
                  </p>

                  <input
                    type="text"
                    value={
                      gatewayData.number
                    }
                    onChange={e =>
                      setGatewayData({
                        ...gatewayData,
                        number:
                          e.target.value
                      })
                    }
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-center text-xl font-bold"
                    placeholder={
                      paymentMethod ===
                      'BKASH'
                        ? '01XXXXXXXXX'
                        : 'XXXX XXXX XXXX XXXX'
                    }
                  />
                </div>
              )}

              {gatewayStep ===
                'otp' && (
                <div className="space-y-4">
                  <p className="text-slate-600 text-center text-sm">
                    Enter OTP sent to
                    your phone
                  </p>

                  <input
                    type="text"
                    value={
                      gatewayData.otp
                    }
                    onChange={e =>
                      setGatewayData({
                        ...gatewayData,
                        otp:
                          e.target.value
                      })
                    }
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-center text-2xl font-bold"
                    maxLength={6}
                    placeholder="000000"
                  />
                </div>
              )}

              {gatewayStep ===
                'pin' && (
                <div className="space-y-4">
                  <p className="text-slate-600 text-center text-sm">
                    Enter PIN
                  </p>

                  <input
                    type="password"
                    value={
                      gatewayData.pin
                    }
                    onChange={e =>
                      setGatewayData({
                        ...gatewayData,
                        pin:
                          e.target.value
                      })
                    }
                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 px-6 text-center text-2xl font-bold"
                    maxLength={5}
                    placeholder="****"
                  />
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() =>
                    setShowGateway(
                      false
                    )
                  }
                  className="flex-1 py-4 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl"
                >
                  Cancel
                </button>

                <button
                  onClick={
                    handleGatewaySubmit
                  }
                  disabled={loading}
                  className={cn(
                    'flex-[2] py-4 rounded-2xl font-bold text-white',
                    paymentMethod ===
                      'BKASH'
                      ? 'bg-[#D12053]'
                      : 'bg-blue-600'
                  )}
                >
                  {loading
                    ? 'Verifying...'
                    : 'Confirm'}
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
        {
          id: 'shipping',
          label:
            t(
              'checkout.shipping'
            ),
          icon: MapPin
        },
        {
          id: 'payment',
          label:
            t(
              'checkout.payment'
            ),
          icon: CreditCard
        },
        {
          id: 'confirmation',
          label:
            t(
              'checkout.confirm'
            ),
          icon: ShieldCheck
        }
      ].map((s, i, arr) => (
        <React.Fragment
          key={s.id}
        >
          <div className="flex flex-col items-center relative">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-emerald-500 text-white">
              <s.icon className="w-6 h-6" />
            </div>

            <span className="absolute -bottom-7 text-xs font-bold">
              {s.label}
            </span>
          </div>

          {i <
            arr.length -
              1 && (
            <div className="w-20 h-1 mx-4 rounded-full bg-slate-200" />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  if (
    step === 'success' &&
    orderInfo
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 pt-20">
        <div className="glass p-12 rounded-[3rem] shadow-2xl text-center max-w-2xl w-full">
          <div className="w-24 h-24 bg-emerald-500 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-8">
            <CheckCircle className="w-12 h-12" />
          </div>

          <h2 className="text-4xl font-bold mb-2">
            Thank You!
          </h2>

          <p className="text-xl text-emerald-600 font-bold mb-8">
            Order Placed
            Successfully
          </p>           <div className="bg-slate-50 rounded-3xl p-8 mb-8 text-left space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-500">
                Order ID
              </span>
              <span className="font-bold">
                #{orderInfo.id}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Estimated Delivery
              </span>
              <span className="font-bold">
                {orderInfo.deliveryDate}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Payment Method
              </span>
              <span className="font-bold">
                {paymentMethod}
              </span>
            </div>
          </div>

          <button
            onClick={() =>
              navigate('/')
            }
            className="px-10 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {renderGatewayModal()}

      <div className="min-h-screen bg-slate-50 pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-7xl">

          {renderStepIndicator()}

          <div className="grid lg:grid-cols-3 gap-8">

            {/* LEFT SIDE */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm p-8">

              {step === 'shipping' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">
                    Shipping Details
                  </h2>

                  <input
                    name="fullName"
                    value={shippingDetails.fullName}
                    onChange={handleInputChange}
                    placeholder="Full Name"
                    className="w-full border rounded-2xl p-4"
                  />

                  <input
                    name="address"
                    value={shippingDetails.address}
                    onChange={handleInputChange}
                    placeholder="Address"
                    className="w-full border rounded-2xl p-4"
                  />

                  <input
                    name="city"
                    value={shippingDetails.city}
                    onChange={handleInputChange}
                    placeholder="City"
                    className="w-full border rounded-2xl p-4"
                  />

                  <input
                    name="phone"
                    value={shippingDetails.phone}
                    onChange={handleInputChange}
                    placeholder="Phone"
                    className="w-full border rounded-2xl p-4"
                  />

                  <input
                    name="zipCode"
                    value={shippingDetails.zipCode}
                    onChange={handleInputChange}
                    placeholder="ZIP Code"
                    className="w-full border rounded-2xl p-4"
                  />
                </div>
              )}

              {step === 'payment' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">
                    Payment Method
                  </h2>

                  {['COD', 'BKASH', 'CARD'].map(
                    method => (
                      <button
                        key={method}
                        onClick={() =>
                          setPaymentMethod(
                            method as any
                          )
                        }
                        className={cn(
                          'w-full p-4 rounded-2xl border text-left font-bold',
                          paymentMethod ===
                            method
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200'
                        )}
                      >
                        {method}
                      </button>
                    )
                  )}
                </div>
              )}

              {step ===
                'confirmation' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold">
                    Confirm Order
                  </h2>

                  <div className="bg-slate-50 p-6 rounded-2xl">
                    <p>
                      <strong>
                        Name:
                      </strong>{' '}
                      {
                        shippingDetails.fullName
                      }
                    </p>

                    <p>
                      <strong>
                        Address:
                      </strong>{' '}
                      {
                        shippingDetails.address
                      }
                      ,{' '}
                      {
                        shippingDetails.city
                      }
                    </p>

                    <p>
                      <strong>
                        Phone:
                      </strong>{' '}
                      {
                        shippingDetails.phone
                      }
                    </p>

                    <p>
                      <strong>
                        Payment:
                      </strong>{' '}
                      {paymentMethod}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-8">

                {step !==
                  'shipping' && (
                  <button
                    onClick={() =>
                      setStep(
                        step ===
                          'payment'
                          ? 'shipping'
                          : 'payment'
                      )
                    }
                    className="px-6 py-3 rounded-2xl border"
                  >
                    Back
                  </button>
                )}

                <button
                  onClick={() => {
                    if (
                      step ===
                      'shipping'
                    ) {
                      if (
                        validateShipping()
                      ) {
                        setStep(
                          'payment'
                        );
                      }
                    } else if (
                      step ===
                      'payment'
                    ) {
                      setStep(
                        'confirmation'
                      );
                    } else {
                      if (
                        paymentMethod ===
                        'COD'
                      ) {
                        handlePlaceOrder();
                      } else {
                        setGatewayStep(
                          'number'
                        );
                        setShowGateway(
                          true
                        );
                      }
                    }
                  }}
                  className="px-8 py-3 bg-emerald-500 text-white rounded-2xl font-bold"
                >
                  {step ===
                  'confirmation'
                    ? 'Place Order'
                    : 'Continue'}
                </button>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="bg-white rounded-3xl shadow-sm p-8 h-fit">
              <h2 className="text-2xl font-bold mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cart.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between"
                  >
                    <span>
                      {item.name} ×{' '}
                      {item.quantity}
                    </span>
                    <span>
                      TK{' '}
                      {item.price *
                        item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span>
                    Subtotal
                  </span>
                  <span>
                    TK {cartTotal}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>
                    Shipping
                  </span>
                  <span>
                    TK {shippingCost}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>
                    TK {tax}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>
                      Discount
                    </span>
                    <span>
                      -TK {discount}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-xl font-bold border-t pt-4">
                  <span>Total</span>
                  <span>
                    TK {grandTotal}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-2">
                <input
                  value={couponCode}
                  onChange={e =>
                    setCouponCode(
                      e.target.value
                    )
                  }
                  placeholder="Coupon Code"
                  className="flex-1 border rounded-2xl p-3"
                />

                <button
                  onClick={
                    handleApplyCoupon
                  }
                  className="px-4 bg-slate-900 text-white rounded-2xl"
                >
                  Apply
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;