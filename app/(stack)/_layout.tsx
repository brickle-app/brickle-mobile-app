import React from "react";
import { Stack, useRouter } from "expo-router";
import { NavigationProvider } from "@/src/context/NavigationContext";
import { Colors } from "@/assets/Colors";

const StackLayout = () => {
  const router = useRouter();

  return (
    <NavigationProvider
      value={{
        push: (href, params) => {
          if (params && typeof href === "string") {
            router.push({ pathname: href, params });
          } else {
            router.push(href as import("expo-router").Href);
          }
        },
        back: () => router.back(),
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: Colors.appBackground,
          },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="webview" options={{ title: "WebView" }} />
        <Stack.Screen name="(tabs)" options={{ title: "Home" }} />
        <Stack.Screen name="leasing" options={{ headerShown: false }} />
        <Stack.Screen name="asset-detail" options={{ headerShown: false }} />
        <Stack.Screen name="pin-lock" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="pin-setup" options={{ headerShown: false, gestureEnabled: false }} />
      </Stack>
    </NavigationProvider>
  );
};

export default StackLayout;
