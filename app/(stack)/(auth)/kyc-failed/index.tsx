import {
  View,
  SafeAreaView,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import { Button, BackGroundGradient } from "@/src/components";
import { Card } from "@/src/components/ui/card/Card";
import Logo from "@/assets/logos/simple-logo-red.svg";
import CancelIcon from "@/assets/icons/SVG/Cancel.svg";
import Reintentar from "@/assets/icons/SVG/Reintentar.svg";
import Ayuda from "@/assets/icons/SVG/Ayuda.svg";

const KycFailed = () => {
  const handleRetry = () => {
    // Navegar de vuelta al formulario de KYC/Complete Profile
    router.push("/complete-profile");
  };

  const handleContactSupport = () => {
    // Navegar a pantalla de soporte o abrir modal de contacto
    router.push("/support/help");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
    >
      <SafeAreaView className="bg-white flex-1 min-h-screen w-screen">
        <BackGroundGradient />
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex flex-1 px-6 py-8 justify-center items-center">
            {/* Logo */}
            <View className="flex justify-center items-center mb-8">
              <Logo width={120} height={80} />
            </View>

            {/* Error Card */}
            <Card className="w-full max-w-sm mb-8 shadow-lg">
              <View className="flex items-center gap-6">
                {/* Error Icon */}
                <View className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <CancelIcon width={40} height={40} />
                </View>

                {/* Title */}
                <Text className="text-2xl font-libre-bold text-center text-gray-800">
                  Verificación Fallida
                </Text>

                {/* Error Message */}
                <View className="gap-3">
                  <Text className="text-base text-center text-gray-600 leading-6">
                    Tu proceso de verificación KYC ha fallado.
                  </Text>
                  <Text className="text-base text-center text-gray-600 leading-6">
                    Puedes intentarlo nuevamente más tarde o contactar con
                    nuestro equipo de soporte para obtener ayuda.
                  </Text>
                </View>

                {/* Additional Info */}
                <View className="w-full bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <Text className="text-sm text-orange-800 text-center">
                    💡 Asegúrate de que tus documentos estén claros y legibles
                    antes de volver a intentar.
                  </Text>
                </View>
              </View>
            </Card>

            {/* Action Buttons */}
            <View className="w-full max-w-sm gap-4">
              <Button
                label="Intentar Nuevamente"
                onPress={handleRetry}
                variant="primary"
                icon={<Reintentar width={20} height={20} />}
                className="w-full"
              />

              <Button
                label="Contactar Soporte"
                onPress={handleContactSupport}
                variant="secondary"
                icon={<Ayuda width={20} height={20} />}
                className="w-full"
              />
            </View>

            {/* Footer Text */}
            <View className="mt-8">
              <Text className="text-sm text-center text-gray-500 leading-5">
                Si necesitas ayuda adicional, no dudes en{"\n"}
                contactar con nuestro equipo de soporte.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default KycFailed;
