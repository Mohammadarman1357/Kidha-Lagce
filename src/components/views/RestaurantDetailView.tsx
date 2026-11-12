/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  Bike,
  Info,
  Search,
  ShoppingCart,
  Share2,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { Restaurant, MenuItem, Review } from '../../types';
import { MenuItemCard } from '../cards/MenuItemCard';
import { listenMenuItems, listenReviews } from '../../services/foodDeliveryService';
import { useCart } from '../../context/CartContext';
import { FOOD_CATEGORIES } from '../../data/mockData';

interface RestaurantDetailViewProps {
  restaurant: Restaurant;
  onBack: () => void;
  onOpenCart: () => void;
}

export const RestaurantDetailView: React.FC<RestaurantDetailViewProps> = ({
  restaurant,
  onBack,
  onOpenCart,
}) => {
  const { itemCount, total, restaurantId: cartRestId } = useCart();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isVegOnly, setIsVegOnly] = useState<boolean>(false);
  const [menuSearch, setMenuSearch] = useState<string>('');
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    const unsubMenu = listenMenuItems(restaurant.id, (items) => {
      setMenuItems(items);
    });
    const unsubReviews = listenReviews(restaurant.id, (revs) => {
      setReviews(revs);
    });
    return () => {
      unsubMenu();
      unsubReviews();
    };
  }, [restaurant.id]);

  // Filtering menu items
  const filteredItems = menuItems.filter((item) => {
    if (isVegOnly && !item.isVeg) return false;
    if (selectedCategory !== 'all' && item.categoryId !== selectedCategory) return false;
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0f1015] text-white pb-24">
      {/* Top Banner & Header */}
      <div className="relative h-60 sm:h-72 w-full bg-neutral-900 overflow-hidden">
        <img
          src={restaurant.banner || restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f1015] via-black/40 to-black/60" />

        {/* Top Floating Buttons */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/90 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFav(!isFav)}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:text-red-500 transition-all cursor-pointer"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: restaurant.name, url: window.location.href });
                }
              }}
              className="w-10 h-10 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/90 transition-all cursor-pointer"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Restaurant Card Header */}
        <div className="absolute bottom-4 left-4 right-4 max-w-4xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md">
                  {restaurant.name}
                </h1>
                {restaurant.isOpen ? (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    OPEN NOW
                  </span>
                ) : (
                  <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                    CLOSED
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-xl">
                {restaurant.tagline || restaurant.description}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 mt-2">
                <span className="text-[#FF6B35] font-semibold">
                  {restaurant.cuisineTypes.join(' • ')}
                </span>
                <span>•</span>
                <span>{restaurant.address}</span>
              </div>
            </div>

            {/* Rating pill */}
            <div className="bg-[#181922]/90 backdrop-blur-md border border-[#2d3042] p-2.5 rounded-2xl text-center shrink-0 shadow-xl">
              <div className="flex items-center justify-center gap-1 bg-emerald-600 px-2.5 py-1 rounded-xl text-white font-extrabold text-sm">
                <span>{restaurant.rating.toFixed(1)}</span>
                <Star className="w-3.5 h-3.5 fill-white" />
              </div>
              <div className="text-[10px] font-medium text-neutral-400 mt-1">
                {restaurant.ratingCount}+ ratings
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Pills Bar */}
      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="bg-[#181922] border border-[#252838] rounded-2xl p-3 flex items-center justify-between text-xs text-neutral-300 divide-x divide-[#282a3c]">
          <div className="flex-1 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4 text-[#FF6B35]" />
            <div>
              <div className="font-bold text-white">{restaurant.deliveryTimeMinutes} mins</div>
              <div className="text-[10px] text-neutral-500">Delivery Time</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2">
            <Bike className="w-4 h-4 text-[#FF6B35]" />
            <div>
              <div className="font-bold text-white">
                {restaurant.deliveryFee === 0 ? 'Free Delivery' : `৳${restaurant.deliveryFee}`}
              </div>
              <div className="text-[10px] text-neutral-500">Delivery Charge</div>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center gap-2">
            <Info className="w-4 h-4 text-[#FF6B35]" />
            <div>
              <div className="font-bold text-white">৳{restaurant.minOrder}</div>
              <div className="text-[10px] text-neutral-500">Minimum Order</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="max-w-4xl mx-auto px-4 mt-6 sticky top-16 z-30 bg-[#0f1015]/95 backdrop-blur-md py-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Menu Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Search in this menu..."
              className="w-full bg-[#181922] border border-[#282a3c] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35]"
            />
          </div>

          {/* Veg Only Toggle */}
          <button
            onClick={() => setIsVegOnly(!isVegOnly)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all ${
              isVegOnly
                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                : 'bg-[#181922] border-[#282a3c] text-neutral-300 hover:border-neutral-500'
            }`}
          >
            <div
              className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                isVegOnly ? 'border-emerald-500 bg-emerald-500' : 'border-neutral-500'
              }`}
            >
              {isVegOnly && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
            </div>
            <span>Veg Only</span>
          </button>
        </div>

        {/* Category Horizontal Pills */}
        <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#FF6B35] text-white'
                : 'bg-[#181922] border border-[#282a3c] text-neutral-400 hover:text-white'
            }`}
          >
            All Items ({menuItems.length})
          </button>
          {FOOD_CATEGORIES.map((cat) => {
            const count = menuItems.filter((i) => i.categoryId === cat.id).length;
            if (count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#FF6B35] text-white'
                    : 'bg-[#181922] border border-[#282a3c] text-neutral-400 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Menu Items List */}
      <div className="max-w-4xl mx-auto px-4 mt-4 space-y-3">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} restaurant={restaurant} />
          ))
        ) : (
          <div className="py-16 text-center bg-[#181922] rounded-3xl border border-[#252838] p-8">
            <div className="text-4xl mb-2">🍽️</div>
            <h3 className="font-bold text-white text-base">No food items matched</h3>
            <p className="text-xs text-neutral-400 mt-1">
              Try clearing filters or search for another dish.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setIsVegOnly(false);
                setMenuSearch('');
              }}
              className="mt-4 px-4 py-2 bg-[#252838] hover:bg-[#303347] text-white text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Floating Bottom Cart Bar */}
      {itemCount > 0 && cartRestId === restaurant.id && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-lg mx-auto">
          <div
            onClick={onOpenCart}
            className="p-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] text-white shadow-2xl flex items-center justify-between cursor-pointer hover:brightness-105 transition-all animate-in slide-in-from-bottom"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black/30 flex items-center justify-center font-black">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-orange-200">
                  {itemCount} {itemCount === 1 ? 'item' : 'items'} added
                </div>
                <div className="text-base font-black">৳{total} plus taxes</div>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-black bg-black/25 px-3 py-1.5 rounded-xl">
              <span>View Cart</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
