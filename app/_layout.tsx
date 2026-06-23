import { useEffect, useState } from "react";
import { Slot, useRouter, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import "./global.css";
import { StatusBar, View, PanResponder } from "react-native";
import { SearchModal } from "@/src/components/ui/searchModal/SearchModal";
import { SessionExpiredModal, AppUpdateModal } from "@/src/components/modals";
import { useAppUpdate } from "@/src/hooks/useAppUpdate";
import { ErrorBoundary } from "@/src/components/ErrorBoundary";
import { registerSessionModal, updateUserActivity, startInactivityTimer, stopInactivityTimer, startTokenExpirationMonitoring, stopTokenExpirationMonitoring } from "@/src/utils/sessionManager";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { authStore } from "@/src/store/auth.store";
import { useBlockchainConfigStore } from "@/src/store/blockchainConfig.store";
import { usePinStore } from "@/src/store/pin.store";
import { validateEnv } from "@/src/utils/env.validator";
import * as Notifications from 'expo-notifications';
import { updateUser } from "@/src/services/brickle.service";
import { restoreSessionFromRefreshToken } from "@/src/services/auth.service";
import { registerForPushNotificationsAsync } from "@/src/utils/notifications";
import { notificationsStore } from "@/src/store/notifications.store";
import { NotificationStatus, NotificationType } from "@/src/types/notifications.types";
import { useSessionActivity } from "@/src/hooks/useSessionActivity";

// Configure splash screen options
SplashScreen.preventAutoHideAsync().catch(() => {
  /* rejects only on Android */
});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  const { user, isAuthenticated } = authStore();
  const hasPin = usePinStore((s) => s.hasPin);
  const isLocked = usePinStore((s) => s.isLocked);
  const router = useRouter();
  const pathname = usePathname();
  const [appIsReady, setAppIsReady] = useState(false);
  const [isSessionModalVisible, setIsSessionModalVisible] = useState(false);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const { updateAvailable, latestVersion, openStore, checked } = useAppUpdate();
  const { addNotification } = notificationsStore();

  // Initialize session activity tracking (handles PIN lock on background)
  useSessionActivity();

  // Global error handler — prevent unhandled promise rejections from crashing the app
  useEffect(() => {
    const handleError = (event: { message?: string }) => {
      if (__DEV__) console.warn("Global error:", event?.message);
    };
    const handleRejection = (event: { reason?: unknown }) => {
      if (__DEV__) console.warn("Unhandled promise rejection:", event?.reason);
    };
    (globalThis as any).ErrorUtils?.setGlobalHandler?.(handleError);
    const subscription = (globalThis as any).addEventListener?.("unhandledrejection", handleRejection);
    return () => {
      if (subscription?.remove) subscription.remove();
    };
  }, []);

  // Create PanResponder to detect user interactions
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      updateUserActivity();
      return false;
    },
    onMoveShouldSetPanResponder: () => false,
  });

  const onLayoutRootView = async () => {
    try {
      await SplashScreen.hideAsync();
      console.log('✅ Splash screen hidden successfully');
    } catch (e) {
      console.warn('⚠️ Error hiding splash screen:', e);
    }
  }

  useEffect(() => {
    const prepare = async () => {
      const isEnvValid = validateEnv();
      if (!isEnvValid) {
        console.error('❌ Environment validation failed');
        return;
      }
      console.log('✅ Environment validation passed');
      await restoreSessionFromRefreshToken();
      setAppIsReady(true);
    }
    prepare().catch((error) => {
      console.error("❌ Error preparing app session:", error);
      setAppIsReady(true);
    });

    // Register session modal handlers
    registerSessionModal(
      () => setIsSessionModalVisible(true),
      () => setIsSessionModalVisible(false),
      router
    );
  }, [router])

  useEffect(() => {
    registerForPushNotificationsAsync()
      .then(token => {
        console.log('Expo Push Token:', token);
        if (user?.id && user?.pushNotificationToken !== token) {
          updateUser({
            ...user,
            pushNotificationToken: token,
          }).catch((err) => console.warn('Failed to update push token:', err));
        }

      })
      .catch((error: any) => {
        console.log('Error getting Expo Push Token:', error);
      });

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
      // Convert expo notification to our custom format
      const customNotification = {
        id: notification.request.identifier,
        title: notification.request.content.title || 'Notification',
        message: notification.request.content.body || '',
        status: NotificationStatus.UNREAD,
        icon: 'notifications',
        createdAt: new Date().toISOString(),
        type: notification.request.content.data.category as NotificationType
      };
      addNotification(customNotification);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, [addNotification, user])

  // Redirect after Slot has mounted; never navigate before the root layout is ready
  useEffect(() => {
    if (!appIsReady) return;
    onLayoutRootView();
    const path = pathname ?? "";
    const timeoutId = setTimeout(() => {
      if (!user) {
        router.replace("/(stack)/(auth)/login");
        console.log("✅ Redirecting to login");
        return;
      }

      const postponePinSetup =
        path.includes("register") ||
        path.includes("complete-profile") ||
        path.includes("verify-otp") ||
        path.includes("redirect-handler");

      const isPinRoute = path.includes("pin-setup") || path.includes("pin-lock");
      const isAuthenticatedRoute =
        path.includes("(tabs)") ||
        path.includes("dashboard") ||
        path.includes("wallet") ||
        path.includes("portfolio") ||
        path.includes("discover") ||
        path.includes("notifications") ||
        path.includes("onramp") ||
        path.includes("profile") ||
        path.includes("asset-detail") ||
        path.includes("leasing") ||
        path.includes("support") ||
        path.includes("webview");

      if (!hasPin) {
        if (!postponePinSetup && !path.includes("pin-setup")) {
          router.replace("/(stack)/pin-setup");
          console.log("✅ Redirecting to pin-setup (PIN obligatorio)");
        }
        return;
      }

      if (hasPin && isLocked) {
        if (!path.includes("pin-lock")) {
          router.replace("/(stack)/pin-lock");
          console.log("✅ Redirecting to pin-lock");
        }
        return;
      }

      if (isAuthenticatedRoute && !isPinRoute) {
        return;
      }

      router.replace("/(stack)/(tabs)/dashboard");
      console.log("✅ Redirecting to dashboard");
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [appIsReady, user, hasPin, isLocked, pathname, router]);

  useEffect(() => {
    if (isAuthenticated && user) {
      startInactivityTimer();
      startTokenExpirationMonitoring();
      useBlockchainConfigStore.getState().fetchConfig().catch(() => {});
    } else {
      stopInactivityTimer();
      stopTokenExpirationMonitoring();
    }

    return () => {
      stopInactivityTimer();
      stopTokenExpirationMonitoring();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (checked && updateAvailable) {
      setIsUpdateModalVisible(true);
    }
  }, [checked, updateAvailable]);

  const handleUpdate = () => {
    setIsUpdateModalVisible(false);
    openStore();
  };

  const handleUpdateLater = () => {
    setIsUpdateModalVisible(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor="#E8F5E9" />
        <ErrorBoundary onRestart={() => router.replace('/')}>
          <View style={{ flex: 1, backgroundColor: "#E8F5E9" }} {...panResponder.panHandlers}>
            {appIsReady ? <Slot /> : null}
            <SearchModal />
            <SessionExpiredModal visible={isSessionModalVisible} />
            <AppUpdateModal
              visible={isUpdateModalVisible}
              latestVersion={latestVersion}
              onUpdate={handleUpdate}
              onLater={handleUpdateLater}
            />
          </View>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
