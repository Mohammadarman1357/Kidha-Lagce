/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const ConflictCartModal: React.FC = () => {
  const { conflictModal, restaurant, confirmSwitchRestaurant, cancelSwitchRestaurant } = useCart();

  if (!conflictModal.isOpen || !conflictModal.pendingItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#181922] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="text-center">
          <h3 className="font-bold text-base text-white">Replace items in cart?</h3>
          <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
            Your cart contains food from <strong className="text-white">{restaurant?.name}</strong>. A new order can only be placed from one restaurant at a time.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <button
            onClick={cancelSwitchRestaurant}
            className="flex-1 py-2.5 rounded-xl bg-[#252838] hover:bg-[#2e3245] text-neutral-300 text-xs font-bold transition-colors"
          >
            Keep Existing
          </button>
          <button
            onClick={confirmSwitchRestaurant}
            className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#ff5722] text-white text-xs font-bold shadow-md transition-colors"
          >
            Discard & Add
          </button>
        </div>
      </div>
    </div>
  );
};
