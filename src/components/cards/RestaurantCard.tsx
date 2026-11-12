/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Star, Clock, Bike, Heart } from 'lucide-react';
import { Restaurant } from '../../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onClick,
  isFavorite,
  onToggleFavorite,
}) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-[#181922] hover:bg-[#1e202b] rounded-2xl border border-[#262837] hover:border-[#FF6B35]/50 overflow-hidden shadow-lg transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-900">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#181922] via-transparent to-black/30" />

        {/* Favorite Heart Button */}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(e);
            }}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white hover:text-red-500 hover:scale-110 transition-all z-10"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </button>
        )}

        {/* Discount Ribbon */}
        {restaurant.featured && (
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#FF5722] to-[#FF8A65] text-white text-[11px] font-black uppercase tracking-wider shadow-md">
            Promoted
          </div>
        )}

        {/* Floating Delivery & Rating Pill */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-xs shadow">
            <span>{restaurant.rating.toFixed(1)}</span>
            <Star className="w-3 h-3 fill-white" />
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-neutral-200 text-xs font-semibold">
            <Clock className="w-3 h-3 text-[#FF6B35]" />
            <span>{restaurant.deliveryTimeMinutes} mins</span>
          </div>
        </div>
      </div>

      {/* Details Container */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-white text-base group-hover:text-[#FF6B35] transition-colors line-clamp-1">
              {restaurant.name}
            </h3>
            <span className="text-xs font-medium text-neutral-400 shrink-0">
              {restaurant.priceRange}
            </span>
          </div>

          <p className="text-xs text-neutral-400 mt-1 line-clamp-1">
            {restaurant.cuisineTypes.join(' • ')}
          </p>

          <p className="text-[11px] text-neutral-500 mt-1 truncate">
            {restaurant.address}, {restaurant.city}
          </p>
        </div>

        {/* Footer info: Delivery fee & safety */}
        <div className="mt-3 pt-2.5 border-t border-[#252737] flex items-center justify-between text-[11px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5 text-neutral-500" />
            <span>
              {restaurant.deliveryFee === 0 ? (
                <strong className="text-emerald-400 font-bold">Free Delivery</strong>
              ) : (
                `৳${restaurant.deliveryFee} delivery`
              )}
            </span>
          </div>

          <span className="text-neutral-500">Min ৳{restaurant.minOrder}</span>
        </div>
      </div>
    </div>
  );
};
