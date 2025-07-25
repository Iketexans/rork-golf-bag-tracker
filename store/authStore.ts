import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export type SubscriptionPlan = 'monthly' | 'yearly' | null;
export type UserRole = 'owner' | 'club';

interface User {
  id: string;
  username: string;
  email: string;
  clubName: string;
  role: UserRole;
}

interface ClubAccount {
  id: string;
  username: string;
  email: string;
  clubName: string;
  password: string;
  createdAt: string;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry: string | null;
  trialStarted: string;
  isTrialActive: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  subscriptionPlan: SubscriptionPlan;
  subscriptionExpiry: string | null;
  isInitialized: boolean;
  isSubscriptionActive: boolean;
  clubAccounts: ClubAccount[];
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  createAccount: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  setSubscription: (plan: SubscriptionPlan, expiryDate: string) => void;
  checkSubscriptionStatus: () => void;
  initialize: () => void;
  
  // Owner actions
  createClubAccount: (email: string, username: string, password: string, clubName: string) => Promise<boolean>;
  deleteClubAccount: (accountId: string) => void;
  getClubAccounts: () => ClubAccount[];
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
      clubAccounts: [],

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
        // Check for owner login
        if (username === 'TheBagroomCaddy' && password === 'Ikesplace1') {
          const user: User = {
            id: 'owner',
            username,
            email: 'owner@bagroomcaddy.com',
            clubName: 'Bagroom Caddy Admin',
            role: 'owner',
          };
          
          set({
            isAuthenticated: true,
            user,
            isSubscriptionActive: true, // Owner always has access
          });
          
          return true;
        }
        
        // Check for club account login
        const { clubAccounts } = get();
        const clubAccount = clubAccounts.find(account => 
          account.username === username && account.password === password
        );
        
        if (clubAccount) {
          // Check if trial/subscription is active
          const now = new Date();
          const trialStart = new Date(clubAccount.trialStarted);
          const trialEnd = new Date(trialStart.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
          
          let isActive = false;
          if (clubAccount.subscriptionPlan && clubAccount.subscriptionExpiry) {
            const subscriptionEnd = new Date(clubAccount.subscriptionExpiry);
            isActive = now < subscriptionEnd;
          } else {
            isActive = now < trialEnd;
          }
          
          if (isActive) {
            const user: User = {
              id: clubAccount.id,
              username: clubAccount.username,
              email: clubAccount.email,
              clubName: clubAccount.clubName,
              role: 'club',
            };
            
            set({
              isAuthenticated: true,
              user,
              subscriptionPlan: clubAccount.subscriptionPlan,
              subscriptionExpiry: clubAccount.subscriptionExpiry,
              isSubscriptionActive: isActive,
            });
            
            return true;
          }
        }
        
        return false;
      },

      createAccount: async (email: string, username: string, password: string) => {
        // This is now only for regular club account creation (not used in current flow)
        return false;
      },
      
      createClubAccount: async (email: string, username: string, password: string, clubName: string) => {
        if (email.length > 0 && username.length > 0 && password.length > 0 && clubName.length > 0) {
          const { clubAccounts } = get();
          
          // Check if username already exists
          if (clubAccounts.some(account => account.username === username)) {
            return false;
          }
          
          const newAccount: ClubAccount = {
            id: Date.now().toString(),
            username,
            email,
            clubName,
            password,
            createdAt: new Date().toISOString(),
            subscriptionPlan: null,
            subscriptionExpiry: null,
            trialStarted: new Date().toISOString(),
            isTrialActive: true,
          };
          
          set({
            clubAccounts: [...clubAccounts, newAccount],
          });
          
          return true;
        }
        return false;
      },
      
      deleteClubAccount: (accountId: string) => {
        const { clubAccounts } = get();
        set({
          clubAccounts: clubAccounts.filter(account => account.id !== accountId),
        });
      },
      
      getClubAccounts: () => {
        return get().clubAccounts;
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