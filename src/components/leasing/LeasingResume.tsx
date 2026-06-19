import { Colors } from "@/assets/Colors";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { Asset } from "@/src/interfaces/investments.interface";
import React, { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";

export const LeasingResume = ({
  asset,
  soldOut,
  isBlocked,
  handleBuyAsset,
}: {
  asset: Asset;
  soldOut?: boolean;
  isBlocked: boolean;
  handleBuyAsset: (bricksCount: number) => void;
}) => {
  const [bricksCount, setBricksCount] = useState(0);
  const pricePerToken = asset.pricePerToken;
  const totalInvestment = bricksCount * pricePerToken;
  const noTokens = soldOut === true || (asset.tokensAvailable ?? 0) <= 0;

  const incrementBricks = () => {
    if (noTokens) return;
    if (bricksCount < asset.tokensAvailable) {
      setBricksCount(prev => prev + 1);
    }
  };

  const decrementBricks = () => {
    if (noTokens) return;
    if (bricksCount > 0) {
      setBricksCount(prev => prev - 1);
    }
  };

  const disabled = noTokens || bricksCount === 0 || bricksCount > asset.tokensAvailable;

  const thinShadow = {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  };

  return (
    <View style={styles.container}>
      <View className="bg-white rounded-t-3xl p-6 border-t border-gray-100" style={thinShadow}>
        <View className="mb-4 flex-row justify-between items-center">
          <Text className="text-base font-libre-regular text-blue-primary">Número de bricks</Text>
          <View className="flex-row items-center rounded-2xl border border-gray-200 bg-gray-50">
            <TouchableOpacity
              onPress={decrementBricks}
              className="w-10 h-10 items-center justify-center"
              disabled={noTokens}
              style={{ opacity: noTokens ? 0.45 : 1 }}
            >
              <Text className="text-lg font-libre-medium text-blue-primary">-</Text>
            </TouchableOpacity>
            <Text className="min-w-[44px] text-center text-base font-libre-medium text-blue-primary">
              {bricksCount}
            </Text>
            <TouchableOpacity
              onPress={incrementBricks}
              className="w-10 h-10 items-center justify-center"
              disabled={noTokens || bricksCount >= asset.tokensAvailable}
              style={{ opacity: noTokens || bricksCount >= asset.tokensAvailable ? 0.5 : 1 }}
            >
              <Text className="text-lg font-libre-medium text-blue-primary">+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-base font-libre-regular text-blue-primary">Precio por token</Text>
            <Text className="text-base font-libre-medium text-blue-primary">{formatCurrency(pricePerToken)}</Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-base font-libre-regular text-blue-primary">Inversión total</Text>
            <Text className="text-base font-libre-medium text-blue-primary">{formatCurrency(totalInvestment)}</Text>
          </View>
        </View>
        <TouchableOpacity
          className="rounded-full py-4 items-center"
          onPress={() => {
            if (noTokens) return;
            handleBuyAsset(bricksCount);
          }}
          style={[
            {
              backgroundColor: disabled || isBlocked ? Colors.gray : Colors.greenPrimary,
              opacity: disabled || isBlocked ? 0.75 : 1,
            },
            thinShadow,
          ]}
          disabled={disabled || isBlocked}
        >
          <Text className="text-base font-libre-medium text-blue-primary">
            {noTokens ? "Agotado" : "Comprar bricks"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    marginHorizontal: 16,
    zIndex: 100,
  },
});