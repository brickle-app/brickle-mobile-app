import { MaterialIcons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/assets/Colors";
import { BRICKLE_BANK_INFO } from "./paymentDetailsModal.logic";

interface PaymentInfoCardProps {
  showCopyFeedback: boolean;
  onCopy: (value: string) => void;
  onOpenQr: () => void;
}

export const PaymentInfoCard = ({ showCopyFeedback, onCopy, onOpenQr }: PaymentInfoCardProps) => (
  <View className="w-full bg-white rounded-xl border border-gray-200 p-6 space-y-4 mb-4">
    <View className="items-center mb-4">
      <Text className="text-blue-primary font-libre-bold text-base mb-2">
        {BRICKLE_BANK_INFO.bankName}
      </Text>
      <TouchableOpacity className="bg-gray-100 p-4 rounded-lg items-center" onPress={onOpenQr}>
        <Image source={require("@/assets/images/recharge/qr.jpeg")} className="w-16 h-16" />
        <Text className="text-sm text-gray-600 mt-2 text-center font-libre-regular">Toca para ampliar QR</Text>
      </TouchableOpacity>
    </View>

    <View className="space-y-3 relative">
      <View className="flex-row justify-between items-center bg-blue-50 px-3 py-2 rounded-md">
        <Text className="text-gray-600 font-libre-regular">Tipo de cuenta:</Text>
        <Text className="text-blue-primary font-libre-bold">{BRICKLE_BANK_INFO.type}</Text>
      </View>

      <CopyableRow label="Número:" value={BRICKLE_BANK_INFO.accountNumber} onCopy={onCopy} />
      <CopyableRow label="Breb-B:" value={BRICKLE_BANK_INFO.keyBreb} onCopy={onCopy} />

      {showCopyFeedback && (
        <View className="absolute -bottom-8 right-2 bg-green-500 px-3 py-1 rounded-full z-10">
          <Text className="text-white text-xs font-libre-medium">¡Copiado!</Text>
        </View>
      )}
    </View>
  </View>
);

interface CopyableRowProps {
  label: string;
  value: string;
  onCopy: (value: string) => void;
}

const CopyableRow = ({ label, value, onCopy }: CopyableRowProps) => (
  <View className="flex-row justify-between items-center bg-blue-50 px-3 py-2 rounded-md">
    <Text className="text-gray-600 font-libre-regular">{label}</Text>
    <View className="flex-row items-center">
      <Text className="text-blue-primary font-libre-bold mr-2">{value}</Text>
      <TouchableOpacity onPress={() => onCopy(value)}>
        <MaterialIcons name="content-copy" size={18} color={Colors.bluePrimary} />
      </TouchableOpacity>
    </View>
  </View>
);
