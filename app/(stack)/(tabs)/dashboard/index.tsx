import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { ScrollView, Text, View, RefreshControl, Pressable, Platform, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { DashboardHeader } from "@/src/components/dashboard/dashboard-header/DashboardHeader";
import { SubscriptionBanner } from "@/src/components/ui/subscription-banner/SubscriptionBanner";
import { ProfileCompletionModal } from "@/src/components/ui/modal/ProfileCompletionModal";
import { useDashboard } from "@/src/hooks/dashboard/useDashboard";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import AssetsSuggestCarousel from "@/src/components/dashboard/AssetsSuggetsCarousel/AssetsSuggetsCarousel";
import { useUserBalance } from "@/src/hooks/useUserBalance";
import { loadRecentSearches } from "@/src/store/search.store";
import { useOnRefreshTriggerIncrement } from "@/src/hooks/useOnRefreshTriggerIncrement";
import { usePullToRefresh } from "@/src/hooks/usePullToRefresh";
import { Asset } from "@/src/interfaces/investments.interface";
import { BrickleService, getInvestmentsGroupedByCategory } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { useLocalSearchParams, useRouter } from "expo-router";
import { DashboardHeaderSkeleton, AssetsSuggestCarouselSkeleton } from "@/src/components/ui/skeleton";
import { useDashboardInvestments } from "@/src/hooks/dashboard/useDashboardInvestments";
import { useInvestmentsOnChainSnapshots } from "@/src/hooks/dashboard/useInvestmentsOnChainSnapshots";
import { usePortfolio } from "@/src/hooks/portfolio/usePortfolio";
import { useClaimableRentInvestments } from "@/src/hooks/portfolio/useClaimableRentInvestments";
import {
  microToCopAmount,
  toChecksumEvmAddress,
} from "@/src/utils/leasingInvestorReads";
import { formatCurrency, parseCopAmountFromText } from "@/src/utils/formatCurrency";
import { Colors } from "@/assets/Colors";
import { ProfileDocumentCta } from "@/src/components/dashboard/ProfileDocumentCta";
import { needsIdentityDocument } from "@/src/utils/profileVerification";
import { refreshAuthenticatedUser } from "@/src/services/refresh-authenticated-user";
import { logNonCriticalError } from "@/src/utils/nonCriticalErrorLogger";

/** Espacio bajo el scroll cuando el anuncio flotante está visible (~altura tarjeta + respiro). */
const CLAIM_BANNER_SCROLL_PADDING = 100;

const DashboardScreen = () => {
  const router = useRouter();
  const { openDocumentUpload } = useLocalSearchParams<{ openDocumentUpload?: string }>();
  const didOpenDocumentUploadFromRoute = useRef(false);
  const { balance, refreshBalance } = useUserBalance();
  const {
    isModalVisible,
    handleBuyPress,
    handleUploadDocument,
    handleCompleteProfile,
    handleCloseModal,
  } = useDashboard();
  const user = authStore((state) => state.user);
  const setUser = authStore((state) => state.setUser);
  const shouldShowDocumentCta = needsIdentityDocument(user);
  const shouldShowWalletActivationCta = Boolean(
    user?.isFullProfileComplete && !user.isProfileUnderReview && !user.walletAddress
  );
  const [suggestedAssets, setSuggestedAssets] = useState<Asset[] | null>(null);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const currentValue = authStore((state) => state.currentValue);
  const totalInvested = authStore((state) => state.totalInvested);
  const roi = authStore((state) => state.roi);
  const {
    investments,
    isLoading: isLoadingInvestments,
    refetch: refetchInvestments,
  } = useDashboardInvestments();
  const { snapshotsByInvestmentId, refetchSnapshots } = useInvestmentsOnChainSnapshots(
    investments ?? [],
    user ?? undefined
  );
  const portfolioEvmAddress = useMemo(
    () =>
      toChecksumEvmAddress(user?.walletAddress) ??
      toChecksumEvmAddress(user?.externalWalletId ?? undefined) ??
      undefined,
    [user?.walletAddress, user?.externalWalletId]
  );
  const { claimableInvestments, isLoading: isLoadingClaimable } = useClaimableRentInvestments(
    investments ?? [],
    portfolioEvmAddress
  );
  const hasClaimableRentOnChain =
    !isLoadingClaimable && claimableInvestments.length > 0;
  const claimableTotalCop = useMemo(() => {
    if (claimableInvestments.length === 0) return 0;
    return claimableInvestments.reduce(
      (sum, row) => sum + microToCopAmount(row.claimableMicro),
      0
    );
  }, [claimableInvestments]);
  const { chartData: portfolioChartData, isLoading: isLoadingPortfolio, refetch: refetchPortfolio } = usePortfolio();

  const fetchSuggestedAssets = useCallback(async () => {
    if (user?.email) {
      setIsLoadingAssets(true);
      try {
        const assets = await getInvestmentsGroupedByCategory(user.email);
        setSuggestedAssets(assets.slice(0, 6));
      } catch (error) {
        logNonCriticalError("Error fetching suggested assets:", error);
      } finally {
        setIsLoadingAssets(false);
      }
    } else {
      setIsLoadingAssets(false);
    }
  }, [user?.email]);

  const fetchBalance = useCallback(async () => {
    setIsLoadingBalance(true);
    try {
      await refreshBalance();
      await loadRecentSearches();
    } catch (error) {
      logNonCriticalError("Error fetching balance:", error);
    } finally {
      setIsLoadingBalance(false);
    }
  }, [refreshBalance]);

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchSuggestedAssets(),
      fetchBalance(),
      refetchPortfolio(),
      refetchInvestments(),
      refetchSnapshots(),
    ]);
  }, [
    fetchBalance,
    fetchSuggestedAssets,
    refetchInvestments,
    refetchPortfolio,
    refetchSnapshots,
  ]);

  const fetchInitialDashboardData = useCallback(async () => {
    await Promise.all([
      fetchSuggestedAssets(),
      fetchBalance(),
    ]);
  }, [fetchBalance, fetchSuggestedAssets]);

  useEffect(() => {
    if (openDocumentUpload !== "1" || didOpenDocumentUploadFromRoute.current) return;
    didOpenDocumentUploadFromRoute.current = true;
    handleUploadDocument();
    router.setParams({ openDocumentUpload: undefined });
  }, [handleUploadDocument, openDocumentUpload, router]);

  useFocusEffect(
    useCallback(() => {
      void refreshAuthenticatedUser({
        email: user?.email,
        getUserByEmail: BrickleService.getUserByEmail,
        setUser,
      });
    }, [setUser, user?.email])
  );

  const handleAssetPress = (asset: Asset) => {
    router.push(`/(stack)/asset-detail/${asset.id}?source=dashboard` as import("expo-router").Href);
  };

  const handleFirstPurchasePress = () => {
    if (!isLoadingBalance) {
      const numericBalance = parseCopAmountFromText(balance);
      if (numericBalance <= 0) {
        router.push({
          pathname: "/(stack)/(tabs)/wallet",
          params: { tab: "recharge" },
        });
        return;
      }
    }
    handleBuyPress();
  };

  const { refreshControlProps } = usePullToRefresh({
    onRefresh: fetchAllData,
  });

  useEffect(() => {
    void fetchInitialDashboardData();
  }, [fetchInitialDashboardData]);

  useOnRefreshTriggerIncrement(() => {
    void fetchAllData();
  });

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="p-4"
        contentContainerStyle={
          hasClaimableRentOnChain
            ? { paddingBottom: CLAIM_BANNER_SCROLL_PADDING }
            : undefined
        }
        refreshControl={<RefreshControl {...refreshControlProps} />}
      >
        <BackGroundGradient />
        <View className="flex flex-col justify-center items-center gap-12">
          {isLoadingBalance && isLoadingInvestments && isLoadingPortfolio && user ? (
            <DashboardHeaderSkeleton />
          ) : (
            <DashboardHeader
              investments={investments}
              isLoadingInvestments={isLoadingInvestments}
              portfolioChartData={portfolioChartData}
              isLoadingPortfolio={isLoadingPortfolio}
              roi={roi.toString()}
              balance={balance.toString()}
              totalInvested={totalInvested}
              currentValue={currentValue}
              onBuyPress={handleFirstPurchasePress}
              snapshotsByInvestmentId={snapshotsByInvestmentId}
            />
          )}

          {shouldShowDocumentCta && (
            <ProfileDocumentCta onPress={handleUploadDocument} />
          )}

          {shouldShowWalletActivationCta && (
            <View className="w-full rounded-2xl border border-blue-primary/15 bg-white p-4">
              <Text className="font-libre-bold text-base text-blue-primary">
                Activa tu cuenta para transacciones
              </Text>
              <Text className="mt-2 font-libre-regular text-xs leading-5 text-gray-600">
                Crea tus códigos de respaldo para poder recargar y retirar de forma segura.
              </Text>
              <Pressable
                className="mt-4 rounded-full bg-primary px-4 py-3"
                onPress={() => router.push("/wallet-upgrade")}
              >
                <Text className="text-center font-libre-bold text-blue-primary">
                  Activar mi cuenta
                </Text>
              </Pressable>
            </View>
          )}

          <SubscriptionBanner
            title="Recarga tu cuenta"
            description="Empieza a construir tu futuro hoy."
            onPress={() => router.push("/(stack)/(tabs)/wallet")} // Optional: Add navigation
          />

          <View className="flex flex-col  w-full  items-start gap-4">
            <Text className="font-libre-bold text-xl text-text-primary ">
              {" "}
              Activos sugeridos
            </Text>
            {isLoadingAssets ? (
              <AssetsSuggestCarouselSkeleton />
            ) : (
              <AssetsSuggestCarousel
                assets={suggestedAssets || undefined}
                onAssetPress={handleAssetPress}
              />
            )}
          </View>

          {/* Modal for Incomplete Profile */}
          <ProfileCompletionModal
            isVisible={isModalVisible}
            onClose={handleCloseModal}
            onCompleteProfile={handleCompleteProfile}
          />
        </View>
      </ScrollView>

      {hasClaimableRentOnChain && (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(stack)/(tabs)/portfolio",
              params: { tab: "claims" },
            })
          }
          accessibilityRole="button"
          accessibilityLabel="Ir a rentas por reclamar en el portafolio"
          className="absolute left-4 right-4 flex-row items-center gap-3 rounded-2xl border border-orange-primary bg-white px-4 py-3 shadow-md"
          style={[
            styles.claimBannerShadow,
            /* El layout del tab ya deja el contenido encima del navigator: no sumar altura del tab */
            { bottom: 8 },
          ]}
        >
          <View className="rounded-full bg-orange-primary/15 p-2">
            <Ionicons name="cash-outline" size={22} color={Colors.orangePrimary} />
          </View>
          <View className="min-w-0 flex-1">
            <Text className="font-libre-bold text-sm text-text-primary">
              Tienes renta por reclamar
            </Text>
            <Text className="mt-0.5 font-libre-regular text-xs text-gray-600">
              {claimableInvestments.length === 1
                ? `Por reclamar: ${formatCurrency(claimableTotalCop)} cop · abre Rentas por reclamar`
                : `${claimableInvestments.length} activos · ${formatCurrency(claimableTotalCop)} cop en total`}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.secondary} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  claimBannerShadow: {
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },
});

export default DashboardScreen;
