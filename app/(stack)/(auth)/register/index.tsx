import {
  View,
  SafeAreaView,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { useRouter } from "expo-router";
import { Button, ErrorRegister } from "@/src/components";
import { FormField } from "@/src/components/ui/input";
import { registerInputs } from "@/src/constants/auth/register-inputs";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import Logo from "@/assets/logos/simple-logo-red.svg";
import { useRegisterForm } from "@/src/hooks/useRegisterForm";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { BRICKLE_PRIVACY_POLICY_PDF_URL } from "@/src/constants/legal-documents";

const RegisterScreen = () => {
  const router = useRouter();
  const {
    formData,
    handleChange,
    handleBlur,
    handleSubmit,
    isFormValid,
    isEmailFromAuth,
    isLoading,
    submitError,
    errors,
    backupCode,
  } = useRegisterForm();

  const [showErrorModal, setShowErrorModal] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const formBlockYRef = useRef(0);
  const fieldYInFormRef = useRef<Record<string, number>>({});

  const scrollFieldIntoView = useCallback((fieldId: string) => {
    const top =
      formBlockYRef.current + (fieldYInFormRef.current[fieldId] ?? 0);
    const paddingTop = 56;
    const y = Math.max(0, top - paddingTop);
    const runScroll = () =>
      scrollViewRef.current?.scrollTo({ y, animated: true });
    runScroll();
    setTimeout(runScroll, 120);
    setTimeout(runScroll, 320);
  }, []);

  const handleRegistration = async () => {
    const result = await handleSubmit();

    if (result) {
      router.replace("/(stack)/pin-setup?welcome=1");
    } else if (submitError) {
      setShowErrorModal(true);
    }
  };

  const screenBody = (
    <SafeAreaView className="flex-1 min-h-screen w-screen">
      <BackGroundGradient />
      <ScrollView
        ref={scrollViewRef}
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 96 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <View className="w-full gap-8 items-center">
          <View className="flex mt-14 justify-center items-center gap-10">
            <Logo width={25} height={45} />
            <Text className="font-libre-bold text-text-primary text-3xl">
              Crea tu cuenta
            </Text>
          </View>

          <View
            className="w-full flex flex-col gap-6 px-5"
            onLayout={(e) => {
              formBlockYRef.current = e.nativeEvent.layout.y;
            }}
          >
            {registerInputs.map((input) => {
              const isEmailField = input.id === "email";
              const isEmailFromGoogleAuth = isEmailField && isEmailFromAuth();

              const displayIcon = isEmailFromGoogleAuth ? (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors.greenTertiary}
                />
              ) : (
                input.icon
              );

              return (
                <View
                  key={input.id}
                  onLayout={(e) => {
                    fieldYInFormRef.current[input.id] =
                      e.nativeEvent.layout.y;
                  }}
                >
                  <FormField
                    width="w-full"
                    label={input.label}
                    placeholder={
                      isEmailFromGoogleAuth
                        ? "Email verificado con Google"
                        : input.placeholder
                    }
                    value={
                      formData[input.id as keyof typeof formData] as string
                    }
                    keyboardType={input.type}
                    secureTextEntry={input.secureTextEntry}
                    onChangeText={(text) =>
                      handleChange(input.id as keyof typeof formData, text)
                    }
                    onBlur={() =>
                      handleBlur(input.id as keyof typeof formData)
                    }
                    icon={displayIcon}
                    error={errors[input.id as keyof typeof formData]}
                    disabled={isEmailFromGoogleAuth}
                    description={
                      isEmailFromGoogleAuth
                        ? "Este email fue verificado durante la autenticación con Google"
                        : input.description
                    }
                    onFocus={() => scrollFieldIntoView(input.id)}
                  />
                </View>
              );
            })}
            <View className="bg-white border border-blue-primary/20 rounded-2xl p-4 gap-2">
              <Text className="text-text-primary text-xs font-semibold uppercase tracking-widest text-center">
                Tu backup code
              </Text>
              <Text selectable className="text-blue-primary font-libre-bold text-xl leading-8 text-center">
                {backupCode}
              </Text>
              <Text className="text-text-primary text-xs leading-5 text-center">
                Guárdalo fuera de la app. Brickle no puede verlo ni recuperarlo por ti.
              </Text>
            </View>
            <FormField
              width="w-full"
              label="Confirmar backup code"
              placeholder="Escribe las 12 palabras"
              value={formData.backupCodeConfirmation}
              onChangeText={(text) => handleChange("backupCodeConfirmation", text.toLowerCase())}
              onBlur={() => handleBlur("backupCodeConfirmation")}
              icon={<Ionicons name="shield-checkmark-outline" size={24} color={Colors.textPrimary} />}
              error={errors.backupCodeConfirmation}
              description="Debes confirmarlo para completar el registro."
              onFocus={() => scrollFieldIntoView("backupCodeConfirmation")}
            />
            <View className="w-full flex-row items-center gap-2 mt-4">
              <Pressable
                onPress={() =>
                  handleChange("termsAccepted", !formData.termsAccepted)
                }
                className="w-6 h-6 border-2 border-text-primary rounded-md justify-center items-center"
              >
                {formData.termsAccepted && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.primary}
                  />
                )}
              </Pressable>
              <Text className="text-text-primary text-xs flex-1">
                He leído y acepto la{" "}
                <Text
                  className="underline"
                  onPress={() =>
                    router.push({
                      pathname: "/webview",
                      params: {
                        url: BRICKLE_PRIVACY_POLICY_PDF_URL,
                        title: "Política de tratamiento de datos",
                      },
                    })
                  }
                >
                  política de tratamiento de datos
                </Text>
              </Text>
            </View>
          </View>

          {submitError && (
            <View className="w-full px-5">
              <View className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <Text className="text-red-600 text-sm text-center">
                  {submitError}
                </Text>
              </View>
            </View>
          )}

          <View className="mb-16 w-full px-5">
            <Button
              width="w-full"
              label={isLoading ? "Creando cuenta..." : "Crear cuenta"}
              onPress={handleRegistration}
              disabled={!isFormValid() || isLoading}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <>
      {Platform.OS === "android" ? (
        <KeyboardAvoidingView
          behavior="height"
          style={{ flex: 1 }}
          keyboardVerticalOffset={25}
        >
          {screenBody}
        </KeyboardAvoidingView>
      ) : (
        <View style={{ flex: 1 }}>{screenBody}</View>
      )}
      <ErrorRegister
        showModal={showErrorModal}
        setShowModal={setShowErrorModal}
      />
    </>
  );
};

export default RegisterScreen;
