import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { Button } from "@/src/components/ui/button/Button";
import { FormField } from "@/src/components/ui/input";
import StandaloneHeader from "@/src/components/ui/customHeader/standaloneHeder";
import { restoreWalletBackupToDevice } from "@/src/services/wallet-restore.service";

export default function WalletRestoreScreen() {
  const router = useRouter();
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRestore = async () => {
    if (!recoveryPassword.trim()) {
      setError("Ingresa tu contraseña de recuperación.");
      return;
    }

    try {
      setError(null);
      setIsRestoring(true);
      await restoreWalletBackupToDevice(recoveryPassword);
      router.back();
    } catch (restoreError) {
      const message = restoreError instanceof Error ? restoreError.message : "No se pudo restaurar la wallet.";
      setError(message.includes("404") ? "Este usuario no tiene un backup de wallet disponible." : message);
    } finally {
      setIsRestoring(false);
    }
  };

  const content = (
    <SafeAreaView className="flex-1 bg-app-background">
      <StandaloneHeader title="Restaurar wallet" onBackPress={() => router.back()} />
      <View className="flex-1 px-5 pt-8 gap-6">
        <View className="items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center">
            <Ionicons name="shield-checkmark-outline" size={34} color={Colors.bluePrimary} />
          </View>
          <Text className="text-blue-primary font-libre-bold text-2xl text-center">
            Recupera la firma de tu wallet
          </Text>
          <Text className="text-text-primary text-sm leading-6 text-center">
            Tu sesión está activa, pero este dispositivo no tiene la clave local para firmar transacciones. Ingresa tu seed phrase de 12 palabras para restaurar la wallet.
          </Text>
        </View>

        <FormField
          width="w-full"
          label="Seed phrase"
          placeholder="Escribe las 12 palabras"
          value={recoveryPassword}
          onChangeText={(text) => {
            setRecoveryPassword(text);
            if (error) setError(null);
          }}
          autoCapitalize="none"
          icon={<Ionicons name="lock-closed-outline" size={24} color={Colors.textPrimary} />}
          error={error ?? undefined}
        />

        <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
          <Text className="text-yellow-800 text-xs leading-5">
            Si tu cuenta fue creada antes de activar seed phrases, primero debes actualizar tu wallet desde el flujo obligatorio de compra.
          </Text>
        </View>

        <Button
          width="w-full"
          label={isRestoring ? "Restaurando..." : "Restaurar wallet"}
          onPress={handleRestore}
          disabled={isRestoring}
          icon={isRestoring ? <ActivityIndicator color={Colors.bluePrimary} /> : undefined}
        />
      </View>
    </SafeAreaView>
  );

  if (Platform.OS === "ios") {
    return <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>{content}</KeyboardAvoidingView>;
  }

  return content;
}
