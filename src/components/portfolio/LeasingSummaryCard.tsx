import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserLeasing } from "@/src/types/portfolio.types";
import { Colors } from "@/assets/Colors";

interface LeasingSummaryCardProps {
  leasings: UserLeasing[];
}

export const LeasingSummaryCard: React.FC<LeasingSummaryCardProps> = ({ leasings }) => {
  const totalMonthlyPayments = leasings.reduce((sum, leasing) => sum + leasing.monthlyPayment, 0);
  const activeLeasings = leasings.length;
  const currentPayments = leasings.filter(leasing => leasing.paymentStatus === 'current').length;
  const overduePayments = leasings.filter(leasing => leasing.paymentStatus === 'overdue').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (leasings.length === 0) {
    return null;
  }

  return (
    <View className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
      <Text className="text-lg font-libre-bold text-gray-800 mb-3">
        Resumen de Leasings
      </Text>

      <View className="flex flex-row justify-between">
        {/* Total Monthly */}
        <View className="flex-1 items-center">
          <View className="flex flex-row items-center gap-1 mb-1">
            <Ionicons name="calendar" size={16} color={Colors.bluePrimary} />
            <Text className="text-xs text-gray-500">Pago mensual</Text>
          </View>
          <Text className="text-sm font-libre-bold text-gray-800">
            {formatCurrency(totalMonthlyPayments)}
          </Text>
        </View>

        {/* Active Leasings */}
        <View className="flex-1 items-center">
          <View className="flex flex-row items-center gap-1 mb-1">
            <Ionicons name="folder-open" size={16} color={Colors.bluePrimary} />
            <Text className="text-xs text-gray-500">Activos</Text>
          </View>
          <Text className="text-sm font-libre-bold text-gray-800">
            {activeLeasings}
          </Text>
        </View>

        {/* Payment Status */}
        <View className="flex-1 items-center">
          <View className="flex flex-row items-center gap-1 mb-1">
            <Ionicons
              name={overduePayments > 0 ? "warning" : "checkmark-circle"}
              size={16}
              color={overduePayments > 0 ? "#ef4444" : Colors.greenPrimary}
            />
            <Text className="text-xs text-gray-500">Estado</Text>
          </View>
          <Text className={`text-sm font-libre-bold ${overduePayments > 0 ? 'text-red-600' : 'text-green-600'
            }`}>
            {overduePayments > 0 ? `${overduePayments} vencidos` : `${currentPayments} al día`}
          </Text>
        </View>
      </View>
    </View>
  );
}; 