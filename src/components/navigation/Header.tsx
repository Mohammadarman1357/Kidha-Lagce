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
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { POPULAR_LOCATIONS } from '../../data/mockData';
import { VoiceSearchModal } from '../common/VoiceSearchModal';
import { UserRole } from '../../types';

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
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);

  const roleConfigs: { id: UserRole; label: string; icon: any; color: string; bg: string; desc: string }[] = [
    {
      id: 'customer',
      label: 'Customer',
      icon: User,
      color: 'text-[#FF6B35]',
      bg: 'bg-[#FF6B35]',
      desc: 'Browse food, order, track live & wallet',
    },
    {
      id: 'rider',
      label: 'Delivery Rider',
      icon: Bike,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500',
      desc: 'Accept trips, GPS route navigation & payouts',
    },
    {
      id: 'manager',
      label: 'Restaurant Manager',
      icon: UtensilsCrossed,
      color: 'text-amber-400',
      bg: 'bg-amber-500',
      desc: 'Kitchen KDS, menu catalog & store hours',
    },
    {
      id: 'admin',
      label: 'Platform Admin',
      icon: Shield,
      color: 'text-purple-400',
      bg: 'bg-purple-600',
      desc: 'Global revenue analytics, outlets & coupons',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#101117]/95 backdrop-blur-md border-b border-[#232535] px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand & Location */}
        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
          <div
            onClick={() => setActiveTab('delivery')}
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#f4511e] flex items-center justify-center shadow-lg shadow-orange-950/50 group-hover:scale-105 transition-transform shrink-0">
              <Flame className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="shrink-0">
              <span className="text-sm sm:text-xl font-black tracking-tight text-white flex items-center gap-0.5 leading-none">
                KIDHA<span className="text-[#FF6B35]">.</span>
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-[#FF6B35] tracking-wide block mt-0.5 leading-tight">
                খিদা লাগছে
              </span>
            </div>
          </div>

          {/* Location Picker */}
          <div className="relative min-w-0">
            <button
              onClick={() => setShowLocationModal(!showLocationModal)}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#1a1b24] hover:bg-[#232532] border border-[#2b2d3d] text-left transition-colors max-w-[125px] sm:max-w-[220px]"
            >
              <MapPin className="w-3.5 h-3.5 text-[#FF6B35] shrink-0" />
              <div className="overflow-hidden min-w-0">
                <div className="text-[9px] sm:text-[10px] font-semibold text-neutral-400 flex items-center gap-0.5 leading-none">
                  <span className="truncate">Deliver to</span>
                  <ChevronDown className="w-2.5 h-2.5 text-neutral-500 shrink-0" />
                </div>
                <div className="text-[11px] sm:text-xs font-bold text-white truncate leading-tight mt-0.5">
                  {activeAddress?.area || 'Banani'}
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

        {/* Center: Search Bar (Desktop Only) */}
        <div className="hidden lg:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search restaurants, biryani, burgers, pizza..."
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
                className="p-1 rounded-lg text-[#FF6B35] hover:bg-[#FF6B35]/15 transition-colors cursor-pointer"
                title="Search by voice (Web Speech API)"
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Actions Container */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Mobile Role Switcher Badge */}
          <button
            onClick={() => setShowRoleModal(true)}
            className="md:hidden flex items-center gap-1 px-2 py-1 rounded-xl bg-[#1a1b24] border border-[#2c2f40] text-xs font-bold transition-all cursor-pointer"
            title="Switch User Role"
          >
            {role === 'customer' && (
              <span className="text-[#FF6B35] flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>User</span>
              </span>
            )}
            {role === 'rider' && (
              <span className="text-emerald-400 flex items-center gap-1">
                <Bike className="w-3 h-3" />
                <span>Rider</span>
              </span>
            )}
            {role === 'manager' && (
              <span className="text-amber-400 flex items-center gap-1">
                <UtensilsCrossed className="w-3 h-3" />
                <span>Mgr</span>
              </span>
            )}
            {role === 'admin' && (
              <span className="text-purple-400 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Admin</span>
              </span>
            )}
            <ChevronDown className="w-3 h-3 text-neutral-400" />
          </button>

          {/* Desktop Quick Role Switcher Pill - 4 Roles */}
          <div className="hidden md:flex items-center bg-[#1a1b24] p-1 rounded-2xl border border-[#2c2f40]">
            <button
              onClick={() => switchRole('customer')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                role === 'customer'
                  ? 'bg-[#FF6B35] text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Customer View"
            >
              <User className="w-3 h-3" />
              <span>User</span>
            </button>
            <button
              onClick={() => switchRole('manager')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                role === 'manager'
                  ? 'bg-amber-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Restaurant Manager Portal"
            >
              <UtensilsCrossed className="w-3 h-3" />
              <span>Manager</span>
            </button>
            <button
              onClick={() => switchRole('rider')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                role === 'rider'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Delivery Rider Partner Portal"
            >
              <Bike className="w-3 h-3" />
              <span>Rider</span>
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                role === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Platform Administrator"
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>

          {/* Favorites Button (Desktop Only) */}
          <button
            onClick={() => setActiveTab('favorites')}
            className={`hidden sm:flex p-2 rounded-xl border transition-all relative cursor-pointer ${
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

          {/* Notifications Button (Desktop Only) */}
          <button
            onClick={() => setActiveTab('notifications')}
            className={`hidden sm:flex p-2 rounded-xl border transition-all relative cursor-pointer ${
              activeTab === 'notifications'
                ? 'bg-[#FF6B35]/20 border-[#FF6B35]/50 text-[#FF6B35]'
                : 'bg-[#1a1b24] border-[#2b2d3d] text-neutral-400 hover:text-white'
            }`}
            title="Notifications & Offers"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#FF6B35]" />
          </button>

          {/* Android Shell Simulator Toggle (Desktop Only) */}
          <button
            onClick={() => setIsAndroidView(!isAndroidView)}
            className={`hidden md:flex p-2 rounded-xl border transition-all cursor-pointer ${
              isAndroidView
                ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                : 'bg-[#1a1b24] border-[#2b2d3d] text-neutral-400 hover:text-white'
            }`}
            title={isAndroidView ? 'Switch to Full Web layout' : 'Preview Android Phone Shell'}
          >
            {isAndroidView ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
          </button>

          {/* Quick APK Button (Tablet & Desktop) */}
          <button
            onClick={() => setActiveTab('android-info')}
            className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-md shadow-emerald-950/40 transition-all cursor-pointer"
            title="Download Android APK & App Setup"
          >
            <Download className="w-3.5 h-3.5" />
            <span>APK</span>
          </button>

          {/* Quick Wallet Pill (Customer Mode, Desktop Only) */}
          {role === 'customer' && (
            <button
              onClick={() => setActiveTab('profile')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1a1b24] hover:bg-[#232635] border border-[#2b2d3d] text-xs font-bold text-emerald-400 transition-colors cursor-pointer"
              title="Kidha Wallet Balance"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>৳{walletBalance}</span>
            </button>
          )}

          {/* Cart Button */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] hover:brightness-110 text-white font-black text-xs shadow-lg shadow-orange-950/50 transition-all cursor-pointer shrink-0"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline font-black">
              {itemCount > 0 ? `৳${total}` : 'Cart'}
            </span>
            {itemCount > 0 && (
              <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-black text-white text-[10px] sm:text-[11px] font-black flex items-center justify-center -mr-0.5">
                {itemCount}
              </span>
            )}
          </button>

          {/* Profile / Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl bg-[#1a1b24] border border-[#2b2d3d] flex items-center justify-center text-white hover:border-[#FF6B35] transition-all overflow-hidden cursor-pointer shrink-0"
              title="Open User Menu"
            >
              {profile?.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-neutral-300" />
              )}
            </button>

            {/* Profile Menu Dropdown / Drawer */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 rounded-3xl bg-[#1a1b24] border border-[#2d3042] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-2 border-b border-[#2d3042] mb-1.5">
                  <div className="font-extrabold text-sm text-white truncate">
                    {profile?.name || 'Habiba Arman'}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {profile?.email || 'armanhabiba903709@gmail.com'}
                  </div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="inline-block text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF6B35]/20 text-[#FF6B35]">
                      {role} role
                    </span>
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                      <Wallet className="w-3 h-3" /> ৳{walletBalance}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  {/* Mobile Role Switcher Quick Action */}
                  <div className="md:hidden px-3 py-1.5 rounded-2xl bg-[#121319] border border-[#252838] mb-1">
                    <div className="text-[10px] font-black uppercase text-neutral-400 mb-1">
                      Switch Role
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      {roleConfigs.map((rc) => (
                        <button
                          key={rc.id}
                          onClick={() => {
                            switchRole(rc.id);
                            setShowUserMenu(false);
                          }}
                          className={`px-2 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            role === rc.id
                              ? 'bg-[#FF6B35] text-white'
                              : 'bg-[#181924] text-neutral-300 hover:text-white'
                          }`}
                        >
                          <rc.icon className="w-3 h-3" />
                          <span>{rc.label.split(' ')[0]}</span>
                        </button>
                      ))}
                    </div>
                  </div>

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
                    Profile & Wallet
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('android-info');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-emerald-400 hover:bg-emerald-950/30 flex items-center gap-2"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    Install APK & Source Code
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

      {/* Mobile Search Input Row */}
      <div className="mt-2 lg:hidden">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search restaurants, biryani, burgers..."
            className="w-full bg-[#1a1b24] border border-[#2b2d3d] rounded-2xl pl-9 pr-14 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35]"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-[10px] text-neutral-400 hover:text-white px-1.5"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setShowVoiceModal(true)}
              className="p-1 rounded-lg text-[#FF6B35] hover:bg-[#FF6B35]/15 transition-colors cursor-pointer"
              title="Search by voice"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Role Switcher Modal / Bottom Sheet */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="w-full sm:max-w-md bg-[#161720] border-t sm:border border-[#2d3042] rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-[#252838]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                <h3 className="font-black text-white text-base">Select Platform Role</h3>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-1.5 rounded-xl bg-[#222432] text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-400 mt-2">
              Kidha Lagce includes dedicated workspaces for each platform stakeholder:
            </p>

            <div className="mt-3.5 space-y-2">
              {roleConfigs.map((rc) => {
                const isSelected = role === rc.id;
                const Icon = rc.icon;
                return (
                  <button
                    key={rc.id}
                    onClick={() => {
                      switchRole(rc.id);
                      setShowRoleModal(false);
                    }}
                    className={`w-full p-3 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1f2130] border-[#FF6B35] ring-2 ring-[#FF6B35]/20 shadow-lg'
                        : 'bg-[#121319] border-[#252838] hover:border-[#34384d]'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? rc.bg + ' text-white' : 'bg-[#1e202d] ' + rc.color
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-white">{rc.label}</span>
                        {isSelected && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#FF6B35] text-white">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-0.5 leading-snug">{rc.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
