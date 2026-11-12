# Kidha Lagce (খিদা লাগছে) – Your Food, Your Cravings!

> **Premier Food Delivery & Restaurant Platform for Bangladesh**  
> Inspired by international food delivery architectures, tailored with local payment integrations (bKash, Nagad, SSLCommerz), real-time order tracking, and three distinct role portals (Customer, Restaurant Manager, and Administrator).

---

## 📱 Application Overview

**Kidha Lagce** is a full-stack, production-ready food delivery platform designed with a premium food-focused dark aesthetic, warm orange flame accents (`#FF6B35`), crisp typography, and responsive mobile-first Material 3 components.

- **Official Name**: Kidha Lagce (খিদা লাগছে)
- **Tagline**: *Your Food, Your Cravings!*
- **Package Identifier**: `com.kidhalagce.app`
- **Target Platform**: Android (via Capacitor 6 / Android Studio) & Progressive Web App

---

## 👥 Three Secure Role Portals

### 1. Customer Portal (Android Mobile-First & Desktop)
- **Personalized Discovery**: Location picker with Dhaka neighborhoods (Banani, Gulshan, Dhanmondi, Uttara, Mirpur, Bashundhara).
- **Food Cravings Carousel**: Biryani & Kacchi, Gourmet Burgers, Artisan Pizza, Pan-Asian & Ramen, Charcoal Kababs, Desserts, Shakes, and Salads.
- **Restaurant Listings & Menus**: High-res photography, star ratings, delivery time estimates, minimum order thresholds, and pure veg indicators.
- **Dish Customization**: Portion size selection, extra sides (e.g., Shahi Borhani, Zafrani Jorda), spice levels, and special chef instructions.
- **Cart & Multi-Restaurant Conflict Guard**: Automatically prevents mixing food across different outlets while offering 1-click replacement.
- **Discount Voucher Engine**: Automatic discount calculation (`KIDHA50`, `CRAVING30`, `FREEDEL`, `WELCOME100`).
- **MFS & Card Checkout**:
  - **bKash**: Direct MFS session simulation with secure PIN verification.
  - **Nagad**: Instant MFS transaction flow.
  - **SSLCommerz**: Credit/debit card and internet banking.
  - **Stripe**: International card processing.
  - **Cash on Delivery (COD)**: Pay when food arrives.
- **6-Step Live Order Tracking**:
  1. *Order Placed*
  2. *Order Confirmed*
  3. *Preparing Food*
  4. *Ready for Pickup*
  5. *Out for Delivery* (Simulated motorcycle rider route, driver contact, vehicle plate)
  6. *Delivered*
- **Order Cancellation**: Allowed before the kitchen starts cooking.
- **Ratings & Reviews**: Star ratings and feedback stored per restaurant.
- **Favorites & Notifications**: Instant access to liked outlets and promotional discounts.

### 2. Restaurant Manager Dashboard
- **Kitchen Display System (KDS)**: Real-time incoming order stream with sound/visual pulse.
- **One-Click Order Advancement**: Move orders from Confirmed → Cooking → Ready → Out for Delivery → Delivered.
- **Menu Dish Stock Toggles**: Toggle dishes between *In Stock (Available)* and *Sold Out* in real time.
- **Outlet Availability**: Toggle restaurant status between *Accepting Orders* and *Store Offline*.
- **Add New Dishes**: Form to create new menu items with prices, photos, and categories.

### 3. Administrator Dashboard
- **Gross Merchandise Value (GMV)** & Platform Revenue KPIs.
- **Interactive Weekly Revenue Trends**: Dynamic graphical representation of volume and earnings.
- **Merchant Outlets Directory**: Add, edit, or deactivate restaurants across cities.
- **Global Order Control**: View all customer orders, execute admin cancellations, and trigger refunds.
- **Promo Coupon Builder**: Create percentage or fixed-amount vouchers with minimum order limits and expiry dates.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite |
| **Styling & Design** | Tailwind CSS v4, Lucide Icons, Motion |
| **Database & Realtime** | Firebase Firestore (Live `onSnapshot` listeners) & PostgreSQL/Supabase |
| **Authentication** | Firebase Auth (Google Sign-In Popup & Email/Password) |
| **Mobile Packaging** | Capacitor 6 Android Native Wrapper |
| **Deployment Target** | Google Cloud Run, Vercel, or Android APK/AAB |

---

## 🗄️ Database Architecture

The application is wired with a complete normalized schema representation:
1. `users` / `profiles` (uid, role, phone, addresses, assigned_restaurant_id)
2. `restaurants` (id, name, tagline, cuisines, rating, delivery fee, address, is_open)
3. `food_categories` (id, name, icon, image)
4. `menu_items` (id, restaurant_id, name, price, is_veg, is_available, options)
5. `orders` (id, order_number, customer, restaurant, items, subtotal, total, status, payment)
6. `coupons` (id, code, discount_type, discount_value, min_order, is_active)
7. `reviews` (id, restaurant_id, customer_id, rating, comment)
8. `notifications` (id, user_id, title, message, type, read)

*(See `SUPABASE_SCHEMA.sql` in the repository root for the full PostgreSQL DDL and Row Level Security policies).*

---

## 🤖 Android APK & Google Play Store Build Instructions

### Prerequisites
- Node.js 18+
- Android Studio Hedgehog / Iguana / Ladybug
- Android SDK (API 34)

### 1. Build Production Assets
```bash
npm run build
```

### 2. Install Capacitor CLI & Core
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/splash-screen @capacitor/status-bar
```

### 3. Initialize the Android Native Project
```bash
npx cap add android
npx cap sync android
```

### 4. Open in Android Studio
```bash
npx cap open android
```

### 5. Generate Signed APK / AAB
1. In Android Studio, go to **Build > Generate Signed Bundle / APK**.
2. Select **Android App Bundle** (AAB) for Google Play Store or **APK** for direct testing.
3. Select or create your release Keystore (`release-key.jks`).
4. Select `release` build variant and click **Finish**.
5. Your signed production binary will be generated in `android/app/release/`.

---

## 🔐 Environment Variables (`.env.example`)

```bash
# GEMINI_API_KEY: Injected by AI Studio for optional AI features
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

# APP_URL: Public URL of the web application
APP_URL="https://your-domain.com"
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start Vite dev server on port 3000
npm run dev

# Run TypeScript linter
npm run lint

# Build production bundle
npm run build
```

## 👨‍💻 Developer
**Developed by Mohammad Arman**

---

## 📄 License
Apache-2.0
