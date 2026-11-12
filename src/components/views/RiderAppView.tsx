/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Bike,
  Power,
  Navigation,
  MapPin,
  Clock,
  DollarSign,
  CheckCircle2,
  Phone,
  ShieldCheck,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Award,
  Wallet,
  ArrowUpRight,
  X,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { Order, RiderProfile, RiderPayout } from '../../types';
import {
  listenAvailableDeliveriesForRider,
  listenRiderProfile,
  updateRiderLocationAndStatus,
  riderAcceptOrder,
  riderConfirmPickup,
  riderVerifyAndDeliver,
  listenRiderPayouts,
  requestRiderPayout,
} from '../../services/foodDeliveryService';
import { INITIAL_RIDER_PROFILE } from '../../data/mockData';

export const RiderAppView: React.FC = () => {
  const [rider, setRider] = useState<RiderProfile>(INITIAL_RIDER_PROFILE);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);
  const [payouts, setPayouts] = useState<RiderPayout[]>([]);
  const [activeTab, setActiveTab] = useState<'radar' | 'active' | 'earnings'>('radar');

  // OTP modal
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Payout modal
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState(1000);
  const [payoutMethod, setPayoutMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');
  const [payoutAccount, setPayoutAccount] = useState('01823987654');
  const [payoutSuccess, setPayoutSuccess] = useState('');

  // Simulated GPS movement state along the route
  const [routeProgress, setRouteProgress] = useState(35);

  // Listen to rider profile
  useEffect(() => {
    const unsub = listenRiderProfile(rider.id, (updated) => {
      setRider(updated);
    });
    return () => unsub();
  }, [rider.id]);

  // Listen to available deliveries
  useEffect(() => {
    const unsub = listenAvailableDeliveriesForRider((orders) => {
      setAvailableOrders(orders);
      // Auto-attach if an order is already assigned to this rider
      const myActive = orders.find(
        (o) => o.rider?.name === rider.name && ['ready_for_pickup', 'out_for_delivery'].includes(o.status)
      );
      if (myActive) {
        setActiveDelivery(myActive);
        setActiveTab('active');
      }
    });
    return () => unsub();
  }, [rider.name]);

  // Listen to payouts
  useEffect(() => {
    const unsub = listenRiderPayouts(rider.id, (list) => {
      setPayouts(list);
    });
    return () => unsub();
  }, [rider.id]);

  // Simulate GPS coordinates live pulse
  useEffect(() => {
    if (!activeDelivery || activeDelivery.status !== 'out_for_delivery') return;
    const interval = setInterval(() => {
      setRouteProgress((prev) => (prev >= 95 ? 20 : prev + 5));
    }, 2500);
    return () => clearInterval(interval);
  }, [activeDelivery]);

  const toggleOnlineStatus = async () => {
    const nextState = !rider.isOnline;
    await updateRiderLocationAndStatus(rider.id, { isOnline: nextState });
    setRider((prev) => ({ ...prev, isOnline: nextState }));
  };

  const handleAcceptDelivery = async (order: Order) => {
    try {
      await riderAcceptOrder(order.id, rider);
      setActiveDelivery(order);
      setActiveTab('active');
    } catch (e) {
      console.error('Accept order failed:', e);
      alert('Order was already claimed by another nearby rider.');
    }
  };

  const handleConfirmPickup = async () => {
    if (!activeDelivery) return;
    try {
      await riderConfirmPickup(activeDelivery.id);
      setActiveDelivery({ ...activeDelivery, status: 'out_for_delivery' });
    } catch (e) {
      console.error('Pickup failed:', e);
    }
  };

  const handleVerifyOtpAndDeliver = async () => {
    if (!activeDelivery || !otpInput.trim()) return;
    setIsVerifying(true);
    setOtpError('');

    const res = await riderVerifyAndDeliver(activeDelivery.id, otpInput, rider.id);
    setIsVerifying(false);

    if (res.success) {
      setShowOtpModal(false);
      setOtpInput('');
      setActiveDelivery(null);
      setActiveTab('earnings');
    } else {
      setOtpError(res.message);
    }
  };

  const handleRequestPayout = async () => {
    if (payoutAmount > rider.walletBalance) {
      alert('Requested amount exceeds available balance.');
      return;
    }
    await requestRiderPayout(rider.id, payoutAmount, payoutMethod, payoutAccount);
    setPayoutSuccess('Withdrawal request submitted! Payout will arrive in ~15 mins.');
    setTimeout(() => {
      setShowPayoutModal(false);
      setPayoutSuccess('');
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Top Rider Partner Header */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-900 border-2 border-emerald-500/50 shrink-0">
              <img src={rider.avatar} alt={rider.name} className="w-full h-full object-cover" />
            </div>
            <span
              className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#181922] ${
                rider.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-500'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">{rider.name}</h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                VERIFIED RIDER
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kidha Lagce • {rider.vehicleType} ({rider.vehiclePlate}) • ⭐ {rider.currentRating} Rating
            </p>
          </div>
        </div>

        {/* Online / Offline Status Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleOnlineStatus}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs flex items-center gap-2 border transition-all shadow-lg ${
              rider.isOnline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-emerald-950/50'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border-neutral-600'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{rider.isOnline ? 'ONLINE (READY FOR TRIPS)' : 'OFFLINE (PAUSED)'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Today's Earnings</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">৳{rider.todayEarnings}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Includes delivery fees + tips</div>
        </div>

        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <Bike className="w-4 h-4 text-[#FF6B35]" />
            <span>Completed Trips</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{rider.totalTrips}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Delivered safely & on time</div>
        </div>

        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span>Available Balance</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">৳{rider.walletBalance}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Ready for bKash withdrawal</div>
        </div>

        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Customer Rating</span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{rider.currentRating} ⭐</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Top 5% rated delivery partner</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#252838] pb-3 overflow-x-auto no-scrollbar whitespace-nowrap flex-nowrap">
        <button
          onClick={() => setActiveTab('radar')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'radar'
              ? 'bg-[#FF6B35] text-white shadow-md'
              : 'bg-[#181922] text-neutral-400 hover:text-white'
          }`}
        >
          <Navigation className="w-4 h-4" />
          <span>Delivery Radar</span>
          {availableOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">
              {availableOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'active'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-[#181922] text-neutral-400 hover:text-white'
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Active Delivery {activeDelivery ? '(1 Live)' : '(None)'}</span>
        </button>

        <button
          onClick={() => setActiveTab('earnings')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'earnings'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-[#181922] text-neutral-400 hover:text-white'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Earnings & Payouts</span>
        </button>
      </div>

      {/* Delivery Radar (Available Trips) */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>Nearby Broadcast Orders</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </h2>
              <p className="text-xs text-neutral-400">
                Live delivery requests from kitchens in Banani, Gulshan & Dhanmondi
              </p>
            </div>
            <div className="text-xs font-bold text-neutral-400 bg-[#181922] px-3 py-1.5 rounded-xl border border-[#252838]">
              Status: {rider.isOnline ? 'Scanning for orders' : 'Turn Online to accept'}
            </div>
          </div>

          {availableOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableOrders.map((order) => {
                const tripFee = 70 + (order.total > 500 ? 25 : 0);
                return (
                  <div
                    key={order.id}
                    className="bg-[#181922] border border-[#252838] hover:border-[#FF6B35]/60 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-2">
                            <span>{order.orderNumber}</span>
                            <span className="text-[10px] text-neutral-400">
                              {order.items.length} dishes
                            </span>
                          </div>
                          <h3 className="font-bold text-base text-white mt-1">
                            {order.restaurantName}
                          </h3>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-black text-emerald-400 text-base">
                            ৳{tripFee}
                          </div>
                          <div className="text-[10px] text-neutral-400">Trip Earnings</div>
                        </div>
                      </div>

                      {/* Pickup to Drop route */}
                      <div className="mt-3.5 space-y-2 text-xs bg-[#121319] p-3 rounded-2xl border border-[#222432]">
                        <div className="flex items-start gap-2 text-neutral-300">
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1" />
                          <div>
                            <span className="font-bold text-white">Pickup: </span>
                            <span className="text-neutral-300">{order.restaurantName}</span>
                            <div className="text-[10px] text-neutral-500">
                              {order.restaurantAddress || 'Banani Road 11'}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start gap-2 text-neutral-300 pt-1 border-t border-[#222432]">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35] shrink-0 mt-1" />
                          <div>
                            <span className="font-bold text-white">Deliver to: </span>
                            <span className="text-neutral-300">{order.deliveryAddress.area}</span>
                            <div className="text-[10px] text-neutral-500">
                              {order.deliveryAddress.addressLine}
                            </div>
                          </div>
                        </div>
                      </div>

                      {order.deliveryInstructions && (
                        <div className="mt-2 text-[11px] text-amber-300/80 bg-amber-950/20 px-2 py-1 rounded-lg">
                          Customer note: "{order.deliveryInstructions}"
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleAcceptDelivery(order)}
                      disabled={!rider.isOnline}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Accept Delivery (Earn ৳{tripFee})</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#181922] border border-[#252838] rounded-3xl p-12 text-center">
              <div className="text-4xl mb-3">📡</div>
              <h3 className="font-bold text-white text-base">Radar Active • Searching nearby</h3>
              <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
                No new unassigned orders in your immediate radius. New kitchen orders will pop up here instantly.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Active Delivery Flow & GPS Route Simulation */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeDelivery ? (
            <div className="max-w-2xl mx-auto space-y-5">
              {/* Live Status Hero */}
              <div className="bg-gradient-to-br from-[#1c1e27] to-[#14151d] border border-[#282a3c] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                      CURRENT ASSIGNMENT
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                      {activeDelivery.status === 'out_for_delivery'
                        ? 'En Route to Customer'
                        : 'Navigate to Kitchen for Pickup'}
                    </h2>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Order {activeDelivery.orderNumber} • {activeDelivery.restaurantName}
                    </p>
                  </div>

                  <div className="w-14 h-14 rounded-2xl bg-[#FF6B35]/20 border border-[#FF6B35]/30 flex items-center justify-center">
                    <Bike className="w-7 h-7 text-[#FF6B35] animate-bounce" />
                  </div>
                </div>

                {/* Simulated Live GPS Map Graphic */}
                <div className="mt-5 bg-[#0f1015] border border-[#252838] rounded-2xl p-4 relative overflow-hidden">
                  <div className="flex items-center justify-between text-xs text-neutral-400 mb-2 font-bold">
                    <span>GPS Telemetry Simulation</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Route Tracking
                    </span>
                  </div>

                  {/* Route progress bar with bike icon */}
                  <div className="h-2 bg-[#222432] rounded-full relative my-6">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-[#FF6B35] rounded-full transition-all duration-700"
                      style={{ width: `${routeProgress}%` }}
                    />
                    <div
                      className="absolute -top-3 w-8 h-8 rounded-full bg-[#FF6B35] text-white flex items-center justify-center text-xs shadow-lg transition-all duration-700"
                      style={{ left: `calc(${routeProgress}% - 16px)` }}
                    >
                      🛵
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-bold">{activeDelivery.restaurantName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />
                      <span className="font-bold">{activeDelivery.deliveryAddress.area}</span>
                    </div>
                  </div>
                </div>

                {/* Customer Details & Call Button */}
                <div className="mt-4 pt-4 border-t border-[#252838] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold text-neutral-400">Customer</div>
                    <div className="text-sm font-black text-white">{activeDelivery.customerName}</div>
                    <div className="text-[11px] text-neutral-400">{activeDelivery.deliveryAddress.addressLine}</div>
                  </div>

                  <a
                    href={`tel:${activeDelivery.customerPhone}`}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Customer</span>
                  </a>
                </div>
              </div>

              {/* Action Stepper for Rider */}
              <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                  Delivery Action Required
                </h3>

                {activeDelivery.status !== 'out_for_delivery' ? (
                  <button
                    onClick={handleConfirmPickup}
                    className="w-full py-4 rounded-2xl bg-[#FF6B35] hover:bg-[#ff5722] text-white font-black text-sm shadow-xl shadow-orange-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Confirm Food Pickup From Kitchen</span>
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs">
                      Arrived at customer flat? Ask customer for their 4-digit Delivery OTP to complete this trip.
                    </div>
                    <button
                      onClick={() => setShowOtpModal(true)}
                      className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-xl shadow-emerald-950/50 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span>Enter Customer Delivery OTP & Complete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#181922] border border-[#252838] rounded-3xl p-12 text-center max-w-md mx-auto">
              <div className="text-4xl mb-3">🛵</div>
              <h3 className="font-bold text-white text-base">No active delivery in progress</h3>
              <p className="text-xs text-neutral-400 mt-1">
                Go to the Delivery Radar tab to claim an available broadcast order.
              </p>
              <button
                onClick={() => setActiveTab('radar')}
                className="mt-4 px-4 py-2 rounded-xl bg-[#FF6B35] text-white font-bold text-xs"
              >
                Go to Delivery Radar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Earnings & Payouts Tab */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div className="bg-[#181922] border border-[#252838] rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-neutral-400">Rider Wallet Balance</div>
              <div className="text-3xl font-black text-white mt-1">৳{rider.walletBalance}</div>
              <p className="text-xs text-neutral-400 mt-1">
                Accumulated payout ready for transfer to bKash or Nagad
              </p>
            </div>

            <button
              onClick={() => setShowPayoutModal(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 cursor-pointer"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Withdraw to bKash / Nagad</span>
            </button>
          </div>

          {/* Historical Trips & Payouts */}
          <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-xl space-y-3">
            <h3 className="text-sm font-bold text-white">Recent Delivery Trips</h3>
            <div className="divide-y divide-[#252838] text-xs">
              {[
                { id: '1', order: '#KL-482910', from: 'Kacchi Bhai', to: 'Banani Road 11', fee: '৳85', time: '1 hour ago' },
                { id: '2', order: '#KL-192842', from: 'The Burger Lab Co.', to: 'Gulshan 1', fee: '৳70', time: '3 hours ago' },
                { id: '3', order: '#KL-882913', from: 'Pizza Roma Artisan', to: 'Dhanmondi 27', fee: '৳95', time: 'Yesterday' },
              ].map((trip) => (
                <div key={trip.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">{trip.order}</div>
                    <div className="text-[11px] text-neutral-400">
                      {trip.from} ➔ {trip.to}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-emerald-400">{trip.fee}</div>
                    <div className="text-[10px] text-neutral-500">{trip.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customer OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#1c1e27] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Verify Delivery OTP</h3>
              <button onClick={() => setShowOtpModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-300">
              Please enter the 4-digit code provided on the customer's phone to securely confirm handover:
            </p>

            <div>
              <input
                type="text"
                maxLength={4}
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                placeholder="4-digit OTP (e.g. 4829)"
                className="w-full text-center tracking-[8px] text-2xl font-black py-3 bg-[#121319] border border-[#2d3042] rounded-2xl text-white focus:outline-none focus:border-emerald-500"
              />
              {otpError && (
                <div className="text-xs text-red-400 mt-2 flex items-center gap-1 justify-center">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{otpError}</span>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#252838] text-neutral-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyOtpAndDeliver}
                disabled={isVerifying || otpInput.length < 4}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : 'Confirm Delivery'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Withdrawal Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#1c1e27] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Withdraw Rider Earnings</h3>
              <button onClick={() => setShowPayoutModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-bold">Withdrawal Amount (BDT ৳)</label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Number(e.target.value))}
                  max={rider.walletBalance}
                  className="w-full mt-1 bg-[#121319] border border-[#282a3c] rounded-xl px-3 py-2 text-white font-bold"
                />
                <span className="text-[10px] text-neutral-400 mt-0.5 block">
                  Max available: ৳{rider.walletBalance}
                </span>
              </div>

              <div>
                <label className="text-neutral-300 font-bold">Payout Method</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setPayoutMethod('bkash')}
                    className={`py-2 rounded-xl font-bold border ${
                      payoutMethod === 'bkash' ? 'bg-[#E2136E] text-white border-[#E2136E]' : 'bg-[#181922] text-neutral-400'
                    }`}
                  >
                    bKash
                  </button>
                  <button
                    onClick={() => setPayoutMethod('nagad')}
                    className={`py-2 rounded-xl font-bold border ${
                      payoutMethod === 'nagad' ? 'bg-[#F7941D] text-white border-[#F7941D]' : 'bg-[#181922] text-neutral-400'
                    }`}
                  >
                    Nagad
                  </button>
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-bold">Account Number</label>
                <input
                  type="text"
                  value={payoutAccount}
                  onChange={(e) => setPayoutAccount(e.target.value)}
                  className="w-full mt-1 bg-[#121319] border border-[#282a3c] rounded-xl px-3 py-2 text-white"
                />
              </div>

              {payoutSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs">
                  {payoutSuccess}
                </div>
              )}
            </div>

            <button
              onClick={handleRequestPayout}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
            >
              Confirm Withdrawal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
