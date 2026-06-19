import { View, Text, Image, TouchableOpacity } from "react-native";
import React from "react";

interface AssetCardProps {
  id: string;
  name: string;
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  imageUrl: string;
  marketCap?: number;
  onPress?: (id: string) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({
  id,
  name,
  symbol,
  price,
  priceChange,
  priceChangePercent,
  imageUrl,
  marketCap,
  onPress,
}) => {
  const isPositive = priceChange >= 0;

  return (
    <TouchableOpacity
      className="bg-white dark:bg-gray-800 rounded-xl p-4 mx-4 mb-3 shadow-sm border border-gray-100 dark:border-gray-700"
      onPress={() => onPress?.(id)}
      activeOpacity={0.8}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View className="bg-gray-100 dark:bg-gray-700 rounded-full p-2 mr-3">
            <Image
              source={{ uri: imageUrl }}
              className="w-8 h-8 rounded-full"
              resizeMode="cover"
            />
          </View>

          <View className="flex-1">
            <Text className="text-gray-900 dark:text-white font-libre-regular text-base">
              {name}
            </Text>
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              {symbol.toUpperCase()}
            </Text>
          </View>
        </View>

        <View className="items-end">
          <Text className="text-gray-900 dark:text-white font-libre-bold text-lg">
            $
            {price.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </Text>
          <View className="flex-row items-center">
            <Text
              className={`font-libre-regular text-sm ${isPositive ? "text-green-500" : "text-red-500"
                }`}
            >
              {isPositive ? "+" : ""}${priceChange.toFixed(2)} (
              {isPositive ? "+" : ""}
              {priceChangePercent.toFixed(2)}%)
            </Text>
          </View>
        </View>
      </View>

      {marketCap && (
        <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Text className="text-gray-500 dark:text-gray-400 text-xs">
            Market Cap: ${marketCap.toLocaleString("en-US")}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default AssetCard;
