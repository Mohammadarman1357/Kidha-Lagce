/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  Plus,
  Clock,
  Sparkles,
  X,
  Share2,
  ShoppingBag,
} from 'lucide-react';
import { Restaurant, GroupOrder, GroupOrderMember } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

interface GroupOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurant: Restaurant;
  onProceedToCheckout: () => void;
}

export const GroupOrderModal: React.FC<GroupOrderModalProps> = ({
  isOpen,
  onClose,
  restaurant,
  onProceedToCheckout,
}) => {
  const { profile } = useAuth();
  const { items, total } = useCart();
  const [copiedLink, setCopiedLink] = useState(false);
  const [groupCode] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  // Simulated group participants
  const [members, setMembers] = useState<GroupOrderMember[]>([
    {
      id: 'mem-1',
      name: profile?.name || 'Habiba Arman (Host)',
      isHost: true,
      items: items,
      joinedAt: 'Just now',
    },
    {
      id: 'mem-2',
      name: 'Tanvir Hossain',
      isHost: false,
      items: [
        {
          id: 'item-sim-1',
          menuItemId: 'item-kb-1',
          restaurantId: restaurant.id,
          name: 'Special Basmati Mutton Kacchi Biryani',
          price: 490,
          image: '',
          isVeg: false,
          quantity: 1,
          selectedOptions: [],
          totalPrice: 490,
        },
      ],
      joinedAt: '2 mins ago',
    },
    {
      id: 'mem-3',
      name: 'Nusrat Jahan',
      isHost: false,
      items: [
        {
          id: 'item-sim-2',
          menuItemId: 'item-sa-1',
          restaurantId: restaurant.id,
          name: 'San Sebastian Basque Burnt Cheesecake',
          price: 380,
          image: '',
          isVeg: true,
          quantity: 1,
          selectedOptions: [],
          totalPrice: 380,
        },
      ],
      joinedAt: '5 mins ago',
    },
  ]);

  if (!isOpen) return null;

  const groupTotal = members.reduce(
    (sum, m) => sum + m.items.reduce((s, i) => s + i.totalPrice * i.quantity, 0),
    0
  );

  const copyInvite = () => {
    navigator.clipboard.writeText(`https://kidhalagce.app/group/${groupCode}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#181922] border border-[#2d3042] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Group Food Order</h3>
              <p className="text-[11px] text-neutral-400">Ordering together from {restaurant.name}</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-xl bg-[#222432] text-neutral-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shareable Invite Code Box */}
        <div className="bg-[#121319] p-4 rounded-2xl border border-[#282a3c] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Shareable Group Code</span>
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Expires in 15 mins</span>
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-2xl font-black text-white tracking-[4px]">#{groupCode}</span>
            <button
              onClick={copyInvite}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-950/40"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
          <p className="text-[10px] text-neutral-500">
            Share this link on WhatsApp or Messenger so your friends can add dishes directly to this cart.
          </p>
        </div>

        {/* Participants & Added Items */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center justify-between">
            <span>Participants ({members.length})</span>
            <span className="text-xs font-black text-white">Combined: ৳{groupTotal}</span>
          </div>

          <div className="space-y-2.5">
            {members.map((member) => (
              <div
                key={member.id}
                className="p-3 rounded-2xl bg-[#14151d] border border-[#242636] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span>{member.name}</span>
                    {member.isHost && (
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-purple-950/50 text-purple-400 border border-purple-500/30">
                        Host
                      </span>
                    )}
                  </span>
                  <span className="text-[10px] text-neutral-500">{member.joinedAt}</span>
                </div>

                <div className="divide-y divide-[#202230]">
                  {member.items.map((item, idx) => (
                    <div key={idx} className="py-1 flex items-center justify-between text-neutral-300">
                      <span>{item.quantity}x {item.name}</span>
                      <span className="font-bold text-white">৳{item.totalPrice * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Group Checkout CTA */}
        <button
          onClick={() => {
            onClose();
            onProceedToCheckout();
          }}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] hover:brightness-110 text-white font-black text-sm shadow-xl shadow-orange-950/50 flex items-center justify-between px-5 transition-all cursor-pointer"
        >
          <span>Consolidated Group Checkout</span>
          <span className="text-base">৳{groupTotal}</span>
        </button>
      </div>
    </div>
  );
};
