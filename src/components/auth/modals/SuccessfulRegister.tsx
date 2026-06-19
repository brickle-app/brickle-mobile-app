import { TouchableOpacity } from "react-native";

import { Colors } from "@/assets/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Modal } from "react-native";
import { router } from "expo-router";

export const SuccessfulRegister = ({ showModal, setShowModal }: { showModal: boolean, setShowModal: (showModal: boolean) => void }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={showModal}
      onRequestClose={() => setShowModal(false)}
    >
      <View className="flex-1 justify-center items-center bg-green-primary/60">
        <View className="flex flex-col gap-4 m-5 rounded-xl p-8 items-center  max-w-[90%] bg-white">
          <Ionicons
            name="checkmark-circle-outline"
            size={80}
            color={Colors.bluePrimary}
          />
          <Text className="text-blue-primary font-libre-bold text-3xl">
            Registro exitoso
          </Text>
          <Text className="text-text-primary font-libre-bold text-base">
            Tu registro se ha realizado correctamente
          </Text>
          <TouchableOpacity
            className="bg-blue-primary rounded-full p-4 w-full"
            onPress={() => {
              setShowModal(false);
              router.push("/dashboard");
            }}
          >
            <Text className="text-white font-libre-bold text-base">
              Continuar
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
};