import { View, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { LeasingDetailScreen } from "@/src/components";
import { authStore } from "@/src/store/auth.store";
import { Colors } from "@/assets/Colors";

/**
 * Detalle de un activo/leasing. Navegación simple por URL.
 * Desde Dashboard: router.push(`/(stack)/asset-detail/${asset.id}`) con params { source: "dashboard" }
 * Desde Discover: router.push(`/(stack)/asset-detail/${asset.id}`) con params { source: "discover-page" }
 */
export default function AssetDetailPage() {
  const router = useRouter();
  const { id, source } = useLocalSearchParams<{ id: string; source?: string }>();
  const balance = authStore((state) => state.balance);

  const assetId = Array.isArray(id) ? id[0] : id;

  if (!assetId) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.appBackground }}>
        <ActivityIndicator size="large" color={Colors.bluePrimary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <LeasingDetailScreen
        key={assetId}
        assetId={assetId}
        userBalance={balance || "0"}
        source={(source as "dashboard" | "discover-page" | "portfolio") ?? "discover-page"}
        onBackPress={() => router.back()}
        onNavigateToLogin={() => router.push("/(stack)/(auth)/login")}
        onNavigateToPortfolio={() => router.push("/(stack)/(tabs)/portfolio")}
      />
    </View>
  );
}
