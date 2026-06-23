type StartupRedirectState = {
  appIsReady: boolean;
  hasUser: boolean;
  hasPin: boolean;
  isLocked: boolean;
  pathname?: string | null;
};

export function getStartupRedirectPath({
  appIsReady,
  hasUser,
  hasPin,
  isLocked,
  pathname,
}: StartupRedirectState): string | null {
  if (!appIsReady) return null;

  const path = pathname ?? "";

  if (!hasUser) {
    return path.includes("login") ? null : "/(stack)/(auth)/login";
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
    return postponePinSetup || path.includes("pin-setup") ? null : "/(stack)/pin-setup";
  }

  if (isLocked) {
    return path.includes("pin-lock") ? null : "/(stack)/pin-lock";
  }

  if (isAuthenticatedRoute && !isPinRoute) return null;

  return path.includes("dashboard") ? null : "/(stack)/(tabs)/dashboard";
}
