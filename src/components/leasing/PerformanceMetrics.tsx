import React from "react";
import { Text, View } from "react-native";
import { PerformanceMetrics as PerformanceMetricsType } from "@/src/types/leasing.types";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { differenceInMonths } from "@/src/utils/dateUtils";
import { RiskLevelLabeled } from "@/src/components/ui/risk-level/AssetRiskLevel";
import { Colors } from "@/assets/Colors";

const onAccent = {
  label: "rgba(255,255,255,0.92)" as const,
  value: Colors.white,
};

interface PerformanceMetricsProps {
  metrics: PerformanceMetricsType;
  mainColor: string;
}

export const PerformanceMetrics = ({ metrics, mainColor }: PerformanceMetricsProps) => {
  const currentDate = new Date();
  const contractPeriod = new Date(metrics.contractPeriod);
  const months = differenceInMonths(currentDate, contractPeriod);

  return (
    <View className="bg-white px-4 py-6 rounded-2xl">
      <View className="flex flex-row gap-4 mb-6">
        <View className="flex-1 rounded-2xl py-5 px-4" style={{ backgroundColor: mainColor }}>
          <Text className="text-sm font-libre-regular" style={{ color: onAccent.label }}>
            Utilidades anuales
          </Text>
          <Text className="text-2xl font-libre-bold mb-1" style={{ color: onAccent.value }}>
            {metrics.annualRate}%
          </Text>
        </View>

        <View className="flex-1 rounded-2xl py-5 px-4" style={{ backgroundColor: mainColor }}>
          <Text className="text-sm font-libre-regular" style={{ color: onAccent.label }}>
            Utilidades mensuales
          </Text>
          <Text className="text-2xl font-libre-bold mb-1" style={{ color: onAccent.value }}>
            {parseFloat((metrics.annualRate / 12).toString()).toFixed(2)}%
          </Text>
        </View>
      </View>

      <View>
        <Text className="text-lg font-libre-medium text-text-primary mb-4">
          Métricas de utilidades
        </Text>

        <View className="space-y-4">
          {/* First Row */}
          <View className="flex-row justify-between">
            <RiskLevelLabeled level={metrics.riskLevel.level} iconSize={16} />

            <View className="flex-1 pl-4">
              <Text className="text-base font-libre-medium text-text-primary mb-1">
                Tiempo restante
              </Text>
              <Text className="text-sm font-libre-regular text-gray-600">
                {months} meses
              </Text>
            </View>
          </View>

          {/* Second Row */}
          <View className="flex-row justify-between mt-5">
            <View className="flex-1 pr-4">
              <Text className="text-base font-libre-medium text-text-primary mb-1">
                Retorno total
              </Text>
              <Text className="text-sm font-libre-regular text-gray-600">
                {formatCurrency(parseFloat(metrics.totalReturn))}
              </Text>
            </View>

            <View className="flex-1 pl-4">
              <Text className="text-base font-libre-medium text-text-primary mb-1">
                Liquidez
              </Text>
              <Text className="text-sm font-libre-regular text-gray-600">
                {metrics.liquidity}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}; 