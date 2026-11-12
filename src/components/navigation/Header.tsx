/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  MapPin,
  Search,
  ShoppingCart,
  ChevronDown,
  User,
  Shield,
  UtensilsCrossed,
  Smartphone,
  Monitor,
  LogOut,
  Flame,
  CheckCircle2,
  Heart,
  Bell,
  Mic,
  Bike,
  Wallet,
  Download,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { POPULAR_LOCATIONS } from '../../data/mockData';
import { VoiceSearchModal } from '../common/VoiceSearchModal';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
  onOpenCart: () => void;
  onOpenAuthModal: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAndroidView: boolean;
  setIsAndroidView: (val: boolean) => void;
  favoriteCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  searchQuery,
  onOpenCart,
  onOpenAuthModal,
  activeTab,
  setActiveTab,
  isAndroidView,
  setIsAndroidView,
  favoriteCount = 0,
}) => {
  const { user, profile, role, switchRole, logout, activeAddress, setActiveAddress, walletBalance } = useAuth();
  const { itemCount, total } = useCart();
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#101117]/95 backdrop-blur-md border-b border-[#232535] px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Brand & Location */}
        <div className="flex items-center gap-4 lg:gap-6">
          <div
            onClick={() => setActiveTab('delivery')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#f4511e] flex items-center justify-center shadow-lg shadow-orange-950/50 group-hover:scale-105 transition-transform">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white flex items-center gap-1 leading-none">
                KIDHA LAGCE<span className="text-[#FF6B35]">.</span>
              </span>
              <span className="text-[10px] font-bold text-[#FF6B35] tracking-wide block mt-0.5">
                খিদা লাগছে <span className="text-neutral-400 font-medium hidden sm:inline">• Your Food, Your Cravings</span>
              </span>
            </div>
          </div>

          {/* Location Picker */}
          <div className="relative">
            <button
              onClick={() => setShowLocationModal(!showLocationModal)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1b24] hover:bg-[#232532] border border-[#2b2d3d] text-left transition-colors max-w-[190px] sm:max-w-[260px]"
            >
              <MapPin className="w-4 h-4 text-[#FF6B35] shrink-0" />
              <div className="overflow-hidden">
                <div className="text-[10px] font-semibold text-neutral-400 flex items-center gap-1 leading-none">
                  Deliver to
                  <ChevronDown className="w-3 h-3 text-neutral-500" />
                </div>
                <div className="text-xs font-bold text-white truncate leading-tight mt-0.5">
                  {activeAddress?.area || 'Banani'}, {activeAddress?.city || 'Dhaka'}
                </div>
              </div>
            </button>

            {/* Location Dropdown Modal */}
            {showLocationModal && (
              <div className="absolute left-0 mt-2 w-72 sm:w-80 rounded-3xl bg-[#1a1b24] border border-[#2d3042] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-xs font-black text-neutral-300 uppercase tracking-wider px-2 py-1 mb-1">
                  Select Delivery Location
                </div>
                <div className="space-y-1">
                  {POPULAR_LOCATIONS.map((loc) => {
                    const isSelected = activeAddress?.area === loc.area;
                    return (
                      <button
                        key={loc.id}
                        onClick={() => {
                          setActiveAddress({
                            id: loc.id,
                            label: loc.area,
                            addressLine: loc.address,
                            area: loc.area,
                            city: loc.city,
                            isDefault: isSelected,
                          });
                          setShowLocationModal(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-2xl text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/40'
                            : 'hover:bg-[#232635] text-neutral-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{loc.area}</div>
                          <div className="text-[11px] text-neutral-400 truncate max-w-[210px]">
                            {loc.address}
                          </div>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-[#FF6B35]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center: Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search for restaurants, biryani, burgers, pizza..."
              className="w-full bg-[#1a1b24] border border-[#2b2d3d] rounded-2xl pl-10 pr-16 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35] transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="text-[11px] text-neutral-400 hover:text-white mr-1"
                >
                  Clear
                </button>
              )}
              <button
                onClick={() => setShowVoiceModal(true)}
                className="p-1 rounded-lg text-[#FF6B35] hover:bg-[#FF6B35]/15 transition-colors"
                title="Search by voice (Web Speech API)"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right: Quick Role Switcher, Android View Toggle, Favorites, Cart & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Role Switcher Pill - 4 Roles */}
          <div className="flex items-center bg-[#1a1b24] p-1 rounded-2xl border border-[#2c2f40]">
            <button
              onClick={() => switchRole('customer')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                role === 'customer'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Customer View"
            >
              <User className="w-3 h-3" />
              <span className="hidden sm:inline">User</span>
            </button>
            <button
              onClick={() => switchRole('manager')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                role === 'manager'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Restaurant Manager Portal"
            >
              <UtensilsCrossed className="w-3 h-3" />
              <span className="hidden sm:inline">Manager</span>
            </button>
            <button
              onClick={() => switchRole('rider')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                role === 'rider'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Delivery Rider Partner Portal"
            >
              <Bike className="w-3 h-3" />
              <span className="hidden sm:inline">Rider</span>
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                role === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Platform Administrator"
            >
              <Shield className="w-3 h-3" />
              <span className="hidden sm:inline">Admin</span>
            </button>
          </div>

          {/* Favorites Button (Desktop) */}
          <button
            onClick={() => setActiveTab('favorites')}
            className={`hidden sm:flex p-2 rounded-xl border transition-all relative ${
              activeTab === 'favorites'
                ? 'bg-red-950/40 border-red-500/50 text-red-500'
                : 'bg-[#1a1b24] border-[#2b2d3d] text-neutral-400 hover:text-white'
            }`}
            title="Favorites"
          >
            <Heart className="w-4 h-4" />
            {favoriteCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-black flex items-center justify-center">
                {favoriteCount}
              </span>
            )}
          </button>

          {/* Notifications Button */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`p-2 rounded-xl border transition-all relative ${
              activeTab === 'notifications'
                ? 'bg-[#FF6B35]/20 border-[#FF6B35]/50 text-[#FF6B35]'
                : 'bg-[#1a1b24] border-[#2b2d3d] text-neutral-400 hover:text-white'
            }`}
            title="Notifications & Offers"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6B35]" />
          </button>

          {/* Android Shell Simulator Toggle */}
          <button
            onClick={() => setIsAndroidView(!isAndroidView)}
            className={`p-2 rounded-xl border transition-all ${
              isAndroidView
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-[#1a1b24] border-[#2b2d3d] text-neutral-400 hover:text-white'
            }`}
            title={isAndroidView ? 'Switch to Full Web layout' : 'Preview Android Phone Shell'}
          >
            {isAndroidView ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          </button>

          {/* Quick APK Button */}
          <button
            onClick={() => setActiveTab('android-info')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
            title="Download Android APK & App Setup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>APK</span>
          </button>

          {/* Quick Wallet Pill (Customer Mode) */}
          {role === 'customer' && (
            <button
              onClick={() => setActiveTab('profile')}
              className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#1a1b24] hover:bg-[#232635] border border-[#2b2d3d] text-xs font-bold text-emerald-400 transition-colors"
              title="Kidha Wallet Balance"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>৳{walletBalance}</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3 py-2 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] hover:brightness-110 text-white font-extrabold text-xs shadow-lg shadow-orange-950/50 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline font-black">
              {itemCount > 0 ? `৳${total}` : 'Cart'}
            </span>
            {itemCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-black text-white text-[11px] font-black flex items-center justify-center -mr-1">
                {itemCount}
              </span>
            )}
          </button>

          {/* Profile / Auth Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-9 h-9 rounded-2xl bg-[#1a1b24] border border-[#2b2d3d] flex items-center justify-center text-white hover:border-[#FF6B35] transition-all overflow-hidden"
            >
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-neutral-300" />
              )}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-3xl bg-[#1a1b24] border border-[#2d3042] shadow-2xl p-2.5 z-50">
                <div className="px-3 py-2 border-b border-[#2d3042] mb-1">
                  <div className="font-extrabold text-sm text-white truncate">
                    {profile?.name || 'Habiba Arman'}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {profile?.email || 'armanhabiba903709@gmail.com'}
                  </div>
                  <div className="mt-1.5 inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF6B35]/20 text-[#FF6B35]">
                    {role} role
                  </div>
                </div>

                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setActiveTab('orders');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#232635] flex items-center gap-2"
                  >
                    <ShoppingCart className="w-3.5 h-3.5 text-[#FF6B35]" />
                    My Food Orders
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('favorites');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#232635] flex items-center gap-2"
                  >
                    <Heart className="w-3.5 h-3.5 text-red-400" />
                    Favorite Outlets
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#232635] flex items-center gap-2"
                  >
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    Profile & Addresses
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('android-info');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-neutral-200 hover:bg-[#232635] flex items-center gap-2"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    Android APK / Capacitor Guide
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                      onOpenAuthModal();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/20 flex items-center gap-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out / Switch Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Input */}
      <div className="mt-2.5 md:hidden">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search dishes or restaurants..."
            className="w-full bg-[#1a1b24] border border-[#2b2d3d] rounded-2xl pl-9 pr-14 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35]"
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-[10px] text-neutral-400 hover:text-white"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowVoiceModal(true)}
              className="p-1 rounded-lg text-[#FF6B35] hover:bg-[#FF6B35]/15 transition-colors"
              title="Search by voice"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Voice Search Modal */}
      {showVoiceModal && (
        <VoiceSearchModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onTranscriptResult={(spoken) => onSearchChange(spoken)}
        />
      )}
    </header>
  );
};
