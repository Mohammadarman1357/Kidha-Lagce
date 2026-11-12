/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShoppingBag,
  Clock,
  User,
  Flame,
  Heart,
  Bike,
  Navigation,
  DollarSign,
  UtensilsCrossed,
  Store,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCart: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCart,
}) => {
  const { itemCount } = useCart();
  const { role } = useAuth();

  // Role-specific bottom tab destinations
  const getTabs = () => {
    if (role === 'rider') {
      return [
        { id: 'radar', label: 'Radar', icon: Navigation },
        { id: 'active', label: 'Active Trip', icon: Bike },
        { id: 'earnings', label: 'Earnings', icon: DollarSign },
        { id: 'profile', label: 'Profile', icon: User },
      ];
    }

    if (role === 'manager') {
      return [
        { id: 'kds', label: 'Kitchen KDS', icon: Clock },
        { id: 'menu', label: 'Menu', icon: UtensilsCrossed },
        { id: 'inventory', label: 'Inventory', icon: Store },
        { id: 'profile', label: 'Account', icon: User },
      ];
    }

    if (role === 'admin') {
      return [
        { id: 'overview', label: 'Analytics', icon: TrendingUp },
        { id: 'orders', label: 'All Orders', icon: ShoppingBag },
        { id: 'restaurants', label: 'Outlets', icon: Store },
        { id: 'coupons', label: 'Coupons', icon: Tag },
      ];
    }

    // Default: Customer
    return [
      { id: 'delivery', label: 'Food', icon: Flame },
      { id: 'favorites', label: 'Favorites', icon: Heart },
      { id: 'cart', label: 'Cart', icon: ShoppingBag, badge: itemCount },
      { id: 'orders', label: 'Orders', icon: Clock },
      { id: 'profile', label: 'Profile', icon: User },
    ];
  };

  const tabs = getTabs();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#101117]/95 backdrop-blur-lg border-t border-[#232535] px-2 py-1.5 md:hidden safe-area-bottom"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'cart') {
                  onOpenCart();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition-all relative min-h-[44px] min-w-[44px] cursor-pointer ${
                isActive ? 'text-[#FF6B35]' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#FF6B35] text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] mt-0.5 ${isActive ? 'font-black text-[#FF6B35]' : 'font-medium'}`}>
                {tab.label}
              </span>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#FF6B35] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
