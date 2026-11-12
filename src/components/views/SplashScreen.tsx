/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Flame, ArrowRight, Sparkles, Bike, ShieldCheck, Heart } from 'lucide-react';

interface SplashScreenProps {
  onDismiss: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onDismiss }) => {
  const [slide, setSlide] = useState(0);

  const slides = [
    {
      badge: 'খিদা লাগছে?',
      title: 'KIDHA LAGCE',
      subtitle: 'Your Food, Your Cravings!',
      bengali: 'গরম গরম খাবার সরাসরি আপনার দরজায়',
      desc: 'Order from Bangladesh’s most iconic restaurants with live GPS tracking and lightning fast delivery.',
      icon: Flame,
      color: 'from-[#FF6B35] to-[#f4511e]',
    },
    {
      badge: 'SPEED & FRESHNESS',
      title: 'FAST 25-MIN DELIVERY',
      subtitle: 'Hot & Sealed Packaging',
      bengali: 'দ্রুততম ডেলিভারি ও রিয়েল-টাইম ট্র্যাকিং',
      desc: 'Watch your chef prepare and your delivery partner navigate right to your door in real-time.',
      icon: Bike,
      color: 'from-amber-500 to-orange-600',
    },
    {
      badge: 'SEAMLESS PAYMENTS',
      title: 'BKASH, NAGAD & COD',
      subtitle: 'Instant & Secure Checkout',
      bengali: 'বিকাশ, নগদ কিংবা ক্যাশ অন ডেলিভারি',
      desc: 'Pay effortlessly using your favorite Bangladeshi mobile financial services or cash on arrival.',
      icon: ShieldCheck,
      color: 'from-emerald-500 to-teal-600',
    },
  ];

  const current = slides[slide];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-[#0c0d12] text-white flex flex-col justify-between p-6 sm:p-10 overflow-hidden animate-in fade-in duration-300">
      {/* Background radial glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FF6B35]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Brand & Skip */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF6B35] to-[#f4511e] flex items-center justify-center shadow-lg shadow-orange-950/50">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-black text-sm tracking-tight text-white">KIDHA LAGCE</span>
            <span className="text-[10px] text-[#FF6B35] block font-bold -mt-0.5">খিদা লাগছে</span>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="text-xs font-bold text-neutral-400 hover:text-white px-3 py-1.5 rounded-xl bg-[#181922] border border-[#2b2d3d] transition-colors"
        >
          Skip to Food
        </button>
      </div>

      {/* Center Hero Visual */}
      <div className="max-w-md mx-auto text-center z-10 py-8 flex flex-col items-center">
        {/* Animated Brand Emblem */}
        <div className="relative mb-6">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#FF6B35] via-[#ff5722] to-amber-500 p-1 shadow-2xl shadow-orange-950/60 animate-bounce duration-1000">
            <div className="w-full h-full rounded-[22px] bg-[#121319] flex flex-col items-center justify-center">
              <Icon className="w-12 h-12 text-[#FF6B35]" />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-black font-black">
            ★
          </div>
        </div>

        {/* Tagline Badge */}
        <span className="inline-block px-3 py-1 rounded-full bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF6B35] text-[11px] font-black uppercase tracking-wider mb-2">
          {current.badge}
        </span>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
          {current.title}
        </h1>

        <p className="text-lg font-bold text-[#FF6B35] mt-0.5">
          {current.bengali}
        </p>

        <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-sm leading-relaxed">
          {current.desc}
        </p>

        {/* Dots Indicators */}
        <div className="flex items-center gap-2 mt-6">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className={`h-1.5 rounded-full transition-all ${
                slide === i ? 'w-6 bg-[#FF6B35]' : 'w-2 bg-[#2a2c3d]'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom CTA Button */}
      <div className="max-w-md mx-auto w-full z-10 space-y-3">
        {slide < slides.length - 1 ? (
          <button
            onClick={() => setSlide((s) => s + 1)}
            className="w-full py-4 rounded-2xl bg-[#1c1e27] hover:bg-[#252837] border border-[#2d3042] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4 text-[#FF6B35]" />
          </button>
        ) : (
          <button
            onClick={onDismiss}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] hover:brightness-110 active:scale-[0.99] text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-950/60 transition-all cursor-pointer"
          >
            <span>Start Exploring Food</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}

        <div className="text-center text-[11px] text-neutral-400 font-medium">
          Developed by <strong className="text-[#FF6B35]">Mohammad Arman</strong>
        </div>
      </div>
    </div>
  );
};
