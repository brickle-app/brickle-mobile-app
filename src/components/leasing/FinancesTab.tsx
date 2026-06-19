import React from "react";
import { View } from "react-native";
import { PerformanceMetrics } from "./PerformanceMetrics";
//import { AmortizationChart } from "./AmortizationChart";
import { Asset } from "@/src/interfaces/investments.interface";
import { getLiquidity, LiquidityLevel } from "@/src/utils/liquidity";
import { getRiskLevel } from "@/src/utils/riskLevel";

interface FinancesTabProps {
  asset: Asset;
  theme: {
    mainColor: string;
    secondaryColor: string;
  };
}

export const FinancesTab = ({ asset, theme }: FinancesTabProps) => {
  return (
    <View>
      <PerformanceMetrics metrics={{
        annualRate: asset.tir || 0,
        riskLevel: getRiskLevel(asset.agreement?.riskLevel || 0),
        riskPercentage: asset.agreement?.riskRate || 0,
        contractPeriod: asset.contractTime.toString(),
        totalReturn: asset.price.toString(),
        liquidity: getLiquidity(asset.liquidity as LiquidityLevel)
      }} mainColor={theme.mainColor} />
      {/* <AmortizationChart asset={asset} theme={theme} /> */}
    </View>
  );
}; 