import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ScrollView, SafeAreaView, View, RefreshControl, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
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
import { getWalletVerificationNotice } from "@/src/utils/walletFeatureAccess";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { Button } from "@/src/components/ui/button/Button";
import { getWalletBackup } from "@/src/services/wallet-backup.service";
import {
  getWalletReadiness,
  WalletBackupStatus,
  WalletReadinessStatus,
} from "@/src/services/wallet-readiness.service";
import { BrickleService } from "@/src/services/brickle.service";
import { refreshAuthenticatedUser } from "@/src/services/refresh-authenticated-user";

const WalletScreen = () => {
  const router = useRouter();
  const { tab: tabParam } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<WalletTabType>(null);
  const [isOperationStatusModalVisible, setIsOperationStatusModalVisible] = useState(false);
  const { getBalance } = useWallet();
  const [balance, setBalance] = useState<string | number>(0);
  const walletAddress = authStore((state) => state.user?.walletAddress);
  const user = authStore((state) => state.user);
  const setUser = authStore((state) => state.setUser);
  const privateKey = authStore((state) => state.privateKey);
  const [backupStatus, setBackupStatus] = useState<WalletBackupStatus>("unknown");
  const walletVerificationNotice = getWalletVerificationNotice(user);
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

  const fetchWalletBackupStatus = useCallback(async () => {
    try {
      const backup = await getWalletBackup();
      setBackupStatus(
        backup.encryptionVersion === "ethers-keystore-v1-backup-code"
          ? "backupCode"
          : "legacy"
      );
    } catch (error) {
      const responseStatus = typeof error === "object" && error !== null && "response" in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined;
      setBackupStatus(responseStatus === 404 ? "missing" : "unknown");
    }
  }, []);

  const effectiveBackupStatus = backupStatus === "unknown" && !walletAddress
    ? "missing"
    : backupStatus;

  const walletReadiness: WalletReadinessStatus | null = effectiveBackupStatus === "unknown"
    ? null
    : getWalletReadiness({
        isFullProfileComplete: user?.isFullProfileComplete,
        isProfileUnderReview: user?.isProfileUnderReview,
        hasWalletAddress: Boolean(walletAddress),
        backupStatus: effectiveBackupStatus,
        hasPrivateKey: Boolean(privateKey),
      });

  useFocusEffect(
    useCallback(() => {
      void refreshAuthenticatedUser({
        email: user?.email,
        getUserByEmail: BrickleService.getUserByEmail,
        setUser,
      });
      void fetchWalletBackupStatus();
    }, [fetchWalletBackupStatus, setUser, user?.email])
  );

  const { refreshControlProps } = usePullToRefresh({
    onRefresh: async () => {
      await fetchBalance();
      await fetchWalletBackupStatus();
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
    void fetchWalletBackupStatus();
  }, [fetchBalance, fetchWalletBackupStatus]);

  const onGlobalRefresh = useCallback(async () => {
    await fetchBalance();
    await fetchWalletBackupStatus();
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
    fetchWalletBackupStatus,
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
    if ((tab === "recharge" || tab === "withdraw") && walletReadiness === "activationRequired") {
      router.push("/wallet-upgrade");
      return;
    }

    if ((tab === "recharge" || tab === "withdraw") && walletReadiness === "restoreRequired") {
      router.push("/wallet-restore");
      return;
    }

    handleAction(tab, () => setActiveTab(tab));
  };

  useEffect(() => {
    if (tabParam !== "recharge") return;
    if (walletReadiness === null) return;

    if (walletReadiness === "activationRequired") {
      router.setParams({ tab: undefined });
      router.push("/wallet-upgrade");
      return;
    }

    if (walletReadiness === "restoreRequired") {
      router.setParams({ tab: undefined });
      router.push("/wallet-restore");
      return;
    }

    setActiveTab("recharge");
    router.setParams({ tab: undefined });
  }, [router, tabParam, walletReadiness]);

  const activationCta = walletReadiness === "activationRequired" ? (
    <View className="mb-4 rounded-2xl border border-blue-primary/15 bg-white p-4">
      <Text className="font-libre-bold text-base text-blue-primary">
        Activa tu cuenta para transacciones
      </Text>
      <Text className="mt-2 font-libre-regular text-xs leading-5 text-gray-600">
        Para recargar o retirar, primero crea tus códigos de respaldo. Son 12 palabras privadas que te permiten recuperar el acceso si cambias de celular.
      </Text>
      <View className="mt-4">
        <Button width="w-full" label="Activar mi cuenta" onPress={() => router.push("/wallet-upgrade")} />
      </View>
    </View>
  ) : null;

  const verificationNoticeBanner = walletVerificationNotice ? (
    <View className="mb-4 flex-row items-start gap-3 rounded-2xl border border-orange-primary/30 bg-orange-primary/10 p-4">
      <View className="rounded-full bg-orange-primary/15 p-2">
        <Ionicons name="time-outline" size={22} color={Colors.orangePrimary} />
      </View>
      <View className="flex-1">
        <Text className="font-libre-bold text-sm text-text-primary">
          {walletVerificationNotice.title}
        </Text>
        <Text className="mt-1 font-libre-regular text-xs leading-5 text-gray-600">
          {walletVerificationNotice.message}
        </Text>
      </View>
    </View>
  ) : null;

  return (
    <>
      <SafeAreaView className="flex-1">
        <BackGroundGradient />
        {activeTab !== "transactions" ? (
          <ScrollView className="flex-1 px-4 pt-4" refreshControl={<RefreshControl {...refreshControlProps} />}>
            <BalanceCard title="Saldo disponible" balance={balance} walletAddress={walletAddress} />
            {verificationNoticeBanner}
            {activationCta}
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
              {verificationNoticeBanner}
              {activationCta}
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
