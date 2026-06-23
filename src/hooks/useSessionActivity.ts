import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { updateUserActivity, stopInactivityTimer, startInactivityTimer } from '@/src/utils/sessionManager';
import { authStore } from '@/src/store/auth.store';
import { BrickleService } from '../services/brickle.service';
import { usePinStore } from '../store/pin.store';
import { router } from 'expo-router';

export const useSessionActivity = () => {
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const { isAuthenticated } = authStore.getState();
      const { hasPin, lock, isLocked } = usePinStore.getState();

      if (nextAppState === 'active') {
        startInactivityTimer();
        updateUserActivity();

        // On foreground return: if PIN is required and locked, navigate to pin-lock
        // _layout.tsx handles cold-start navigation — we only handle background→foreground
        if (isAuthenticated && hasPin && isLocked) {
          (router as any).push("/(stack)/pin-lock");
        }

        const { userEmail, setUser } = authStore.getState();
        if (userEmail) {
          BrickleService.getUserByEmail(userEmail).then((userData) => {
            if (userData) setUser(userData as any);
          }).catch(() => {});
        }
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        stopInactivityTimer();
        if (isAuthenticated && hasPin) lock();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, []);

  const trackActivity = () => {
    updateUserActivity();
  };

  return { trackActivity };
};