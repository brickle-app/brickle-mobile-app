import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Investment } from "@/src/interfaces/investments.interface";
import {
  getCategoryBgColor,
  getCategoryChipTextColor,
  getCategoryIcon,
  getCategoryIconCircleBackground,
  getCategoryIconGlyphColor,
} from "@/src/utils/categories";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { computeInvestmentOnChainPosition } from "@/src/utils/investmentOnChainPosition";
import type { InvestorOnChainSnapshot } from "@/src/utils/leasingInvestorReads";

export { bricksForInvestment } from "@/src/utils/investmentOnChainPosition";

const ICON_SIZE = 22;
const ICON_CIRCLE = 44;

function categoryCircleTint(type: string | undefined): string {
  return getCategoryIconCircleBackground(type || "");
}

export interface DashboardInvestmentListRowProps {
  investment: Investment;
  showBottomBorder: boolean;
  onPress: () => void;
  /** En listas anidadas (p. ej. categoría expandida) menos padding horizontal en la fila + contenedor padre con px-4. */
  contentInset?: "default" | "nested";
  /** Snapshot on-chain del inversor; si existe, capital y bricks reflejan quema / amortización. */
  onChainSnapshot?: InvestorOnChainSnapshot;
}

/**
 * Fila de inversión al estilo lista del dashboard (icono circular, montos, TIR en chip).
 */
export function DashboardInvestmentListRow({
  investment: inv,
  showBottomBorder,
  onPress,
  contentInset = "default",
  onChainSnapshot,
}: DashboardInvestmentListRowProps) {
  const type = inv.leasing?.type || "Otros";
  const tint = categoryCircleTint(type);
  const name = inv.leasing?.name || type;
  const position = computeInvestmentOnChainPosition(inv, onChainSnapshot);
  const bricksLine = `${position.bricksLabel} ${
    position.bricksLabel === "1" ? "Brick" : "Bricks"
  }`;
  const tir = inv.leasing?.tir;
  const tirLabel =
    tir != null && Number.isFinite(Number(tir))
      ? `${Number(tir).toFixed(1)}% E.A.`
      : "— E.A.";
  const rawIcon = getCategoryIcon(type);
  const tirPillBg = getCategoryBgColor(type);
  const tirPillText = getCategoryChipTextColor(type);

  const rowPadX = contentInset === "nested" ? "px-2" : "px-3";

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-row items-center py-2.5 ${rowPadX} ${
        showBottomBorder ? "border-b border-green-secondary/40" : ""
      }`}
    >
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: ICON_CIRCLE,
          height: ICON_CIRCLE,
          marginRight: 12,
          backgroundColor: tint,
        }}
      >
        {rawIcon ? (
          React.cloneElement(
            rawIcon as React.ReactElement<{ width?: number; height?: number; color?: string }>,
            {
              width: ICON_SIZE,
              height: ICON_SIZE,
              color: getCategoryIconGlyphColor(type),
            }
          )
        ) : (
          <Ionicons name="cube-outline" size={ICON_SIZE} color={getCategoryIconGlyphColor(type)} />
        )}
      </View>

      <View className="min-w-0 flex-1 items-start px-1">
        <Text
          className="w-full text-left font-libre-bold text-base text-blue-primary"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {name}
        </Text>
        <Text
          className="w-full text-left font-libre-bold text-lg text-blue-primary"
          numberOfLines={1}
        >
          {formatCurrency(position.capitalCop)}
        </Text>
        <Text className="w-full text-left font-libre-regular text-xs text-secondary">
          {bricksLine}
        </Text>
      </View>

      <View
        className="shrink-0 rounded-full px-2.5 py-1"
        style={{ backgroundColor: tirPillBg }}
      >
        <Text
          className="font-libre-bold text-[11px]"
          style={{ color: tirPillText }}
          numberOfLines={1}
        >
          {tirLabel}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
