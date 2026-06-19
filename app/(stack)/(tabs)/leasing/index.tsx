import { LeasingDetailScreen } from "@/src/components";
import { useLocalSearchParams, useRouter } from "expo-router";
import { authStore } from "@/src/store/auth.store";
import { Href } from "expo-router";

const LeasingDetailScreenWrapper = () => {
  const { assetId, source } = useLocalSearchParams<{
    assetId: string;
    source?: string;
  }>();
  const router = useRouter();
  const balance = authStore((state) => state.balance);

  const getBackDestination = (): Href => {
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

  if (!assetId) {
    return null;
  }

  return (
    <LeasingDetailScreen
      assetId={assetId}
      userBalance={balance || "0"}
      source={source as "dashboard" | "discover-page" | "portfolio" | undefined}
      onBackPress={() => router.push(getBackDestination())}
      onNavigateToLogin={() => router.push("/(stack)/(auth)/login")}
      onNavigateToPortfolio={() => router.push("/(stack)/(tabs)/portfolio")}
    />
  );
};

export default LeasingDetailScreenWrapper;