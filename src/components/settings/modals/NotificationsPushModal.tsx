import { Colors } from "@/assets/Colors";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";

import { Modal } from "react-native";

export const NotificationsPushModal = ({
  visible,
  onRequestClose,
  title,
  description,
  handelAction,
  isLoading
}: {
  visible: boolean,
  onRequestClose: () => void, title: string, description: string, handelAction: () => void, isLoading: boolean
}) => {
  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      transparent={true}
      animationType="fade"
    >
      <View className={`flex-1 justify-center gap-10 items-center bg-violet-primary/60`}>
        {/* Modal Content */}

        <View className="flex flex-col gap-4 m-5  rounded-xl p-8 items-center  max-w-[90%] bg-white">
          <Ionicons
            name="information-circle"
            size={80}
            color={Colors.bluePrimary}
          />
          <Text className="text-blue-primary font-libre-bold text-3xl">
            {title}
          </Text>
          <Text className="text-text-primary font-libre-bold text-base">
            {description}
          </Text>

          <View className="flex flex-row gap-4 w-full mt-4">
            <TouchableOpacity className="py-3 w-1/2 rounded-full border  border-green-primary" onPress={onRequestClose}>
              <Text className="text-blue-primary font-libre-bold text-center">
                Cerrar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`py-3 w-1/2 rounded-full ${isLoading ? 'bg-gray-300' : 'bg-green-primary'}`}
              disabled={isLoading}
              onPress={handelAction}
            >
              <Text className="text-blue-primary font-libre-bold text-center">
                {isLoading ? 'Procesando...' : 'Confirmar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};