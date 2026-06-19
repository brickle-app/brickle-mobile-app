import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { authStore } from "../store/auth.store";
import { isAxiosError } from "axios";
import { startInactivityTimer, startTokenExpirationMonitoring } from "../utils/sessionManager";
import * as SecureStore from "expo-secure-store";
import { ethers } from "ethers";

WebBrowser.maybeCompleteAuthSession();

const PRIVATE_KEY_STORAGE_KEY = "brickle_private_key";
const REFRESH_TOKEN_STORAGE_KEY = "brickle_refresh_token";

const BRICKLE_API_URL = process.env.EXPO_PUBLIC_BRICKLE_API_URL;

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

  await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, privateKey);
  authStore.getState().setPrivateKey(privateKey);

  return { walletAddress, privateKey };
}

export async function getPrivateKey(): Promise<string | null> {
  const storedKey = authStore.getState().privateKey;
  if (storedKey) return storedKey;

  const secureKey = await SecureStore.getItemAsync(PRIVATE_KEY_STORAGE_KEY);
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

  const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleWebClientId,
    webClientId: googleWebClientId,
    redirectUri: "https://auth.expo.io/@pivelcode/brickle",
  });

  const handleLogin = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await promptAsync();
      if (result?.type !== "success" || !result.params?.id_token) {
        setIsLoading(false);
        return;
      }

      const idToken = result.params.id_token;

      const res = await fetch(`${BRICKLE_API_URL}/api/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID }),
      });

      if (!res.ok) {
        console.error("Google auth failed", await res.text());
        setShowAuthError(true);
        setIsLoading(false);
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
    } catch (error) {
      console.error("Google auth error:", error);
      setShowAuthError(true);
    } finally {
      setIsLoading(false);
    }
  }, [promptAsync, router, setUserEmail]);

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
      console.log("[verifyOtp] response:", JSON.stringify(data));
      console.log("[verifyOtp] isBasicProfileComplete:", data.user.isBasicProfileComplete);

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

    await SecureStore.setItemAsync(PRIVATE_KEY_STORAGE_KEY, privateKey);
    authStore.getState().setPrivateKey(privateKey);

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

    const res = await fetch(`${BRICKLE_API_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });

    if (!res.ok) return { success: false };

    const data: AuthResponse = await res.json();

    authStore.getState().setAccessToken(data.accessToken);
    await storeTokens(data.accessToken, data.refreshToken);

    return { success: true, newToken: data.accessToken };
  } catch (error) {
    console.error("Refresh token error:", error);
    return { success: false };
  }
};
