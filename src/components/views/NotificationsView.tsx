/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Bell, Sparkles, Bike, CheckCircle2, Tag, Clock, ArrowRight } from 'lucide-react';
import { NotificationItem } from '../../types';

interface NotificationsViewProps {
  onApplyCoupon?: (code: string) => void;
  onTrackOrder?: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  onApplyCoupon,
  onTrackOrder,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      userId: 'all',
      title: 'খিদা লাগছে? Flat 50% Discount!',
      message: 'Use voucher code KIDHA50 at checkout to save up to ৳200 on your feast.',
      type: 'promo',
      read: false,
      createdAt: 'Just now',
    },
    {
      id: 'notif-2',
      userId: 'all',
      title: 'Free Delivery Active across Dhaka',
      message: 'Apply coupon code FREEDEL on any order above ৳499 for ৳0 delivery charge.',
      type: 'promo',
      read: false,
      createdAt: '1 hour ago',
    },
    {
      id: 'notif-3',
      userId: 'user',
      title: 'Live Order Updates Active',
      message: 'Your kitchen status, rider motorcycle tracking, and arrival timers sync in real-time.',
      type: 'order',
      read: true,
      createdAt: 'Today, 11:30 AM',
    },
    {
      id: 'notif-4',
      userId: 'system',
      title: 'Welcome to Kidha Lagce (খিদা লাগছে)!',
      message: 'Explore over 100+ partner restaurants in Banani, Gulshan, Dhanmondi, and Uttara.',
      type: 'system',
      read: true,
      createdAt: 'Yesterday',
    },
  ]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#FF6B35]" />
            <span>Notifications & Offers</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Stay updated with your cravings, deliveries, and discount vouchers
          </p>
        </div>

        <button
          onClick={markAllRead}
          className="text-xs font-bold text-[#FF6B35] hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 rounded-3xl border transition-all flex items-start gap-3.5 ${
              !notif.read
                ? 'bg-[#181922] border-[#FF6B35]/40 shadow-lg shadow-orange-950/20'
                : 'bg-[#14151d] border-[#242636]'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                notif.type === 'promo'
                  ? 'bg-[#FF6B35]/20 text-[#FF6B35]'
                  : notif.type === 'order'
                  ? 'bg-emerald-950/40 text-emerald-400'
                  : 'bg-blue-950/40 text-blue-400'
              }`}
            >
              {notif.type === 'promo' ? (
                <Tag className="w-5 h-5" />
              ) : notif.type === 'order' ? (
                <Bike className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-sm text-white">{notif.title}</h4>
                <span className="text-[10px] text-neutral-500 shrink-0">{notif.createdAt}</span>
              </div>
              <p className="text-xs text-neutral-300 mt-1 leading-relaxed">{notif.message}</p>

              {notif.type === 'promo' && notif.message.includes('KIDHA50') && onApplyCoupon && (
                <button
                  onClick={() => onApplyCoupon('KIDHA50')}
                  className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#FF6B35] bg-[#FF6B35]/15 px-3 py-1 rounded-xl hover:bg-[#FF6B35]/25 transition-colors"
                >
                  <span>Apply Code KIDHA50</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
