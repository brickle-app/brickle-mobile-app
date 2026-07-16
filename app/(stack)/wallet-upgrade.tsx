import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { Button } from "@/src/components/ui/button/Button";
import { FormField } from "@/src/components/ui/input";
import StandaloneHeader from "@/src/components/ui/customHeader/standaloneHeder";
import {
  createSecureWalletUpgrade,
  getWalletActivationUserMessage,
} from "@/src/services/wallet-upgrade.service";
import { normalizeWalletBackupCode } from "@/src/services/wallet-backup-code.service";

export default function WalletUpgradeScreen() {
  const router = useRouter();
  const [backupCode, setBackupCode] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState("");
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateWallet = async () => {
    try {
      setError(null);
      setIsUpgrading(true);
      const result = await createSecureWalletUpgrade();
      setBackupCode(result.backupCode);
    } catch (activationError) {
      console.error("[wallet-activation-screen] create wallet failed", activationError);
      setError(getWalletActivationUserMessage(activationError));
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleConfirm = () => {
    if (!backupCode) return;

    if (normalizeWalletBackupCode(confirmation) !== backupCode) {
      setError("Los códigos no coinciden. Escríbelos en el mismo orden.");
      return;
    }

    router.back();
  };

  const content = (
    <SafeAreaView className="flex-1 bg-app-background">
      <StandaloneHeader title="Activar cuenta" onBackPress={() => router.back()} />
      <View className="flex-1 px-5 pt-8 gap-6">
        <View className="items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center">
            <Ionicons name="key-outline" size={34} color={Colors.bluePrimary} />
          </View>
          <Text className="text-blue-primary font-libre-bold text-2xl text-center">
            Crea tus códigos de respaldo
          </Text>
          <Text className="text-text-primary text-sm leading-6 text-center">
            Estos códigos son 12 palabras privadas. Te permiten recuperar el acceso a tus transacciones si cambias de celular o reinstalas la app.
          </Text>
        </View>

        {backupCode ? (
          <>
            <View className="bg-white border border-blue-primary/20 rounded-2xl p-4 gap-2">
              <Text className="text-text-primary text-xs font-semibold uppercase tracking-widest text-center">
                Tus códigos de respaldo
              </Text>
              <Text selectable className="text-blue-primary font-libre-bold text-xl leading-8 text-center">
                {backupCode}
              </Text>
            </View>

            <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <Text className="text-yellow-800 text-xs leading-5">
                Brickle no puede ver ni recuperar estos códigos. Guárdalos en un lugar seguro.
              </Text>
            </View>

            <FormField
              width="w-full"
              label="Confirma tus códigos de respaldo"
              placeholder="Escribe las 12 palabras en orden"
              value={confirmation}
              onChangeText={(text) => {
                setConfirmation(text.toLowerCase());
                if (error) setError(null);
              }}
              autoCapitalize="none"
              icon={<Ionicons name="shield-checkmark-outline" size={24} color={Colors.textPrimary} />}
              error={error ?? undefined}
            />

            <Button width="w-full" label="Ya guardé mis códigos" onPress={handleConfirm} />
          </>
        ) : (
          <>
            {error ? <Text className="text-red-600 text-sm text-center">{error}</Text> : null}
            <Button
              width="w-full"
              label={isUpgrading ? "Activando..." : "Generar códigos de respaldo"}
              onPress={handleCreateWallet}
              disabled={isUpgrading}
              icon={isUpgrading ? <ActivityIndicator color={Colors.bluePrimary} /> : undefined}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );

  if (Platform.OS === "ios") {
    return <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>{content}</KeyboardAvoidingView>;
  }

  return content;
}
