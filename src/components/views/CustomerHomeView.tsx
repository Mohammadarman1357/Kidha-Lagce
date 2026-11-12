/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Flame,
  Clock,
  Bike,
  Star,
  ChevronRight,
  TrendingUp,
  Heart,
  Award,
  Search,
  Mic,
  MicOff,
  X,
  Volume2,
  Globe,
  Radio,
  AlertCircle,
  Square,
  Users,
} from 'lucide-react';
import { Restaurant, FoodCategory, PromotionalBanner, MenuItem } from '../../types';
import { RestaurantCard } from '../cards/RestaurantCard';
import { FOOD_CATEGORIES, PROMOTIONAL_BANNERS, INITIAL_MENU_ITEMS } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { VoiceSearchModal } from '../common/VoiceSearchModal';
import { AIFoodConciergeModal } from '../common/AIFoodConciergeModal';
import { GroupOrderModal } from '../modals/GroupOrderModal';

interface CustomerHomeViewProps {
  restaurants: Restaurant[];
  searchQuery: string;
  onSearchChange?: (query: string) => void;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onApplyBannerPromo?: (code: string) => void;
  favorites?: string[];
  onToggleFavorite?: (restId: string) => void;
}

export const CustomerHomeView: React.FC<CustomerHomeViewProps> = ({
  restaurants,
  searchQuery,
  onSearchChange,
  onSelectRestaurant,
  onApplyBannerPromo,
  favorites = [],
  onToggleFavorite,
}) => {
  const { profile, activeAddress } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'time' | 'popular'>('popular');
  const [filterRating4Plus, setFilterRating4Plus] = useState(false);
  const [filterFastDelivery, setFilterFastDelivery] = useState(false);
  const [filterFreeDelivery, setFilterFreeDelivery] = useState(false);

  // Web Speech API state directly within the search bar
  const [isInlineListening, setIsInlineListening] = useState<boolean>(false);
  const [voiceLang, setVoiceLang] = useState<'bn-BD' | 'en-US'>('bn-BD');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showAIModal, setShowAIModal] = useState<boolean>(false);
  const [showGroupModal, setShowGroupModal] = useState<boolean>(false);

  const recognitionRef = useRef<any>(null);

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  // Web Speech API trigger within search bar
  const startInlineVoiceSearch = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError('Web Speech API is not supported in this browser. Please use Chrome, Edge, or Android Browser.');
      setShowVoiceModal(true);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = voiceLang;

      recognition.onstart = () => {
        setIsInlineListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        let finalText = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript;
          } else {
            interimText += event.results[i][0].transcript;
          }
        }

        const recognized = (finalText || interimText).trim();
        if (recognized && onSearchChange) {
          // Dynamically update the search query state in real-time
          onSearchChange(recognized);
        }

        if (finalText) {
          if (navigator.vibrate) {
            navigator.vibrate([30, 50, 30]);
          }
          setIsInlineListening(false);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Inline Web Speech API error:', event.error);
        setIsInlineListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone in browser settings.');
        } else if (event.error === 'no-speech') {
          setSpeechError("No speech detected. Speak clearly and try again.");
        } else {
          setSpeechError(`Speech recognition: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsInlineListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start Web Speech API recognition:', err);
      setIsInlineListening(false);
      setShowVoiceModal(true);
    }
  }, [voiceLang, onSearchChange]);

  const stopInlineVoiceSearch = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsInlineListening(false);
  }, []);

  const toggleInlineVoiceSearch = useCallback(() => {
    if (isInlineListening) {
      stopInlineVoiceSearch();
    } else {
      startInlineVoiceSearch();
    }
  }, [isInlineListening, startInlineVoiceSearch, stopInlineVoiceSearch]);

  const switchVoiceLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextLang = voiceLang === 'bn-BD' ? 'en-US' : 'bn-BD';
    setVoiceLang(nextLang);
    if (isInlineListening) {
      stopInlineVoiceSearch();
    }
  };

  // Filter and sort restaurants based on dynamic search query
  const filteredRestaurants = useMemo(() => {
    return restaurants
      .filter((r) => {
        // Search query (updated dynamically via Web Speech API or typing)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesName = r.name.toLowerCase().includes(q);
          const matchesCuisine = r.cuisineTypes.some((c) => c.toLowerCase().includes(q));
          const matchesCity = r.city.toLowerCase().includes(q) || r.address.toLowerCase().includes(q);
          if (!matchesName && !matchesCuisine && !matchesCity) return false;
        }

        // Category filter
        if (selectedCategory) {
          const categoryObj = FOOD_CATEGORIES.find((c) => c.id === selectedCategory);
          if (categoryObj) {
            const matchesCategory = r.cuisineTypes.some((c) =>
              c.toLowerCase().includes(categoryObj.name.toLowerCase().split(' ')[0])
            );
            if (!matchesCategory) return false;
          }
        }

        // Pill filters
        if (filterRating4Plus && r.rating < 4.5) return false;
        if (filterFastDelivery && r.deliveryTimeMinutes > 30) return false;
        if (filterFreeDelivery && r.deliveryFee > 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'time') return a.deliveryTimeMinutes - b.deliveryTimeMinutes;
        return (b.ratingCount || 0) - (a.ratingCount || 0);
      });
  }, [
    restaurants,
    searchQuery,
    selectedCategory,
    sortBy,
    filterRating4Plus,
    filterFastDelivery,
    filterFreeDelivery,
  ]);

  return (
    <div className="space-y-7 pb-20">
      {/* Hero Welcome Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-black text-[#FF6B35]">
            <Sparkles className="w-4 h-4" />
            <span>KIDHA LAGCE? • {activeAddress?.area?.toUpperCase() || 'DHAKA'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
            খিদা লাগছে, {profile?.name?.split(' ')[0] || 'Foodie'}?
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            Hot, mouth-watering food delivered right to your doorstep in 25–35 minutes.
          </p>
        </div>

        {/* AI Concierge & Group Order Quick Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-amber-500 hover:brightness-110 active:scale-95 text-white font-black text-xs shadow-lg shadow-orange-950/40 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Concierge</span>
          </button>

          <button
            onClick={() => setShowGroupModal(true)}
            className="px-3.5 py-2 rounded-2xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Group Order</span>
          </button>
        </div>
      </div>

      {/* Web Speech API Integrated Search Bar */}
      <div
        className={`bg-[#181922] rounded-3xl p-3 shadow-xl transition-all border ${
          isInlineListening
            ? 'border-[#FF6B35] ring-4 ring-[#FF6B35]/20 bg-[#1c1a24] shadow-[0_0_35px_rgba(255,107,53,0.3)]'
            : 'border-[#2b2d3d] hover:border-[#FF6B35]/60'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {/* Search or Audio Equalizer Icon */}
          <div className="pl-2 shrink-0">
            {isInlineListening ? (
              <div className="flex items-end gap-1 h-5 w-5 justify-center">
                <span className="w-1 bg-[#FF6B35] rounded-full animate-bounce h-3" />
                <span className="w-1 bg-[#FF6B35] rounded-full animate-bounce h-5 delay-100" />
                <span className="w-1 bg-[#FF6B35] rounded-full animate-bounce h-2 delay-200" />
                <span className="w-1 bg-[#FF6B35] rounded-full animate-bounce h-4 delay-75" />
              </div>
            ) : (
              <Search className="w-5 h-5 text-[#FF6B35]" />
            )}
          </div>

          {/* Dynamic Search Input with Real-time Speech-to-Text Population */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={
              isInlineListening
                ? voiceLang === 'bn-BD'
                  ? 'শুনছি... বলুন: কাচ্চি, বার্গার, পিজা...'
                  : 'Listening... Speak food or restaurant now...'
                : 'Search dishes, cuisines, or tap mic for voice-to-text...'
            }
            className={`flex-1 bg-transparent border-none text-sm text-white focus:outline-none transition-colors ${
              isInlineListening ? 'placeholder-[#FF6B35] font-bold' : 'placeholder-neutral-500'
            }`}
          />

          {/* Clear button if text exists */}
          {searchQuery && (
            <button
              onClick={() => onSearchChange && onSearchChange('')}
              className="p-1 rounded-lg text-neutral-400 hover:text-white transition-colors"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Speech Language Switcher (Bangla / English) */}
          <button
            onClick={switchVoiceLanguage}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#222432] hover:bg-[#2b2e40] border border-[#2f3246] text-[11px] font-bold text-neutral-300 hover:text-white transition-all"
            title="Toggle Voice Recognition Language (Bangla / English)"
          >
            <Globe className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>{voiceLang === 'bn-BD' ? 'বাংলা' : 'EN'}</span>
          </button>

          {/* Web Speech API Microphone Trigger Button */}
          <button
            onClick={toggleInlineVoiceSearch}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl font-black text-xs shadow-md transition-all cursor-pointer ${
              isInlineListening
                ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse shadow-red-950/60 ring-2 ring-red-400'
                : 'bg-gradient-to-r from-[#FF6B35] to-[#f4511e] hover:brightness-110 active:scale-95 text-white shadow-orange-950/50'
            }`}
            title={
              isInlineListening
                ? 'Stop listening'
                : `Click to trigger Web Speech API Voice-to-Text (${voiceLang === 'bn-BD' ? 'Bangla' : 'English'})`
            }
          >
            {isInlineListening ? (
              <>
                <Square className="w-3.5 h-3.5 fill-white" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span className="hidden sm:inline">Voice Search</span>
              </>
            )}
          </button>
        </div>

        {/* Live Listening Status Banner or Voice Chips */}
        {isInlineListening ? (
          <div className="mt-2.5 pt-2.5 border-t border-[#FF6B35]/30 flex items-center justify-between text-xs text-[#FF6B35] animate-in fade-in">
            <div className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>
                Web Speech API Listening in {voiceLang === 'bn-BD' ? 'Bangla (বাংলা)' : 'English (US)'}...
              </span>
            </div>
            <button
              onClick={stopInlineVoiceSearch}
              className="text-[11px] font-extrabold text-neutral-300 hover:text-white bg-[#262838] px-2.5 py-0.5 rounded-lg"
            >
              Done Speaking
            </button>
          </div>
        ) : (
          <div className="mt-2.5 pt-2.5 border-t border-[#232535] flex items-center justify-between gap-2 overflow-x-auto no-scrollbar text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5 shrink-0 font-medium">
              <Volume2 className="w-3.5 h-3.5 text-[#FF6B35]" />
              <span>Voice commands:</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { label: 'কাচ্চি বিরিয়ানি', q: 'Kacchi' },
                { label: 'Smash Burger', q: 'Burger' },
                { label: 'Woodfired Pizza', q: 'Pizza' },
                { label: 'Ramen & Dim Sum', q: 'Ramen' },
              ].map((chip) => (
                <button
                  key={chip.label}
                  onClick={() => onSearchChange && onSearchChange(chip.q)}
                  className="px-2.5 py-0.5 rounded-lg bg-[#202230] hover:bg-[#2a2d40] text-neutral-300 hover:text-[#FF6B35] transition-colors"
                >
                  🎙️ {chip.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error notification if microphone permission denied */}
        {speechError && (
          <div className="mt-2 p-2 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-[11px] flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
            <span>{speechError}</span>
          </div>
        )}
      </div>

      {/* Promotional Banners Carousel (Swipeable on mobile, 3-column grid on desktop) */}
      <div className="flex md:grid md:grid-cols-3 gap-3.5 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar pb-1">
        {PROMOTIONAL_BANNERS.map((banner) => (
          <div
            key={banner.id}
            onClick={() => {
              if (banner.actionType === 'restaurant') {
                const targetRest = restaurants.find((r) => r.id === banner.actionTarget);
                if (targetRest) onSelectRestaurant(targetRest);
              } else if (banner.code && onApplyBannerPromo) {
                onApplyBannerPromo(banner.code);
              }
            }}
            className="group relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#1c1e27] to-[#14151d] border border-[#2b2e3e] hover:border-[#FF6B35]/60 shadow-xl cursor-pointer transition-all hover:scale-[1.01] shrink-0 w-[82%] sm:w-[55%] md:w-auto snap-center"
          >
            <div className="h-40 sm:h-48 w-full relative">
              <img
                src={banner.image}
                alt={banner.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121319] via-black/40 to-transparent" />

              <div className="absolute top-3 left-3 px-2.5 py-0.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-wider">
                {banner.badge}
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                <div>
                  <h3 className="text-sm sm:text-lg font-black text-white leading-tight drop-shadow-md">
                    {banner.title}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-neutral-300 mt-0.5">{banner.subtitle}</p>
                </div>
                <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#FF6B35] text-white text-[11px] sm:text-xs font-bold shrink-0 shadow-lg group-hover:bg-[#ff5722] transition-colors">
                  {banner.ctaText}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Food Categories Circles */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>What are you craving?</span>
            <Flame className="w-4 h-4 text-[#FF6B35]" />
          </h2>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-bold text-[#FF6B35] hover:underline"
            >
              Clear Category Filter
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 overflow-x-auto py-2 no-scrollbar">
          {FOOD_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className="group flex flex-col items-center shrink-0 w-20 text-center transition-all cursor-pointer"
              >
                <div
                  className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                    isSelected
                      ? 'border-[#FF6B35] scale-105 shadow-lg shadow-orange-950/50'
                      : 'border-[#282a3c] group-hover:border-[#FF6B35]/50 group-hover:scale-105'
                  }`}
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <span
                  className={`text-xs mt-2 truncate w-full font-bold ${
                    isSelected ? 'text-[#FF6B35]' : 'text-neutral-300 group-hover:text-white'
                  }`}
                >
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Sort Bar (Horizontal scroll on mobile, flex on desktop) */}
      <div className="bg-[#181922] border border-[#252838] rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 overflow-x-auto no-scrollbar">
        {/* Pills */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <button
            onClick={() => setFilterRating4Plus(!filterRating4Plus)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              filterRating4Plus
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#222432] text-neutral-300 hover:bg-[#2b2d3e]'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Rating 4.5+</span>
          </button>

          <button
            onClick={() => setFilterFastDelivery(!filterFastDelivery)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              filterFastDelivery
                ? 'bg-[#FF6B35] text-white shadow-md'
                : 'bg-[#222432] text-neutral-300 hover:bg-[#2b2d3e]'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Fast (&lt;30m)</span>
          </button>

          <button
            onClick={() => setFilterFreeDelivery(!filterFreeDelivery)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              filterFreeDelivery
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-[#222432] text-neutral-300 hover:bg-[#2b2d3e]'
            }`}
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Free Delivery</span>
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <span className="text-neutral-400 font-medium hidden sm:inline">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-[#222432] border border-[#2d3042] rounded-xl px-2.5 py-1.5 text-xs text-white font-bold focus:outline-none focus:border-[#FF6B35] cursor-pointer"
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="time">Delivery Time</option>
          </select>
        </div>
      </div>

      {/* Restaurants Grid Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {searchQuery ? `Dishes matching "${searchQuery}"` : 'Top Rated Restaurants in Dhaka'}
            </h2>
            <p className="text-xs text-neutral-400">
              {filteredRestaurants.length} restaurants open for delivery now
            </p>
          </div>
        </div>

        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => onSelectRestaurant(restaurant)}
                isFavorite={favorites.includes(restaurant.id)}
                onToggleFavorite={() => onToggleFavorite && onToggleFavorite(restaurant.id)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#181922] border border-[#252838] rounded-3xl p-12 text-center">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="font-bold text-white text-base">No restaurants matched</h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              We couldn't find any restaurant matching your filters or search terms. Try clearing your filters or speak a different craving.
            </p>
            <button
              onClick={() => {
                if (onSearchChange) onSearchChange('');
                setSelectedCategory(null);
                setFilterRating4Plus(false);
                setFilterFastDelivery(false);
                setFilterFreeDelivery(false);
              }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#252838] hover:bg-[#303348] text-white font-bold text-xs"
            >
              Reset Search & Filters
            </button>
          </div>
        )}
      </div>

      {/* Optional fallback Voice Search Modal */}
      {showVoiceModal && (
        <VoiceSearchModal
          isOpen={showVoiceModal}
          onClose={() => setShowVoiceModal(false)}
          onTranscriptResult={(res) => onSearchChange && onSearchChange(res)}
          initialLang={voiceLang}
        />
      )}

      {/* AI Food Concierge Modal */}
      {showAIModal && (
        <AIFoodConciergeModal
          isOpen={showAIModal}
          onClose={() => setShowAIModal(false)}
          menuItems={INITIAL_MENU_ITEMS}
          restaurants={restaurants}
          onSelectRestaurant={onSelectRestaurant}
        />
      )}

      {/* Group Order Modal */}
      {showGroupModal && restaurants[0] && (
        <GroupOrderModal
          isOpen={showGroupModal}
          onClose={() => setShowGroupModal(false)}
          restaurant={restaurants[0]}
          onProceedToCheckout={() => {
            setShowGroupModal(false);
          }}
        />
      )}
    </div>
  );
};
