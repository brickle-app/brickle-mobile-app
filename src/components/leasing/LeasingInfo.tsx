import React from "react";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface LeasingInfoProps {
  title: string;
  pricePerToken: number;
}

export const LeasingInfo = ({ title, pricePerToken }: LeasingInfoProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount).replace('US$', '$');
  };

  return (
    <View className="px-4 py-4">
      <View className="flex flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-xl font-libre-bold text-primary-white mb-2">
            {title}
          </Text>
          <Text className="text-base text-primary-white">
            {formatCurrency(pricePerToken)} por token
          </Text>
        </View>

        <View className="bg-gray-100 rounded-full p-2 ml-4">
          <Ionicons name="information-circle-outline" size={24} color="#6B7280" />
        </View>
      </View>
    </View>
  );
}; 