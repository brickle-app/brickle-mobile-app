import React, { useEffect } from "react";
import { View, Text, SafeAreaView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { Button } from "@/src/components";

export default function OnrampSuccess() {
  const router = useRouter();
  const { success } = useLocalSearchParams<{ success: string }>();

  useEffect(() => {
    console.log("Onramp Success - Success param:", success);
  }, [success]);

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleGoToWallet = () => {
    router.push("/wallet");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center items-center px-6">
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-green-100 items-center justify-center mb-4">
            <Ionicons
              name="checkmark-circle"
              size={48}
              color={Colors.primary}
            />
          </View>

          <Text className="text-2xl font-libre-bold text-blue-primary mb-2">
            ¡Recarga exitosa!
          </Text>

          <Text className="text-base text-gray-600 text-center leading-6">
            Tu recarga ha sido procesada exitosamente. Los fondos estarán disponibles en tu billetera en breve.
          </Text>
        </View>

        <View className="w-full max-w-sm space-y-4">
          <Button
            label="Ir a Dashboard"
            onPress={handleGoToDashboard}
            variant="primary"
            className="w-full"
          />

          <TouchableOpacity
            onPress={handleGoToWallet}
            className="w-full py-3 items-center"
          >
            <Text className="text-blue-primary font-libre-regular">
              Ver mi billetera
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}