import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserLeasing, PaymentStatus } from "@/src/types/portfolio.types";
import { Colors } from "@/assets/Colors";

interface LeasingCardProps {
  leasing: UserLeasing;
  onPress?: () => void;
}

const getStatusInfo = (status: PaymentStatus) => {
  switch (status) {
    case 'current':
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        icon: 'checkmark-circle' as const,
        iconColor: Colors.greenPrimary,
        text: 'Al día',
      };
    case 'pending':
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        icon: 'time' as const,
        iconColor: '#f59e0b',
        text: 'Pendiente',
      };
    case 'overdue':
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        icon: 'warning' as const,
        iconColor: '#ef4444',
        text: 'Vencido',
      };
  }
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
  });
};

export const LeasingCard: React.FC<LeasingCardProps> = ({ leasing, onPress }) => {
  const statusInfo = getStatusInfo(leasing.paymentStatus);
  const progressPercentage = (leasing.paymentsCompleted / leasing.totalPayments) * 100;

  const CardContent = () => (
    <View className="flex h-[130px] w-full justify-center items-center bg-primary-white rounded-2xl shadow-sm">
      <View className="flex flex-row w-full gap-4 justify-between items-center px-4">
        {/* Icon Section */}
        <View className={`${leasing.colorIconBg} flex rounded-xl size-[70px] justify-center items-center`}>
          {leasing.icon}
        </View>

        {/* Content Section */}
        <View className="flex flex-col justify-center items-start gap-1 flex-1">
          <Text className="text-lg font-libre-bold text-gray-800">
            {leasing.assetName}
          </Text>

          <Text className="text-sm text-gray-600">
            Próximo pago: {formatCurrency(leasing.monthlyPayment)} - {formatDate(leasing.nextPaymentDate)}
          </Text>

          {/* Progress Section */}
          <View className="flex flex-row items-center gap-2 w-full mt-1">
            <Text className="text-xs text-gray-500">
              {leasing.totalPayments - leasing.paymentsCompleted}/{leasing.totalPayments}
            </Text>
            <View className="flex-1 bg-gray-200 rounded-full h-2">
              <View
                className="bg-blue-primary h-2 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
          </View>
        </View>

        {/* Status Section */}
        <View className="flex flex-col items-center gap-1">
          <View className={`${statusInfo.bgColor} px-2 py-1 rounded-lg flex-row items-center gap-1`}>
            <Ionicons
              name={statusInfo.icon}
              size={12}
              color={statusInfo.iconColor}
            />
            <Text className={`${statusInfo.color} text-xs font-libre-regular`}>
              {statusInfo.text}
            </Text>
          </View>

          <Text className="text-xs text-gray-500">
            {leasing.tokensOwned} tokens
          </Text>
        </View>
      </View>

      <View className="absolute top-[-8] right-0 bg-orange-primary px-3 py-1 rounded-full shadow-sm">
        <Text className="text-white text-[10px] font-libre-bold">Reclamar renta</Text>
      </View>

    </View>
  );

  // Si hay onPress, envolver en TouchableOpacity
  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Ver detalles de leasing ${leasing.assetName}`}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
}; 