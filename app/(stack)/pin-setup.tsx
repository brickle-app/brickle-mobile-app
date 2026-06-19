import React, { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PinSetupView } from "@/src/components/pin/PinSetupView";

/**
 * PIN obligatorio tras registro o si aún no existe PIN (redirección desde root).
 * ?welcome=1 muestra un mensaje tras registro exitoso.
 */
export default function PinSetupStackScreen() {
  const router = useRouter();
  const { welcome } = useLocalSearchParams<{ welcome?: string }>();
  const welcomeShown = useRef(false);

  useEffect(() => {
    const w = Array.isArray(welcome) ? welcome[0] : welcome;
    if ((w === "1" || w === "true") && !welcomeShown.current) {
      welcomeShown.current = true;
      Alert.alert(
        "Registro exitoso",
        "Tu cuenta se creó correctamente. Crea un PIN de 4 dígitos para continuar."
      );
      router.setParams({ welcome: undefined });
    }
  }, [welcome, router]);

  return <PinSetupView mandatory />;
}
