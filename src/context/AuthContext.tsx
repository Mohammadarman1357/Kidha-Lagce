/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  firebaseSignOut,
  onAuthStateChanged,
  testConnection,
  type User,
} from '../lib/firebase';
import { UserProfile, UserRole, DeliveryAddress } from '../types';
import { getUserProfile, saveUserProfile, seedInitialDataIfNeeded } from '../services/foodDeliveryService';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  role: UserRole;
  loading: boolean;
  activeAddress: DeliveryAddress | null;
  addresses: DeliveryAddress[];
  walletBalance: number;
  rewardPoints: number;
  signInWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => Promise<void>;
  setActiveAddress: (address: DeliveryAddress) => void;
  addDeliveryAddress: (address: Omit<DeliveryAddress, 'id'>) => Promise<void>;
  setAssignedRestaurant: (restaurantId: string) => Promise<void>;
  setWalletBalance: React.Dispatch<React.SetStateAction<number>>;
  setRewardPoints: React.Dispatch<React.SetStateAction<number>>;
  isConnected: boolean;
}

const DEFAULT_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr-default-1',
    label: 'Home',
    addressLine: 'Flat 4B, Concord Lake City, Plot 14, Road 11',
    area: 'Banani',
    city: 'Dhaka',
    landmark: 'Near Star Kabab & Banani Lake Park',
    phone: '+880 1712-345678',
    isDefault: true,
  },
  {
    id: 'addr-default-2',
    label: 'Work',
    addressLine: 'Level 8, Crystal Palace, SE(D) 22 Gulshan South Avenue',
    area: 'Gulshan 1',
    city: 'Dhaka',
    landmark: 'Opposite to Gulshan DCC Market',
    phone: '+880 1819-876543',
    isDefault: false,
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [loading, setLoading] = useState<boolean>(true);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(DEFAULT_ADDRESSES);
  const [activeAddress, setActiveAddressState] = useState<DeliveryAddress | null>(DEFAULT_ADDRESSES[0]);
  const [walletBalance, setWalletBalance] = useState<number>(1250);
  const [rewardPoints, setRewardPoints] = useState<number>(480);

  // Test connection & seed DB on startup
  useEffect(() => {
    async function init() {
      try {
        const ok = await testConnection();
        setIsConnected(ok);
        await seedInitialDataIfNeeded();
      } catch (err) {
        console.warn('Initialization notice:', err);
      }
    }
    init();
  }, []);

  // Listen to Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          let userProf = await getUserProfile(currentUser.uid);
          // Check if admin email
          const isAdminEmail = currentUser.email === 'armanhabiba903709@gmail.com';
          
          if (!userProf) {
            const initialRole: UserRole = isAdminEmail ? 'admin' : 'customer';
            userProf = {
              uid: currentUser.uid,
              name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Food Explorer',
              email: currentUser.email || '',
              role: initialRole,
              avatar: currentUser.photoURL || undefined,
              addresses: DEFAULT_ADDRESSES,
              createdAt: new Date().toISOString(),
            };
            await saveUserProfile(userProf);
          } else if (isAdminEmail && userProf.role !== 'admin') {
            userProf.role = 'admin';
            await saveUserProfile(userProf);
          }

          setProfile(userProf);
          setRole(userProf.role);
          if (userProf.addresses && userProf.addresses.length > 0) {
            setAddresses(userProf.addresses);
            setActiveAddressState(userProf.addresses.find((a) => a.isDefault) || userProf.addresses[0]);
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        // Fallback demo profile so users can explore all 3 roles without friction
        const demoRole: UserRole = 'customer';
        setProfile({
          uid: 'guest-customer-001',
          name: 'Habiba Arman',
          email: 'armanhabiba903709@gmail.com',
          role: demoRole,
          addresses: DEFAULT_ADDRESSES,
          createdAt: new Date().toISOString(),
        });
        setRole(demoRole);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google Sign In failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, pass: string) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: unknown) {
      console.error('Email sign in failed:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const registerWithEmail = useCallback(
    async (name: string, email: string, pass: string, assignedRole: UserRole = 'customer') => {
      setLoading(true);
      try {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        const newProf: UserProfile = {
          uid: res.user.uid,
          name,
          email,
          role: assignedRole,
          addresses: DEFAULT_ADDRESSES,
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(newProf);
        setProfile(newProf);
        setRole(assignedRole);
      } catch (err: unknown) {
        console.error('Email registration failed:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      if (auth.currentUser) {
        await firebaseSignOut(auth);
      }
      setUser(null);
      setProfile(null);
      setRole('customer');
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  }, []);

  const switchRole = useCallback(
    async (newRole: UserRole) => {
      setRole(newRole);
      if (profile) {
        const updated: UserProfile = {
          ...profile,
          role: newRole,
          assignedRestaurantId:
            newRole === 'manager'
              ? profile.assignedRestaurantId || 'rest-kacchi-bhai'
              : profile.assignedRestaurantId,
        };
        setProfile(updated);
        if (user) {
          try {
            await saveUserProfile(updated);
          } catch (e) {
            console.warn('Could not persist role update to cloud:', e);
          }
        }
      }
    },
    [profile, user]
  );

  const setActiveAddress = useCallback((addr: DeliveryAddress) => {
    setActiveAddressState(addr);
  }, []);

  const addDeliveryAddress = useCallback(
    async (addr: Omit<DeliveryAddress, 'id'>) => {
      const newAddress: DeliveryAddress = {
        ...addr,
        id: `addr-${Date.now()}`,
      };
      const updated = [newAddress, ...addresses];
      setAddresses(updated);
      setActiveAddressState(newAddress);
      if (profile && user) {
        const updatedProf: UserProfile = { ...profile, addresses: updated };
        setProfile(updatedProf);
        await saveUserProfile(updatedProf);
      }
    },
    [addresses, profile, user]
  );

  const setAssignedRestaurant = useCallback(
    async (restaurantId: string) => {
      if (profile) {
        const updated: UserProfile = { ...profile, assignedRestaurantId: restaurantId };
        setProfile(updated);
        if (user) {
          await saveUserProfile(updated);
        }
      }
    },
    [profile, user]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        role,
        loading,
        activeAddress,
        addresses,
        walletBalance,
        rewardPoints,
        signInWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        switchRole,
        setActiveAddress,
        addDeliveryAddress,
        setAssignedRestaurant,
        setWalletBalance,
        setRewardPoints,
        isConnected,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
