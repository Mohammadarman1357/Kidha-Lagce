/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'manager' | 'customer' | 'rider';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  addresses?: DeliveryAddress[];
  assignedRestaurantId?: string;
  riderId?: string;
  walletBalance?: number;
  rewardPoints?: number;
  createdAt: string;
}

export interface DeliveryAddress {
  id: string;
  label: string; // 'Home' | 'Work' | 'Other'
  addressLine: string;
  city: string;
  area: string;
  landmark?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  description: string;
  cuisineTypes: string[];
  rating: number;
  ratingCount: number;
  deliveryTimeMinutes: number;
  deliveryFee: number;
  minOrder: number;
  address: string;
  city: string;
  image: string;
  banner: string;
  isOpen: boolean;
  openingHours: string;
  managerId?: string;
  featured?: boolean;
  priceRange: '$' | '$$' | '$$$' | '$$$$';
  createdAt?: string;
}

export interface MenuOptionChoice {
  id: string;
  name: string;
  price: number;
}

export interface MenuOptionGroup {
  id: string;
  name: string;
  type: 'single' | 'multiple';
  required: boolean;
  maxChoices?: number;
  choices: MenuOptionChoice[];
}

export interface MenuItem {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  categoryId: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  rating: number;
  ratingCount?: number;
  tags?: string[];
  stockCount?: number;
  isLowStock?: boolean;
  options?: MenuOptionGroup[];
  createdAt?: string;
}

export interface FoodCategory {
  id: string;
  name: string;
  icon: string;
  image: string;
}

export interface CartItemOptionSelected {
  groupId: string;
  groupName: string;
  choiceId: string;
  choiceName: string;
  price: number;
}

export interface CartItem {
  id: string; // unique cart item id (includes options hash)
  menuItemId: string;
  restaurantId: string;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
  quantity: number;
  selectedOptions: CartItemOptionSelected[];
  specialInstructions?: string;
  totalPrice: number;
}

export type OrderStatus =
  | 'placed'
  | 'confirmed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod =
  | 'bkash'
  | 'nagad'
  | 'sslcommerz'
  | 'stripe'
  | 'wallet'
  | 'cod';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded';

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage?: string;
  restaurantAddress?: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  discount: number;
  total: number;
  appliedCoupon?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentTransactionId?: string;
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  deliveryAddress: DeliveryAddress;
  deliveryInstructions?: string;
  estimatedDeliveryMinutes: number;
  deliveryOtp?: string; // 4-digit code for rider verification
  scheduledTime?: string; // e.g. "Tomorrow, 1:30 PM"
  isGroupOrder?: boolean;
  groupOrderId?: string;
  rider?: {
    id?: string;
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    currentLat?: number;
    currentLng?: number;
  };
  createdAt: string;
  updatedAt: string;
  cancelReason?: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  isActive: boolean;
  expiresAt: string;
  usageCount: number;
}

export interface Review {
  id: string;
  orderId?: string;
  restaurantId: string;
  customerId: string;
  customerName: string;
  customerAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'order' | 'promo' | 'system' | 'rider';
  read: boolean;
  createdAt: string;
  orderId?: string;
}

export interface PromotionalBanner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  code?: string;
  image: string;
  gradient: string;
  ctaText: string;
  actionType: 'category' | 'restaurant' | 'coupon';
  actionTarget: string;
}

// -------------------------------------------------------------
// Delivery Rider App Entities
// -------------------------------------------------------------
export interface RiderProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  avatar: string;
  vehicleType: 'Motorcycle' | 'Bicycle' | 'Electric Scooter';
  vehiclePlate: string;
  nidOrPassport: string;
  isOnline: boolean;
  approvalStatus: 'pending' | 'approved' | 'suspended';
  currentRating: number;
  totalTrips: number;
  todayEarnings: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  walletBalance: number;
  currentLat: number;
  currentLng: number;
  joinedAt: string;
}

export interface RiderPayout {
  id: string;
  riderId: string;
  amount: number;
  method: 'bkash' | 'nagad' | 'bank';
  accountNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requestedAt: string;
  completedAt?: string;
}

// -------------------------------------------------------------
// Customer Wallet & Loyalty Program
// -------------------------------------------------------------
export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  source: 'topup' | 'order_payment' | 'refund' | 'reward_redemption' | 'cashback';
  timestamp: string;
  referenceId?: string;
}

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface LoyaltyProfile {
  userId: string;
  points: number;
  tier: LoyaltyTier;
  totalPointsEarned: number;
  referralCode: string;
  referredCount: number;
}

// -------------------------------------------------------------
// Group Ordering
// -------------------------------------------------------------
export interface GroupOrderMember {
  id: string;
  name: string;
  isHost: boolean;
  items: CartItem[];
  joinedAt: string;
}

export interface GroupOrder {
  id: string;
  code: string;
  hostId: string;
  hostName: string;
  restaurantId: string;
  restaurantName: string;
  restaurantImage: string;
  members: GroupOrderMember[];
  status: 'open' | 'locked' | 'ordered';
  deadlineMinutes: number;
  createdAt: string;
}

// -------------------------------------------------------------
// Food Subscription Plans
// -------------------------------------------------------------
export interface SubscriptionPlan {
  id: string;
  title: string;
  tagline: string;
  cadence: 'Daily Lunch' | 'Weekly Plan' | 'Monthly Feast';
  price: number;
  features: string[];
  image: string;
  status: 'active' | 'paused' | 'cancelled';
  renewalDate: string;
  mealsCount: number;
}

// -------------------------------------------------------------
// Table Reservation
// -------------------------------------------------------------
export interface TableReservation {
  id: string;
  restaurantId: string;
  restaurantName: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  guestsCount: number;
  date: string;
  timeSlot: string;
  tableZone: 'AC Main Hall' | 'Rooftop Lounge' | 'Family Private Booth';
  specialRequests?: string;
  status: 'confirmed' | 'seated' | 'completed' | 'cancelled';
  createdAt: string;
}

// -------------------------------------------------------------
// Customer Support Ticket
// -------------------------------------------------------------
export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderNumber?: string;
  subject: string;
  issueType: 'delivery_delay' | 'missing_item' | 'food_quality' | 'refund_request' | 'other';
  status: 'open' | 'investigating' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  messages: {
    sender: 'user' | 'agent';
    text: string;
    time: string;
  }[];
}

