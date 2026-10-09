import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { Button } from "@/src/components/ui/button/Button";
import { SeedPhraseInput } from "@/src/components/wallet/SeedPhraseInput";
import { applyWordsAt, emptySeedWords, isSeedPhraseComplete, joinSeedWords, splitSeedWords } from "@/src/utils/seedPhrase";
import StandaloneHeader from "@/src/components/ui/customHeader/standaloneHeder";
import { restoreWalletBackupToDevice } from "@/src/services/wallet-restore.service";
import { goBackOrReplace } from "@/src/utils/navigationFallback";
import { WalletActivationOverlay } from "@/src/components/wallet/WalletActivationOverlay";
import { WalletActivationStep } from "@/src/utils/walletActivation";
import * as Haptics from "expo-haptics";

export default function WalletRestoreScreen() {
  const router = useRouter();
  const [words, setWords] = useState<string[]>(emptySeedWords);
  const [isRestoring, setIsRestoring] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<WalletActivationStep>("fetching");
  const [error, setError] = useState<string | null>(null);
  const [isPasteLoading, setIsPasteLoading] = useState(false);
  const goBackOrWallet = () => goBackOrReplace(router, "/(stack)/(tabs)/wallet");

  const handleRestore = async () => {
    if (!isSeedPhraseComplete(words)) {
      setError("Completa las 12 palabras de tu respaldo. Revisa las que aparecen en rojo.");
      return;
    }

    try {
      setError(null);
      setProgress(0);
      setStep("fetching");
      setIsRestoring(true);
      // On success the overlay shows its "activated" state and then calls handleActivationFinished.
      await restoreWalletBackupToDevice(joinSeedWords(words), { onStep: setStep, onProgress: setProgress });
    } catch (restoreError) {
      setIsRestoring(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      const message = restoreError instanceof Error ? restoreError.message : "No se pudo restaurar la wallet.";
      setError(message.includes("404") ? "Este usuario no tiene un backup de wallet disponible." : message);
    }
  };

  const handleActivationFinished = () => {
    setIsRestoring(false);
    goBackOrWallet();
  };

  const handlePaste = async () => {
    setIsPasteLoading(true);
    try {
      const pasted = splitSeedWords(await Clipboard.getStringAsync());
      if (pasted.length > 0) {
        setWords(applyWordsAt(emptySeedWords(), 0, pasted).words);
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
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-5 pt-4 gap-5">
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

            <View className="gap-2">
              <Text className="text-text-primary font-libre-bold text-base">Códigos de respaldo</Text>
              <SeedPhraseInput
                words={words}
                onChangeWords={(next) => {
                  setWords(next);
                  if (error) setError(null);
                }}
                onPasteFromClipboard={handlePaste}
                isPasting={isPasteLoading}
                disabled={isRestoring}
              />
              {error && <Text className="text-red text-xs">{error}</Text>}
            </View>

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

      <WalletActivationOverlay
        visible={isRestoring}
        step={step}
        derivationProgress={progress}
        onFinished={handleActivationFinished}
      />
    </SafeAreaView>
  );
}
