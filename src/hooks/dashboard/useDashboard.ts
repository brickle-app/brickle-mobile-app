import { useState } from "react";
import { useRouter } from "expo-router";
import { authStore } from "@/src/store/auth.store";

export function useDashboard() {
  const router = useRouter();
  const user = authStore((state) => state.user);

  const [hasCompletedProfile] = useState(user?.isFullProfileComplete || false);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleBuyPress = () => {
    if (user?.isFullProfileComplete) {
      router.push("/(stack)/(tabs)/discover");
    } else if (user?.isProfileUnderReview) {
      import("react-native").then(({ Alert }) => {
        Alert.alert(
          "Perfil en revisión",
          "Tu documento está siendo revisado por nuestro equipo. Te notificaremos una vez que tu cuenta esté validada."
        );
      });
    } else if (!user?.isBasicProfileComplete) {
      router.push("/complete-profile");
    } else {
      setModalVisible(true);
    }
  };

  const handleCompleteProfile = () => {
    setModalVisible(false);
    router.push("/complete-profile");
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  return {
    isModalVisible,
    handleBuyPress,
    handleCompleteProfile,
    handleCloseModal,
  };
}
