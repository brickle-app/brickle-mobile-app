import { SafeAreaView } from "react-native";
import React from "react";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import CompleteProfileForm from "@/src/components/auth/completeProfileForm/CompleteProfileForm";

const CompleteProfileScreen = () => {
  return (
    // Keyboard handling lives in CompleteProfileForm; a second KeyboardAvoidingView here doubled the padding
    <SafeAreaView className="flex-1">
      <BackGroundGradient />
      <CompleteProfileForm />
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;
