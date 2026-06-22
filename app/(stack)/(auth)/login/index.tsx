import {
  View,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "@/src/components";
import { Colors } from "@/assets/Colors";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import Logo from "@/assets/logos/fulllogo-red-variant.svg";
import { FormField } from "@/src/components/ui/input";
import { useGoogleAuth, useEmailAuth } from "@/src/services/auth.service";
import { useLoginForm } from "@/src/hooks/auth/useLoginForm";
import { BiometricLoginButton } from "@/src/components/auth/BiometricLoginButton";
import { AuthErrorModal } from "@/src/components/ui/modal/AuthErrorModal";

const LoginScreen = () => {
  const { handleLogin, showAuthError, handleRetryLogin, handleCloseError } = useGoogleAuth();
  const { handleEmailLogin, setEmail, isLoading } = useEmailAuth();

  const { errors, validateField, validateForm, handleChange, formData } =
    useLoginForm();
  // Dentro del componente LoginScreen
  const handleEmailChange = (text: string) => {
    const lowercaseEmail = text.toLowerCase();
    handleChange("email", lowercaseEmail);
    setEmail(lowercaseEmail);

    setTimeout(() => {
      validateField("email", lowercaseEmail);
    }, 300);
  };

  const handleSubmit = () => {
    if (validateForm()) {
      handleEmailLogin();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
    >
      <SafeAreaView className="bg-white flex-1 min-h-screen w-screen">
        <BackGroundGradient />
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex flex-1 gap-8 items-center">
            <View className="flex mt-36 justify-center items-center">
              <Logo width={250} height={100} />
            </View>

            <View className="flex mt-10 mb-10 justify-center items-center gap-4">

              <FormField
                containerClassName="mb-8"
                label="Correo electrónico"
                placeholder="Correo electrónico"
                icon={
                  <Ionicons
                    name="mail-outline"
                    size={24}
                    color={Colors.primary}
                  />
                }
                error={errors.email}
                onChangeText={handleEmailChange}
                value={formData.email}
              />
              <Button label="Ingresar" onPress={handleSubmit} disabled={isLoading} />

              <Button
                onPress={handleLogin}
                label="Ingresar con Google"
                variant="secondary"
                icon={
                  <Ionicons
                    name="logo-google"
                    size={24}
                    color={Colors.primary}
                  />
                }
              />

              {/* Biometric Login Button - Shows first if available */}
              <BiometricLoginButton className="w-full mt-6" />
            </View>

            {/*<View className="flex justify-center items-center mt-auto mb-12">
              <Text className="font-libre-light text-1xl">
                ¿Aún no tienes cuenta?{" "}
                <Link
                  href={"/register"}
                  className="text-text-primary font-libre-bold underline"
                >
                  Regístrate aquí
                </Link>
              </Text>
            </View>*/}
          </View>
        </ScrollView>
        <AuthErrorModal
          isVisible={showAuthError}
          onClose={handleCloseError}
          onRetry={handleRetryLogin}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
