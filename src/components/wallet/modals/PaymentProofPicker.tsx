import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Colors } from "@/assets/Colors";
import { getPaymentProofLabel, isPaymentProofReady } from "./paymentDetailsModal.logic";
import { PaymentProofImage } from "./paymentDetailsModal.types";

interface PaymentProofPickerProps {
  uploadedImage: PaymentProofImage;
  paymentProofUrl: string | null;
  isUploading: boolean;
  onPickImage: () => void;
}

export const PaymentProofPicker = ({
  uploadedImage,
  paymentProofUrl,
  isUploading,
  onPickImage,
}: PaymentProofPickerProps) => {
  const ready = isPaymentProofReady(uploadedImage, paymentProofUrl, isUploading);

  return (
    <View className="w-full bg-orange-50 rounded-xl p-4 mb-6">
      <Text className="text-orange-800 font-libre-bold text-center mb-4">Subir Comprobante de Pago</Text>
      <TouchableOpacity
        className="border-2 border-dashed border-orange-300 bg-white rounded-lg p-3 items-center"
        onPress={onPickImage}
        disabled={isUploading}
      >
        {uploadedImage?.uri ? (
          <View className="items-center">
            <Image source={{ uri: uploadedImage.uri }} className="w-16 h-16 rounded-lg mb-3" />
            <Ionicons
              name={ready ? "checkmark-circle" : "alert-circle-outline"}
              size={16}
              color={ready ? Colors.greenPrimary : Colors.orangePrimary}
            />
            <Text className={`${ready ? "text-green-600" : "text-orange-700"} font-libre-bold mt-1 text-center`}>
              {getPaymentProofLabel(uploadedImage, paymentProofUrl, isUploading)}
            </Text>
          </View>
        ) : (
          <View className="items-center">
            <Ionicons name="cloud-upload-outline" size={40} color={Colors.orangePrimary} />
            <Text className="text-orange-700 font-libre-regular mt-2 text-center">
              {getPaymentProofLabel(uploadedImage, paymentProofUrl, isUploading)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};
