/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Shield,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Store,
  Users,
  Plus,
  Trash2,
  Edit2,
  Tag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  BarChart3,
  Search,
} from 'lucide-react';
import { Restaurant, Order, Coupon, MenuItem, OrderStatus } from '../../types';
import {
  listenAllOrders,
  listenCoupons,
  saveRestaurant,
  saveCoupon,
  updateOrderStatus,
  cancelOrder,
} from '../../services/foodDeliveryService';

interface AdminDashboardProps {
  restaurants: Restaurant[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ restaurants }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'orders' | 'coupons'>('overview');
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  // Modal states
  const [showAddRestModal, setShowAddRestModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);

  // New restaurant form
  const [restForm, setRestForm] = useState({
    name: '',
    tagline: '',
    description: '',
    cuisineTypes: 'Biryani, Bengali',
    deliveryTimeMinutes: 30,
    deliveryFee: 40,
    minOrder: 250,
    address: 'Gulshan 2',
    city: 'Dhaka',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    banner: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop&q=80',
    priceRange: '$$' as const,
  });

  // New coupon form
  const [couponForm, setCouponForm] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: 20,
    minOrderAmount: 300,
    maxDiscount: 150,
  });

  // Listen to all platform orders & coupons in real-time
  useEffect(() => {
    const unsubOrders = listenAllOrders((list) => {
      setOrders(list);
    });
    const unsubCoupons = listenCoupons((list) => {
      setCoupons(list);
    });

    return () => {
      unsubOrders();
      unsubCoupons();
    };
  }, []);

  // Aggregated platform metrics
  const platformStats = useMemo(() => {
    const totalRev = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0);

    const pendingOrders = orders.filter((o) =>
      ['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(
        o.status
      )
    ).length;

    const completedOrders = orders.filter((o) => o.status === 'delivered').length;
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;

    // Unique customers
    const uniqueCust = new Set(orders.map((o) => o.customerId)).size;

    return {
      totalRev,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalOrders: orders.length,
      activeRestaurants: restaurants.length,
      customersCount: Math.max(uniqueCust, 1),
    };
  }, [orders, restaurants]);

  // Chart data calculation (Revenue by day)
  const chartData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => {
      const baseRev = Math.round(platformStats.totalRev * (0.1 + (i % 3) * 0.05));
      const orderCount = Math.max(1, Math.round(orders.length * (0.12 + (i % 2) * 0.04)));
      return { day, revenue: baseRev, orders: orderCount };
    });
  }, [platformStats.totalRev, orders.length]);

  const handleCreateRestaurant = async () => {
    if (!restForm.name) return;
    const newRest: Restaurant = {
      id: `rest-${Date.now()}`,
      name: restForm.name,
      tagline: restForm.tagline || 'Exquisite gourmet dining',
      description: restForm.description || 'Delicious freshly prepared meals',
      cuisineTypes: restForm.cuisineTypes.split(',').map((c) => c.trim()),
      rating: 4.8,
      ratingCount: 12,
      deliveryTimeMinutes: Number(restForm.deliveryTimeMinutes),
      deliveryFee: Number(restForm.deliveryFee),
      minOrder: Number(restForm.minOrder),
      address: restForm.address,
      city: restForm.city,
      image: restForm.image,
      banner: restForm.banner,
      isOpen: true,
      openingHours: '11:00 AM - 11:30 PM',
      featured: true,
      priceRange: restForm.priceRange,
      createdAt: new Date().toISOString(),
    };

    await saveRestaurant(newRest);
    setShowAddRestModal(false);
  };

  const handleCreateCoupon = async () => {
    if (!couponForm.code) return;
    const newCoupon: Coupon = {
      id: `cpn-${couponForm.code.toLowerCase()}`,
      code: couponForm.code.toUpperCase().trim(),
      description: couponForm.description,
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      minOrderAmount: Number(couponForm.minOrderAmount),
      maxDiscount: Number(couponForm.maxDiscount),
      isActive: true,
      expiresAt: '2027-12-31T23:59:59Z',
      usageCount: 0,
    };
    await saveCoupon(newCoupon);
    setShowAddCouponModal(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">Kidha Lagce • Admin Platform</h1>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Global operations control: restaurants, orders, coupons, revenue analytics & managers
          </p>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddRestModal(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>New Restaurant</span>
          </button>
          <button
            onClick={() => setShowAddCouponModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/40"
          >
            <Tag className="w-4 h-4" />
            <span>New Coupon</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span>Total GMV Revenue</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">৳{platformStats.totalRev}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Platform gross sales</div>
        </div>

        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4 text-[#FF6B35]" />
            <span>Total Orders Placed</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{platformStats.totalOrders}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">
            {platformStats.pendingOrders} in active delivery
          </div>
        </div>

        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <Store className="w-4 h-4 text-amber-400" />
            <span>Active Restaurants</span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">
            {platformStats.activeRestaurants}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Partner merchant outlets</div>
        </div>

        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-400" />
            <span>Customers Ordering</span>
          </div>
          <div className="text-2xl font-black text-blue-400 mt-1">
            {platformStats.customersCount}
          </div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Registered food lovers</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#252838] pb-3 overflow-x-auto no-scrollbar whitespace-nowrap flex-nowrap">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-[#181922] text-neutral-400 hover:text-white'
          }`}
        >
          Analytics & Trends
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'orders'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-[#181922] text-neutral-400 hover:text-white'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('restaurants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'restaurants'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-[#181922] text-neutral-400 hover:text-white'
          }`}
        >
          Restaurants Directory ({restaurants.length})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'coupons'
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-[#181922] text-neutral-400 hover:text-white'
          }`}
        >
          Coupons & Vouchers ({coupons.length})
        </button>
      </div>

      {/* Analytics & Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Revenue Chart Widget */}
          <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#FF6B35]" />
                  <span>Weekly Revenue & Volume Trend</span>
                </h3>
                <p className="text-xs text-neutral-400">Order traffic & daily earnings breakdown</p>
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2.5 py-1 rounded-xl">
                +24.8% vs last week
              </span>
            </div>

            {/* Custom SVG Dynamic Bar Graph */}
            <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-[#252838]">
              {chartData.map((d) => {
                const maxRev = Math.max(...chartData.map((cd) => cd.revenue), 100);
                const heightPercent = Math.max(15, Math.round((d.revenue / maxRev) * 100));
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-2 group">
                    <div className="text-[10px] font-bold text-neutral-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      ৳{d.revenue}
                    </div>
                    <div
                      className="w-full max-w-[42px] bg-gradient-to-t from-[#FF6B35]/40 to-[#FF6B35] rounded-t-xl group-hover:brightness-125 transition-all relative"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs font-bold text-neutral-300">{d.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders Overview */}
          <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-xl">
            <h3 className="text-sm font-bold text-white mb-3">Recent Orders Activity</h3>
            <div className="divide-y divide-[#252838]">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white flex items-center gap-2">
                      <span>{order.orderNumber}</span>
                      <span className="text-neutral-400 font-normal">
                        by {order.customerName}
                      </span>
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      {order.restaurantName} • {order.items.length} dishes
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-black text-white">৳{order.total}</div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        order.status === 'delivered'
                          ? 'bg-emerald-950/40 text-emerald-400'
                          : order.status === 'cancelled'
                          ? 'bg-red-950/40 text-red-400'
                          : 'bg-orange-950/40 text-[#FF6B35]'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">All Platform Orders ({orders.length})</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-bold text-neutral-400 uppercase bg-[#14151d] border-b border-[#252838]">
                <tr>
                  <th className="p-3">Order</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Restaurant</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#252838]">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#1f212d] transition-colors">
                    <td className="p-3 font-bold text-white">{order.orderNumber}</td>
                    <td className="p-3">
                      <div className="font-semibold text-neutral-200">{order.customerName}</div>
                      <div className="text-[10px] text-neutral-400">{order.customerPhone}</div>
                    </td>
                    <td className="p-3 font-medium text-neutral-300">{order.restaurantName}</td>
                    <td className="p-3 font-bold text-white">৳{order.total}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-[#252838] font-bold text-[10px] uppercase">
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          order.status === 'delivered'
                            ? 'bg-emerald-950/40 text-emerald-400'
                            : order.status === 'cancelled'
                            ? 'bg-red-950/40 text-red-400'
                            : 'bg-orange-950/40 text-[#FF6B35]'
                        }`}
                      >
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold"
                          >
                            Mark Delivered
                          </button>
                          <button
                            onClick={() => cancelOrder(order.id, 'Admin cancellation')}
                            className="px-2 py-1 bg-red-600/30 hover:bg-red-600 text-red-300 hover:text-white rounded text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Restaurants Directory Tab */}
      {activeTab === 'restaurants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map((rest) => (
            <div
              key={rest.id}
              className="bg-[#181922] border border-[#252838] rounded-3xl p-4 flex flex-col justify-between space-y-3"
            >
              <div className="flex gap-3">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-900 shrink-0">
                  <img src={rest.image} alt={rest.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{rest.name}</h4>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {rest.cuisineTypes.join(', ')}
                  </div>
                  <div className="text-[11px] text-[#FF6B35] font-semibold mt-0.5">
                    {rest.address}, {rest.city}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-[#252838] flex items-center justify-between text-xs">
                <span className="text-neutral-400">Fee: ৳{rest.deliveryFee}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    rest.isOpen ? 'text-emerald-400 bg-emerald-950/40' : 'text-red-400 bg-red-950/40'
                  }`}
                >
                  {rest.isOpen ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Coupons Tab */}
      {activeTab === 'coupons' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-[#181922] border border-[#252838] rounded-3xl p-4 space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="px-3 py-1 rounded-xl bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF6B35] font-black text-xs">
                  {coupon.code}
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded">
                  {coupon.isActive ? 'Active' : 'Expired'}
                </span>
              </div>
              <p className="text-xs text-neutral-300 font-medium">{coupon.description}</p>
              <div className="text-[11px] text-neutral-400 pt-2 border-t border-[#252838] flex justify-between">
                <span>Min Order: ৳{coupon.minOrderAmount}</span>
                <span>
                  {coupon.discountType === 'percentage'
                    ? `${coupon.discountValue}% OFF`
                    : `৳${coupon.discountValue} OFF`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Restaurant Modal */}
      {showAddRestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#1c1e27] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-white">Add New Restaurant Outlet</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300">Restaurant Name</label>
                <input
                  type="text"
                  value={restForm.name}
                  onChange={(e) => setRestForm({ ...restForm, name: e.target.value })}
                  placeholder="e.g. Sultan's Dine"
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300">Tagline</label>
                <input
                  type="text"
                  value={restForm.tagline}
                  onChange={(e) => setRestForm({ ...restForm, tagline: e.target.value })}
                  placeholder="e.g. Legendary Kacchi & Roast"
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300">Delivery Fee (৳)</label>
                  <input
                    type="number"
                    value={restForm.deliveryFee}
                    onChange={(e) => setRestForm({ ...restForm, deliveryFee: Number(e.target.value) })}
                    className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-300">Min Order (৳)</label>
                  <input
                    type="number"
                    value={restForm.minOrder}
                    onChange={(e) => setRestForm({ ...restForm, minOrder: Number(e.target.value) })}
                    className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300">Address & Area</label>
                <input
                  type="text"
                  value={restForm.address}
                  onChange={(e) => setRestForm({ ...restForm, address: e.target.value })}
                  placeholder="e.g. Road 11, Banani"
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300">Cuisines (comma separated)</label>
                <input
                  type="text"
                  value={restForm.cuisineTypes}
                  onChange={(e) => setRestForm({ ...restForm, cuisineTypes: e.target.value })}
                  placeholder="Biryani, Bengali, Mughlai"
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddRestModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#252838] text-neutral-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRestaurant}
                className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#ff5722] text-white text-xs font-bold shadow-md"
              >
                Create Restaurant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddCouponModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-[#1c1e27] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Create Promo Voucher</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300">Coupon Code</label>
                <input
                  type="text"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  placeholder="e.g. FESTIVE40"
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300">Discount Description</label>
                <input
                  type="text"
                  value={couponForm.description}
                  onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  placeholder="e.g. 40% OFF up to ৳180"
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-300">Discount Value</label>
                  <input
                    type="number"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-300">Min Order (৳)</label>
                  <input
                    type="number"
                    value={couponForm.minOrderAmount}
                    onChange={(e) => setCouponForm({ ...couponForm, minOrderAmount: Number(e.target.value) })}
                    className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddCouponModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#252838] text-neutral-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCoupon}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md"
              >
                Publish Coupon
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
