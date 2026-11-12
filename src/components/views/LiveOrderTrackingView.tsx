/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Phone,
  Bike,
  MapPin,
  ChevronRight,
  RotateCcw,
  AlertCircle,
  X,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';
import { cancelOrder, updateOrderStatus, ORDERS_COLLECTION } from '../../services/foodDeliveryService';
import { db } from '../../lib/firebase';
import { useCart } from '../../context/CartContext';
import { doc, onSnapshot } from 'firebase/firestore';

interface LiveOrderTrackingViewProps {
  order: Order;
  onBack: () => void;
  onReorder: (order: Order) => void;
}

const LIFECYCLE_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'placed', label: 'Order Placed', desc: 'Received & sent to restaurant' },
  { status: 'confirmed', label: 'Order Confirmed', desc: 'Restaurant accepted your order' },
  { status: 'preparing', label: 'Preparing Food', desc: 'Chefs are crafting your meal' },
  { status: 'ready_for_pickup', label: 'Ready for Pickup', desc: 'Packed, sealed & handed to rider' },
  { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider is on the way to your door' },
  { status: 'delivered', label: 'Delivered', desc: 'Enjoy your delicious feast!' },
];

export const LiveOrderTrackingView: React.FC<LiveOrderTrackingViewProps> = ({
  order: initialOrder,
  onBack,
  onReorder,
}) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Changed my mind');
  const [isCancelling, setIsCancelling] = useState(false);

  // Listen in real-time to this specific order
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, ORDERS_COLLECTION, initialOrder.id), (snap) => {
        if (snap.exists()) {
          setOrder(snap.data() as Order);
        }
      });
      return () => unsub();
    } catch (e) {
      console.warn('Realtime listener error:', e);
    }
  }, [initialOrder.id]);

  const currentStepIndex = LIFECYCLE_STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === 'cancelled';
  const isDelivered = order.status === 'delivered';
  const canCancel = ['placed', 'confirmed'].includes(order.status);

  const handleCancelSubmit = async () => {
    setIsCancelling(true);
    try {
      await cancelOrder(order.id, cancelReason);
      setShowCancelModal(false);
    } catch (err) {
      console.error('Cancel order failed:', err);
      alert('Unable to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1015] text-white pb-20">
      {/* Top Header */}
      <div className="sticky top-0 z-30 bg-[#121318]/95 backdrop-blur-md border-b border-[#232535] px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-[#1c1e27] border border-[#2b2d3d] flex items-center justify-center text-white hover:bg-[#252837] transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base text-white flex items-center gap-2">
              <span>Order {order.orderNumber}</span>
              {isCancelled ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-950/50 text-red-400 border border-red-500/30">
                  CANCELLED
                </span>
              ) : isDelivered ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                  DELIVERED
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-950/50 text-[#FF6B35] border border-orange-500/30 animate-pulse">
                  LIVE
                </span>
              )}
            </h1>
            <p className="text-[11px] text-neutral-400">From {order.restaurantName}</p>
          </div>
        </div>

        {canCancel && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/30 px-3 py-1.5 rounded-xl bg-red-950/20"
          >
            Cancel Order
          </button>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Estimated Time Card or Status Hero */}
        {!isCancelled && (
          <div className="bg-gradient-to-br from-[#1c1e27] to-[#14151d] border border-[#282a3c] rounded-3xl p-5 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-36 bg-gradient-to-l from-[#FF6B35]/10 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#FF6B35]" />
                  <span>
                    {isDelivered
                      ? 'Order Completed'
                      : `Estimated Arrival: ~${order.estimatedDeliveryMinutes} mins`}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {isDelivered
                    ? 'Delivered Fresh & Hot!'
                    : order.status === 'out_for_delivery'
                    ? 'Rider is on the way to you!'
                    : order.status === 'preparing'
                    ? 'Kitchen is preparing your food'
                    : order.status === 'ready_for_pickup'
                    ? 'Food is packed & ready for rider'
                    : 'Order confirmed by restaurant'}
                </h2>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-[#FF6B35]/20 border border-[#FF6B35]/30 flex items-center justify-center shrink-0">
                <Bike className="w-6 h-6 text-[#FF6B35] animate-bounce" />
              </div>
            </div>

            {/* Simulated Live Route Banner */}
            <div className="mt-4 pt-4 border-t border-[#262838] flex items-center justify-between text-xs text-neutral-300">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="font-semibold">{order.restaurantName}</span>
              </div>
              <div className="h-0.5 flex-1 mx-3 bg-[#2a2d3e] relative">
                <div
                  className="h-full bg-[#FF6B35] transition-all duration-500"
                  style={{
                    width: `${Math.max(10, ((currentStepIndex + 1) / LIFECYCLE_STEPS.length) * 100)}%`,
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />
                <span className="font-semibold">{order.deliveryAddress.area}</span>
              </div>
            </div>

            {/* Delivery Verification OTP Card */}
            {!isDelivered && (
              <div className="mt-4 pt-4 border-t border-[#262838] bg-[#121319]/80 p-3.5 rounded-2xl border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                    Customer Delivery Verification OTP
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white tracking-[6px] mt-0.5">
                    {order.deliveryOtp || '4829'}
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    Share this code with your rider upon receiving your food package.
                  </div>
                </div>

                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cancellation Notice Banner */}
        {isCancelled && (
          <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-300 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-sm">Order Cancelled</div>
              <div className="text-xs text-red-200/80 mt-0.5">
                {order.cancelReason || 'Cancelled by customer'}
              </div>
              {order.paymentMethod !== 'cod' && (
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  Full refund of ৳{order.total} initiated to your original payment method.
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6-Step Lifecycle Stepper */}
        {!isCancelled && (
          <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-lg">
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">
              Live Order Status
            </h3>

            <div className="space-y-4">
              {LIFECYCLE_STEPS.map((step, idx) => {
                const isPassed = currentStepIndex >= idx;
                const isCurrent = currentStepIndex === idx;

                return (
                  <div key={step.status} className="flex items-start gap-3.5 relative">
                    {/* Connecting line */}
                    {idx < LIFECYCLE_STEPS.length - 1 && (
                      <div
                        className={`absolute left-[13px] top-[26px] bottom-[-16px] w-0.5 ${
                          currentStepIndex > idx ? 'bg-emerald-500' : 'bg-[#282a3c]'
                        }`}
                      />
                    )}

                    {/* Step Icon Indicator */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 z-10 transition-all ${
                        isPassed
                          ? 'bg-emerald-500 text-black shadow-md shadow-emerald-950'
                          : isCurrent
                          ? 'bg-[#FF6B35] text-white ring-4 ring-[#FF6B35]/20 animate-pulse'
                          : 'bg-[#222432] text-neutral-500 border border-[#2d3042]'
                      }`}
                    >
                      {isPassed ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span className="text-[11px] font-black">{idx + 1}</span>
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-xs font-extrabold ${
                            isCurrent
                              ? 'text-[#FF6B35]'
                              : isPassed
                              ? 'text-white'
                              : 'text-neutral-500'
                          }`}
                        >
                          {step.label}
                        </h4>
                        {isCurrent && (
                          <span className="text-[10px] font-black text-[#FF6B35] bg-[#FF6B35]/15 px-2 py-0.5 rounded-full">
                            IN PROGRESS
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assigned Rider Card */}
        {order.rider && !isCancelled && (
          <div className="bg-[#181922] border border-[#252838] rounded-3xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-800 border border-[#2b2d3d] flex items-center justify-center text-xl shrink-0">
                🛵
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-400">Delivery Partner</div>
                <div className="font-extrabold text-sm text-white">{order.rider.name}</div>
                <div className="text-[11px] text-neutral-400">{order.rider.vehicle}</div>
              </div>
            </div>

            <a
              href={`tel:${order.rider.phone}`}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/50"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call</span>
            </a>
          </div>
        )}

        {/* Delivery Address & Instructions */}
        <div className="bg-[#181922] border border-[#252838] rounded-3xl p-4 space-y-2 text-xs">
          <div className="font-bold text-neutral-300">Delivery Details</div>
          <div className="flex items-start gap-2 text-neutral-300">
            <MapPin className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">{order.deliveryAddress.label}</div>
              <div className="text-neutral-400">{order.deliveryAddress.addressLine}</div>
              <div className="text-neutral-500 text-[11px] mt-0.5">
                Phone: {order.customerPhone}
              </div>
            </div>
          </div>
          {order.deliveryInstructions && (
            <div className="text-[11px] text-amber-300/80 bg-amber-950/20 border border-amber-500/20 px-2.5 py-1.5 rounded-xl">
              Note for rider: "{order.deliveryInstructions}"
            </div>
          )}
        </div>

        {/* Itemized Order Summary */}
        <div className="bg-[#181922] border border-[#252838] rounded-3xl p-4 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-neutral-300">
            <span>Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})</span>
            <span className="text-[#FF6B35]">{order.restaurantName}</span>
          </div>

          <div className="divide-y divide-[#232535]">
            {order.items.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#252838] text-neutral-300 font-bold flex items-center justify-center text-[11px]">
                    {item.quantity}x
                  </span>
                  <div>
                    <div className="font-semibold text-white">{item.name}</div>
                    {item.selectedOptions?.map((o) => (
                      <span key={o.choiceId} className="text-[10px] text-neutral-400 block">
                        • {o.choiceName}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="font-bold text-white">৳{item.totalPrice * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Pricing breakdown */}
          <div className="pt-2 border-t border-[#252838] space-y-1.5 text-xs text-neutral-400">
            <div className="flex justify-between">
              <span>Item Subtotal</span>
              <span>৳{order.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>{order.deliveryFee === 0 ? 'FREE' : `৳${order.deliveryFee}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes (5%)</span>
              <span>৳{order.tax}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Coupon Discount</span>
                <span>-৳{order.discount}</span>
              </div>
            )}
            <div className="pt-2 border-t border-[#252838] flex justify-between text-sm font-black text-white">
              <span>Total Paid via {order.paymentMethod.toUpperCase()}</span>
              <span className="text-[#FF6B35]">৳{order.total}</span>
            </div>
          </div>
        </div>

        {/* Reorder Button */}
        <button
          onClick={() => onReorder(order)}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#1c1e27] hover:bg-[#252837] border border-[#2c2f42] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all"
        >
          <RotateCcw className="w-4 h-4 text-[#FF6B35]" />
          <span>Reorder These Items</span>
        </button>
      </div>

      {/* Cancellation Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#1c1e27] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Cancel Order?</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Please specify the reason for cancelling order {order.orderNumber}:
            </p>

            <div className="space-y-2">
              {[
                'Changed my mind',
                'Placed by mistake',
                'Delivery time is too long',
                'Selected wrong delivery address',
              ].map((reason) => (
                <label
                  key={reason}
                  onClick={() => setCancelReason(reason)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs cursor-pointer ${
                    cancelReason === reason
                      ? 'bg-red-950/20 border-red-500/50 text-white font-bold'
                      : 'bg-[#14151d] border-[#252838] text-neutral-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    checked={cancelReason === reason}
                    onChange={() => setCancelReason(reason)}
                    className="accent-red-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#252838] text-neutral-200 text-xs font-bold"
              >
                Nevermind
              </button>
              <button
                onClick={handleCancelSubmit}
                disabled={isCancelling}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg"
              >
                {isCancelling ? 'Cancelling...' : 'Confirm Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};