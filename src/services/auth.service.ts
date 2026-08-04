import "@/src/utils/crypto-get-random-values";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import { useRouter } from "expo-router";
import { authStore, persistPrivateKeyToSecureStore, loadPrivateKeyFromSecureStore } from "../store/auth.store";
import { startInactivityTimer, startTokenExpirationMonitoring } from "../utils/sessionManager";
import * as SecureStore from "expo-secure-store";
import { ethers } from "ethers";

WebBrowser.maybeCompleteAuthSession();

const REFRESH_TOKEN_STORAGE_KEY = "brickle_refresh_token";

const BRICKLE_API_URL = process.env.EXPO_PUBLIC_BRICKLE_API_URL;
const MISSING_GOOGLE_CLIENT_ID = "missing-google-client-id";

function configuredClientId(clientId: string | undefined) {
  return clientId?.trim() || undefined;
}

export function buildGoogleAuthRequestConfig(
  env: Partial<Record<string, string | undefined>> = process.env,
  _createRedirectUri?: unknown,
  platform: string = Platform.OS
) {
  const webClientId = configuredClientId(env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID) ?? MISSING_GOOGLE_CLIENT_ID;
  const iosClientId = configuredClientId(env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID) ?? MISSING_GOOGLE_CLIENT_ID;
  const androidClientId = configuredClientId(env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID);
  const clientId = platform === "ios"
    ? iosClientId
    : platform === "android"
      ? androidClientId ?? webClientId
      : webClientId;
  const redirectUri = platform === "ios" && iosClientId !== MISSING_GOOGLE_CLIENT_ID
    ? `com.googleusercontent.apps.${iosClientId.replace(/\.apps\.googleusercontent\.com$/, "")}:/oauthredirect`
    : undefined;

  return {
    clientId,
    webClientId,
    iosClientId,
    androidClientId,
    redirectUri,
  };
}

type GoogleAuthResultStatus =
  | { type: "authenticated"; idToken: string }
  | { type: "pending_token_exchange" }
  | { type: "error" };

export function getGoogleAuthResultStatus(result: any): GoogleAuthResultStatus {
  if (result?.type !== "success") {
    return { type: "error" };
  }

  if (result.params?.id_token) {
    return { type: "authenticated", idToken: result.params.id_token };
  }

  if (result.params?.code) {
    return { type: "pending_token_exchange" };
  }

  return { type: "error" };
}

export function getGoogleAuthBackendClientId(
  env: Partial<Record<string, string | undefined>> = process.env,
  platform: string = Platform.OS
) {
  if (platform === "ios") {
    return configuredClientId(env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
  }
  if (platform === "android") {
    return configuredClientId(env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID)
      ?? configuredClientId(env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
  }
  return configuredClientId(env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID);
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePictureUrl: string | null;
    walletAddress: string | null;
    phoneNumber: string;
    termsAccepted: boolean;
    createdAt: string;
    isBasicProfileComplete: boolean;
    isFullProfileComplete: boolean;
  };
}

function applyAuthResponse(data: AuthResponse) {
  const {
    setAccessToken,
    setUser,
    setUserEmail,
    setIsAuthenticated,
  } = authStore.getState();

  setAccessToken(data.accessToken);
  setUserEmail(data.user.email);
  setUser({
    id: data.user.id,
    firstName: data.user.firstName,
    lastName: data.user.lastName,
    email: data.user.email,
    profilePictureUrl: data.user.profilePictureUrl,
    walletAddress: data.user.walletAddress ?? undefined,
    phoneNumber: data.user.phoneNumber,
    termsAccepted: data.user.termsAccepted,
    isBasicProfileComplete: data.user.isBasicProfileComplete,
    isFullProfileComplete: data.user.isFullProfileComplete,
  });
  setIsAuthenticated(true);
}

async function storeTokens(accessToken: string, refreshToken: string) {
  authStore.getState().setAccessToken(accessToken);
  await SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
}

async function getStoredRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_STORAGE_KEY);
}

export async function createLocalWallet() {
  const wallet = ethers.Wallet.createRandom();
  const privateKey = wallet.privateKey;
  const walletAddress = wallet.address;

  authStore.getState().setPrivateKey(privateKey);
  await persistPrivateKeyToSecureStore(privateKey);

  return { walletAddress, privateKey };
}

export async function getPrivateKey(): Promise<string | null> {
  const storedKey = authStore.getState().privateKey;
  if (storedKey) return storedKey;

  const secureKey = await loadPrivateKeyFromSecureStore();
  if (secureKey) {
    authStore.getState().setPrivateKey(secureKey);
    return secureKey;
  }

  return null;
}

export const useGoogleAuth = () => {
  const setUserEmail = authStore((state) => state.setUserEmail);
  const setUser = authStore((state) => state.setUser);
  const setIsAuthenticated = authStore((state) => state.setIsAuthenticated);
  const setAccessToken = authStore((state) => state.setAccessToken);
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [showAuthError, setShowAuthError] = useState(false);
  const [isAwaitingGoogleToken, setIsAwaitingGoogleToken] = useState(false);

  const [, response, promptAsync] = Google.useIdTokenAuthRequest(
    buildGoogleAuthRequestConfig()
  );

  const completeGoogleLogin = useCallback(async (idToken: string) => {
    console.log("[GoogleAuth] Got id_token, exchanging with backend...");

    const res = await fetch(`${BRICKLE_API_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken, clientId: getGoogleAuthBackendClientId(process.env, Platform.OS) }),
    });
    console.log("[GoogleAuth] Backend response status:", res.status);

    if (!res.ok) {
      console.error("Google auth failed", { status: res.status });
      setShowAuthError(true);
      return;
    }

    const data: AuthResponse = await res.json();

    setUserEmail(data.user.email);
    setAccessToken(data.accessToken);
    await storeTokens(data.accessToken, data.refreshToken);

    setUser({
      id: data.user.id,
      firstName: data.user.firstName,
      lastName: data.user.lastName,
      email: data.user.email,
      profilePictureUrl: data.user.profilePictureUrl,
      walletAddress: data.user.walletAddress ?? undefined,
      phoneNumber: data.user.phoneNumber,
      termsAccepted: data.user.termsAccepted,
      isBasicProfileComplete: data.user.isBasicProfileComplete,
      isFullProfileComplete: data.user.isFullProfileComplete,
    });

    setIsAuthenticated(true);
    startInactivityTimer();
    startTokenExpirationMonitoring();

    if (!data.user.isBasicProfileComplete) {
      router.push("/register");
    } else {
      router.push("/dashboard");
    }
  }, [router, setAccessToken, setIsAuthenticated, setUser, setUserEmail]);

  useEffect(() => {
    if (!isAwaitingGoogleToken || !response) return;

    const status = getGoogleAuthResultStatus(response);

    if (status.type === "pending_token_exchange") return;

    setIsAwaitingGoogleToken(false);

    if (status.type === "error") {
      console.log("[GoogleAuth] Token exchange result was not successful:", response?.type);
      setShowAuthError(true);
      return;
    }

    setIsLoading(true);
    completeGoogleLogin(status.idToken)
      .catch((error) => {
        console.error("Google auth error:", error);
        setShowAuthError(true);
      })
      .finally(() => setIsLoading(false));
  }, [completeGoogleLogin, isAwaitingGoogleToken, response]);

  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    setIsAwaitingGoogleToken(false);
    console.log("[GoogleAuth] Starting login flow...");
    try {
      console.log("[GoogleAuth] Calling promptAsync()...");
      const result = await promptAsync();
      console.log("[GoogleAuth] promptAsync returned:", result?.type);

      const status = getGoogleAuthResultStatus(result);

      if (status.type === "error") {
        console.log("[GoogleAuth] Auth result type is not success:", result?.type);
        setShowAuthError(true);
        setIsLoading(false);
        return;
      }

      if (status.type === "pending_token_exchange") {
        console.log("[GoogleAuth] Waiting for native code exchange to return id_token...");
        setIsAwaitingGoogleToken(true);
        return;
      }

      await completeGoogleLogin(status.idToken);
    } catch (error) {
      console.error("Google auth error:", error);
      setShowAuthError(true);
    } finally {
      setIsLoading(false);
    }
  }, [completeGoogleLogin, promptAsync]);

  const handleRetryLogin = () => {
    setShowAuthError(false);
    handleLogin();
  };

  const handleCloseError = () => {
    setShowAuthError(false);
  };

  return { handleLogin, isLoading, showAuthError, handleRetryLogin, handleCloseError };
};

export const useEmailAuth = () => {
  const setUserEmail = authStore((state) => state.setUserEmail);
  const [email, setEmail] = useState<string | null>(null);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [otpStatus, setOtpStatus] = useState<{
    success: boolean;
    data?: any;
    error?: any;
  } | null>(null);

  const handleEmailLogin = useCallback(async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${BRICKLE_API_URL}/api/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setUserEmail(email);
        router.push("/verify-otp");
        setOtpStatus({ success: true, data });
      } else {
        setOtpStatus({ success: false, error: data });
      }
    } catch (error) {
      setOtpStatus({ success: false, error });
    } finally {
      setIsLoading(false);
    }
  }, [email, setUserEmail, router]);

  return { handleEmailLogin, isLoading, setEmail, otpStatus };
};

export const useVerifyOtp = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [otpStatus, setOtpStatus] = useState<{
    success: boolean;
    data?: any;
    error?: any;
  } | null>(null);
  const [showAuthError, setShowAuthError] = useState(false);
  const userEmail = authStore((state) => state.userEmail);
  const setUser = authStore((state) => state.setUser);
  const setIsAuthenticated = authStore((state) => state.setIsAuthenticated);
  const setAccessToken = authStore((state) => state.setAccessToken);

  const verifyOtp = async (otp: string) => {
    if (otp.length !== 6) {
      setOtpStatus({ success: false, error: "El código debe tener 6 dígitos." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`${BRICKLE_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, otp }),
      });

      if (!res.ok) {
        setOtpStatus({ success: false, error: "Verifica que este si sea tu código." });
        setIsLoading(false);
        return;
      }

      const data: AuthResponse = await res.json();
      console.log("[verifyOtp] authenticated user profile state:", {
        isBasicProfileComplete: data.user.isBasicProfileComplete,
      });

      setAccessToken(data.accessToken);
      await storeTokens(data.accessToken, data.refreshToken);

      setOtpStatus({ success: true, data });

      setUser({
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        email: data.user.email,
        profilePictureUrl: data.user.profilePictureUrl,
        walletAddress: data.user.walletAddress ?? undefined,
        phoneNumber: data.user.phoneNumber,
        termsAccepted: data.user.termsAccepted,
        isBasicProfileComplete: data.user.isBasicProfileComplete,
        isFullProfileComplete: data.user.isFullProfileComplete,
      });

      if (data.user.isBasicProfileComplete) {
        setIsAuthenticated(true);
        startInactivityTimer();
        startTokenExpirationMonitoring();
        router.push("/dashboard");
      } else {
        console.log("[verifyOtp] redirecting to register because isBasicProfileComplete is false");
        setIsAuthenticated(true);
        router.push("/register");
      }
    } catch (error) {
      console.error("OTP verify error:", error);
      setOtpStatus({ success: false, error: "Error verificando el código." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryOtp = () => {
    setShowAuthError(false);
    router.push("/login");
  };

  const handleCloseError = () => {
    setShowAuthError(false);
  };

  return { verifyOtp, isLoading, otpStatus, showAuthError, handleRetryOtp, handleCloseError };
};

export const useCreateUserWallet = () => {
  const createUserWallet = async (userId: string) => {
    const wallet = ethers.Wallet.createRandom();
    const privateKey = wallet.privateKey;
    const walletAddress = wallet.address;

    authStore.getState().setPrivateKey(privateKey);
    await persistPrivateKeyToSecureStore(privateKey);

    return {
      id: `local-${userId}`,
      address: walletAddress,
      privateKey,
    };
  };

  return { createUserWallet };
};

export const refreshToken = async (): Promise<{ success: boolean; newToken?: string }> => {
  try {
    const refreshTokenValue = await getStoredRefreshToken();
    if (!refreshTokenValue) {
      console.warn("No refresh token available");
      return { success: false };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    const res = await fetch(`${BRICKLE_API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      // Clear stale refresh token so we don't keep retrying
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY);
      return { success: false };
    }

    const data: AuthResponse = await res.json();

    applyAuthResponse(data);
    await storeTokens(data.accessToken, data.refreshToken);

    return { success: true, newToken: data.accessToken };
  } catch (error) {
    console.error("Refresh token error:", error);
    return { success: false };
  }
};

export const restoreSessionFromRefreshToken = async (): Promise<boolean> => {
  const refreshResult = await refreshToken();
  if (!refreshResult.success) {
    return false;
  }

  const privateKey = await loadPrivateKeyFromSecureStore();
  if (privateKey) {
    authStore.getState().setPrivateKey(privateKey);
  }

  return true;
};
