import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { LeasingDetailScreen } from "@/src/components";
import { authStore } from "@/src/store/auth.store";
import { Colors } from "@/assets/Colors";
import { useAppNavigation } from "@/src/context/NavigationContext";
import { leasingParamsStore } from "@/src/store/leasingParams.store";
import { Href } from "expo-router";

/**
 * Detalle de leasing: lee leasingId del store, pide GET /api/Leasing/{id} y muestra datos.
 * Navegar: leasingParamsStore.getState().setParams(assetId, source); router.push("/(stack)/leasing");
 */
export default function LeasingDetailScreenRoute() {
  const nav = useAppNavigation();
  const [params, setParams] = useState<{ assetId: string; source: string } | null>(null);

  useEffect(() => {
    const id = setTimeout(() => {
      const { assetId, source } = leasingParamsStore.getState();
      if (assetId && typeof assetId === "string") {
        setParams({ assetId, source: source ?? "discover-page" });
      } else {
        nav.back();
      }
    }, 0);
    return () => clearTimeout(id);
  }, [nav]);

  const balance = authStore((state) => state.balance);

  if (!params) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: Colors.appBackground }}>
        <ActivityIndicator size="large" color={Colors.bluePrimary} />
      </View>
    );
  }

  const { assetId, source } = params;

  const getBackDestination = () => {
    switch (source) {
      case "dashboard":
        return "/(stack)/(tabs)/dashboard";
      case "portfolio":
        return "/(stack)/(tabs)/portfolio";
      case "discover-page":
      default:
        return "/(stack)/(tabs)/discover";
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <LeasingDetailScreen
        key={assetId}
        assetId={assetId}
        userBalance={balance || "0"}
        source={source as "dashboard" | "discover-page" | "portfolio"}
        onBackPress={() => {
          leasingParamsStore.getState().clear();
          nav.push(getBackDestination());
        }}
        onNavigateToWalletRestore={() => nav.push("/(stack)/wallet-restore")}
        onNavigateToWalletUpgrade={() => nav.push("/(stack)/wallet-upgrade" as Href)}
        onNavigateToPortfolio={() => nav.push("/(stack)/(tabs)/portfolio")}
      />
    </View>
  );
}
