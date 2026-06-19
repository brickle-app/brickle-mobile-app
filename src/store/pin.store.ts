import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

interface PinState {
    hasPin: boolean;
    isLocked: boolean;
    lastActivity: number | null;
    pinLength: number;

    setPin: (pin: string) => Promise<void>;
    validatePin: (pin: string) => Promise<boolean>;
    removePin: () => Promise<void>;
    lock: () => void;
    unlock: () => void;
    updateActivity: () => void;
}

const PIN_KEY = 'user_session_pin';

export const usePinStore = create<PinState>()(
    persist(
        (set, get) => ({
            hasPin: false,
            isLocked: false,
            lastActivity: null,
            pinLength: 4,

            setPin: async (pin: string) => {
                try {
                    await SecureStore.setItemAsync(PIN_KEY, pin);
                    set({ hasPin: true, isLocked: false, lastActivity: Date.now() });
                } catch (error) {
                    console.error("Error setting PIN:", error);
                    throw error;
                }
            },

            validatePin: async (pin: string) => {
                try {
                    const storedPin = await SecureStore.getItemAsync(PIN_KEY);
                    if (storedPin === pin) {
                        set({ isLocked: false, lastActivity: Date.now() });
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error("Error validating PIN:", error);
                    return false;
                }
            },

            removePin: async () => {
                try {
                    await SecureStore.deleteItemAsync(PIN_KEY);
                    set({ hasPin: false, isLocked: false, lastActivity: null });
                } catch (error) {
                    console.error("Error removing PIN:", error);
                }
            },

            lock: () => {
                if (get().hasPin) {
                    set({ isLocked: true });
                }
            },

            unlock: () => {
                set({ isLocked: false, lastActivity: Date.now() });
            },

            updateActivity: () => {
                set({ lastActivity: Date.now() });
            },
        }),
        {
            name: 'pin-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                hasPin: state.hasPin,
                isLocked: state.isLocked,
                lastActivity: state.lastActivity,
                pinLength: state.pinLength
            }),
        }
    )
);
