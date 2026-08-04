import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { Button } from "@/src/components/ui/button/Button";
import { FormField } from "@/src/components/ui/input";
import StandaloneHeader from "@/src/components/ui/customHeader/standaloneHeder";
import { restoreWalletBackupToDevice } from "@/src/services/wallet-restore.service";
import { goBackOrReplace } from "@/src/utils/navigationFallback";

function RestoreLoadingOverlay() {
  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="shield-checkmark" size={48} color={Colors.bluePrimary} />
        </View>
        <ActivityIndicator size="small" color={Colors.bluePrimary} style={styles.spinner} />
        <Text style={styles.title}>Activando cuenta</Text>
        <Text style={styles.subtitle}>
          Esto puede tardar unos momentos mientras restauramos tu wallet de forma segura.
        </Text>
      </View>
    </View>
  );
}

export default function WalletRestoreScreen() {
  const router = useRouter();
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasteLoading, setIsPasteLoading] = useState(false);
  const goBackOrWallet = () => goBackOrReplace(router, "/(stack)/(tabs)/wallet");

  const handleRestore = async () => {
    if (!recoveryPassword.trim()) {
      setError("Ingresa tu contraseña de recuperación.");
      return;
    }

    try {
      setError(null);
      setIsRestoring(true);
      await restoreWalletBackupToDevice(recoveryPassword);
      goBackOrWallet();
    } catch (restoreError) {
      const message = restoreError instanceof Error ? restoreError.message : "No se pudo restaurar la wallet.";
      setError(message.includes("404") ? "Este usuario no tiene un backup de wallet disponible." : message);
    } finally {
      setIsRestoring(false);
    }
  };

  const handlePaste = async () => {
    setIsPasteLoading(true);
    try {
      const text = await Clipboard.getStringAsync();
      if (text && text.trim()) {
        setRecoveryPassword(text.trim());
        if (error) setError(null);
      }
    } catch (clipboardError) {
      console.warn("Clipboard read error (may contain image):", clipboardError);
    } finally {
      setIsPasteLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-app-background">
      <StandaloneHeader title="Restaurar wallet" onBackPress={goBackOrWallet} />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-5 pt-8 gap-6">
            <View className="items-center gap-4">
              <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center">
                <Ionicons name="shield-checkmark-outline" size={34} color={Colors.bluePrimary} />
              </View>
              <Text className="text-blue-primary font-libre-bold text-2xl text-center">
                Recupera la firma de tu wallet
              </Text>
              <Text className="text-text-primary text-sm leading-6 text-center">
                Tu sesión está activa, pero este dispositivo no tiene la clave local para firmar transacciones. Ingresa tus códigos de respaldo de 12 palabras para restaurar la wallet.
              </Text>
            </View>

            <FormField
              width="w-full"
              label="Códigos de respaldo"
              placeholder="Escribe las 12 palabras"
              value={recoveryPassword}
              onChangeText={(text) => {
                setRecoveryPassword(text);
                if (error) setError(null);
              }}
              autoCapitalize="none"
              icon={<Ionicons name="lock-closed-outline" size={24} color={Colors.textPrimary} />}
              rightIcon={
                <TouchableOpacity
                  onPress={handlePaste}
                  disabled={isPasteLoading}
                  accessibilityLabel="Pegar desde portapapeles"
                  accessibilityRole="button"
                >
                  {isPasteLoading ? (
                    <ActivityIndicator size="small" color={Colors.bluePrimary} />
                  ) : (
                    <Ionicons name="clipboard-outline" size={24} color={Colors.bluePrimary} />
                  )}
                </TouchableOpacity>
              }
              error={error ?? undefined}
            />

            <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <Text className="text-yellow-800 text-xs leading-5">
                Si tu cuenta fue creada antes de activar códigos de respaldo, primero debes actualizar tu wallet desde el flujo obligatorio de compra.
              </Text>
            </View>

            <Button
              width="w-full"
              label="Restaurar wallet"
              onPress={handleRestore}
              disabled={isRestoring}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {isRestoring && <RestoreLoadingOverlay />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    marginHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.greenSecondary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  spinner: {
    marginBottom: 12,
  },
  title: {
    fontFamily: "LibreFranklin-Bold",
    fontSize: 20,
    color: Colors.bluePrimary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "LibreFranklin-Regular",
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: "center",
    lineHeight: 20,
    paddingHorizontal: 8,
  },
});
