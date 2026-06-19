import { View, Text, SafeAreaView, ScrollView, RefreshControl, Pressable } from "react-native";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDashboardInvestments } from "@/src/hooks/dashboard/useDashboardInvestments";
import { useInvestmentsOnChainSnapshots } from "@/src/hooks/dashboard/useInvestmentsOnChainSnapshots";
import { useProjections } from "@/src/hooks/portfolio/useProjections";
import { usePortfolio } from "@/src/hooks/portfolio/usePortfolio";
import { useClaimableRentInvestments } from "@/src/hooks/portfolio/useClaimableRentInvestments";
import { authStore } from "@/src/store/auth.store";
import { UserLeasing } from "@/src/types/portfolio.types";
import { Asset, Investment } from "@/src/interfaces/investments.interface";
import { router, useLocalSearchParams } from "expo-router";
import { usePullToRefresh } from "@/src/hooks/usePullToRefresh";
import {
  LeasingPaymentModal,
  BalanceCard,
  BackGroundGradient,
  HeaderAssetsCard,
} from "@/src/components";
import { SwitchablePortfolioChart } from "@/src/components/portfolio/SwitchablePortfolioChart";
import { CategoryCollapsibleSection } from "@/src/components/portfolio/CategoryCollapsibleSection";
import {
  BalanceCardSkeleton,
  PortfolioChartSkeleton,
  HeaderAssetsCardSkeleton
} from "@/src/components/ui/skeleton";
import {
  getCategoryIcon,
  getCategoryIconCircleBackground,
  getCategoryIconGlyphColor,
} from "@/src/utils/categories";
import { formatCurrency } from "@/src/utils/formatCurrency";
import {
  microToCopAmount,
  toChecksumEvmAddress,
} from "@/src/utils/leasingInvestorReads";
import { computeInvestmentOnChainPosition } from "@/src/utils/investmentOnChainPosition";
import {
  PORTFOLIO_PROJECTION_MONTHS,
  averageMonthlyCashflowFromProjectionPoints,
} from "@/src/utils/portfolioProjection.utility";
import { useOnRefreshTriggerIncrement } from "@/src/hooks/useOnRefreshTriggerIncrement";

const PortfolioScreen = () => {
  const {
    parsedProjectionData,
    fetchProjections,
    getDefaultStartDate,
  } = useProjections();
  const { investments, isLoading: isLoadingInvestments, refetch: refetchInvestments } = useDashboardInvestments();
  const user = authStore((state) => state.user);
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
  const currentValue = authStore((state) => state.currentValue);
  const totalInvested = authStore((state) => state.totalInvested);
  const roi = authStore((state) => state.roi);
  const { chartData, isLoading: isLoadingChart, refetch: refetchPortfolio } = usePortfolio();
  const { claimableInvestments, isLoading: isLoadingClaimable } = useClaimableRentInvestments(
    investments,
    portfolioEvmAddress
  );
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [selectedLeasing, setSelectedLeasing] = useState<UserLeasing | null>(null);
  const { selectedCategory, tab: tabParam } = useLocalSearchParams<{
    selectedCategory?: string;
    tab?: string;
  }>();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(selectedCategory || null);
  const [portfolioTab, setPortfolioTab] = useState<"assets" | "claims">("assets");

  useEffect(() => {
    if (tabParam === "claims") {
      setPortfolioTab("claims");
      router.setParams({ tab: undefined });
    }
  }, [tabParam]);

  // Group investments by category
  const investmentsByCategory = useMemo(() => {
    if (!investments || investments.length === 0) return {};

    return investments.reduce((acc, investment) => {
      const category = investment.leasing.type || 'Sin categoría';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(investment);
      return acc;
    }, {} as Record<string, Investment[]>);
  }, [investments]);

  useEffect(() => {
    if (currentValue && currentValue > 0) {
      fetchProjections({
        currentValue: currentValue,
        projectionMonths: PORTFOLIO_PROJECTION_MONTHS,
        expectedAnnualReturn: roi / 100,
        startDate: getDefaultStartDate(),
        investedPrincipal: totalInvested > 0 ? totalInvested : undefined,
      });
    }
  }, [currentValue, roi, totalInvested, fetchProjections, getDefaultStartDate]);

  const handleRefresh = async () => {
    await refetchPortfolio();
    await refetchInvestments();
    await refetchSnapshots();
    await fetchProjections({
      currentValue: currentValue,
      projectionMonths: PORTFOLIO_PROJECTION_MONTHS,
      expectedAnnualReturn: roi / 100,
      startDate: getDefaultStartDate(),
      investedPrincipal: totalInvested > 0 ? totalInvested : undefined,
    });
  };

  const { refreshControlProps } = usePullToRefresh({
    onRefresh: handleRefresh,
  });

  const onGlobalRefresh = useCallback(async () => {
    await refetchPortfolio();
    await refetchInvestments();
    await refetchSnapshots();
    const { currentValue: cv, roi: r, totalInvested: ti } = authStore.getState();
    if (cv && cv > 0) {
      await fetchProjections({
        currentValue: cv,
        projectionMonths: PORTFOLIO_PROJECTION_MONTHS,
        expectedAnnualReturn: r / 100,
        startDate: getDefaultStartDate(),
        investedPrincipal: ti > 0 ? ti : undefined,
      });
    }
  }, [
    refetchPortfolio,
    refetchInvestments,
    refetchSnapshots,
    fetchProjections,
    getDefaultStartDate,
  ]);

  useOnRefreshTriggerIncrement(onGlobalRefresh);

  const handleAssetPress = (asset: Asset, investment: Investment) => {
    router.push({
      pathname: "/(stack)/(tabs)/my-investments",
      params: {
        assetId: asset.id,
        investmentData: JSON.stringify(investment)
      },
    });
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalVisible(false);
    setSelectedLeasing(null);
  };

  const hasProjectionPoints =
    (parsedProjectionData?.projectionData?.length ?? 0) > 0;

  /** Promedio mensual que recibe el usuario: interés + capital devuelto por mes en la proyección. */
  const portfolioChartDisplayValue = useMemo(() => {
    const average = averageMonthlyCashflowFromProjectionPoints(
      parsedProjectionData?.projectionData
    );
    if (average != null) {
      return String(Math.round(average));
    }
    return chartData?.totalValue || String(currentValue ?? 0);
  }, [parsedProjectionData?.projectionData, chartData?.totalValue, currentValue]);

  const portfolioChartTitle = hasProjectionPoints
    ? `Ingreso mensual promedio (próx. ${PORTFOLIO_PROJECTION_MONTHS} meses)`
    : `Valor de cartera próximos ${PORTFOLIO_PROJECTION_MONTHS} meses`;

  return (
    <SafeAreaView className="flex-1">
      <BackGroundGradient />
      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false} refreshControl={<RefreshControl {...refreshControlProps} />}>
        {currentValue == null ? (
          <BalanceCardSkeleton />
        ) : (
          <BalanceCard
            title="Valor total del portafolio"
            balance={currentValue.toString()}
          />
        )}

        <Text className="text-2xl font-libre-bold mb-4">Portafolio</Text>
        {isLoadingChart ? (
          <PortfolioChartSkeleton />
        ) : (
          <SwitchablePortfolioChart
            barDataCapital={chartData?.barDataCapital || []}
            barDataRendimiento={chartData?.barDataRendimiento || []}
            projectionData={parsedProjectionData?.projectionData}
            title={portfolioChartTitle}
            value={portfolioChartDisplayValue}
            roi={chartData?.roi || roi.toString()}
            currentValue={currentValue}
          />
        )}

        <View className="flex-row w-full gap-1 mb-4 mt-2 border-b border-gray-200">
          <Pressable
            onPress={() => setPortfolioTab("assets")}
            className={`flex-1 pb-3 px-2 border-b-2 ${
              portfolioTab === "assets" ? "border-blue-primary" : "border-transparent"
            }`}
          >
            <Text
              className={`text-center text-sm font-libre-bold ${
                portfolioTab === "assets" ? "text-blue-primary" : "text-gray-500"
              }`}
            >
              Mis activos
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setPortfolioTab("claims")}
            className={`flex-1 pb-3 px-2 border-b-2 ${
              portfolioTab === "claims" ? "border-blue-primary" : "border-transparent"
            }`}
          >
            <Text
              className={`text-center text-sm font-libre-bold ${
                portfolioTab === "claims" ? "text-blue-primary" : "text-gray-500"
              }`}
            >
              Rentas por reclamar
            </Text>
          </Pressable>
        </View>

        <View className="flex flex-col w-full mb-6">
          {portfolioTab === "assets" ? (
            isLoadingInvestments ? (
              <>
                <HeaderAssetsCardSkeleton />
                <HeaderAssetsCardSkeleton />
                <HeaderAssetsCardSkeleton />
              </>
            ) : investments?.length > 0 ? (
              Object.keys(investmentsByCategory).map((category) => (
                <CategoryCollapsibleSection
                  key={category}
                  category={category}
                  investments={investmentsByCategory[category]}
                  isExpanded={expandedCategory === category}
                  onToggle={() => setExpandedCategory(expandedCategory === category ? null : category)}
                  onAssetPress={handleAssetPress}
                  snapshotsByInvestmentId={snapshotsByInvestmentId}
                />
              ))
            ) : (
              <View className="bg-white rounded-2xl p-6 items-center">
                <Text className="text-gray-500 text-base text-center">
                  Aún no tienes inversiones activas
                </Text>
                <Text className="text-gray-400 text-sm text-center mt-2">
                  Explora las oportunidades de inversión disponibles
                </Text>
              </View>
            )
          ) : isLoadingClaimable ? (
            <>
              <HeaderAssetsCardSkeleton variant="claimable" />
              <HeaderAssetsCardSkeleton variant="claimable" />
            </>
          ) : claimableInvestments.length > 0 ? (
            claimableInvestments.map(({ investment, claimableMicro }) => (
              <View
                key={investment.id}
                className="mb-4 w-full max-w-[360px] self-center items-center px-1"
              >
                <HeaderAssetsCard
                  title={investment.leasing.name}
                  value={
                    computeInvestmentOnChainPosition(
                      investment,
                      snapshotsByInvestmentId[investment.id]
                    ).bricksLabel
                  }
                  pricePerToken={investment.leasing.pricePerToken}
                  roi={investment.leasing.tir ?? 0}
                  colorIconBg={getCategoryIconCircleBackground(investment.leasing.type)}
                  iconGlyphColor={getCategoryIconGlyphColor(investment.leasing.type)}
                  icon={getCategoryIcon(investment.leasing.type)}
                  showClaimableWarning
                  onPress={() => handleAssetPress(investment.leasing, investment)}
                />
                <Text className="mt-2 w-full self-start text-sm text-gray-600">
                  Por reclamar: {formatCurrency(microToCopAmount(claimableMicro))} cop
                </Text>
              </View>
            ))
          ) : (
            <View className="bg-white rounded-2xl p-6 items-center">
              <Text className="text-gray-500 text-base text-center">
                No tienes rentas activas pendientes por reclamar
              </Text>
              <Text className="text-gray-400 text-sm text-center mt-2">
                Cuando haya monto disponible on-chain, aparecerá aquí por activo
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <LeasingPaymentModal
        isVisible={isPaymentModalVisible}
        leasing={selectedLeasing}
        onClose={handleClosePaymentModal}
        onPaymentSuccess={() => ({})}
      />
    </SafeAreaView>
  );
};

export default PortfolioScreen;
