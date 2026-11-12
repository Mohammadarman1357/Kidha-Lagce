/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, UtensilsCrossed, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { signInWithGoogle, loginWithEmail, registerWithEmail, switchRole } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name');
        await registerWithEmail(name, email, password, role);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoRole = async (targetRole: UserRole) => {
    await switchRole(targetRole);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-[#181922] border border-[#2d3042] rounded-3xl p-6 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#222432] text-neutral-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6B35]/20 text-[#FF6B35] text-[11px] font-black uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kidha Lagce (খিদা লাগছে)</span>
          </div>
          <h2 className="text-xl font-black text-white">
            {isRegister ? 'Create your Account' : 'Welcome to Kidha Lagce'}
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {isRegister
              ? 'Sign up to order delicious food and track deliveries'
              : 'Log in to access your orders, favorites, and saved addresses'}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Google One-Click Login */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <div className="h-px flex-1 bg-[#282a3c]" />
          <span>or with email</span>
          <div className="h-px flex-1 bg-[#282a3c]" />
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {isRegister && (
            <div>
              <label className="text-xs font-bold text-neutral-300">Full Name</label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Habiba Arman"
                  required
                  className="w-full bg-[#121319] border border-[#282a3c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-neutral-300">Email Address</label>
            <div className="relative mt-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-[#121319] border border-[#282a3c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-neutral-300">Password</label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-[#121319] border border-[#282a3c] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#FF6B35]"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="text-xs font-bold text-neutral-300">Account Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full mt-1 bg-[#121319] border border-[#282a3c] rounded-xl px-3 py-2 text-xs text-white font-bold"
              >
                <option value="customer">Customer (Food Ordering)</option>
                <option value="manager">Restaurant Manager</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF6B35] to-[#f4511e] hover:brightness-110 text-white font-black text-xs shadow-lg shadow-orange-950/50 transition-all cursor-pointer"
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Log In'}
          </button>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-xs text-[#FF6B35] hover:underline font-bold"
          >
            {isRegister ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
          </button>
        </div>

        {/* Quick Demo Switcher */}
        <div className="pt-2 border-t border-[#252838]">
          <div className="text-[11px] font-bold text-neutral-400 mb-2 text-center">
            Quick 1-Click Role Exploration:
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickDemoRole('customer')}
              className="p-2 rounded-xl bg-[#222432] hover:bg-[#2b2d3d] text-center border border-[#2e3142]"
            >
              <User className="w-3.5 h-3.5 mx-auto text-[#FF6B35]" />
              <div className="text-[10px] font-black text-white mt-1">Customer</div>
            </button>
            <button
              onClick={() => handleQuickDemoRole('manager')}
              className="p-2 rounded-xl bg-[#222432] hover:bg-[#2b2d3d] text-center border border-[#2e3142]"
            >
              <UtensilsCrossed className="w-3.5 h-3.5 mx-auto text-amber-400" />
              <div className="text-[10px] font-black text-white mt-1">Manager</div>
            </button>
            <button
              onClick={() => handleQuickDemoRole('admin')}
              className="p-2 rounded-xl bg-[#222432] hover:bg-[#2b2d3d] text-center border border-[#2e3142]"
            >
              <Shield className="w-3.5 h-3.5 mx-auto text-purple-400" />
              <div className="text-[10px] font-black text-white mt-1">Admin</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
