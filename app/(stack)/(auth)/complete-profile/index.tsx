import { SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import React from "react";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import CompleteProfileForm from "@/src/components/auth/completeProfileForm/CompleteProfileForm";

const CompleteProfileScreen = () => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <SafeAreaView className="flex-1">
        <BackGroundGradient />
        <CompleteProfileForm />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default CompleteProfileScreen;
