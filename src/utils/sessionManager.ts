import { authStore } from "@/src/store/auth.store";
import { isAxiosError } from "axios";
import { Router } from "expo-router";
import { refreshToken } from "@/src/services/auth.service";

let sessionModalState = {
  isVisible: false,
  showModal: () => {},
  hideModal: () => {},
};

let inactivityManager = {
  timeout: null as NodeJS.Timeout | null,
  lastActivity: Date.now(),
  isActive: false,
  INACTIVITY_TIMEOUT: 10 * 60 * 1000,
};

let tokenExpirationManager = {
  checkInterval: null as NodeJS.Timeout | null,
  isActive: false,
  CHECK_INTERVAL: 30 * 1000, // Check every 30 seconds
  REFRESH_THRESHOLD: 60 * 1000, // Refresh 1 minute before expiration
};

let router: Router | null = null;

export const registerSessionModal = (
  showModal: () => void,
  hideModal: () => void,
  routerInstance: Router
) => {
  sessionModalState.showModal = showModal;
  sessionModalState.hideModal = hideModal;
  router = routerInstance;
};

export const checkSessionError = async (error: any) => {
  const { tokenExpiration } = authStore.getState();
  let isSessionExpired = false;

  if (
    isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403)
  ) {
    isSessionExpired = true;
  }

  if (Date.now() > tokenExpiration) {
    isSessionExpired = true;
  }

  if (isSessionExpired) {
    console.log("🔄 Session error detected, attempting to refresh token...");

    // Try to refresh the token before showing the modal
    const refreshResult = await refreshToken();

    if (refreshResult.success) {
      console.log("✅ Token refreshed successfully after session error");
      return false; // Session recovered, no need to show modal
    }

    console.error("❌ Failed to refresh token, showing session expired modal");
    sessionModalState.showModal();
    return true;
  }

  return false;
};

export const handleSessionExpiry = () => {
  const { logout } = authStore.getState();
  stopInactivityTimer();
  logout();
  sessionModalState.hideModal();
  if (router) {
    router.replace("/(stack)/(auth)/login");
  }
};

const resetInactivityTimer = () => {
  if (!inactivityManager.isActive) return;

  if (inactivityManager.timeout) {
    clearTimeout(inactivityManager.timeout);
  }

  inactivityManager.lastActivity = Date.now();

  inactivityManager.timeout = setTimeout(() => {
    const { isAuthenticated } = authStore.getState();

    if (isAuthenticated) {
      sessionModalState.showModal();
    }
  }, inactivityManager.INACTIVITY_TIMEOUT);
};

export const startInactivityTimer = () => {
  inactivityManager.isActive = true;
  resetInactivityTimer();
};

export const stopInactivityTimer = () => {
  inactivityManager.isActive = false;
  if (inactivityManager.timeout) {
    clearTimeout(inactivityManager.timeout);
    inactivityManager.timeout = null;
  }
};

export const updateUserActivity = () => {
  if (inactivityManager.isActive) {
    resetInactivityTimer();
  }
};

// Token expiration monitoring functions
const checkTokenExpiration = async () => {
  const { tokenExpiration, isAuthenticated } = authStore.getState();

  if (!isAuthenticated || !tokenExpiration) {
    return;
  }

  const now = Date.now();
  const timeUntilExpiration = tokenExpiration - now;

  // If token is already expired, show modal
  if (timeUntilExpiration <= 0) {
    console.warn("⚠️ Token has expired");
    sessionModalState.showModal();
    stopTokenExpirationMonitoring();
    return;
  }

  // If token is about to expire, try to refresh it
  if (timeUntilExpiration <= tokenExpirationManager.REFRESH_THRESHOLD) {
    console.log("🔄 Token is about to expire, attempting refresh...");
    const result = await refreshToken();

    if (!result.success) {
      console.error("❌ Failed to refresh token, showing session expired modal");
      sessionModalState.showModal();
      stopTokenExpirationMonitoring();
    } else {
      console.log("✅ Token refreshed successfully, continuing session");
    }
  }
};

export const startTokenExpirationMonitoring = () => {
  if (tokenExpirationManager.isActive) {
    return;
  }

  tokenExpirationManager.isActive = true;
  console.log("🔐 Started token expiration monitoring");

  // Check immediately, but with a small delay to avoid startup loop
  setTimeout(checkTokenExpiration, 2000);

  // Then check periodically
  tokenExpirationManager.checkInterval = setInterval(
    checkTokenExpiration,
    tokenExpirationManager.CHECK_INTERVAL
  );
};

export const stopTokenExpirationMonitoring = () => {
  tokenExpirationManager.isActive = false;

  if (tokenExpirationManager.checkInterval) {
    clearInterval(tokenExpirationManager.checkInterval);
    tokenExpirationManager.checkInterval = null;
    console.log("🔐 Stopped token expiration monitoring");
  }
};
