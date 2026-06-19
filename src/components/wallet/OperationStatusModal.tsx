import { View, Text, Modal, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import useChangeStatusBarColor from "@/src/hooks/ui/useChangeStatusBarColor";

interface OperationStatusModalProps {
  isVisible: boolean;
  onClose?: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  type: "success" | "error";
}

const OperationStatusModal = ({
  isVisible,
  onClose,
  title,
  description,
  icon,
  type
}: OperationStatusModalProps) => {
  useChangeStatusBarColor({
    isVisible,
    color: "#85FA8FB3",
    opacity: "",
  });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable onPress={onClose} className="flex-1">
        <View className={`flex-1 justify-center gap-10 items-center ${type === "success" ? "bg-primary/80" : "bg-red-600"}`}>
          <View className="flex flex-col gap-4 m-5  rounded-xl p-8 items-center  max-w-[90%]">
            <Ionicons
              name="checkmark-circle-outline"
              size={80}
              color={Colors.bluePrimary}
            />
            <Text className="text-blue-primary text-center font-libre-bold text-3xl">
              {title}
            </Text>
            {description && (
              <Text className="w-full text-center text-base font-libre-bold text-text-primary">
                {description}
              </Text>
            )}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

export default OperationStatusModal;
