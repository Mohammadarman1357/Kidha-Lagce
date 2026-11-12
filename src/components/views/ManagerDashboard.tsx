/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed,
  DollarSign,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Power,
  Edit2,
  Trash2,
  Search,
  ChevronDown,
  Bell,
  Eye,
  Filter,
} from 'lucide-react';
import { Restaurant, MenuItem, Order, OrderStatus } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  listenRestaurantOrders,
  listenMenuItems,
  updateOrderStatus,
  saveRestaurant,
  saveMenuItem,
} from '../../services/foodDeliveryService';
import { FOOD_CATEGORIES } from '../../data/mockData';
import { VegIcon } from '../common/VegIcon';

interface ManagerDashboardProps {
  restaurants: Restaurant[];
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ restaurants }) => {
  const { profile, setAssignedRestaurant } = useAuth();
  
  // Assigned restaurant ID or default to first restaurant
  const assignedId = profile?.assignedRestaurantId || restaurants[0]?.id || 'rest-kacchi-bhai';
  const currentRestaurant = restaurants.find((r) => r.id === assignedId) || restaurants[0];

  const [activeTab, setActiveTab] = useState<'kds' | 'menu' | 'settings'>('kds');
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orderFilter, setOrderFilter] = useState<'all' | 'active' | 'completed'>('active');
  const [showAddMenuModal, setShowAddMenuModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // New menu item form state
  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: 350,
    categoryId: 'cat-biryani',
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
    isVeg: false,
    isAvailable: true,
  });

  // Listen to orders for this restaurant in real-time
  useEffect(() => {
    if (!currentRestaurant) return;
    const unsubOrders = listenRestaurantOrders(currentRestaurant.id, (list) => {
      setOrders(list);
    });
    const unsubMenu = listenMenuItems(currentRestaurant.id, (items) => {
      setMenuItems(items);
    });

    return () => {
      unsubOrders();
      unsubMenu();
    };
  }, [currentRestaurant?.id]);

  // Statistics
  const stats = useMemo(() => {
    const totalRev = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.subtotal, 0);
    const pendingCount = orders.filter((o) =>
      ['placed', 'confirmed', 'preparing', 'ready_for_pickup'].includes(o.status)
    ).length;
    const completedCount = orders.filter((o) => o.status === 'delivered').length;
    const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

    return { totalRev, pendingCount, completedCount, cancelledCount };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    if (orderFilter === 'active') {
      return orders.filter((o) =>
        ['placed', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery'].includes(
          o.status
        )
      );
    }
    if (orderFilter === 'completed') {
      return orders.filter((o) => ['delivered', 'cancelled'].includes(o.status));
    }
    return orders;
  }, [orders, orderFilter]);

  const toggleRestaurantOpen = async () => {
    if (!currentRestaurant) return;
    await saveRestaurant({
      ...currentRestaurant,
      isOpen: !currentRestaurant.isOpen,
    });
  };

  const handleUpdateStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (e) {
      console.error('Update status failed:', e);
    }
  };

  const toggleItemAvailability = async (item: MenuItem) => {
    await saveMenuItem({
      ...item,
      isAvailable: !item.isAvailable,
    });
  };

  const handleSaveMenuItem = async () => {
    if (!currentRestaurant || !itemForm.name) return;
    const newItem: MenuItem = {
      id: editingItem?.id || `item-${Date.now()}`,
      restaurantId: currentRestaurant.id,
      name: itemForm.name,
      description: itemForm.description,
      price: Number(itemForm.price),
      categoryId: itemForm.categoryId,
      image: itemForm.image,
      isVeg: itemForm.isVeg,
      isAvailable: itemForm.isAvailable,
      rating: 4.8,
      createdAt: new Date().toISOString(),
    };
    await saveMenuItem(newItem);
    setShowAddMenuModal(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Banner & Restaurant Switcher */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-neutral-900 border border-[#2d3042] shrink-0">
            <img
              src={currentRestaurant.image}
              alt={currentRestaurant.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {currentRestaurant.name}
              </h1>
              <span
                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                  currentRestaurant.isOpen
                    ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40'
                    : 'bg-red-950/40 text-red-400 border-red-500/40'
                }`}
              >
                {currentRestaurant.isOpen ? 'Accepting Orders' : 'Store Offline'}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Kidha Lagce • Manager Portal • {currentRestaurant.address}, {currentRestaurant.city}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Restaurant switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400 hidden sm:inline">Outlet:</span>
            <select
              value={currentRestaurant.id}
              onChange={(e) => setAssignedRestaurant(e.target.value)}
              className="bg-[#222432] border border-[#2d3042] rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
            >
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Online/Offline */}
          <button
            onClick={toggleRestaurantOpen}
            className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-2 border transition-all ${
              currentRestaurant.isOpen
                ? 'bg-red-950/30 border-red-500/50 text-red-400 hover:bg-red-900/40'
                : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/40'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{currentRestaurant.isOpen ? 'Go Offline' : 'Open Store'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-[#FF6B35]" />
            <span>Outlet Revenue</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">৳{stats.totalRev}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">From delivered & active orders</div>
        </div>

        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Live Kitchen Orders</span>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-1">{stats.pendingCount}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Need immediate prep</div>
        </div>

        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Delivered Orders</span>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{stats.completedCount}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Completed successfully</div>
        </div>

        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-4">
          <div className="text-xs text-neutral-400 font-semibold flex items-center gap-1.5">
            <UtensilsCrossed className="w-4 h-4 text-purple-400" />
            <span>Menu Items</span>
          </div>
          <div className="text-2xl font-black text-white mt-1">{menuItems.length}</div>
          <div className="text-[10px] text-neutral-500 mt-0.5">Active catalogue dishes</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#252838] pb-3 overflow-x-auto no-scrollbar whitespace-nowrap flex-nowrap">
        <button
          onClick={() => setActiveTab('kds')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'kds'
              ? 'bg-[#FF6B35] text-white shadow-md'
              : 'bg-[#181922] text-neutral-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Kitchen Live Display (KDS)</span>
          {stats.pendingCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-black text-white text-[10px] font-black flex items-center justify-center">
              {stats.pendingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('menu')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'menu'
              ? 'bg-[#FF6B35] text-white shadow-md'
              : 'bg-[#181922] text-neutral-400 hover:text-white'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Menu Catalogue ({menuItems.length})</span>
        </button>
      </div>

      {/* KDS (Kitchen Display System) Tab */}
      {activeTab === 'kds' && (
        <div className="space-y-4">
          {/* Filter Pills */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setOrderFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  orderFilter === 'active'
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-[#181922] text-neutral-400'
                }`}
              >
                Active Kitchen Orders ({stats.pendingCount})
              </button>
              <button
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  orderFilter === 'all'
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-[#181922] text-neutral-400'
                }`}
              >
                All Orders ({orders.length})
              </button>
              <button
                onClick={() => setOrderFilter('completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                  orderFilter === 'completed'
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-[#181922] text-neutral-400'
                }`}
              >
                Completed & Cancelled
              </button>
            </div>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => {
                return (
                  <div
                    key={order.id}
                    className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-lg flex flex-col justify-between space-y-4 hover:border-[#3a3d52] transition-all"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-xs font-black text-white flex items-center gap-2">
                            <span>{order.orderNumber}</span>
                            <span className="text-[10px] text-neutral-400">
                              {new Date(order.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="text-xs font-bold text-neutral-300 mt-0.5">
                            Customer: {order.customerName}
                          </div>
                          <div className="text-[11px] text-neutral-400">
                            Phone: {order.customerPhone}
                          </div>
                        </div>

                        {/* Order status tag */}
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'placed'
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                              : order.status === 'preparing'
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                              : order.status === 'ready_for_pickup'
                              ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                              : order.status === 'out_for_delivery'
                              ? 'bg-orange-500/20 text-[#FF6B35] border border-orange-500/40'
                              : order.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>

                      {/* Items to Cook */}
                      <div className="mt-3 bg-[#13141c] p-3 rounded-2xl border border-[#212330] space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="text-xs">
                            <div className="flex items-center justify-between font-bold text-white">
                              <span>
                                {item.quantity}x {item.name}
                              </span>
                              <span>৳{item.totalPrice * item.quantity}</span>
                            </div>
                            {item.selectedOptions?.map((o) => (
                              <div
                                key={o.choiceId}
                                className="text-[10px] text-neutral-400 pl-4"
                              >
                                • {o.choiceName}
                              </div>
                            ))}
                            {item.specialInstructions && (
                              <div className="text-[10px] text-amber-400 italic pl-4">
                                Note: {item.specialInstructions}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Special order note */}
                      {order.deliveryInstructions && (
                        <div className="mt-2 text-[11px] text-neutral-400">
                          Instructions: <span className="text-neutral-300">{order.deliveryInstructions}</span>
                        </div>
                      )}

                      <div className="mt-2 text-xs font-bold text-neutral-300 flex justify-between">
                        <span>Payment ({order.paymentMethod.toUpperCase()}):</span>
                        <span className="text-[#FF6B35]">৳{order.total}</span>
                      </div>
                    </div>

                    {/* Step-by-Step Action Transition Buttons */}
                    <div className="pt-3 border-t border-[#252838] flex flex-col gap-2">
                      {order.status === 'placed' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'confirmed')}
                          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition-all"
                        >
                          Accept Order
                        </button>
                      )}

                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                          className="w-full py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#ff5722] text-white font-black text-xs shadow-md transition-all"
                        >
                          Start Cooking (Preparing)
                        </button>
                      )}

                      {order.status === 'preparing' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'ready_for_pickup')}
                          className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs shadow-md transition-all"
                        >
                          Food Ready for Pickup
                        </button>
                      )}

                      {order.status === 'ready_for_pickup' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'out_for_delivery')}
                          className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs shadow-md transition-all"
                        >
                          Handed to Rider (Out for Delivery)
                        </button>
                      )}

                      {order.status === 'out_for_delivery' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition-all"
                        >
                          Mark as Delivered
                        </button>
                      )}

                      {order.status === 'delivered' && (
                        <div className="text-center text-xs font-bold text-emerald-400 py-1">
                          ✓ Completed & Delivered
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#181922] border border-[#252838] rounded-3xl p-12 text-center">
              <div className="text-4xl mb-3">🍳</div>
              <h3 className="font-bold text-white text-base">No active kitchen orders</h3>
              <p className="text-xs text-neutral-400 mt-1">
                New incoming orders will appear here in real-time with 1-click status advancement.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Menu Management Tab */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white">Food Dishes & Availability</h2>
              <p className="text-xs text-neutral-400">
                Mark out-of-stock items, update prices or add new dishes
              </p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setItemForm({
                  name: '',
                  description: '',
                  price: 350,
                  categoryId: 'cat-biryani',
                  image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop&q=80',
                  isVeg: false,
                  isAvailable: true,
                });
                setShowAddMenuModal(true);
              }}
              className="px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#ff5722] text-white font-black text-xs flex items-center gap-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Food Item</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#181922] border border-[#252838] rounded-3xl p-4 flex gap-3 items-start justify-between"
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-neutral-900 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 pr-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    <VegIcon isVeg={item.isVeg} size={14} />
                    <span className="text-[10px] text-neutral-400 font-bold uppercase">
                      {FOOD_CATEGORIES.find((c) => c.id === item.categoryId)?.name || 'Dish'}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white line-clamp-1">{item.name}</h4>
                  <div className="text-xs font-black text-[#FF6B35] mt-0.5">৳{item.price}</div>

                  {/* Stock Toggle Button */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => toggleItemAvailability(item)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${
                        item.isAvailable
                          ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                          : 'bg-red-950/40 border-red-500/50 text-red-400'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock (Available)' : 'Sold Out'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Menu Item Modal */}
      {showAddMenuModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#1c1e27] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">Add New Dish to Menu</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-neutral-300">Dish Name</label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  placeholder="e.g. Royal Mutton Biryani Special"
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300">Price (BDT ৳)</label>
                <input
                  type="number"
                  value={itemForm.price}
                  onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })}
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300">Category</label>
                <select
                  value={itemForm.categoryId}
                  onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                >
                  {FOOD_CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-300">Description</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  rows={2}
                  placeholder="Describe ingredients, cooking method, portions..."
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs text-white font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.isVeg}
                    onChange={(e) => setItemForm({ ...itemForm, isVeg: e.target.checked })}
                    className="accent-emerald-500"
                  />
                  <span>Pure Vegetarian</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-white font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={itemForm.isAvailable}
                    onChange={(e) => setItemForm({ ...itemForm, isAvailable: e.target.checked })}
                    className="accent-[#FF6B35]"
                  />
                  <span>Available In Stock</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAddMenuModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#252838] text-neutral-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveMenuItem}
                className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#ff5722] text-white text-xs font-bold shadow-md"
              >
                Save Food Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
