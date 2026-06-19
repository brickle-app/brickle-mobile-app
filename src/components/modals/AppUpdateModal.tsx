import React from "react";
import { Modal, View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";

interface AppUpdateModalProps {
  visible: boolean;
  latestVersion: string | null;
  onUpdate: () => void;
  onLater: () => void;
}

export const AppUpdateModal: React.FC<AppUpdateModalProps> = ({
  visible,
  latestVersion,
  onUpdate,
  onLater,
}) => {
  if (!visible) return null;

  return (
    <Modal transparent={true} animationType="fade" statusBarTranslucent>
      <SafeAreaView className="flex-1 bg-violet-primary/80 justify-center items-center px-6">
        <View className="bg-white rounded-3xl p-8 max-w-sm w-full">
          <View className="items-center mb-6">
            <View className="bg-green-100 rounded-full p-4 mb-6">
              <Ionicons name="download-outline" size={24} color={Colors.greenPrimary} />
            </View>

            <Text className="text-blue-primary font-libre-bold text-base text-center mb-2">
              Nueva versión disponible
            </Text>

            <Text className="text-text-primary font-libre-regular text-sm text-center mb-1">
              Una nueva versión{latestVersion ? ` (${latestVersion})` : ""} de Brickle está disponible.
            </Text>

            <Text className="text-text-primary font-libre-regular text-sm text-center">
              Actualiza para acceder a las últimas funciones y mejoras.
            </Text>
          </View>

          <TouchableOpacity
            className="bg-primary rounded-full py-4 px-6 mb-3"
            onPress={onUpdate}
            activeOpacity={0.8}
          >
            <Text className="text-blue-primary font-libre-bold text-base text-center">
              Actualizar ahora
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-full py-3 px-6 border border-gray-300"
            onPress={onLater}
            activeOpacity={0.8}
          >
            <Text className="text-text-primary font-libre-regular text-sm text-center">
              Más tarde
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
