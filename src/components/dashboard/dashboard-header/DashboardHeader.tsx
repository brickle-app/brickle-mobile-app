import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button } from "@/src/components/ui/button/Button";
import { CustomSwitch } from "@/src/components/ui/customSwitch/CustomSwitch";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { PortfolioHistoricalLineChart } from "@/src/components/ui/portfolio-chart/PortfolioHistoricalLineChart";
import { Asset, Investment } from "@/src/interfaces/investments.interface";
import { Colors } from "@/assets/Colors";
import { formatCurrency, parseCopAmountFromText } from "@/src/utils/formatCurrency";
import { PortfolioChartSkeleton } from "@/src/components/ui/skeleton";
import { DashboardTopInvestmentsList } from "@/src/components/dashboard/DashboardTopInvestmentsList";
import type { InvestorOnChainSnapshot } from "@/src/utils/leasingInvestorReads";

interface DashboardHeaderProps {
  investments: Investment[];
  currentValue: number;
  isLoadingInvestments: boolean;
  portfolioChartData: {
    barDataCapital: { value: number; label: string; frontColor: string }[];
    barDataRendimiento: { value: number; label?: string; frontColor: string }[];
    barDataCombined: { value: number; label: string; frontColor: string }[];
    projectedLineData: { value: number; label: string }[];
    totalValue: string;
    roi: string;
  };
  isLoadingPortfolio: boolean;
  roi: string;
  balance: string;
  /** Capital invertido en activos (suma de inversiones), para capital total (efectivo + activos). */
  totalInvested: number;
  onBuyPress: () => void;
  snapshotsByInvestmentId?: Record<string, InvestorOnChainSnapshot>;
}

export const DashboardHeader = ({
  investments,
  currentValue,
  isLoadingInvestments,
  portfolioChartData,
  isLoadingPortfolio,
  roi,
  balance,
  totalInvested,
  onBuyPress,
  snapshotsByInvestmentId,
}: DashboardHeaderProps) => {
  const [isOnValue, setIsOnValue] = useState(false);

  const handleAssetPress = (asset: Asset, investment: Investment) => {
    router.push({
      pathname: "/(stack)/(tabs)/my-investments",
      params: {
        assetId: asset.id,
        investmentData: JSON.stringify(investment),
      },
    });
  };

  const lineChartSeriesRaw = (() => {
    const projected = portfolioChartData.projectedLineData;
    if (projected.length > 0) {
      return projected.map((p) => ({ value: p.value, label: p.label ?? "" }));
    }
    return portfolioChartData.barDataCombined.map((p) => ({
      value: p.value,
      label: p.label ?? "",
    }));
  })();

  const numericBalance = parseCopAmountFromText(balance);

  // Capital total = efectivo en wallet + capital invertido en activos
  const patrimonioFromWallet = numericBalance + (totalInvested || 0);

  // Ancla la proyección del API al capital total real: misma forma, escala correcta.
  const apiAnchor = lineChartSeriesRaw.length > 0 ? lineChartSeriesRaw[0].value : 0;
  const lineChartSeries =
    patrimonioFromWallet > 0 && lineChartSeriesRaw.length > 0
      ? lineChartSeriesRaw.map((p) => ({
        value: patrimonioFromWallet + (p.value - apiAnchor),
        label: p.label,
      }))
      : lineChartSeriesRaw;

  /** Cifra principal: capital total (efectivo + activos). */
  const chartHeadlineValue = String(patrimonioFromWallet);

  return (
    <View className="flex flex-col w-full gap-3">
      {/* Tarjeta verde con balance */}
      <View className="bg-green-primary rounded-2xl px-4 pt-4 pb-4 min-h-[120px]">
        <View className="flex-row justify-between items-start gap-2">
          <View className="flex-1 min-w-0 pr-1">
            <Text className="text-text-primary text-sm font-libre-bold mb-1">Balance</Text>
            <Text className="text-text-primary text-3xl font-libre-bold">
              {formatCurrency(numericBalance)}{" "}
              <Text className="text-text-primary text-base font-libre-regular">cop</Text>
            </Text>
            <View className="mt-3 pt-3 border-t border-text-primary/15">
              <Text className="text-text-primary text-xs font-libre-bold mb-0.5">
                Capital total
              </Text>
              <Text className="text-text-primary text-xl font-libre-bold">
                {formatCurrency(patrimonioFromWallet)}{" "}
                <Text className="text-text-primary text-sm font-libre-regular">cop</Text>
              </Text>
            </View>
            {investments?.length === 0 && !isLoadingInvestments && (
              <TouchableOpacity
                onPress={() => router.push("/(stack)/(tabs)/portfolio")}
                className="flex-row items-center gap-1 mt-2"
              >
                <Text className="text-text-primary text-sm font-libre-regular">
                  Aún no tienes activos disponibles
                </Text>
                <Ionicons name="chevron-forward" size={18} color={Colors.textPrimary} />
              </TouchableOpacity>
            )}
            {currentValue === 0 && (!investments || investments.length === 0) && (
              <Button
                label="Haz tu primera compra"
                onPress={onBuyPress}
                variant="blue"
                className="!w-[200px] !h-[30px] font-normal mt-2"
              />
            )}
          </View>
          {/* Toggle ROI / Gráfico */}
          <View className="shrink-0 pt-0.5">
            <CustomSwitch
              rate={roi ?? "0"}
              value={{ value: isOnValue }}
              onPress={() => setIsOnValue(!isOnValue)}
              trackColors={{ on: Colors.bluePrimary, off: Colors.bluePrimary }}
              rateTextColor="#FFFFFF"
            />
          </View>
        </View>
      </View>

      {/* Panel inferior: lista de activos OR gráfico de proyección */}
      {!isOnValue ? (
        <View className="w-full gap-3 py-1">
          {isLoadingInvestments ? (
            <DashboardTopInvestmentsList
              investments={[]}
              isLoading
              onPressInvestment={() => { }}
            />
          ) : investments?.length > 0 ? (
            <DashboardTopInvestmentsList
              investments={investments}
              isLoading={false}
              snapshotsByInvestmentId={snapshotsByInvestmentId}
              onPressInvestment={(inv) => handleAssetPress(inv.leasing, inv)}
            />
          ) : (
            <TouchableOpacity
              className="flex w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary-white py-6"
              onPress={() => router.push("/portfolio")}
            >
              <Text className="font-libre-bold text-sm text-blue-primary">
                Aún no tienes activos disponibles
              </Text>
              <Ionicons name="arrow-forward-circle" size={20} color={Colors.bluePrimary} />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View className="w-full overflow-hidden rounded-2xl bg-primary-white">
          {isLoadingPortfolio ? (
            <PortfolioChartSkeleton />
          ) : (
            <PortfolioHistoricalLineChart
              series={lineChartSeries}
              title="Proyección patrimonio (12 meses)"
              value={chartHeadlineValue}
              roi={portfolioChartData.roi}
            />
          )}
        </View>
      )}
    </View>
  );
};
