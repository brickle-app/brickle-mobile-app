import React, { useEffect } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/src/components";

export default function OnrampFailed() {
  const router = useRouter();
  const { success } = useLocalSearchParams<{ success: string }>();

  const handleRetry = () => {
    router.push("/wallet");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleContactSupport = () => {
    router.push("/support/help");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-red-100 items-center justify-center mb-4">
            <Ionicons
              name="close-circle"
              size={48}
              color="#EF4444"
            />
          </View>

          <Text className="text-2xl font-libre-bold text-blue-primary mb-2">
            Recarga cancelada
          </Text>

          <Text className="text-base text-gray-600 text-center leading-6">
            Tu recarga no pudo ser procesada. Puedes intentar nuevamente o contactar a soporte si el problema persiste.
          </Text>
        </View>

        <View className="w-full max-w-sm space-y-4">
          <Button
            label="Intentar nuevamente"
            onPress={handleRetry}
            variant="primary"
            className="w-full"
          />

          <TouchableOpacity
            onPress={handleContactSupport}
            className="w-full py-3 items-center border border-blue-primary rounded-full"
          >
            <Text className="text-blue-primary font-libre-regular">
              Contactar soporte
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGoToDashboard}
            className="w-full py-3 items-center"
          >
            <Text className="text-gray-600 font-libre-regular">
              Volver al inicio
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}