import React from 'react';
import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { formatCurrency } from '@/src/utils/formatCurrency';

interface MonthlyIncomeCardProps {
  income: number;
  /** Texto bajo el monto (origen del estimado). */
  subtitle?: string;
}

/**
 * Componente para mostrar los ingresos mensuales con un pequeño gráfico
 */
export const MonthlyIncomeCard = ({
  income,
  subtitle = "E.M - Valor portafolio + intereses",
}: MonthlyIncomeCardProps) => {
  return (
    <View className="bg-violet-primary w-full h-[112px] rounded-xl overflow-hidden flex-row shadow-md">
      <View className="w-4 bg-violet-400" />
      <View className="flex-1 flex-row justify-between items-center p-4">
        <View className="flex-1 mr-3">
          <Text className="text-sm font-libre-bold text-violet-secondary">
            Ingresos mensuales
          </Text>
          <Text className="text-xl text-primary font-libre-bold">
            {formatCurrency(income)}
          </Text>
          <Text className="text-secondary text-xs mt-1">{subtitle}</Text>
        </View>
        {/* Placeholder for an icon - Replace with actual Icon component if available */}
        {/* Gráfico simplificado */}
        <View className="flex-row items-center">
          <View className="h-4 w-1 bg-gray-300 mx-0.5 rounded-full"></View>
          <View className="h-5 w-1 bg-gray-300 mx-0.5 rounded-full"></View>
          <View className="h-6 w-1 bg-gray-300 mx-0.5 rounded-full"></View>
          <View className="h-8 w-1 bg-gray-400 mx-0.5 rounded-full"></View>
          <Feather name="trending-up" size={20} color="#4CAF50" />
        </View>

      </View>
    </View>
  );
}; 