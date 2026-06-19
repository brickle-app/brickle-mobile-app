import {
  View,
  SafeAreaView,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import { Button, BackGroundGradient } from "@/src/components";
import { Card } from "@/src/components/ui/card/Card";
import Logo from "@/assets/logos/simple-logo-red.svg";
import useUpdateUserProfile from "@/src/hooks/auth/useUpdateUserProfile";

const KycSuccessScreen = () => {
  const { updateUserProfile } = useUpdateUserProfile();

  const handleGoToDashboard = async () => {
    const result = await updateUserProfile();
    if (!result.ok) {
      Alert.alert(
        "No se pudo actualizar",
        result.error ??
          "Tu verificación fue exitosa, pero hubo un error al sincronizar. Puedes continuar e intentar más tarde desde tu perfil."
      );
    }
    router.push("/dashboard");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
    >
      <SafeAreaView className="flex-1 min-h-screen w-screen h-[500px]">
        <BackGroundGradient />
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex flex-1 px-6 justify-center items-center ">
            {/* Success Card */}
            <Card className="w-full max-w-sm mb-8 flex flex-col justify-center items-center gap-10 py-10">
              <View className="flex items-center gap-6">
                <Logo width={120} height={80} />

                {/* Title */}
                <Text className="text-2xl font-libre-bold text-center text-blue-primary">
                  ¡Verificación Exitosa!
                </Text>

                {/* Success Message */}
                <View className="gap-3">
                  <Text className="text-base text-center text-text-primary leading-6">
                    Tu cuenta ya está completamente verificada. Ahora puedes
                    acceder a todas las funciones de Brickle.
                  </Text>
                </View>
              </View>
              <View className="w-full max-w-sm gap-4">
                <Button
                  label="Continuar"
                  onPress={handleGoToDashboard}
                  variant="primary"
                  className="w-full"
                  textClassName="!text-xl"
                />
              </View>
            </Card>

            {/* Action Buttons */}

            {/* Footer Text */}
            <View className="mt-8">
              <Text className="text-sm text-center text-gray-500 leading-5">
                Gracias por confiar en nosotros.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default KycSuccessScreen;
