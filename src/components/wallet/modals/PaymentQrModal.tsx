import { Ionicons } from "@expo/vector-icons";
import { Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { BRICKLE_BANK_INFO } from "./paymentDetailsModal.logic";

interface PaymentQrModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PaymentQrModal = ({ visible, onClose }: PaymentQrModalProps) => (
  <Modal animationType="fade" visible={visible} onRequestClose={onClose} transparent>
    <View className="flex-1 justify-center items-center bg-black/90">
      <View className="w-full h-full justify-center items-center p-8">
        <TouchableOpacity className="absolute top-12 right-6 z-10" onPress={onClose}>
          <Ionicons name="close-circle" size={40} color="white" />
        </TouchableOpacity>
        <View className="bg-white p-6 rounded-xl items-center max-w-sm w-full">
          <Text className="text-blue-primary font-libre-bold text-lg mb-4 text-center">Código QR para pago</Text>
          <Image source={require("@/assets/images/recharge/qr.jpeg")} className="w-80 h-80 mb-4" resizeMode="contain" />
          <Text className="text-gray-600 font-libre-regular text-center text-sm">Escanea este código QR con tu app bancaria</Text>
          <Text className="text-blue-primary font-libre-bold text-center mt-2">{BRICKLE_BANK_INFO.bankName}</Text>
        </View>
      </View>
    </View>
  </Modal>
);
