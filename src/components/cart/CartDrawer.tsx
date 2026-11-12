/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Tag,
  MapPin,
  CreditCard,
  Check,
  ShieldCheck,
  ChevronRight,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { VegIcon } from '../common/VegIcon';
import { PaymentMethod, Order, OrderStatus } from '../../types';
import { INITIAL_COUPONS } from '../../data/mockData';
import { createOrder } from '../../services/foodDeliveryService';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced: (order: Order) => void;
  onOpenAddressModal: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderPlaced,
  onOpenAddressModal,
}) => {
  const {
    items,
    restaurant,
    itemCount,
    subtotal,
    deliveryFee,
    tax,
    discount,
    total,
    appliedCoupon,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    clearCart,
  } = useCart();

  const { user, profile, activeAddress, walletBalance, setWalletBalance } = useAuth();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bkash');
  const [selectedInstruction, setSelectedInstruction] = useState<string>('Leave at door');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledSlot, setScheduledSlot] = useState('Today, 7:30 PM (Dinner)');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'review' | 'mfs_modal'>('review');
  const [mfsNumber, setMfsNumber] = useState('01712345678');
  const [mfsPin, setMfsPin] = useState('12345');

  if (!isOpen) return null;

  const handleApplyCoupon = (code: string) => {
    setCouponError('');
    setCouponSuccess('');
    const found = INITIAL_COUPONS.find(
      (c) => c.code.toLowerCase() === code.trim().toLowerCase()
    );
    if (!found) {
      setCouponError('Invalid coupon code. Try ZOMATO50 or TASTY30');
      return;
    }
    const res = applyCoupon(found);
    if (res.success) {
      setCouponSuccess(res.message);
      setCouponInput('');
    } else {
      setCouponError(res.message);
    }
  };

  const handleCheckoutSubmit = async () => {
    if (!restaurant || items.length === 0) return;
    if (!activeAddress) {
      onOpenAddressModal();
      return;
    }

    // If online MFS like bKash/Nagad or card, trigger interactive modal
    if (paymentMethod === 'bkash' || paymentMethod === 'nagad') {
      setPaymentStep('mfs_modal');
      return;
    }

    await finalizeOrder();
  };

  const finalizeOrder = async () => {
    if (!restaurant || !activeAddress) return;
    setIsSubmitting(true);

    try {
      const orderId = `ord-${Date.now()}`;
      const orderNum = `#KL-${Math.floor(100000 + Math.random() * 900000)}`;

      const newOrder: Order = {
        id: orderId,
        orderNumber: orderNum,
        customerId: user?.uid || profile?.uid || 'guest-user',
        customerName: profile?.name || 'Habiba Arman',
        customerEmail: user?.email || profile?.email || 'armanhabiba903709@gmail.com',
        customerPhone: activeAddress.phone || '+880 1712-345678',
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        restaurantImage: restaurant.image,
        restaurantAddress: restaurant.address,
        items: [...items],
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        appliedCoupon: appliedCoupon?.code,
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        paymentTransactionId:
          paymentMethod !== 'cod'
            ? `TXN-${paymentMethod.toUpperCase()}-${Math.floor(1000000 + Math.random() * 9000000)}`
            : undefined,
        status: 'placed' as OrderStatus,
        deliveryOtp: Math.floor(1000 + Math.random() * 9000).toString(),
        scheduledTime: isScheduled ? scheduledSlot : undefined,
        statusHistory: [
          {
            status: 'placed',
            timestamp: new Date().toISOString(),
            note: isScheduled
              ? `Scheduled order placed for ${scheduledSlot}`
              : 'Order placed by customer and sent to kitchen',
          },
        ],
        deliveryAddress: activeAddress,
        deliveryInstructions: selectedInstruction,
        estimatedDeliveryMinutes: restaurant.deliveryTimeMinutes || 30,
        rider: {
          name: 'Shakil Ahmed',
          phone: '+880 1823-987654',
          vehicle: 'Honda CB 150 (Dhaka Metro-Ha 42-1982)',
          rating: 4.9,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (paymentMethod === 'wallet') {
        setWalletBalance((prev) => Math.max(0, prev - total));
      }

      // Create in Firestore
      await createOrder(newOrder);

      // Clear cart
      clearCart();
      onClose();
      onOrderPlaced(newOrder);
    } catch (err) {
      console.error('Failed to create order in Firestore:', err);
      alert('Unable to place order. Please check connection and try again.');
    } finally {
      setIsSubmitting(false);
      setPaymentStep('review');
    }
  };

  const deliveryInstructionsList = [
    'Leave at door',
    'Avoid calling',
    'Ring doorbell',
    'Hand to guard at lobby',
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-[#14151d] border-l border-[#252838] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#252838] flex items-center justify-between bg-[#181922]">
          <div>
            <h2 className="font-extrabold text-white text-lg flex items-center gap-2">
              <span>Your Cart</span>
              {itemCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] font-black">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </h2>
            {restaurant && (
              <p className="text-xs text-neutral-400 truncate max-w-[260px]">
                From {restaurant.name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#222533] text-neutral-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-24 h-24 rounded-full bg-[#1c1e27] border border-[#2b2d3d] flex items-center justify-center text-4xl mb-4">
              🛍️
            </div>
            <h3 className="font-bold text-white text-lg">Your cart is empty</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs leading-relaxed">
              Good food is always cooking! Add your favorite dishes from top restaurants to get started.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] text-white font-bold text-xs shadow-lg shadow-orange-950/50"
            >
              Browse Restaurants
            </button>
          </div>
        ) : (
          /* Active Cart Items & Checkout */
          <div className="flex-1 overflow-y-auto p-4 space-y-5 divide-y divide-[#232535]">
            {/* Delivery address banner */}
            <div className="bg-[#1c1e27] border border-[#2b2e3e] rounded-2xl p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#FF6B35]/15 border border-[#FF6B35]/30 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4 text-[#FF6B35]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Delivery at {activeAddress?.label || 'Home'}</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">
                        25-30 mins
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400 mt-0.5 line-clamp-1">
                      {activeAddress?.addressLine || 'Banani, Dhaka'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={onOpenAddressModal}
                  className="text-xs font-bold text-[#FF6B35] hover:underline shrink-0"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Food Items List */}
            <div className="pt-4 space-y-3">
              <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                Items from {restaurant?.name}
              </div>

              {items.map((cartItem) => (
                <div
                  key={cartItem.id}
                  className="bg-[#181922] border border-[#252838] rounded-2xl p-3 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 flex-1">
                    <VegIcon isVeg={cartItem.isVeg} size={16} />
                    <div className="flex-1">
                      <div className="text-xs font-bold text-white leading-tight">
                        {cartItem.name}
                      </div>
                      <div className="text-xs font-black text-[#FF6B35] mt-0.5">
                        ৳{cartItem.totalPrice}
                      </div>

                      {/* Customization pills */}
                      {cartItem.selectedOptions && cartItem.selectedOptions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cartItem.selectedOptions.map((opt) => (
                            <span
                              key={opt.choiceId}
                              className="text-[10px] bg-[#222533] text-neutral-300 px-1.5 py-0.5 rounded"
                            >
                              {opt.choiceName} (+৳{opt.price})
                            </span>
                          ))}
                        </div>
                      )}

                      {cartItem.specialInstructions && (
                        <div className="text-[10px] text-neutral-400 italic mt-1">
                          Note: "{cartItem.specialInstructions}"
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-[#202330] border border-[#2d3042] rounded-xl p-0.5">
                    <button
                      onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                      className="p-1 rounded-lg text-neutral-300 hover:text-white"
                    >
                      {cartItem.quantity === 1 ? (
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <Minus className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <span className="px-2 text-xs font-black text-white">{cartItem.quantity}</span>
                    <button
                      onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                      className="p-1 rounded-lg text-neutral-300 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Instructions Chips */}
            <div className="pt-4">
              <div className="text-xs font-bold text-neutral-300 mb-2">Delivery Instructions</div>
              <div className="grid grid-cols-2 gap-2">
                {deliveryInstructionsList.map((inst) => {
                  const active = selectedInstruction === inst;
                  return (
                    <button
                      key={inst}
                      onClick={() => setSelectedInstruction(inst)}
                      className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold text-left border transition-all ${
                        active
                          ? 'bg-[#FF6B35]/15 border-[#FF6B35] text-[#FF6B35]'
                          : 'bg-[#181922] border-[#252838] text-neutral-300 hover:border-neutral-500'
                      }`}
                    >
                      {inst}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Coupons Section */}
            <div className="pt-4 space-y-2">
              <div className="text-xs font-bold text-neutral-300 flex items-center justify-between">
                <span>Offers & Coupons</span>
                {appliedCoupon && (
                  <button
                    onClick={removeCoupon}
                    className="text-[11px] font-bold text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-emerald-300">
                        {appliedCoupon.code} applied!
                      </div>
                      <div className="text-[10px] text-emerald-400">
                        You saved ৳{discount} on this order
                      </div>
                    </div>
                  </div>
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Enter promo code (e.g. ZOMATO50)"
                      className="flex-1 bg-[#181922] border border-[#252838] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35]"
                    />
                    <button
                      onClick={() => handleApplyCoupon(couponInput)}
                      className="px-4 py-2 bg-[#252838] hover:bg-[#303348] text-white font-bold text-xs rounded-xl transition-all"
                    >
                      Apply
                    </button>
                  </div>

                  {couponError && (
                    <div className="text-[11px] text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{couponError}</span>
                    </div>
                  )}

                  {couponSuccess && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>{couponSuccess}</span>
                    </div>
                  )}

                  {/* Quick coupon chips */}
                  <div className="flex gap-1.5 overflow-x-auto py-1 no-scrollbar">
                    {INITIAL_COUPONS.map((c) => (
                      <button
                        key={c.code}
                        onClick={() => handleApplyCoupon(c.code)}
                        className="px-2.5 py-1 rounded-lg bg-[#1f212d] hover:bg-[#282b3a] border border-dashed border-[#FF6B35]/40 text-[#FF6B35] text-[10px] font-black shrink-0 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{c.code}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="pt-4 space-y-2">
              <div className="text-xs font-bold text-neutral-300">Select Payment Method</div>
              <div className="grid grid-cols-2 gap-2">
                {/* bKash */}
                <button
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'bkash'
                      ? 'bg-[#E2136E]/15 border-[#E2136E] text-white'
                      : 'bg-[#181922] border-[#252838] text-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#E2136E] text-white font-black text-[10px] flex items-center justify-center">
                      bK
                    </span>
                    <div>
                      <div className="text-xs font-bold">bKash</div>
                      <div className="text-[9px] text-neutral-400">MFS Gateway</div>
                    </div>
                  </div>
                  {paymentMethod === 'bkash' && <Check className="w-3.5 h-3.5 text-[#E2136E]" />}
                </button>

                {/* Nagad */}
                <button
                  onClick={() => setPaymentMethod('nagad')}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'nagad'
                      ? 'bg-[#F7941D]/15 border-[#F7941D] text-white'
                      : 'bg-[#181922] border-[#252838] text-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-[#F7941D] text-white font-black text-[10px] flex items-center justify-center">
                      NG
                    </span>
                    <div>
                      <div className="text-xs font-bold">Nagad</div>
                      <div className="text-[9px] text-neutral-400">Instant Pay</div>
                    </div>
                  </div>
                  {paymentMethod === 'nagad' && <Check className="w-3.5 h-3.5 text-[#F7941D]" />}
                </button>

                {/* SSLCommerz / Cards */}
                <button
                  onClick={() => setPaymentMethod('sslcommerz')}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'sslcommerz'
                      ? 'bg-blue-600/15 border-blue-500 text-white'
                      : 'bg-[#181922] border-[#252838] text-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="text-xs font-bold">SSLCommerz</div>
                      <div className="text-[9px] text-neutral-400">Cards & Netbank</div>
                    </div>
                  </div>
                  {paymentMethod === 'sslcommerz' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>

                  {/* Cash on Delivery */}
                <button
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    paymentMethod === 'cod'
                      ? 'bg-emerald-600/15 border-emerald-500 text-white'
                      : 'bg-[#181922] border-[#252838] text-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">💵</span>
                    <div>
                      <div className="text-xs font-bold">Cash on Delivery</div>
                      <div className="text-[9px] text-neutral-400">Pay on arrival</div>
                    </div>
                  </div>
                  {paymentMethod === 'cod' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                {/* Kidha In-App Wallet */}
                <button
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all col-span-2 ${
                    paymentMethod === 'wallet'
                      ? 'bg-purple-600/20 border-purple-500 text-white'
                      : 'bg-[#181922] border-[#252838] text-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-purple-600 text-white font-black text-[10px] flex items-center justify-center">
                      KW
                    </span>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-2">
                        <span>Kidha In-App Wallet</span>
                        <span className="text-[10px] text-emerald-400 font-black">
                          (Balance: ৳{walletBalance})
                        </span>
                      </div>
                      <div className="text-[9px] text-neutral-400">Instant 1-tap checkout • Zero gateway fees</div>
                    </div>
                  </div>
                  {paymentMethod === 'wallet' && <Check className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              </div>
            </div>

            {/* Scheduled Food Order Toggle */}
            <div className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-300">Schedule Delivery for Later</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#252838] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF6B35]"></div>
                </label>
              </div>

              {isScheduled && (
                <div className="bg-[#181922] border border-[#282a3c] rounded-2xl p-3 space-y-2 text-xs">
                  <span className="text-neutral-400 block text-[11px]">Select Delivery Slot:</span>
                  <select
                    value={scheduledSlot}
                    onChange={(e) => setScheduledSlot(e.target.value)}
                    className="w-full bg-[#121319] border border-[#2d3042] rounded-xl px-3 py-2 text-white font-bold"
                  >
                    <option value="Today, 7:30 PM (Dinner)">Today, 7:30 PM (Dinner)</option>
                    <option value="Today, 9:00 PM (Late Night)">Today, 9:00 PM (Late Night)</option>
                    <option value="Tomorrow, 1:00 PM (Lunch)">Tomorrow, 1:00 PM (Lunch)</option>
                    <option value="Tomorrow, 8:00 PM (Dinner)">Tomorrow, 8:00 PM (Dinner)</option>
                    <option value="Friday, 1:30 PM (Jummah Special)">Friday, 1:30 PM (Jummah Special)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Bill Details */}
            <div className="pt-4 space-y-2">
              <div className="text-xs font-bold text-neutral-300">Bill Summary</div>
              <div className="bg-[#181922] border border-[#252838] rounded-2xl p-3.5 space-y-2 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Item Subtotal</span>
                  <span>৳{subtotal}</span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Delivery Charge</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-bold">FREE</span>
                    ) : (
                      `৳${deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-300">
                  <span>Restaurant GST & Taxes (5%)</span>
                  <span>৳{tax}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-bold">
                    <span>Discount Coupon ({appliedCoupon?.code})</span>
                    <span>-৳{discount}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#252838] flex justify-between text-sm font-black text-white">
                  <span>To Pay</span>
                  <span className="text-[#FF6B35]">৳{total}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Proceed to Pay */}
        {items.length > 0 && (
          <div className="p-4 bg-[#181922] border-t border-[#252838]">
            <button
              onClick={handleCheckoutSubmit}
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] hover:brightness-110 active:scale-[0.99] text-white font-extrabold text-sm shadow-xl shadow-orange-950/50 flex items-center justify-between transition-all disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-orange-200" />
                <span>
                  {paymentMethod === 'cod' ? 'Confirm Order (COD)' : `Pay via ${paymentMethod.toUpperCase()}`}
                </span>
              </div>
              <span className="font-black text-base">৳{total}</span>
            </button>
          </div>
        )}
      </div>

      {/* MFS Gateway Modal Simulation */}
      {paymentStep === 'mfs_modal' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#1c1e27] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2.5 py-1 rounded-lg text-white font-black text-xs ${
                    paymentMethod === 'bkash' ? 'bg-[#E2136E]' : 'bg-[#F7941D]'
                  }`}
                >
                  {paymentMethod.toUpperCase()}
                </span>
                <span className="text-sm font-bold text-white">Payment Checkout</span>
              </div>
              <button
                onClick={() => setPaymentStep('review')}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-[#14151d] p-3 rounded-2xl border border-[#282a3c] text-center">
              <div className="text-[11px] text-neutral-400">Total Payable Amount</div>
              <div className="text-2xl font-black text-white mt-0.5">৳{total}</div>
              <div className="text-[10px] text-neutral-500 mt-1">Merchant: Kidha Lagce Food Delivery Ltd.</div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-300">Your Account Number</label>
                <input
                  type="text"
                  value={mfsNumber}
                  onChange={(e) => setMfsNumber(e.target.value)}
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-300">Account PIN</label>
                <input
                  type="password"
                  value={mfsPin}
                  onChange={(e) => setMfsPin(e.target.value)}
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <button
              onClick={finalizeOrder}
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-all ${
                paymentMethod === 'bkash'
                  ? 'bg-[#E2136E] hover:brightness-110'
                  : 'bg-[#F7941D] hover:brightness-110'
              }`}
            >
              {isSubmitting ? 'Verifying Transaction...' : `Confirm & Pay ৳${total}`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
