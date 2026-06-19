import { StatusBar } from "react-native";
import { useEffect } from "react";

interface ChangeStatusBarProps {
  isVisible: boolean;
  color: string;
  opacity?: string;
}
const useChangeStatusBarColor = ({
  isVisible,
  color,
  opacity = "99",
}: ChangeStatusBarProps) => {
  useEffect(() => {
    let statusBarTimeout: NodeJS.Timeout;

    if (isVisible) {
      statusBarTimeout = setTimeout(() => {
        StatusBar.setBackgroundColor(color + opacity, true);
        StatusBar.setBarStyle("light-content");
      }, 145);
    } else {
      statusBarTimeout = setTimeout(() => {
        StatusBar.setBackgroundColor("#E8F5E9");
        StatusBar.setBarStyle("dark-content");
      }, 145);
    }

    return () => {
      // Limpia el timeout si el componente se desmonta antes de que se ejecute
      clearTimeout(statusBarTimeout);

      // Restaurar el StatusBar original al desmontar
      StatusBar.setBackgroundColor("#E8F5E9");
      StatusBar.setBarStyle("dark-content");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);
};

export default useChangeStatusBarColor;
