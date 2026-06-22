import React, { useCallback, useState } from "react";
import { Alert, Modal, Text, TouchableOpacity, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { uploadPaymentProof } from "@/src/services/payment.service";
import { authStore } from "@/src/store/auth.store";
import { formatColombianPesos } from "@/src/utils/formatCurrency";
import { PaymentInfoCard } from "./PaymentInfoCard";
import { PaymentProofPicker } from "./PaymentProofPicker";
import { PaymentQrModal } from "./PaymentQrModal";
import { isPaymentProofReady } from "./paymentDetailsModal.logic";
import { PaymentDetailsModalProps } from "./paymentDetailsModal.types";

export const PaymentDetailsModal = ({
  visible,
  onClose,
  amount,
  onConfirmTransaction,
}: PaymentDetailsModalProps) => {
  const { user } = authStore();
  const [uploadedImage, setUploadedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [showFullscreenQR, setShowFullscreenQR] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const resetUploadState = useCallback(() => {
    setUploadedImage(null);
    setPaymentProofUrl(null);
  }, []);

  const handleUploadPaymentProof = useCallback(
    async (image: ImagePicker.ImagePickerAsset) => {
      if (!user?.id || !user?.email) {
        Alert.alert("Error", "No se encontró una sesión válida para subir el comprobante");
        return;
      }

      setIsUploading(true);
      setPaymentProofUrl(null);
      try {
        const fileUrl = await uploadPaymentProof({ id: user.id, email: user.email }, image);
        setUploadedImage(image);
        setPaymentProofUrl(fileUrl);
      } catch (error) {
        resetUploadState();
        Alert.alert("Error", "Error al subir el comprobante de pago");
        console.error("Upload error:", error);
      } finally {
        setIsUploading(false);
      }
    },
    [resetUploadState, user]
  );

  const pickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permisos requeridos", "Se necesitan permisos para acceder a la galería");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      await handleUploadPaymentProof(result.assets[0]);
    }
  }, [handleUploadPaymentProof]);

  const handleConfirmTransaction = useCallback(() => {
    if (!paymentProofUrl) {
      Alert.alert("Error", "Debes subir el comprobante de pago primero");
      return;
    }
    onConfirmTransaction(paymentProofUrl, amount);
  }, [amount, onConfirmTransaction, paymentProofUrl]);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch {
      Alert.alert("Error", "No se pudo copiar");
    }
  }, []);

  const proofReady = isPaymentProofReady(uploadedImage, paymentProofUrl, isUploading);

  return (
    <Modal animationType="fade" visible={visible} onRequestClose={onClose} transparent>
      <View className="flex-1 justify-center gap-10 items-center bg-violet-primary/60">
        <View className="flex flex-col gap-4 m-5 rounded-xl p-6 items-center max-w-[90%] bg-white">
          <Ionicons name="card-outline" size={32} color={Colors.bluePrimary} />
          <Text className="text-blue-primary font-libre-bold text-base text-center">Detalles de pago</Text>

          <View className="w-full bg-blue-50 rounded-xl p-4 mb-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-libre-regular">Monto a pagar: </Text>
              <Text className="text-blue-primary font-libre-bold text-lg">${formatColombianPesos(amount)} COP</Text>
            </View>
          </View>

          <PaymentInfoCard
            showCopyFeedback={showCopyFeedback}
            onCopy={copyToClipboard}
            onOpenQr={() => setShowFullscreenQR(true)}
          />

          <PaymentProofPicker
            uploadedImage={uploadedImage}
            paymentProofUrl={paymentProofUrl}
            isUploading={isUploading}
            onPickImage={pickImage}
          />

          <View className="flex flex-row gap-4 w-full">
            <TouchableOpacity className="py-3 w-1/2 rounded-full border border-gray-300 bg-gray-100" onPress={onClose}>
              <Text className="text-gray-700 font-libre-bold text-center">Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`py-3 w-1/2 rounded-full ${proofReady ? "bg-green-primary" : "bg-gray-300"}`}
              disabled={!proofReady}
              onPress={handleConfirmTransaction}
            >
              <Text className={`font-libre-bold text-center ${proofReady ? "text-blue-primary" : "text-gray-500"}`}>
                {isUploading ? "Procesando..." : "Confirmar"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <PaymentQrModal visible={showFullscreenQR} onClose={() => setShowFullscreenQR(false)} />
    </Modal>
  );
};
