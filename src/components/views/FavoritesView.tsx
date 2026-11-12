/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Heart, Star, Clock, Bike, ArrowRight } from 'lucide-react';
import { Restaurant } from '../../types';
import { RestaurantCard } from '../cards/RestaurantCard';

interface FavoritesViewProps {
  favoriteIds: string[];
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onToggleFavorite: (restId: string) => void;
  onExplore: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteIds,
  restaurants,
  onSelectRestaurant,
  onToggleFavorite,
  onExplore,
}) => {
  const favoriteRestaurants = restaurants.filter((r) => favoriteIds.includes(r.id));

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <span>Your Favorite Outlets</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Quick access to restaurants you love on Kidha Lagce
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1c1e27] border border-[#2b2d3d] text-neutral-300">
          {favoriteRestaurants.length} saved
        </span>
      </div>

      {favoriteRestaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {favoriteRestaurants.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              restaurant={restaurant}
              onClick={() => onSelectRestaurant(restaurant)}
              isFavorite={true}
              onToggleFavorite={() => onToggleFavorite(restaurant.id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#181922] border border-[#252838] rounded-3xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-red-950/20 border border-red-500/20 mx-auto flex items-center justify-center text-3xl mb-4 text-red-500">
            ❤️
          </div>
          <h3 className="font-bold text-white text-lg">No favorites added yet</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Tap the heart icon on any restaurant or dish to save it here for fast re-ordering whenever hunger strikes!
          </p>
          <button
            onClick={onExplore}
            className="mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] text-white font-extrabold text-xs shadow-lg shadow-orange-950/50 flex items-center gap-2 mx-auto"
          >
            <span>Explore Restaurants</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
