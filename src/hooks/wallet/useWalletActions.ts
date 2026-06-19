import { useState } from "react";
import { useRouter } from "expo-router";
import { authStore } from "@/src/store/auth.store";
import { WalletTabType } from "@/src/components/wallet/WalletTabs";

export function useWalletActions() {
  const router = useRouter();
  const user = authStore((state) => state.user);
  const [isModalVisible, setModalVisible] = useState(false);
  const [pendingAction, setPendingAction] = useState<WalletTabType>(null);

  const handleAction = (action: WalletTabType, callback: () => void) => {
    if (action === null || action === "transactions") {
      callback();
      return;
    }

    if (user?.isFullProfileComplete === true) {
      callback();
    } else if (user?.isProfileUnderReview) {
      import("react-native").then(({ Alert }) => {
        Alert.alert(
          "Perfil en revisión",
          "Tu documento está siendo revisado por nuestro equipo. Te notificaremos una vez que tu cuenta esté validada."
        );
      });
    } else if (!user?.isBasicProfileComplete) {
      setPendingAction(action);
      router.push("/complete-profile");
    } else {
      setPendingAction(action);
      setModalVisible(true);
    }
  };

  const handleCompleteProfile = () => {
    setModalVisible(false);
    setPendingAction(null);
    router.push("/complete-profile");
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setPendingAction(null);
  };

  return {
    isModalVisible,
    pendingAction,
    handleAction,
    handleCompleteProfile,
    handleCloseModal,
  };
}
