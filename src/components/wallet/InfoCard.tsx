import React from 'react';
import { Text, View } from 'react-native';
import { Card } from '@/src/components/ui/card/Card';

interface InfoCardProps {
  text: string;
  icon: React.ReactNode;
}

/**
 * Componente para mostrar información con un icono de interrogación
 */
export const InfoCard = ({ text, icon }: InfoCardProps) => {
  return (
    <Card variant="bordered" className="mb-4 flex-row">
      <View className="mr-3 mt-0.5">
        <View className="w-8 h-8 rounded-full items-center justify-center">
          {icon}
        </View>
      </View>
      <View className="flex-1">
        <Text className="text-gray-700 text-sm">{text}</Text>
      </View>
    </Card>
  );
}; 