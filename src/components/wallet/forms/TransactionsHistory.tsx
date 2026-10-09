import React from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import Logo from "@/assets/logos/simple-logo-red.svg"
import Withdraw from "@/assets/icons/SVG/Grfica-6.svg"
import InvestmentReturn from "@/assets/icons/SVG/Grafica-2.svg"
import Recharge from "@/assets/icons/SVG/Recargar.svg"
import { Colors } from "@/assets/Colors";
import { formatCurrency } from "@/src/utils/formatCurrency";

// Definir la interfaz Transaction primero
export interface Transaction {
  id: string;
  type: "investment" | "withdraw" | "investment-return" | "recharge" | "deduction";
  description: string;
  date: string;
  amount: number;
  /** ISO timestamp of the movement, used to group the history by day. */
  occurredAt?: string;
}


// Moved render function outside the component and exported it
export const renderTransactionItem = ({ item }: { item: Transaction }) => {
  // Definir el icono según el tipo de transacción
  let icon;
  if (item.type === "investment") {
    icon = <Logo width={18} height={32} />
  } else if (item.type === "withdraw" || item.type === "deduction") {
    icon = <Withdraw width={50} height={36} color={item.type === "deduction" ? Colors.red : Colors.orangePrimary} />
  } else if (item.type === "investment-return") {
    icon = <InvestmentReturn width={50} height={36} color={Colors.greenPrimary} />
  } else if (item.type === "recharge") {
    icon = <Recharge width={50} height={36} color={Colors.greenPrimary} />
  } else {
    icon = <Feather name="refresh-cw" size={24} color="#2196F3" />;
  }

  const isDeduction = item.type === "deduction";

  return (
    <View className="flex-row items-center py-3 px-4 min-h-[67px]" style={styles.container}>
      <View className="h-10 w-10 items-center justify-center mr-3">
        {icon}
      </View>
      <View className="flex-1 mr-3">
        <Text className="font-libre-regular text-sm" numberOfLines={2} ellipsizeMode="tail">
          {item.description}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">{item.date}</Text>
      </View>
      <Text
        className="font-libre-bold"
        numberOfLines={1}
        style={[{ flexShrink: 0 }, isDeduction ? { color: Colors.red } : null]}
      >
        {isDeduction ? "-" : ""}
        {formatCurrency(Math.abs(item.amount))}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});