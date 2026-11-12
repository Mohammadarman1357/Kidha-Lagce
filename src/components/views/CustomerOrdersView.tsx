/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Clock, ChevronRight, RotateCcw, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import { Order } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { listenCustomerOrders, addReview } from '../../services/foodDeliveryService';

interface CustomerOrdersViewProps {
  onSelectOrder: (order: Order) => void;
  onReorder: (order: Order) => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  onSelectOrder,
  onReorder,
}) => {
  const { user, profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviewModalOrder, setReviewModalOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const customerId = user?.uid || profile?.uid || 'guest-user';

  useEffect(() => {
    const unsub = listenCustomerOrders(customerId, (fetched) => {
      setOrders(fetched);
    });
    return () => unsub();
  }, [customerId]);

  const handleReviewSubmit = async () => {
    if (!reviewModalOrder) return;
    setIsSubmittingReview(true);
    try {
      await addReview({
        id: `rev-${Date.now()}`,
        orderId: reviewModalOrder.id,
        restaurantId: reviewModalOrder.restaurantId,
        customerId,
        customerName: profile?.name || 'Customer',
        rating,
        comment: comment.trim() || 'Great food and on-time delivery!',
        createdAt: new Date().toISOString(),
      });
      setReviewModalOrder(null);
      setComment('');
      alert('Thank you for rating your food experience!');
    } catch (e) {
      console.error('Review submission failed:', e);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white">Your Food Orders</h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time status updates and order history
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#1c1e27] border border-[#2b2d3d] text-neutral-300">
          {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
        </span>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => {
            const isLive = !['delivered', 'cancelled'].includes(order.status);
            const totalItemsCount = order.items.reduce((sum, i) => sum + i.quantity, 0);

            return (
              <div
                key={order.id}
                className="bg-[#181922] border border-[#252838] hover:border-[#383b52] rounded-3xl p-5 shadow-lg transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 border border-[#282a3c] overflow-hidden shrink-0">
                      {order.restaurantImage ? (
                        <img
                          src={order.restaurantImage}
                          alt={order.restaurantName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🍲
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm sm:text-base text-white">
                        {order.restaurantName}
                      </h3>
                      <div className="text-[11px] text-neutral-400 flex items-center gap-2 mt-0.5">
                        <span>{order.orderNumber}</span>
                        <span>•</span>
                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider ${
                      isLive
                        ? 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/40 animate-pulse'
                        : order.status === 'delivered'
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-950/40 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Items preview */}
                <div className="text-xs text-neutral-300 bg-[#14151d] p-3 rounded-2xl border border-[#232535]">
                  <div className="font-medium line-clamp-1">
                    {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-neutral-400 mt-2 pt-2 border-t border-[#232535]">
                    <span>Total Amount ({totalItemsCount} items):</span>
                    <span className="font-black text-white text-xs">৳{order.total}</span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  {order.status === 'delivered' && (
                    <button
                      onClick={() => setReviewModalOrder(order)}
                      className="px-3.5 py-2 rounded-xl bg-[#222432] hover:bg-[#2b2d3d] text-amber-400 font-bold text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>Rate Food</span>
                    </button>
                  )}

                  <button
                    onClick={() => onReorder(order)}
                    className="px-3.5 py-2 rounded-xl bg-[#222432] hover:bg-[#2b2d3d] text-neutral-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reorder</span>
                  </button>

                  <button
                    onClick={() => onSelectOrder(order)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] hover:brightness-110 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-orange-950/50"
                  >
                    <span>{isLive ? 'Track Live' : 'View Details'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty Orders */
        <div className="bg-[#181922] border border-[#252838] rounded-3xl p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-[#1e202b] mx-auto flex items-center justify-center text-4xl mb-4">
            🛵
          </div>
          <h3 className="font-bold text-white text-lg">No food orders yet</h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            Once you place an order, its live preparation, rider movement, and delivery updates will appear right here.
          </p>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm bg-[#1c1e27] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">
              Rate your food from {reviewModalOrder.restaurantName}
            </h3>

            {/* Stars */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'
                    }`}
                  />
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-neutral-300">Your Review</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How was the taste, packaging, and portion size?"
                rows={3}
                className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setReviewModalOrder(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#252838] text-neutral-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview}
                className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#ff5722] text-white text-xs font-bold"
              >
                {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
