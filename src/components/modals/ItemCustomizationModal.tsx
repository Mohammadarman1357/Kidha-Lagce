/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { MenuItem, Restaurant, CartItem, CartItemOptionSelected } from '../../types';
import { VegIcon } from '../common/VegIcon';

interface ItemCustomizationModalProps {
  item: MenuItem;
  restaurant: Restaurant;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (cartItem: CartItem) => void;
}

export const ItemCustomizationModal: React.FC<ItemCustomizationModalProps> = ({
  item,
  restaurant,
  isOpen,
  onClose,
  onAddToCart,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedChoices, setSelectedChoices] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    item.options?.forEach((group) => {
      if (group.type === 'single' && group.choices.length > 0) {
        initial[group.id] = [group.choices[0].id];
      } else {
        initial[group.id] = [];
      }
    });
    return initial;
  });
  const [instructions, setInstructions] = useState('');

  if (!isOpen) return null;

  const handleSingleSelect = (groupId: string, choiceId: string) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [groupId]: [choiceId],
    }));
  };

  const handleMultiToggle = (groupId: string, choiceId: string, maxChoices?: number) => {
    setSelectedChoices((prev) => {
      const current = prev[groupId] || [];
      const exists = current.includes(choiceId);
      if (exists) {
        return { ...prev, [groupId]: current.filter((id) => id !== choiceId) };
      } else {
        if (maxChoices && current.length >= maxChoices) {
          return prev;
        }
        return { ...prev, [groupId]: [...current, choiceId] };
      }
    });
  };

  // Calculate extra option cost
  let extraCost = 0;
  const flatSelectedOptions: CartItemOptionSelected[] = [];

  item.options?.forEach((group) => {
    const selectedIds = selectedChoices[group.id] || [];
    group.choices.forEach((c) => {
      if (selectedIds.includes(c.id)) {
        extraCost += c.price;
        flatSelectedOptions.push({
          groupId: group.id,
          groupName: group.name,
          choiceId: c.id,
          choiceName: c.name,
          price: c.price,
        });
      }
    });
  });

  const unitPrice = item.price + extraCost;
  const totalPrice = unitPrice * quantity;

  const handleConfirm = () => {
    const optionsHash = flatSelectedOptions
      .map((o) => o.choiceId)
      .sort()
      .join('-');
    const cartItemId = `${item.id}_${optionsHash || 'base'}`;

    const cartItem: CartItem = {
      id: cartItemId,
      menuItemId: item.id,
      restaurantId: restaurant.id,
      name: item.name,
      price: item.price,
      image: item.image,
      isVeg: item.isVeg,
      quantity,
      selectedOptions: flatSelectedOptions,
      specialInstructions: instructions.trim() || undefined,
      totalPrice: unitPrice,
    };

    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-[#181922] border border-[#2d3042] rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="relative p-4 border-b border-[#252838] flex items-start gap-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden bg-neutral-900 shrink-0">
            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 pr-8">
            <div className="flex items-center gap-2">
              <VegIcon isVeg={item.isVeg} />
              <h3 className="font-bold text-white text-base leading-tight">{item.name}</h3>
            </div>
            <div className="text-sm font-black text-[#FF6B35] mt-1">৳{unitPrice}</div>
            <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{item.description}</p>
          </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-[#252838] text-neutral-300 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Customization Groups */}
        <div className="p-4 overflow-y-auto space-y-5 flex-1 divide-y divide-[#252838]">
          {item.options?.map((group) => {
            const isSingle = group.type === 'single';
            const selected = selectedChoices[group.id] || [];

            return (
              <div key={group.id} className="pt-4 first:pt-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-bold text-neutral-200">{group.name}</h4>
                  <span className="text-[11px] font-semibold text-neutral-400 bg-[#252838] px-2 py-0.5 rounded-full">
                    {group.required ? 'Required • Pick 1' : 'Optional'}
                  </span>
                </div>

                <div className="space-y-2">
                  {group.choices.map((choice) => {
                    const isChoiceSelected = selected.includes(choice.id);
                    return (
                      <label
                        key={choice.id}
                        onClick={() => {
                          if (isSingle) {
                            handleSingleSelect(group.id, choice.id);
                          } else {
                            handleMultiToggle(group.id, choice.id, group.maxChoices);
                          }
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                          isChoiceSelected
                            ? 'bg-[#FF6B35]/10 border-[#FF6B35]/50 text-white'
                            : 'bg-[#1e202b] border-[#292c3d] text-neutral-300 hover:border-[#383c52]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isChoiceSelected
                                ? 'border-[#FF6B35] bg-[#FF6B35]'
                                : 'border-neutral-500'
                            }`}
                          >
                            {isChoiceSelected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                          <span className="text-xs font-semibold">{choice.name}</span>
                        </div>
                        <span className="text-xs font-bold text-neutral-300">
                          {choice.price > 0 ? `+৳${choice.price}` : 'Free'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Cooking Instructions */}
          <div className="pt-4">
            <h4 className="text-xs font-bold text-neutral-300 mb-1.5">Special Instructions</h4>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Less spicy, extra tissues, sauce on the side"
              className="w-full bg-[#1e202b] border border-[#2a2d3e] rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35]"
            />
          </div>
        </div>

        {/* Footer: Quantity & Add Button */}
        <div className="p-4 border-t border-[#252838] bg-[#14151d] rounded-b-3xl flex items-center justify-between gap-4">
          {/* Stepper */}
          <div className="flex items-center bg-[#202330] border border-[#2d3042] rounded-xl p-1">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white disabled:opacity-40"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-black text-white">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="p-1.5 rounded-lg text-neutral-300 hover:text-white"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] hover:brightness-110 text-white font-extrabold text-sm shadow-lg shadow-orange-950/50 flex items-center justify-between transition-all"
          >
            <span>Add Item</span>
            <span>৳{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
