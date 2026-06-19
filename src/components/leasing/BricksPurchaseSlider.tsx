import React from "react";
import { Text, View } from "react-native";
import { PurchaseState } from "@/src/types/leasing.types";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { Colors } from "@/assets/Colors";

interface BricksPurchaseSliderProps {
  purchaseState: PurchaseState;
  currentFunding: number;
  totalTokens: number;
  pricePerToken: number;
  theme: {
    mainColor: string;
    secondaryColor: string;
  };
  soldOut?: boolean;
}

export const BricksPurchaseSlider = ({
  currentFunding,
  totalTokens,
  pricePerToken,
  theme,
  soldOut,
}: BricksPurchaseSliderProps) => {
  const fundedPct = totalTokens > 0 ? ((totalTokens - currentFunding) / totalTokens) * 100 : 0;
  const barWidthPct = Math.min(Math.round(fundedPct), 100);

  const thinShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  };

  return (
    <View
      className="mx-4 mt-4 mb-2 px-4 py-5 rounded-2xl"
      style={[{ backgroundColor: Colors.cardSecondary }, thinShadow, soldOut ? { opacity: 0.85 } : undefined]}
    >
      <Text
        className="text-lg font-libre-bold mb-4"
        style={{ color: soldOut ? Colors.secondary : Colors.textPrimary }}
      >
        Comprar Bricks
      </Text>
      <View className="flex-row justify-between items-start mb-2">
        <View>
          <Text className="text-secondary text-xs font-libre-regular">Bricks disponibles</Text>
          <Text className="text-text-primary text-base font-libre-bold mt-0.5">
            {currentFunding} de {totalTokens}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-secondary text-xs font-libre-regular">Valor por token</Text>
          <Text className="text-text-primary text-base font-libre-bold mt-0.5">
            {formatCurrency(pricePerToken)}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-2 mt-2">
        <View className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{ width: `${barWidthPct}%`, backgroundColor: theme.mainColor }}
          />
        </View>
        <Text className="text-secondary text-xs font-libre-regular min-w-[52px] text-right">
          {Math.round(fundedPct)}% financiado
        </Text>
      </View>
    </View>
  );
}; 