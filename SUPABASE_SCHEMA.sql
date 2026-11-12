-- =========================================================================
-- KIDHA LAGCE (খিদা লাগছে) – COMPLETE POSTGRESQL & SUPABASE DATABASE SCHEMA
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES & ROLES
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'customer');

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uid TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'customer',
    phone TEXT,
    avatar_url TEXT,
    assigned_restaurant_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RESTAURANTS
CREATE TABLE IF NOT EXISTS public.restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    tagline TEXT,
    description TEXT,
    cuisine_types TEXT[] NOT NULL DEFAULT '{}',
    rating NUMERIC(2,1) DEFAULT 4.8,
    rating_count INT DEFAULT 0,
    delivery_time_minutes INT DEFAULT 30,
    delivery_fee INT DEFAULT 40,
    min_order INT DEFAULT 200,
    address TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT DEFAULT 'Dhaka',
    image_url TEXT NOT NULL,
    banner_url TEXT,
    is_open BOOLEAN DEFAULT TRUE,
    opening_hours TEXT DEFAULT '11:00 AM - 11:30 PM',
    manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    featured BOOLEAN DEFAULT FALSE,
    price_range TEXT DEFAULT '$$',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. FOOD CATEGORIES
CREATE TABLE IF NOT EXISTS public.food_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    image_url TEXT NOT NULL,
    display_order INT DEFAULT 0
);

-- 4. MENU ITEMS
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price INT NOT NULL,
    original_price INT,
    category_id UUID REFERENCES public.food_categories(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    is_veg BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    rating NUMERIC(2,1) DEFAULT 4.8,
    rating_count INT DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MENU ITEM OPTIONS & ADD-ONS
CREATE TABLE IF NOT EXISTS public.menu_item_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('single', 'multiple')),
    required BOOLEAN DEFAULT FALSE,
    max_choices INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.menu_item_option_choices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_id UUID NOT NULL REFERENCES public.menu_item_options(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INT DEFAULT 0
);

-- 6. CUSTOMER DELIVERY ADDRESSES
CREATE TABLE IF NOT EXISTS public.addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    label TEXT NOT NULL, -- 'Home' | 'Work' | 'Other'
    address_line TEXT NOT NULL,
    area TEXT NOT NULL,
    city TEXT DEFAULT 'Dhaka',
    landmark TEXT,
    phone TEXT NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. ORDERS & STATUS HISTORY
CREATE TYPE order_status AS ENUM (
    'placed',
    'confirmed',
    'preparing',
    'ready_for_pickup',
    'out_for_delivery',
    'delivered',
    'cancelled'
);

CREATE TYPE payment_method AS ENUM (
    'bkash',
    'nagad',
    'sslcommerz',
    'stripe',
    'cod'
);

CREATE TYPE payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);

CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES public.profiles(id),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
    restaurant_name TEXT NOT NULL,
    subtotal INT NOT NULL,
    delivery_fee INT NOT NULL DEFAULT 40,
    tax INT NOT NULL DEFAULT 0,
    discount INT DEFAULT 0,
    total INT NOT NULL,
    applied_coupon TEXT,
    payment_method payment_method NOT NULL DEFAULT 'bkash',
    payment_status payment_status NOT NULL DEFAULT 'pending',
    payment_transaction_id TEXT,
    status order_status NOT NULL DEFAULT 'placed',
    delivery_address JSONB NOT NULL,
    delivery_instructions TEXT,
    estimated_delivery_minutes INT DEFAULT 30,
    rider_info JSONB,
    cancel_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES public.menu_items(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    price INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    selected_options JSONB DEFAULT '[]',
    special_instructions TEXT,
    total_price INT NOT NULL
);

-- 8. COUPONS & VOUCHERS
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value INT NOT NULL,
    min_order_amount INT NOT NULL DEFAULT 0,
    max_discount INT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. REVIEWS & RATINGS
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id),
    customer_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'order',
    is_read BOOLEAN DEFAULT FALSE,
    order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper functions for RLS
CREATE OR REPLACE FUNCTION is_admin() RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE uid = auth.uid()::text AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_manager_of(rest_id UUID) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE uid = auth.uid()::text AND (role = 'admin' OR assigned_restaurant_id = rest_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Public can view restaurants & menus
CREATE POLICY "Public can read restaurants" ON public.restaurants FOR SELECT USING (true);
CREATE POLICY "Public can read menu items" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "Public can read coupons" ON public.coupons FOR SELECT USING (is_active = true);
CREATE POLICY "Public can read reviews" ON public.reviews FOR SELECT USING (true);

-- Customers can view & create their own orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT 
USING (
    customer_id IN (SELECT id FROM public.profiles WHERE uid = auth.uid()::text) 
    OR is_admin() 
    OR is_manager_of(restaurant_id)
);

CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT 
WITH CHECK (
    customer_id IN (SELECT id FROM public.profiles WHERE uid = auth.uid()::text)
);

-- Managers can update their assigned restaurant's orders
CREATE POLICY "Managers and Admin can update orders" ON public.orders FOR UPDATE 
USING (is_manager_of(restaurant_id) OR is_admin());

-- Notifications
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT 
USING (user_id IN (SELECT id FROM public.profiles WHERE uid = auth.uid()::text));
