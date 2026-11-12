/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Star, Plus, Minus } from 'lucide-react';
import { MenuItem, Restaurant, CartItem } from '../../types';
import { VegIcon } from '../common/VegIcon';
import { useCart } from '../../context/CartContext';
import { ItemCustomizationModal } from '../modals/ItemCustomizationModal';

interface MenuItemCardProps {
  item: MenuItem;
  restaurant: Restaurant;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, restaurant }) => {
  const { items, addItem, updateQuantity } = useCart();
  const [showCustomModal, setShowCustomModal] = useState(false);

  // Find if item is already in cart (matching base menuItemId)
  const cartEntries = items.filter((ci) => ci.menuItemId === item.id);
  const totalInCart = cartEntries.reduce((s, ci) => s + ci.quantity, 0);

  const handleAddClick = () => {
    if (item.options && item.options.length > 0) {
      setShowCustomModal(true);
    } else {
      const basicCartItem: CartItem = {
        id: item.id,
        menuItemId: item.id,
        restaurantId: restaurant.id,
        name: item.name,
        price: item.price,
        image: item.image,
        isVeg: item.isVeg,
        quantity: 1,
        selectedOptions: [],
        totalPrice: item.price,
      };
      addItem(basicCartItem, restaurant);
    }
  };

  const handleIncrement = () => {
    if (cartEntries.length === 1 && (!item.options || item.options.length === 0)) {
      updateQuantity(cartEntries[0].id, cartEntries[0].quantity + 1);
    } else {
      setShowCustomModal(true);
    }
  };

  const handleDecrement = () => {
    if (cartEntries.length > 0) {
      const target = cartEntries[cartEntries.length - 1];
      updateQuantity(target.id, target.quantity - 1);
    }
  };

  return (
    <>
      <div className="bg-[#181922] rounded-2xl border border-[#252838] p-4 flex gap-3 sm:gap-4 items-center justify-between hover:border-[#33374b] transition-all">
        {/* Left Info */}
        <div className="flex-1 pr-2">
          <div className="flex items-center gap-2 mb-1">
            <VegIcon isVeg={item.isVeg} />
            {item.tags?.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/30"
              >
                {tag}
              </span>
            ))}
          </div>

          <h4 className="font-bold text-white text-sm sm:text-base leading-snug">{item.name}</h4>

          <div className="flex items-center gap-2 mt-1">
            <span className="font-black text-sm sm:text-base text-white">৳{item.price}</span>
            {item.originalPrice && (
              <span className="text-xs text-neutral-500 line-through">৳{item.originalPrice}</span>
            )}
            {item.rating && (
              <div className="flex items-center gap-0.5 text-xs text-emerald-400 font-bold ml-2">
                <Star className="w-3 h-3 fill-emerald-400" />
                <span>{item.rating.toFixed(1)}</span>
                {item.ratingCount && (
                  <span className="text-neutral-500 text-[11px]">({item.ratingCount})</span>
                )}
              </div>
            )}
          </div>

          <p className="text-xs text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {item.options && item.options.length > 0 && (
            <span className="inline-block text-[11px] font-semibold text-[#FF6B35] mt-1.5">
              Customisable
            </span>
          )}
        </div>

        {/* Right Photo & ADD button */}
        <div className="relative shrink-0 flex flex-col items-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-neutral-900 shadow-md">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* ADD / Stepper Button */}
          <div className="absolute -bottom-2 z-10 shadow-lg">
            {totalInCart > 0 ? (
              <div className="flex items-center bg-[#1e202c] border-2 border-[#FF6B35] rounded-xl px-2 py-1 text-xs font-black shadow-md">
                <button
                  onClick={handleDecrement}
                  className="text-neutral-300 hover:text-white px-1 py-0.5"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-2.5 text-[#FF6B35] font-black">{totalInCart}</span>
                <button
                  onClick={handleIncrement}
                  className="text-neutral-300 hover:text-white px-1 py-0.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddClick}
                className="px-5 py-1.5 rounded-xl bg-[#1e202c] hover:bg-[#282a3a] border-2 border-[#FF6B35] text-[#FF6B35] font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                ADD
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customization Modal */}
      {showCustomModal && (
        <ItemCustomizationModal
          item={item}
          restaurant={restaurant}
          isOpen={showCustomModal}
          onClose={() => setShowCustomModal(false)}
          onAddToCart={(cartItem) => addItem(cartItem, restaurant)}
        />
      )}
    </>
  );
};
