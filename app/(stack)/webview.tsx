import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getWebViewUriForDocument } from "@/src/utils/pdf-webview-uri";

function normalizeParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

const WebViewScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ url?: string; title?: string }>();
  const url = normalizeParam(params.url);
  const titleParam = normalizeParam(params.title);
  const [loading, setLoading] = useState(true);

  const displayUri = useMemo(
    () => (url ? getWebViewUriForDocument(url) : ""),
    [url]
  );

  const headerTitle = (() => {
    if (titleParam?.trim()) return titleParam.trim();
    if (!url) return "";
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "Documento";
    }
  })();

  if (!url) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          className="mx-4 mb-4 flex-row items-center"
          onPress={() => router.back()}
          hitSlop={12}
        >
          <Ionicons
            name="arrow-back-circle"
            size={28}
            color={Colors.primary}
          />
          <Text className="ml-2 font-libre-bold text-gray-800">Volver</Text>
        </TouchableOpacity>
        <Text className="mx-4 text-gray-600">Enlace no disponible.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      <View className="flex flex-row items-center border-b border-gray-100 px-4 py-3">
        <TouchableOpacity className="mr-3" onPress={() => router.back()}>
          <Ionicons
            name="arrow-back-circle"
            size={28}
            color={Colors.primary}
          />
        </TouchableOpacity>
        <Text
          className="flex-1 font-libre-bold text-base text-gray-800"
          numberOfLines={1}
        >
          {headerTitle}
        </Text>
      </View>

      <View style={styles.container}>
        {loading && (
          <View style={styles.loadingOverlay} pointerEvents="none">
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        )}
        <WebView
          source={{ uri: displayUri }}
          style={styles.webview}
          startInLoadingState
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => setLoading(false)}
          scalesPageToFit={Platform.OS === "android"}
          javaScriptEnabled
          domStorageEnabled
          allowsInlineMediaPlayback
          mixedContentMode="compatibility"
          originWhitelist={["https://*", "http://*"]}
        />
      </View>
    </View>
  );
};

export default WebViewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    opacity: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    zIndex: 1,
  },
});
