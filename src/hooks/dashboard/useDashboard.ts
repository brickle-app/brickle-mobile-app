import { useState } from "react";
import { useRouter } from "expo-router";
import { authStore } from "@/src/store/auth.store";
import { getDashboardProfileAction } from "./dashboardProfileAction";

export function useDashboard() {
  const router = useRouter();
  const user = authStore((state) => state.user);

  const [isModalVisible, setModalVisible] = useState(false);

  const handleBuyPress = () => {
    const action = getDashboardProfileAction(user);

    if (action === "discover") {
      router.push("/(stack)/(tabs)/discover");
    } else if (action === "review") {
      import("react-native").then(({ Alert }) => {
        Alert.alert(
          "Perfil en revisión",
          "Tu documento está siendo revisado por nuestro equipo. Te notificaremos una vez que tu cuenta esté validada."
        );
      });
    } else if (action === "complete-profile") {
      router.push("/complete-profile");
    } else {
      setModalVisible(true);
    }
  };

  const handleUploadDocument = () => {
    setModalVisible(true);
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
    handleUploadDocument,
    handleCompleteProfile,
    handleCloseModal,
  };
}
