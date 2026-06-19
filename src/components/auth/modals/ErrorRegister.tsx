import { TouchableOpacity } from "react-native";

import { Colors } from "@/assets/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const ErrorRegister = ({ showModal, setShowModal }: { showModal: boolean, setShowModal: (showModal: boolean) => void }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showModal}
      onRequestClose={() => setShowModal(false)}
    >
      <SafeAreaView className="flex-1 justify-center items-center bg-red-500/80 relative">
        <View className="flex-row justify-end items-end w-full px-5">
          <TouchableOpacity className="flex-row items-center justify-center gap-2" onPress={() => setShowModal(false)}>
            <Ionicons
              name="close-circle"
              size={28}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
        <View className="flex flex-col gap-4 m-5 rounded-xl p-11 items-center max-w-[90%] bg-white">
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={Colors.red}
          />
          <Text className="text-blue-primary font-libre-bold text-3xl">
            Error en el registro
          </Text>
          <Text className="text-text-primary font-libre-bold text-base">
            Tu registro no se ha realizado correctamente
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  )
};