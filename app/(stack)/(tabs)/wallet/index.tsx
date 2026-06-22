import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ScrollView, SafeAreaView, View, RefreshControl } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";

import {
  BalanceCard,
  MonthlyIncomeCard,
  WalletTabs,
  WalletTabType,
  SendForm,
  RechargeForm,
  WithdrawForm,
  PortfolioCompositionChart,
} from "@/src/components/wallet";
import { useDashboardInvestments } from "@/src/hooks/dashboard/useDashboardInvestments";
import OperationStatusModal from "@/src/components/wallet/OperationStatusModal";
import { useWallet } from "@/src/components/wallet/hooks/useWallet";
import { MovementsForm } from "@/src/components/wallet/forms/MovementsForm";
import { authStore } from "@/src/store/auth.store";
import { usePullToRefresh } from "@/src/hooks/usePullToRefresh";
import { ProfileCompletionModal } from "@/src/components/ui/modal/ProfileCompletionModal";
import { useWalletActions } from "@/src/hooks/wallet/useWalletActions";
import { useProjections } from "@/src/hooks/portfolio/useProjections";
import {
  PORTFOLIO_PROJECTION_MONTHS,
  averageMonthlyCashflowFromProjectionPoints,
} from "@/src/utils/portfolioProjection.utility";
import { useOnRefreshTriggerIncrement } from "@/src/hooks/useOnRefreshTriggerIncrement";

const WalletScreen = () => {
  const router = useRouter();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<WalletTabType>(null);
  const [isOperationStatusModalVisible, setIsOperationStatusModalVisible] = useState(false);
  const { getBalance } = useWallet();
  const [balance, setBalance] = useState<string | number>(0);
  const walletAddress = authStore((state) => state.user?.walletAddress);
  const currentValue = authStore((state) => state.currentValue);
  const totalInvested = authStore((state) => state.totalInvested);
  const roi = authStore((state) => state.roi);
  const { refetch: refetchInvestments } = useDashboardInvestments();
  const { parsedProjectionData, fetchProjections, getDefaultStartDate } =
    useProjections();
  const {
    isModalVisible,
    handleAction,
    handleCompleteProfile,
    handleCloseModal,
  } = useWalletActions();

  useEffect(() => {
    if (currentValue && currentValue > 0) {
      fetchProjections({
        currentValue,
        projectionMonths: PORTFOLIO_PROJECTION_MONTHS,
        expectedAnnualReturn: roi / 100,
        startDate: getDefaultStartDate(),
        investedPrincipal: totalInvested > 0 ? totalInvested : undefined,
      });
    }
  }, [
    currentValue,
    roi,
    totalInvested,
    fetchProjections,
    getDefaultStartDate,
  ]);

  const projectionAverageMonthly = useMemo(
    () =>
      averageMonthlyCashflowFromProjectionPoints(
        parsedProjectionData?.projectionData
      ),
    [parsedProjectionData?.projectionData]
  );

  /** Misma lógica que cartera: promedio interés+capital de la proyección; si no hay datos, TIR mensual sobre valor actual. */
  const monthlyIncome = useMemo(() => {
    if (projectionAverageMonthly != null && projectionAverageMonthly > 0) {
      return projectionAverageMonthly;
    }
    return (Math.pow(1 + roi / 100, 1 / 12) - 1) * currentValue;
  }, [projectionAverageMonthly, roi, currentValue]);

  const monthlyIncomeSubtitle =
    projectionAverageMonthly != null && projectionAverageMonthly > 0
      ? `Promedio próx. ${PORTFOLIO_PROJECTION_MONTHS} meses (interés + capital)`
      : "E.M — estimación con TIR del portafolio";

  const fetchBalance = useCallback(async () => {
    const b = await getBalance();
    setBalance(b);
  }, [getBalance]);

  const { refreshControlProps } = usePullToRefresh({
    onRefresh: async () => {
      await fetchBalance();
      await refetchInvestments();
      if (currentValue && currentValue > 0) {
        await fetchProjections({
          currentValue,
          projectionMonths: PORTFOLIO_PROJECTION_MONTHS,
          expectedAnnualReturn: roi / 100,
          startDate: getDefaultStartDate(),
          investedPrincipal: totalInvested > 0 ? totalInvested : undefined,
        });
      }
    },
  });

  useEffect(() => {
    void fetchBalance();
  }, [fetchBalance]);

  useEffect(() => {
    if (tabParam === "recharge") {
      setActiveTab("recharge");
      router.setParams({ tab: undefined });
    }
  }, [tabParam, router]);

  const onGlobalRefresh = useCallback(async () => {
    await fetchBalance();
    await refetchInvestments();
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
    fetchBalance,
    refetchInvestments,
    fetchProjections,
    getDefaultStartDate,
  ]);

  useOnRefreshTriggerIncrement(onGlobalRefresh);

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "send":
        return <SendForm setIsModalVisible={setIsOperationStatusModalVisible} />;
      case "recharge":
        return <RechargeForm />;
      case "withdraw":
        return <WithdrawForm setIsModalVisible={setIsOperationStatusModalVisible} />;
      case "transactions":
        return <MovementsForm />;
      default:
        return null;
    }
  };

  const handleTabChange = (tab: WalletTabType) => {
    handleAction(tab, () => setActiveTab(tab));
  };

  return (
    <>
      <SafeAreaView className="flex-1">
        <BackGroundGradient />
        {activeTab !== "transactions" ? (
          <ScrollView className="flex-1 px-4 pt-4" refreshControl={<RefreshControl {...refreshControlProps} />}>
            <BalanceCard title="Saldo disponible" balance={balance} walletAddress={walletAddress} />
            <WalletTabs activeTab={activeTab} onTabChange={handleTabChange} />
            {renderTabContent()}
            {!activeTab && (
              <>
                <PortfolioCompositionChart />
                <MonthlyIncomeCard
                  income={monthlyIncome}
                  subtitle={monthlyIncomeSubtitle}
                />
              </>
            )}
          </ScrollView>
        ) : (
          <View className="flex-1 pt-4">
            <View className="px-4">
              <BalanceCard title="Saldo disponible" balance={balance} walletAddress={walletAddress} />
              <WalletTabs activeTab={activeTab} onTabChange={handleTabChange} />
            </View>
            {renderTabContent()}
          </View>
        )}
      </SafeAreaView>

      <ProfileCompletionModal
        isVisible={isModalVisible}
        onClose={handleCloseModal}
        onCompleteProfile={handleCompleteProfile}
      />
      <OperationStatusModal
        isVisible={isOperationStatusModalVisible}
        onClose={() => setIsOperationStatusModalVisible(false)}
        title="Operación exitosa"
        description="Tu solicitud fue procesada correctamente."
        type="success"
      />
    </>
  );
};

export default WalletScreen;
