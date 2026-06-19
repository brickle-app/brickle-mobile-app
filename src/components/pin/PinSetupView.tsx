import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  BackHandler,
} from "react-native";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { PinInput } from "@/src/components/ui/pin/PinInput";
import { usePinStore } from "@/src/store/pin.store";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";

export interface PinSetupViewProps {
  /** Si es true: sin volver atrás, obligatorio; al terminar va al dashboard. */
  mandatory?: boolean;
}

export function PinSetupView({ mandatory = false }: PinSetupViewProps) {
  const [step, setStep] = useState<"create" | "confirm">("create");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { setPin: storePin } = usePinStore();

  useFocusEffect(
    useCallback(() => {
      if (!mandatory) return undefined;
      const sub = BackHandler.addEventListener("hardwareBackPress", () => true);
      return () => sub.remove();
    }, [mandatory])
  );

  const goToDashboard = () => {
    router.replace("/(stack)/(tabs)/dashboard");
  };

  const handleCreateComplete = (value: string) => {
    setPin(value);
    setStep("confirm");
    setError(null);
  };

  const handleConfirmComplete = async (value: string) => {
    if (value === pin) {
      try {
        await storePin(value);
        if (mandatory) {
          goToDashboard();
        } else {
          Alert.alert(
            "PIN establecido",
            "Tu PIN de seguridad se ha guardado correctamente. Deberás ingresarlo al volver a abrir la app.",
            [{ text: "Entendido", onPress: () => router.back() }]
          );
        }
      } catch {
        setError("No se pudo guardar el PIN. Intenta de nuevo.");
      }
    } else {
      setError("Los PIN no coinciden. Intenta de nuevo.");
      setStep("create");
      setPin("");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 py-2">
        {!mandatory ? (
          <>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={Colors.bluePrimary} />
            </TouchableOpacity>
            <Text className="ml-4 text-xl font-libre-bold text-blue-primary">
              Seguridad
            </Text>
          </>
        ) : (
          <Text className="flex-1 text-center text-xl font-libre-bold text-blue-primary pr-6">
            Seguridad
          </Text>
        )}
      </View>

      {mandatory && (
        <Text className="px-6 pb-2 font-libre-regular text-sm text-gray-600">
          Para continuar debes crear un PIN de 4 dígitos. Lo usarás al abrir la
          app para proteger tu cuenta.
        </Text>
      )}

      <View className="flex-1">
        {step === "create" ? (
          <PinInput
            key="create"
            title="Crea tu PIN"
            subtitle="Ingresa 4 dígitos para proteger tu sesión"
            onComplete={handleCreateComplete}
            error={error}
          />
        ) : (
          <PinInput
            key="confirm"
            title="Confirma tu PIN"
            subtitle="Ingresa nuevamente los 4 dígitos"
            onComplete={handleConfirmComplete}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
