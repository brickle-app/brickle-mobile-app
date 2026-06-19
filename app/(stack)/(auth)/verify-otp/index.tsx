import { Text, View } from "react-native";
import React, { useState } from "react";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import { FormField } from "@/src/components/ui/input";
import { useVerifyOtp } from "@/src/services/auth.service";
import { Button } from "@/src/components";
import Logo from "@/assets/logos/fulllogo-red-variant.svg";
import { useRouter } from "expo-router";
import { AuthErrorModal } from "@/src/components/ui/modal/AuthErrorModal";

const VerifyOtpScreen = () => {
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const { verifyOtp, isLoading, otpStatus, showAuthError, handleRetryOtp, handleCloseError } = useVerifyOtp();

  return (
    <View className="flex-1 ">
      <BackGroundGradient />
      <View className="flex flex-1 gap-8 items-center">
        <View className="flex mt-36 justify-center items-center">
          <Logo width={250} height={100} />
        </View>

        <FormField
          label="Código de verificación"
          placeholder="Ingrese el código de verificación"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          error={otpStatus?.error ?? undefined}
        />

        <View className="flex-col gap-4">
          <Button
            label={isLoading ? "Verificando..." : "Continuar"}
            disabled={isLoading}
            className={`font-libre-bold ${isLoading ? "opacity-50" : "opacity-100"}`}
            onPress={() => verifyOtp(otp)}
          />
          <Button
            variant="secondary"
            label="Cancelar"
            className="font-libre-bold"
            onPress={() => router.back()}
          />
        </View>

      </View>
      <AuthErrorModal
        isVisible={showAuthError}
        onClose={handleCloseError}
        onRetry={handleRetryOtp}
      />
    </View>
  );
};

export default VerifyOtpScreen;
