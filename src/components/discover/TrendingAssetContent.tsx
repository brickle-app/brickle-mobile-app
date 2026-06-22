import React from "react";
import { Text, View } from "react-native";
import { RiskLevelInline } from "@/src/components/ui/risk-level/AssetRiskLevel";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { trendingAssetCardStyles as styles } from "./TrendingAssetCard.styles";

interface TrendingAssetContentProps {
  name: string;
  price: number;
  bidsAvailable: number;
  riskLevel: { level: string; color: string };
  roi: string;
  soldOut: boolean;
  categoryBg: string;
  categoryFg: string;
}

export const TrendingAssetContent = ({
  name,
  price,
  bidsAvailable,
  riskLevel,
  roi,
  soldOut,
  categoryBg,
  categoryFg,
}: TrendingAssetContentProps) => (
  <View className="flex-1 justify-between px-2.5 py-2" style={styles.contentColumn}>
    <View style={[styles.contentFadedBlock, soldOut ? { opacity: 0.48 } : undefined]}>
      <View style={soldOut ? { paddingTop: 30 } : undefined}>
        <Text className="text-text-primary font-libre-bold text-sm leading-tight" style={{ marginBottom: 4 }} numberOfLines={2}>
          {name}
        </Text>
        <Text className="text-text-primary font-libre-medium text-sm leading-tight">
          {formatCurrency(price)} <Text className="text-secondary font-libre-regular text-xs">por Brick</Text>
        </Text>
        <Text className="mt-0.5 text-[11px] font-libre-regular leading-tight text-secondary">
          {soldOut ? "Sin Bricks disponibles" : `${bidsAvailable} Bricks disponibles`}
        </Text>
      </View>
      <View className="mt-1 flex-row items-center justify-between">
        <RiskLevelInline level={riskLevel.level} prefix="Riesgo " iconSize={12} textClassName="text-[11px] font-libre-regular leading-tight text-secondary" />
        <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: soldOut ? "rgba(28, 54, 71, 0.1)" : categoryBg }}>
          <Text className="text-[11px] font-libre-bold" style={{ color: soldOut ? "rgba(28, 54, 71, 0.55)" : categoryFg }}>
            {roi}% E.A.
          </Text>
        </View>
      </View>
    </View>
    {soldOut ? (
      <View style={[styles.soldOutPill, { backgroundColor: categoryBg, borderColor: "rgba(0,0,0,0.12)" }]} accessibilityRole="text" accessibilityLabel="Activo agotado">
        <Text style={[styles.soldOutPillText, { color: categoryFg }]}>Agotado</Text>
      </View>
    ) : null}
  </View>
);
