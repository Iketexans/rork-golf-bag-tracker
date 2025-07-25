import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type SubscriptionPlan = 'monthly' | 'yearly' | null;

interface User {
  id: string;
  username: string;
  email: string;
  clubName: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry: string | null;
  isInitialized: boolean;
  isSubscriptionActive: boolean; // Changed to boolean instead of function
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  createAccount: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setSubscription: (plan: SubscriptionPlan, expiryDate: string) => void;
  checkSubscriptionStatus: () => void; // New function to update subscription status
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      subscriptionPlan: null,
      subscriptionExpiry: null,
      isInitialized: false,
      isSubscriptionActive: false,

      initialize: () => {
        const { subscriptionPlan, subscriptionExpiry } = get();
        let isSubscriptionActive = false;
        
        if (subscriptionPlan && subscriptionExpiry) {
          const now = new Date();
          const expiry = new Date(subscriptionExpiry);
          isSubscriptionActive = now < expiry;
        }
        
        set({ 
          isInitialized: true,
          isSubscriptionActive 
        });
      },

      checkSubscriptionStatus: () => {
        const { subscriptionPlan, subscriptionExpiry } = get();
        if (!subscriptionPlan || !subscriptionExpiry) {
          set({ isSubscriptionActive: false });
          return;
        }
        
        const now = new Date();
        const expiry = new Date(subscriptionExpiry);
        set({ isSubscriptionActive: now < expiry });
      },

      login: async (username: string, password: string) => {
        // Mock authentication - in real app, this would call an API
        if (username.length > 0 && password.length > 0) {
          const user: User = {
            id: '1',
            username,
            email: `${username}@example.com`,
            clubName: 'Pine Valley Golf Club',
          };
          
          set({
            isAuthenticated: true,
            user,
          });
          
          return true;
        }
        return false;
      },

      createAccount: async (email: string, username: string, password: string) => {
        // Mock account creation - in real app, this would call an API
        if (email.length > 0 && username.length > 0 && password.length > 0) {
          const user: User = {
            id: Date.now().toString(),
            username,
            email,
            clubName: 'Pine Valley Golf Club',
          };
          
          set({
            isAuthenticated: true,
            user,
          });
          
          return true;
        }
        return false;
      },

      logout: () => {
        console.log('Logout called');
        set({
          isAuthenticated: false,
          user: null,
          subscriptionPlan: null,
          subscriptionExpiry: null,
          isSubscriptionActive: false,
        });
        // Clear persisted storage
        AsyncStorage.removeItem('auth-storage').then(() => {
          console.log('Auth storage cleared');
          // Force page reload on web, restart app on mobile
          if (Platform.OS === 'web') {
            window.location?.reload?.();
          }
        }).catch((error) => {
          console.error('Error clearing auth storage:', error);
        });
      },

      setSubscription: (plan: SubscriptionPlan, expiryDate: string) => {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const isSubscriptionActive = now < expiry;
        
        set({
          subscriptionPlan: plan,
          subscriptionExpiry: expiryDate,
          isSubscriptionActive,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.initialize();
        }
      },
    }
  )
);