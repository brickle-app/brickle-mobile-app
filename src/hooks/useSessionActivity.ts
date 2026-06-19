import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { updateUserActivity, stopInactivityTimer, startInactivityTimer } from '@/src/utils/sessionManager';
import { authStore } from '@/src/store/auth.store';
import { BrickleService } from '../services/brickle.service';
import { usePinStore } from '../store/pin.store';
import { router } from 'expo-router';

export const useSessionActivity = () => {
  useEffect(() => {
    const checkPinLock = () => {
      const { isAuthenticated } = authStore.getState();
      const { hasPin, lock, isLocked } = usePinStore.getState();

      if (!isAuthenticated || !hasPin) return;
      // Lock on cold start so PIN is required when app opens with hasPin
      if (!isLocked) lock();
      (router as any).push("/pin-lock");
    };

    // Defer so Root Layout's Slot is mounted before any navigation (avoid "navigate before mounting")
    const initialTimer = setTimeout(checkPinLock, 100);
    const recheckTimer = setTimeout(checkPinLock, 500);

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const { isAuthenticated } = authStore.getState();
      const { hasPin, lock, isLocked } = usePinStore.getState();

      if (nextAppState === 'active') {
        startInactivityTimer();
        updateUserActivity();

        if (isAuthenticated && hasPin && isLocked) {
          (router as any).push("/pin-lock");
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
      clearTimeout(initialTimer);
      clearTimeout(recheckTimer);
      subscription?.remove();
    };
  }, []);

  const trackActivity = () => {
    updateUserActivity();
  };

  return { trackActivity };
};