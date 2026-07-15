import React, { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, SafeAreaView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { Button } from "@/src/components/ui/button/Button";
import { FormField } from "@/src/components/ui/input";
import StandaloneHeader from "@/src/components/ui/customHeader/standaloneHeder";
import { createSecureWalletUpgrade } from "@/src/services/wallet-upgrade.service";
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
    } catch {
      setError("No se pudo actualizar la wallet. Intenta de nuevo.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleConfirm = () => {
    if (!backupCode) return;

    if (normalizeWalletBackupCode(confirmation) !== backupCode) {
      setError("La seed phrase no coincide. Escribe las 12 palabras en el mismo orden.");
      return;
    }

    router.back();
  };

  const content = (
    <SafeAreaView className="flex-1 bg-app-background">
      <StandaloneHeader title="Actualizar wallet" onBackPress={() => router.back()} />
      <View className="flex-1 px-5 pt-8 gap-6">
        <View className="items-center gap-4">
          <View className="w-16 h-16 rounded-full bg-primary/20 items-center justify-center">
            <Ionicons name="key-outline" size={34} color={Colors.bluePrimary} />
          </View>
          <Text className="text-blue-primary font-libre-bold text-2xl text-center">
            Protege tu wallet
          </Text>
          <Text className="text-text-primary text-sm leading-6 text-center">
            Para comprar debes usar una wallet con seed phrase. Estas 12 palabras son la única forma segura de recuperar tu wallet en otro dispositivo.
          </Text>
        </View>

        {backupCode ? (
          <>
            <View className="bg-white border border-blue-primary/20 rounded-2xl p-4 gap-2">
              <Text className="text-text-primary text-xs font-semibold uppercase tracking-widest text-center">
                Tu seed phrase
              </Text>
              <Text selectable className="text-blue-primary font-libre-bold text-xl leading-8 text-center">
                {backupCode}
              </Text>
            </View>

            <View className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4">
              <Text className="text-yellow-800 text-xs leading-5">
                Guarda estas 12 palabras fuera de la app. Brickle no puede verlas ni recuperarlas por ti.
              </Text>
            </View>

            <FormField
              width="w-full"
              label="Confirmar seed phrase"
              placeholder="Escribe las 12 palabras"
              value={confirmation}
              onChangeText={(text) => {
                setConfirmation(text.toLowerCase());
                if (error) setError(null);
              }}
              autoCapitalize="none"
              icon={<Ionicons name="shield-checkmark-outline" size={24} color={Colors.textPrimary} />}
              error={error ?? undefined}
            />

            <Button width="w-full" label="Ya guardé mi seed phrase" onPress={handleConfirm} />
          </>
        ) : (
          <>
            {error ? <Text className="text-red-600 text-sm text-center">{error}</Text> : null}
            <Button
              width="w-full"
              label={isUpgrading ? "Actualizando..." : "Generar wallet segura"}
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
