/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Shield,
  Heart,
  ShoppingBag,
  Smartphone,
  LogOut,
  ChevronRight,
  Plus,
  Flame,
  Globe,
  Bell,
  Wallet,
  Sparkles,
  Award,
  Calendar,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  CheckCircle2,
  X,
  CreditCard,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  listenWalletTransactions,
  topUpCustomerWallet,
  listenLoyaltyProfile,
  listenSubscriptions,
  toggleSubscription,
  listenSupportTickets,
  createSupportTicket,
  createTableReservation,
} from '../../services/foodDeliveryService';
import {
  WalletTransaction,
  LoyaltyProfile,
  SubscriptionPlan,
  SupportTicket,
  TableReservation,
} from '../../types';

interface ProfileViewProps {
  onOpenAddressModal: () => void;
  onOpenAuthModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  onOpenAddressModal,
  onOpenAuthModal,
  onNavigateTab,
}) => {
  const { user, profile, role, switchRole, logout, addresses, activeAddress, walletBalance, setWalletBalance } = useAuth();
  const [language, setLanguage] = useState<'bn' | 'en'>('en');

  // Modals
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(500);
  const [topUpMethod, setTopUpMethod] = useState<'bkash' | 'nagad' | 'card'>('bkash');
  const [topUpSuccess, setTopUpSuccess] = useState('');

  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [ticketCreated, setTicketCreated] = useState('');

  const [showReservationModal, setShowReservationModal] = useState(false);
  const [resDate, setResDate] = useState('Tomorrow');
  const [resTime, setResTime] = useState('08:00 PM');
  const [resGuests, setResGuests] = useState(2);
  const [resRest, setResRest] = useState('Kacchi Bhai - Royal Feast');
  const [resSuccess, setResSuccess] = useState('');

  const [copiedCode, setCopiedCode] = useState(false);

  // Real-time state
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyProfile | null>(null);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const userId = user?.uid || profile?.uid || 'guest-customer-001';

  useEffect(() => {
    const unsubTx = listenWalletTransactions(userId, (list) => setTransactions(list));
    const unsubLoyalty = listenLoyaltyProfile(userId, (p) => setLoyalty(p));
    const unsubSubs = listenSubscriptions((subs) => setSubscriptions(subs));
    const unsubTickets = listenSupportTickets(userId, (tkts) => setTickets(tkts));

    return () => {
      unsubTx();
      unsubLoyalty();
      unsubSubs();
      unsubTickets();
    };
  }, [userId]);

  const handleTopUpSubmit = async () => {
    await topUpCustomerWallet(userId, topUpAmount, topUpMethod);
    setWalletBalance((prev) => prev + topUpAmount);
    setTopUpSuccess(`৳${topUpAmount} added to your Kidha Wallet successfully!`);
    setTimeout(() => {
      setShowTopUpModal(false);
      setTopUpSuccess('');
    }, 1500);
  };

  const handleCreateTicket = async () => {
    if (!supportSubject || !supportMessage) return;
    const ticket: SupportTicket = {
      id: `tkt-${Date.now()}`,
      userId,
      userName: profile?.name || 'Habiba Arman',
      userEmail: profile?.email || 'armanhabiba903709@gmail.com',
      subject: supportSubject,
      issueType: 'other',
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      messages: [
        { sender: 'user', text: supportMessage, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ],
    };
    await createSupportTicket(ticket);
    setTicketCreated('Support ticket submitted! Our support agent will assist you in minutes.');
    setTimeout(() => {
      setShowSupportModal(false);
      setTicketCreated('');
      setSupportSubject('');
      setSupportMessage('');
    }, 2000);
  };

  const handleCreateReservation = async () => {
    const resObj: TableReservation = {
      id: `res-${Date.now()}`,
      restaurantId: 'rest-kacchi-bhai',
      restaurantName: resRest,
      customerId: userId,
      customerName: profile?.name || 'Habiba Arman',
      customerPhone: activeAddress?.phone || '+880 1712-345678',
      guestsCount: resGuests,
      date: resDate,
      timeSlot: resTime,
      tableZone: 'AC Main Hall',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };
    await createTableReservation(resObj);
    setResSuccess('Table reserved successfully! A confirmation SMS has been dispatched.');
    setTimeout(() => {
      setShowReservationModal(false);
      setResSuccess('');
    }, 2000);
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(loyalty?.referralCode || 'ARMAN-KIDHA-50');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto py-4 space-y-6 pb-24">
      {/* User Info Header Card */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-6 shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF6B35] to-[#f4511e] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-orange-950/40 shrink-0">
            {profile?.name ? profile.name.charAt(0).toUpperCase() : 'K'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-black text-white">
                {profile?.name || 'Habiba Arman'}
              </h1>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30">
                {role}
              </span>
            </div>
            <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
              <Mail className="w-3.5 h-3.5" />
              <span>{profile?.email || 'armanhabiba903709@gmail.com'}</span>
            </div>
            <div className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
              <Phone className="w-3.5 h-3.5" />
              <span>{activeAddress?.phone || '+880 1712-345678'}</span>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAuthModal}
          className="text-xs font-bold text-[#FF6B35] hover:underline shrink-0"
        >
          Switch Account
        </button>
      </div>

      {/* Customer In-App Wallet Card */}
      <div className="bg-gradient-to-br from-[#1c1e27] to-[#14151d] border border-[#2b2e3e] rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-400">Kidha Digital Wallet</div>
              <div className="text-2xl font-black text-white">৳{walletBalance}</div>
            </div>
          </div>

          <button
            onClick={() => setShowTopUpModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-xs shadow-md shadow-emerald-950/40 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Top Up</span>
          </button>
        </div>

        {/* Recent Wallet Transactions */}
        <div className="pt-2 border-t border-[#252838] space-y-2">
          <div className="text-[11px] font-bold text-neutral-400 uppercase">Recent Transactions</div>
          <div className="space-y-1.5">
            {transactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between text-xs py-1">
                <span className="text-neutral-300 truncate max-w-[240px]">{tx.description}</span>
                <span className={`font-black ${tx.type === 'credit' ? 'text-emerald-400' : 'text-neutral-300'}`}>
                  {tx.type === 'credit' ? `+৳${tx.amount}` : `-৳${tx.amount}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Kidha Loyalty & Rewards Program */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-neutral-400">Loyalty Rewards Club</div>
              <div className="text-base font-black text-white flex items-center gap-2">
                <span>{loyalty?.tier || 'Silver'} Member</span>
                <span className="text-xs text-amber-400 font-bold">({loyalty?.points || 480} pts)</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40">
              Earn 1 pt / ৳10
            </span>
          </div>
        </div>

        {/* Referral Code Box */}
        <div className="mt-2 p-3 bg-[#13141c] rounded-2xl border border-[#232535] flex items-center justify-between">
          <div>
            <div className="text-[10px] text-neutral-400">Invite a friend to get ৳100 off</div>
            <div className="text-xs font-black text-[#FF6B35] tracking-wider mt-0.5">
              {loyalty?.referralCode || 'ARMAN-KIDHA-50'}
            </div>
          </div>
          <button
            onClick={copyReferralCode}
            className="px-3 py-1.5 rounded-xl bg-[#222432] hover:bg-[#2c2f42] text-white text-[11px] font-bold flex items-center gap-1"
          >
            <Share2 className="w-3.5 h-3.5 text-[#FF6B35]" />
            <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onNavigateTab('orders')}
          className="bg-[#181922] hover:bg-[#202230] border border-[#252838] rounded-2xl p-4 text-left flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FF6B35]/20 flex items-center justify-center text-[#FF6B35]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">My Food Orders</div>
              <div className="text-[10px] text-neutral-400">Track & Reorder</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </button>

        <button
          onClick={() => onNavigateTab('favorites')}
          className="bg-[#181922] hover:bg-[#202230] border border-[#252838] rounded-2xl p-4 text-left flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-950/30 flex items-center justify-center text-red-500">
              <Heart className="w-5 h-5 fill-red-500" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Liked Outlets</div>
              <div className="text-[10px] text-neutral-400">Saved Cravings</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </button>
      </div>

      {/* Meal Subscriptions Section */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF6B35]" />
            <h3 className="text-sm font-bold text-white">Meal Subscription Plans</h3>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/40 px-2 py-0.5 rounded">
            Scheduled Daily Tiffins
          </span>
        </div>

        <div className="space-y-3">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className="p-3.5 rounded-2xl bg-[#14151d] border border-[#242636] flex items-center justify-between gap-3"
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{sub.title}</span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                      sub.status === 'active'
                        ? 'bg-emerald-950/50 text-emerald-400'
                        : 'bg-amber-950/50 text-amber-400'
                    }`}
                  >
                    {sub.status}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{sub.tagline}</div>
                <div className="text-xs font-black text-[#FF6B35] mt-1">
                  ৳{sub.price} / cycle ({sub.mealsCount} meals)
                </div>
              </div>

              <button
                onClick={() => toggleSubscription(sub.id, sub.status === 'active' ? 'paused' : 'active')}
                className="px-3 py-1.5 rounded-xl bg-[#222432] hover:bg-[#2c2f42] text-xs font-bold text-neutral-300 hover:text-white"
              >
                {sub.status === 'active' ? 'Pause' : 'Resume'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Table Reservation & Dine-In QR Section */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-lg flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#FF6B35]" />
            <span>Table Reservation & Dine-in</span>
          </h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Book AC hall or rooftop booths at top Dhaka restaurants without queues
          </p>
        </div>

        <button
          onClick={() => setShowReservationModal(true)}
          className="px-3.5 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#ff5722] text-white text-xs font-bold shrink-0 shadow-md"
        >
          Book Table
        </button>
      </div>

      {/* Customer Support & WhatsApp Help */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-lg space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span>Customer Care & Order Support</span>
        </h3>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <button
            onClick={() => setShowSupportModal(true)}
            className="p-3 rounded-2xl bg-[#14151d] hover:bg-[#202230] border border-[#252838] text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                <span>In-App Chat</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Submit complaint / refund</div>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </button>

          <a
            href="https://wa.me/8801700000000"
            target="_blank"
            rel="noreferrer"
            className="p-3 rounded-2xl bg-[#14151d] hover:bg-[#202230] border border-[#252838] text-left flex items-center justify-between"
          >
            <div>
              <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span>💬 WhatsApp Support</span>
              </div>
              <div className="text-[10px] text-neutral-400 mt-0.5">Instant live chat with agent</div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
          </a>
        </div>
      </div>

      {/* Saved Delivery Addresses Section */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#FF6B35]" />
            <h3 className="text-sm font-bold text-white">Saved Delivery Addresses</h3>
          </div>
          <button
            onClick={onOpenAddressModal}
            className="text-xs font-bold text-[#FF6B35] flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New</span>
          </button>
        </div>

        <div className="space-y-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-3.5 rounded-2xl bg-[#14151d] border border-[#242636] flex items-start justify-between gap-3"
            >
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{addr.label}</span>
                  {activeAddress?.id === addr.id && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/30">
                      Default Delivery
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-neutral-400 mt-0.5">{addr.addressLine}</div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  {addr.area}, {addr.city} • {addr.phone}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preferences & Settings */}
      <div className="bg-[#181922] border border-[#252838] rounded-3xl p-5 shadow-lg space-y-4">
        <h3 className="text-sm font-bold text-white">Preferences & App Settings</h3>

        <div className="space-y-3 text-xs">
          {/* Language Toggle */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5 text-neutral-300">
              <Globe className="w-4 h-4 text-[#FF6B35]" />
              <span>Language Preference (ভাষা)</span>
            </div>
            <div className="flex items-center bg-[#14151d] p-1 rounded-xl border border-[#282a3c]">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  language === 'en' ? 'bg-[#FF6B35] text-white' : 'text-neutral-400'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                  language === 'bn' ? 'bg-[#FF6B35] text-white' : 'text-neutral-400'
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>

          {/* Android Guide Shortcut */}
          <div
            onClick={() => onNavigateTab('android-info')}
            className="flex items-center justify-between py-1 cursor-pointer hover:text-white text-neutral-300"
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Capacitor Android Packaging Setup</span>
            </div>
            <ChevronRight className="w-4 h-4 text-neutral-500" />
          </div>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        onClick={() => logout()}
        className="w-full py-3.5 rounded-2xl bg-[#1c1e27] hover:bg-red-950/20 hover:border-red-500/40 border border-[#2c2f42] text-red-400 font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
        <span>Log Out of Kidha Lagce</span>
      </button>

      {/* Footer Branding */}
      <div className="text-center pt-2 space-y-1">
        <div className="text-xs font-black text-neutral-300 tracking-wider">
          KIDHA LAGCE <span className="text-[#FF6B35]">খিদা লাগছে</span>
        </div>
        <div className="text-xs font-semibold text-neutral-400">
          Developed by <strong className="text-[#FF6B35]">Mohammad Arman</strong>
        </div>
        <div className="text-[10px] text-neutral-500">
          Version 1.0.0 (Capacitor Android Production Ready)
        </div>
      </div>

      {/* Wallet Top-Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#1c1e27] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Top Up Kidha Wallet</h3>
              <button onClick={() => setShowTopUpModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-bold">Top-Up Amount (৳)</label>
                <div className="grid grid-cols-3 gap-2 mt-1.5">
                  {[300, 500, 1000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-2 rounded-xl font-bold border ${
                        topUpAmount === amt
                          ? 'bg-[#FF6B35] text-white border-[#FF6B35]'
                          : 'bg-[#14151d] border-[#282a3c] text-neutral-300'
                      }`}
                    >
                      ৳{amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-bold">Payment Method</label>
                <div className="grid grid-cols-2 gap-2 mt-1.5">
                  <button
                    onClick={() => setTopUpMethod('bkash')}
                    className={`py-2 rounded-xl font-bold border ${
                      topUpMethod === 'bkash' ? 'bg-[#E2136E] text-white border-[#E2136E]' : 'bg-[#14151d] text-neutral-400'
                    }`}
                  >
                    bKash
                  </button>
                  <button
                    onClick={() => setTopUpMethod('nagad')}
                    className={`py-2 rounded-xl font-bold border ${
                      topUpMethod === 'nagad' ? 'bg-[#F7941D] text-white border-[#F7941D]' : 'bg-[#14151d] text-neutral-400'
                    }`}
                  >
                    Nagad
                  </button>
                </div>
              </div>

              {topUpSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs">
                  {topUpSuccess}
                </div>
              )}
            </div>

            <button
              onClick={handleTopUpSubmit}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-bold text-xs shadow-lg"
            >
              Confirm ৳{topUpAmount} Recharge
            </button>
          </div>
        </div>
      )}

      {/* Support Chat Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#1c1e27] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Create Support Ticket</h3>
              <button onClick={() => setShowSupportModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-bold">Issue Subject</label>
                <input
                  type="text"
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  placeholder="e.g. Delayed delivery or Missing cutlery"
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-neutral-300 font-bold">Describe Your Concern</label>
                <textarea
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  rows={3}
                  placeholder="Provide order details and we'll resolve immediately..."
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-white"
                />
              </div>

              {ticketCreated && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs">
                  {ticketCreated}
                </div>
              )}
            </div>

            <button
              onClick={handleCreateTicket}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg"
            >
              Submit Ticket
            </button>
          </div>
        </div>
      )}

      {/* Table Reservation Modal */}
      {showReservationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-[#1c1e27] border border-[#2d3042] rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-white">Book Restaurant Table</h3>
              <button onClick={() => setShowReservationModal(false)} className="text-neutral-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-neutral-300 font-bold">Select Restaurant</label>
                <select
                  value={resRest}
                  onChange={(e) => setResRest(e.target.value)}
                  className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-white"
                >
                  <option value="Kacchi Bhai - Royal Feast">Kacchi Bhai - Royal Feast (Banani)</option>
                  <option value="The Burger Lab Co.">The Burger Lab Co. (Gulshan 1)</option>
                  <option value="Pizza Roma Artisan">Pizza Roma Artisan (Dhanmondi)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-neutral-300 font-bold">Date</label>
                  <select
                    value={resDate}
                    onChange={(e) => setResDate(e.target.value)}
                    className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Today">Today</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="This Friday">This Friday</option>
                  </select>
                </div>
                <div>
                  <label className="text-neutral-300 font-bold">Time</label>
                  <select
                    value={resTime}
                    onChange={(e) => setResTime(e.target.value)}
                    className="w-full mt-1 bg-[#14151d] border border-[#282a3c] rounded-xl px-3 py-2 text-white"
                  >
                    <option value="01:30 PM">01:30 PM (Lunch)</option>
                    <option value="08:00 PM">08:00 PM (Dinner)</option>
                    <option value="09:30 PM">09:30 PM (Late)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-neutral-300 font-bold">Number of Guests</label>
                <div className="flex gap-2 mt-1">
                  {[2, 4, 6, 8].map((num) => (
                    <button
                      key={num}
                      onClick={() => setResGuests(num)}
                      className={`flex-1 py-1.5 rounded-xl font-bold border ${
                        resGuests === num ? 'bg-[#FF6B35] text-white border-[#FF6B35]' : 'bg-[#14151d] text-neutral-400'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {resSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-400 text-xs">
                  {resSuccess}
                </div>
              )}
            </div>

            <button
              onClick={handleCreateReservation}
              className="w-full py-3 rounded-xl bg-[#FF6B35] hover:bg-[#ff5722] text-white font-bold text-xs shadow-lg"
            >
              Confirm Reservation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
