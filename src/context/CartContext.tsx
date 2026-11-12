/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, Coupon, Restaurant } from '../types';

interface CartContextType {
  items: CartItem[];
  restaurantId: string | null;
  restaurant: Restaurant | null;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  appliedCoupon: Coupon | null;
  conflictModal: { isOpen: boolean; pendingItem?: { item: CartItem; rest: Restaurant } };
  addItem: (item: CartItem, rest: Restaurant) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  applyCoupon: (coupon: Coupon) => { success: boolean; message: string };
  removeCoupon: () => void;
  clearCart: () => void;
  confirmSwitchRestaurant: () => void;
  cancelSwitchRestaurant: () => void;
}

const CART_STORAGE_KEY = 'zomato_craver_cart_v1';

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [restaurant, setRestaurant] = useState<Restaurant | null>(() => {
    try {
      const saved = localStorage.getItem(`${CART_STORAGE_KEY}_rest`);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [conflictModal, setConflictModal] = useState<{
    isOpen: boolean;
    pendingItem?: { item: CartItem; rest: Restaurant };
  }>({ isOpen: false });

  // Sync to storage
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      if (restaurant) {
        localStorage.setItem(`${CART_STORAGE_KEY}_rest`, JSON.stringify(restaurant));
      } else {
        localStorage.removeItem(`${CART_STORAGE_KEY}_rest`);
      }
    } catch (e) {
      console.warn('Storage sync failed:', e);
    }
  }, [items, restaurant]);

  const restaurantId = useMemo(() => restaurant?.id || null, [restaurant]);

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0),
    [items]
  );

  const deliveryFee = useMemo(() => {
    if (items.length === 0) return 0;
    if (appliedCoupon?.code === 'FREEDEL') return 0;
    return restaurant?.deliveryFee ?? 40;
  }, [items.length, appliedCoupon, restaurant]);

  // Tax 5%
  const tax = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.round(subtotal * 0.05);
  }, [items.length, subtotal]);

  const discount = useMemo(() => {
    if (!appliedCoupon || items.length === 0) return 0;
    if (subtotal < appliedCoupon.minOrderAmount) return 0;

    if (appliedCoupon.discountType === 'percentage') {
      const calc = Math.round((subtotal * appliedCoupon.discountValue) / 100);
      return appliedCoupon.maxDiscount ? Math.min(calc, appliedCoupon.maxDiscount) : calc;
    } else {
      return appliedCoupon.discountValue;
    }
  }, [appliedCoupon, items.length, subtotal]);

  const total = useMemo(() => {
    if (items.length === 0) return 0;
    return Math.max(0, subtotal + deliveryFee + tax - discount);
  }, [items.length, subtotal, deliveryFee, tax, discount]);

  const addItem = useCallback(
    (item: CartItem, rest: Restaurant) => {
      // Check if from different restaurant
      if (items.length > 0 && restaurant && restaurant.id !== rest.id) {
        setConflictModal({
          isOpen: true,
          pendingItem: { item, rest },
        });
        return;
      }

      setRestaurant(rest);
      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.id === item.id);
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + item.quantity,
          };
          return updated;
        }
        return [...prev, item];
      });
    },
    [items.length, restaurant]
  );

  const removeItem = useCallback((cartItemId: string) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== cartItemId);
      if (next.length === 0) {
        setRestaurant(null);
        setAppliedCoupon(null);
      }
      return next;
    });
  }, []);

  const updateQuantity = useCallback((cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      setItems((prev) => {
        const next = prev.filter((i) => i.id !== cartItemId);
        if (next.length === 0) {
          setRestaurant(null);
          setAppliedCoupon(null);
        }
        return next;
      });
      return;
    }

    setItems((prev) =>
      prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQty } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setRestaurant(null);
    setAppliedCoupon(null);
  }, []);

  const confirmSwitchRestaurant = useCallback(() => {
    if (conflictModal.pendingItem) {
      setItems([conflictModal.pendingItem.item]);
      setRestaurant(conflictModal.pendingItem.rest);
      setAppliedCoupon(null);
    }
    setConflictModal({ isOpen: false });
  }, [conflictModal]);

  const cancelSwitchRestaurant = useCallback(() => {
    setConflictModal({ isOpen: false, pendingItem: undefined });
  }, []);

  const applyCoupon = useCallback(
    (coupon: Coupon) => {
      if (!coupon.isActive) {
        return { success: false, message: 'This coupon is no longer active.' };
      }
      if (subtotal < coupon.minOrderAmount) {
        return {
          success: false,
          message: `Add ৳${coupon.minOrderAmount - subtotal} more to apply this coupon (Minimum order ৳${coupon.minOrderAmount})`,
        };
      }
      setAppliedCoupon(coupon);
      return { success: true, message: `Coupon ${coupon.code} applied successfully!` };
    },
    [subtotal]
  );

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        restaurantId,
        restaurant,
        itemCount,
        subtotal,
        deliveryFee,
        tax,
        discount,
        total,
        appliedCoupon,
        conflictModal,
        addItem,
        removeItem,
        updateQuantity,
        applyCoupon,
        removeCoupon,
        clearCart,
        confirmSwitchRestaurant,
        cancelSwitchRestaurant,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
