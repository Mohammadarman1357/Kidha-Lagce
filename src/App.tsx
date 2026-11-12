/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/navigation/Header';
import { BottomNav } from './components/navigation/BottomNav';
import { SplashScreen } from './components/views/SplashScreen';
import { CustomerHomeView } from './components/views/CustomerHomeView';
import { RestaurantDetailView } from './components/views/RestaurantDetailView';
import { LiveOrderTrackingView } from './components/views/LiveOrderTrackingView';
import { CustomerOrdersView } from './components/views/CustomerOrdersView';
import { FavoritesView } from './components/views/FavoritesView';
import { NotificationsView } from './components/views/NotificationsView';
import { ProfileView } from './components/views/ProfileView';
import { ManagerDashboard } from './components/views/ManagerDashboard';
import { AdminDashboard } from './components/views/AdminDashboard';
import { RiderAppView } from './components/views/RiderAppView';
import { CapacitorGuideView } from './components/views/CapacitorGuideView';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/modals/AuthModal';
import { AddressModal } from './components/modals/AddressModal';
import { ConflictCartModal } from './components/modals/ConflictCartModal';
import { Restaurant, Order } from './types';
import { listenRestaurants } from './services/foodDeliveryService';
import { INITIAL_RESTAURANTS } from './data/mockData';
import { Wifi, Battery, WifiOff, Sparkles, Flame } from 'lucide-react';

const FAVORITES_STORAGE_KEY = 'kidha_lagce_favs_v1';
const SPLASH_SEEN_KEY = 'kidha_lagce_splash_seen_v1';

const AppContent: React.FC = () => {
  const { role, isConnected } = useAuth();
  const { applyCoupon } = useCart();

  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return localStorage.getItem(SPLASH_SEEN_KEY) !== 'true';
    } catch {
      return true;
    }
  });

  const [restaurants, setRestaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [activeTab, setActiveTab] = useState<string>('delivery');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['rest-kacchi-bhai', 'rest-burger-lab'];
    } catch {
      return ['rest-kacchi-bhai', 'rest-burger-lab'];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isAndroidView, setIsAndroidView] = useState(false);

  // Sync favorites
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    } catch (e) {
      console.warn('Storage sync failed:', e);
    }
  }, [favorites]);

  const toggleFavorite = (restId: string) => {
    setFavorites((prev) =>
      prev.includes(restId) ? prev.filter((id) => id !== restId) : [...prev, restId]
    );
  };

  // Real-time listener for restaurants
  useEffect(() => {
    const unsub = listenRestaurants((list) => {
      setRestaurants(list);
    });
    return () => unsub();
  }, []);

  const handleSelectRestaurant = (rest: Restaurant) => {
    setSelectedRestaurant(rest);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderPlaced = (order: Order) => {
    setTrackingOrder(order);
    setActiveTab('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReorder = (order: Order) => {
    const rest = restaurants.find((r) => r.id === order.restaurantId);
    if (rest) {
      setSelectedRestaurant(rest);
      setTrackingOrder(null);
      setActiveTab('delivery');
    }
  };

  const handleDismissSplash = () => {
    setShowSplash(false);
    try {
      localStorage.setItem(SPLASH_SEEN_KEY, 'true');
    } catch {}
  };

  const handleApplyBannerPromo = (code: string) => {
    setIsCartOpen(true);
  };

  // Main view routing
  const renderMainContent = () => {
    if (role === 'admin') {
      return <AdminDashboard restaurants={restaurants} />;
    }

    if (role === 'manager') {
      return <ManagerDashboard restaurants={restaurants} />;
    }

    if (role === 'rider') {
      return <RiderAppView />;
    }

    // Customer Views
    if (trackingOrder) {
      return (
        <LiveOrderTrackingView
          order={trackingOrder}
          onBack={() => setTrackingOrder(null)}
          onReorder={handleReorder}
        />
      );
    }

    if (selectedRestaurant) {
      return (
        <RestaurantDetailView
          restaurant={selectedRestaurant}
          onBack={() => setSelectedRestaurant(null)}
          onOpenCart={() => setIsCartOpen(true)}
        />
      );
    }

    if (activeTab === 'orders') {
      return (
        <CustomerOrdersView
          onSelectOrder={(ord) => setTrackingOrder(ord)}
          onReorder={handleReorder}
        />
      );
    }

    if (activeTab === 'favorites') {
      return (
        <FavoritesView
          favoriteIds={favorites}
          restaurants={restaurants}
          onSelectRestaurant={handleSelectRestaurant}
          onToggleFavorite={toggleFavorite}
          onExplore={() => setActiveTab('delivery')}
        />
      );
    }

    if (activeTab === 'notifications') {
      return (
        <NotificationsView
          onApplyCoupon={handleApplyBannerPromo}
          onTrackOrder={() => setActiveTab('orders')}
        />
      );
    }

    if (activeTab === 'profile') {
      return (
        <ProfileView
          onOpenAddressModal={() => setIsAddressModalOpen(true)}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onNavigateTab={setActiveTab}
        />
      );
    }

    if (activeTab === 'android-info') {
      return <CapacitorGuideView />;
    }

    return (
      <CustomerHomeView
        restaurants={restaurants}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSelectRestaurant={handleSelectRestaurant}
        onApplyBannerPromo={handleApplyBannerPromo}
        favorites={favorites}
        onToggleFavorite={toggleFavorite}
      />
    );
  };

  return (
    <div
      className={`min-h-screen bg-[#0c0d12] text-neutral-100 flex flex-col font-sans transition-all selection:bg-[#FF6B35] selection:text-white ${
        isAndroidView ? 'py-0 sm:py-8 items-center justify-center bg-black/95' : ''
      }`}
    >
      {/* Optional First-Time Splash Screen */}
      {showSplash && <SplashScreen onDismiss={handleDismissSplash} />}

      {/* Android Device Mockup Shell (Adaptive: full-screen on mobile, phone shell on desktop) */}
      <div
        className={
          isAndroidView
            ? 'w-full sm:max-w-[430px] sm:min-h-[850px] bg-[#0f1015] sm:rounded-[48px] sm:border-[10px] sm:border-[#222432] sm:shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col relative min-h-screen sm:min-h-[850px]'
            : 'w-full flex-1 flex flex-col min-h-screen'
        }
      >
        {/* Android Native Status Bar Simulation (Desktop Simulator Only) */}
        {isAndroidView && (
          <div className="hidden sm:flex bg-[#121318] px-6 py-2 items-center justify-between text-[11px] text-neutral-400 font-bold border-b border-[#20222f] select-none">
            <span>12:45</span>
            {/* Camera Punch Hole */}
            <div className="w-4 h-4 rounded-full bg-black border border-[#2b2d3d]" />
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Global Header */}
        {(!selectedRestaurant || role !== 'customer') && !trackingOrder && (
          <Header
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isAndroidView={isAndroidView}
            setIsAndroidView={setIsAndroidView}
            favoriteCount={favorites.length}
          />
        )}

        {/* Connection Notice if client offline */}
        {!isConnected && (
          <div className="bg-amber-950/60 border-b border-amber-500/30 px-4 py-2 text-center text-xs text-amber-300 flex items-center justify-center gap-2">
            <WifiOff className="w-3.5 h-3.5" />
            <span>Working in offline/hybrid mode. Data updates cached locally.</span>
          </div>
        )}

        {/* Main Body Content Container with safe bottom navigation padding */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-2 sm:pt-4 pb-24 sm:pb-8">
          {renderMainContent()}
        </main>

        {/* Footer with Developer Attribution */}
        {(!selectedRestaurant || role !== 'customer') && !trackingOrder && (
          <footer className="w-full py-6 px-4 text-center border-t border-[#1e202c] mt-auto">
            <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs text-neutral-400 font-medium">
              <span className="font-bold text-white">Kidha Lagce (খিদা লাগছে)</span>
              <span className="text-neutral-600">•</span>
              <span>Developed by <strong className="text-[#FF6B35] font-black">Mohammad Arman</strong></span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Your Food, Your Cravings! • Full-Stack Android & Web Food Delivery Platform
            </p>
          </footer>
        )}

        {/* Mobile Bottom Navigation for all roles */}
        {!selectedRestaurant && !trackingOrder && (
          <BottomNav
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}
      </div>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderPlaced={handleOrderPlaced}
        onOpenAddressModal={() => setIsAddressModalOpen(true)}
      />

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <AddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} />
      <ConflictCartModal />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}
