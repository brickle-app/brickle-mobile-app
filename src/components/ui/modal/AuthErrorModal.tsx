import { Modal, View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { Button } from "../button/Button";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";

interface AuthErrorModalProps {
  isVisible: boolean;
  onClose: () => void;
  onRetry: () => void;
  title?: string;
  message?: string;
  retryLabel?: string;
}

export const AuthErrorModal = ({
  isVisible,
  onClose,
  onRetry,
  title = "Error de inicio de sesión",
  message = "No se pudo establecer la sesión correctamente. Por favor, intenta nuevamente.",
  retryLabel = "Reintentar",
}: AuthErrorModalProps) => {
  if (!isVisible) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView
        className="flex-1 justify-center items-center bg-violet-primary/80"
      >
        <View className="flex-row justify-end items-end w-full px-5">
          <TouchableOpacity className="flex-row items-center justify-center" onPress={onClose}>
            <Ionicons
              name="close-circle"
              size={26}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
        <View className="flex flex-col gap-6 m-5 bg-white rounded-xl p-11 items-center shadow-lg max-w-[90%]">
          <Ionicons
            name="alert-circle"
            size={32}
            color={Colors.red}
          />
          <Text className="text-blue-primary font-libre-bold text-xl">
            {title}
          </Text>

          <Text className="mb-4 text-center text-sm leading-6 text-text-primary">
            {message}
          </Text>

          <Button
            label={retryLabel}
            onPress={onRetry}
            width="w-[250px]"
            textClassName="!text-base"
            className="h-12"
          />
        </View>

      </SafeAreaView>
    </Modal>
  );
};
