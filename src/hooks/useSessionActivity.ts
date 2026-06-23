import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { updateUserActivity, stopInactivityTimer, startInactivityTimer } from '@/src/utils/sessionManager';
import { authStore } from '@/src/store/auth.store';
import { BrickleService } from '../services/brickle.service';
import { usePinStore } from '../store/pin.store';

export const useSessionActivity = () => {
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const { isAuthenticated } = authStore.getState();
      const { hasPin, lock } = usePinStore.getState();

      if (nextAppState === 'active') {
        startInactivityTimer();
        updateUserActivity();

        // _layout.tsx is the single owner of auth/PIN navigation.
        // This hook only updates lock/activity state to avoid startup route races.

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
