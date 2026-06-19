import { CompleteProfileFormData } from "../schemes/complete-profile-scheme";
import { PartialBrickleUser } from "../types/user.types";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { usePinStore } from "./pin.store";

interface State {
  token: string | null;
  user: PartialBrickleUser | null;
  userEmail: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  kycFormData: CompleteProfileFormData | null;
  balance: string | null;
  newUser: boolean;
  privateKey: string | null;
  totalReturn: number;
  /** Suma de capital invertido en activos (desde overview de portafolio). */
  totalInvested: number;
  currentValue: number;
  roi: number;
  tokenExpiration: number;

  setKycFormData: (kycFormData: CompleteProfileFormData) => void;
  setAccessToken: (accessToken: string) => void;
  setToken: (token: string) => void;
  setUser: (user: PartialBrickleUser) => void;
  setUserEmail: (userEmail: string) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string) => void;
  setBalance: (balance: string) => void;
  setNewUser: (newUser: boolean) => void;
  setPrivateKey: (privateKey: string) => void;
  logout: () => Promise<void>;
  reset: () => Promise<void>;
  setTotalReturn: (totalReturn: number) => void;
  setTotalInvested: (totalInvested: number) => void;
  setCurrentValue: (currentValue: number) => void;
  setRoi: (roi: number) => void;
  setTokenExpiration: (tokenExpiration: number) => void;
}

const initialState = {
  token: null,
  user: null,
  userEmail: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  accessToken: null,
  kycFormData: null,
  balance: null,
  newUser: false,
  privateKey: null,
  totalReturn: 0,
  totalInvested: 0,
  currentValue: 0,
  roi: 0,
  tokenExpiration: 0,
};

export const authStore = create<State>()(
  persist(
    (set) => ({
      ...initialState,
      setAccessToken: (accessToken: string) => {
        try {
          set({ accessToken });
          console.log("✅ Access token updated successfully");
        } catch (error) {
          console.error("❌ Error setting access token:", error);
          set({ error: "Failed to set access token" });
        }
      },
      setToken: (token: string) => {
        try {
          set({ token });
          console.log("✅ Token updated successfully");
        } catch (error) {
          console.error("❌ Error setting token:", error);
          set({ error: "Failed to set token" });
        }
      },
      setUser: (user: PartialBrickleUser) => {
        try {
          set({ user });
          console.log("✅ User updated successfully");
        } catch (error) {
          console.error("❌ Error setting user:", error);
          set({ error: "Failed to set user" });
        }
      },
      setIsAuthenticated: (isAuthenticated: boolean) => {
        try {
          set({ isAuthenticated });
          console.log("✅ Authentication state updated:", isAuthenticated);
        } catch (error) {
          console.error("❌ Error setting authentication state:", error);
          set({ error: "Failed to set authentication state" });
        }
      },
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string) => set({ error }),
      setUserEmail: (userEmail: string) => set({ userEmail }),
      setKycFormData: (kycFormData: CompleteProfileFormData) =>
        set({ kycFormData }),
      setBalance: (balance: string) => set({ balance }),
      setNewUser: (newUser: boolean) => set({ newUser }),
      setPrivateKey: (privateKey: string) => {
        try {
          set({ privateKey });
          console.log("✅ Private key updated successfully");
        } catch (error) {
          console.error("❌ Error setting private key:", error);
          set({ error: "Failed to set private key" });
        }
      },
      setTokenExpiration: (tokenExpiration: number) => {
        try {
          set({ tokenExpiration });
          console.log("✅ Token expiration updated successfully");
        } catch (error) {
          console.error("❌ Error setting token expiration:", error);
          set({ error: "Failed to set token expiration" });
        }
      },
      setTotalReturn: (totalReturn: number) => {
        set({ totalReturn });
      },
      setTotalInvested: (totalInvested: number) => {
        set({ totalInvested });
      },
      setCurrentValue: (currentValue: number) => {
        set({ currentValue });
      },
      setRoi: (roi: number) => {
        set({ roi });
      },
      logout: async () => {
        try {
          await usePinStore.getState().removePin();
          set(initialState);
          // Clear AsyncStorage completely for user data
          AsyncStorage.multiRemove([
            'auth-storage',
            'user-preferences',
            'session-data',
            'cached-data',
            'recent-searches',
            'biometric_enabled',
            'stored_credentials',
            '@user_data',
            '@auth_token',
            '@is_authenticated'
          ]).catch((error) => {
            console.error("❌ Error clearing AsyncStorage during logout:", error);
          });
          
          // Clear search store data
          try {
            const { searchStore } = require('./search.store');
            searchStore.getState().clearAllData();
          } catch (error) {
            console.error("❌ Error clearing search data during logout:", error);
          }
          
          console.log("✅ Logout successful - All user data cleared");
        } catch (error) {
          console.error("❌ Error during logout:", error);
          set({ error: "Failed to logout" });
        }
      },
      reset: async () => {
        try {
          await usePinStore.getState().removePin();
          set(initialState);
          // Clear AsyncStorage completely for reset
          AsyncStorage.multiRemove([
            'auth-storage',
            'user-preferences', 
            'session-data',
            'cached-data',
            'recent-searches',
            'biometric_enabled',
            'stored_credentials',
            '@user_data',
            '@auth_token',
            '@is_authenticated'
          ]).catch((error) => {
            console.error("❌ Error clearing AsyncStorage during reset:", error);
          });
          console.log("✅ Auth store reset successfully - All user data cleared");
        } catch (error) {
          console.error("❌ Error resetting auth store:", error);
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        console.log("🔄 Rehydrating auth store...");
        if (state) {
          console.log("✅ Auth store rehydrated successfully");
        } else {
          console.warn("⚠️ No stored auth state found");
        }
      },
    }
  )
);
