import React from "react";
import { Text, View } from "react-native";
import { Specification } from "@/src/types/leasing.types";

interface SpecificationsTableProps {
  specifications: Specification[];
}

export const SpecificationsTable = ({ specifications }: SpecificationsTableProps) => {
  return (
    <View className="px-4 py-6 mb-8">
      <Text className="text-lg font-libre-bold text-text-primary mb-4">
        Especificaciones
      </Text>

      {specifications.length === 0 ? (
        <Text className="text-sm font-libre-regular text-gray-600 leading-6">
          No hay especificaciones técnicas cargadas para este activo. Si necesitas más datos,
          revisa el contrato o contacta soporte.
        </Text>
      ) : (
        <View className="flex flex-row flex-wrap gap-3">
          {specifications.map((spec, index) => (
            <View key={index} className="flex-col min-w-[90px]">
              <Text className="text-xs font-libre-bold text-text-primary mb-1">
                {spec.title}
              </Text>
              <Text className="text-sm font-libre-regular text-text-primary">
                {spec.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}; 