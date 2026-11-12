/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  X,
  Flame,
  ArrowRight,
  Clock,
  Star,
  Check,
  Bot,
  Plus,
} from 'lucide-react';
import { MenuItem, Restaurant } from '../../types';
import { getAIFoodRecommendations, AIRecItem } from '../../services/foodDeliveryService';
import { useCart } from '../../context/CartContext';

interface AIFoodConciergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  menuItems: MenuItem[];
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
}

export const AIFoodConciergeModal: React.FC<AIFoodConciergeModalProps> = ({
  isOpen,
  onClose,
  menuItems,
  restaurants,
  onSelectRestaurant,
}) => {
  const { addItem } = useCart();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecItem[]>([
    {
      name: 'Special Basmati Mutton Kacchi Biryani',
      restaurantName: 'Kacchi Bhai - Royal Feast',
      reason: 'Bestseller in Dhaka • Melt-in-mouth slow-cooked tender meat with fragrant basmati',
      price: 490,
      tags: ['Top Craving', 'Basmati Shahi'],
    },
    {
      name: 'The Double Bacon Smash Burger',
      restaurantName: 'The Burger Lab Co.',
      reason: '4.8⭐ Rated • Freshly smashed Angus beef patties with melted Monterey Jack',
      price: 480,
      tags: ['Juicy & Cheesy', 'Chef Special'],
    },
  ]);
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAskAI = async (queryText?: string) => {
    const q = (queryText || prompt).trim();
    if (!q) return;
    setLoading(true);

    try {
      const recs = await getAIFoodRecommendations(q, menuItems, restaurants);
      setRecommendations(recs);
    } catch (e) {
      console.warn('AI recommendation fallback:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (rec: AIRecItem) => {
    const matchingItem = menuItems.find(
      (m) => m.name.toLowerCase().includes(rec.name.toLowerCase()) || rec.name.toLowerCase().includes(m.name.toLowerCase())
    );
    const matchingRest = restaurants.find(
      (r) => r.name.toLowerCase().includes(rec.restaurantName.toLowerCase())
    );

    if (matchingItem && matchingRest) {
      const cartItem: import('../../types').CartItem = {
        id: `${matchingItem.id}-${Date.now()}`,
        menuItemId: matchingItem.id,
        restaurantId: matchingRest.id,
        name: matchingItem.name,
        price: matchingItem.price,
        image: matchingItem.image,
        isVeg: matchingItem.isVeg,
        quantity: 1,
        selectedOptions: [],
        totalPrice: matchingItem.price,
      };
      addItem(cartItem, matchingRest);
      setAddedItemName(rec.name);
      setTimeout(() => setAddedItemName(null), 1500);
    } else if (matchingRest) {
      onSelectRestaurant(matchingRest);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#181922] border border-[#2d3042] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-950/40">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-1.5">
                <span>Kidha AI Food Concierge</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF6B35]/20 text-[#FF6B35]">
                  SMART AI
                </span>
              </h3>
              <p className="text-[11px] text-neutral-400">
                Tells you what to order based on your mood, budget & cravings
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-[#222432] text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Query Input */}
        <div className="relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
            placeholder="Tell AI your craving: e.g. 'Spicy mutton lunch under ৳500'..."
            className="w-full bg-[#121319] border border-[#282a3c] rounded-2xl pl-4 pr-24 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35]"
          />
          <button
            onClick={() => handleAskAI()}
            disabled={loading}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] hover:brightness-110 text-white font-bold text-xs shadow-md shadow-orange-950/40 disabled:opacity-50"
          >
            {loading ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>

        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-1.5 text-[11px]">
          {[
            'Authentic Kacchi with Borhani',
            'Double Beef Smashed Burger',
            'Woodfired Pizza for 2 under ৳900',
            'Healthy Keto protein lunch',
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setPrompt(chip);
                handleAskAI(chip);
              }}
              className="px-2.5 py-1 rounded-xl bg-[#1f212d] hover:bg-[#282a3c] border border-[#2c2f42] text-neutral-300 hover:text-white transition-colors"
            >
              ✨ {chip}
            </button>
          ))}
        </div>

        {/* Recommendations Result List */}
        <div className="space-y-3 pt-2 border-t border-[#252838]">
          <div className="text-xs font-bold text-neutral-400 uppercase tracking-wider flex items-center justify-between">
            <span>AI Selected Dishes Grounded on Live Kitchens</span>
            <span className="text-[10px] text-emerald-400 font-bold">In-Stock</span>
          </div>

          <div className="space-y-2.5">
            {recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3.5 rounded-2xl bg-[#14151d] border border-[#242636] hover:border-[#FF6B35]/40 transition-all flex items-start justify-between gap-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-white">{rec.name}</h4>
                    <span className="text-[10px] font-black text-[#FF6B35]">৳{rec.price}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    From <strong className="text-neutral-300">{rec.restaurantName}</strong>
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                    💡 {rec.reason}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {rec.tags.map((t, ti) => (
                      <span key={ti} className="text-[9px] bg-[#202230] text-neutral-400 px-2 py-0.5 rounded-md">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleQuickAdd(rec)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 flex items-center gap-1 transition-all ${
                    addedItemName === rec.name
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#FF6B35] hover:bg-[#ff5722] text-white shadow-md'
                  }`}
                >
                  {addedItemName === rec.name ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
