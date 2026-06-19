import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, Image, Modal } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { uploadPaymentProof } from '@/src/services/payment.service';
import { authStore } from '@/src/store/auth.store';
import { formatColombianPesos } from '@/src/utils/formatCurrency';
import { Colors } from '@/assets/Colors';
import { Ionicons } from '@expo/vector-icons';

interface PaymentDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  amount: string;
  onConfirmTransaction: (paymentProofUrl: string, amount: string) => void;
}

const BRICKLE_BANK_INFO = {
  type: 'Ahorros',
  bankName: 'Bancolombia',
  accountNumber: '25900003125',
  accountHolder: 'Brickle S.A.S',
  nit: '901.234.567-8',
  keyBreb: '0090013737'
};

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  visible,
  onClose,
  amount,
  onConfirmTransaction,
}) => {
  const { user } = authStore();
  const [uploadedImage, setUploadedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentProofUrl, setPaymentProofUrl] = useState<string | null>(null);
  const [showFullscreenQR, setShowFullscreenQR] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos requeridos', 'Se necesitan permisos para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadedImage(result.assets[0]);
      await handleUploadPaymentProof(result.assets[0]);
    }
  };

  const handleUploadPaymentProof = async (image: ImagePicker.ImagePickerAsset) => {
    if (!user?.id || !user?.email) return;

    setIsUploading(true);
    try {
      const fileUrl = await uploadPaymentProof(user as any, image);
      setPaymentProofUrl(fileUrl);
    } catch (error) {
      Alert.alert('Error', 'Error al subir el comprobante de pago');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmTransaction = () => {
    if (!paymentProofUrl) {
      Alert.alert('Error', 'Debes subir el comprobante de pago primero');
      return;
    }
    onConfirmTransaction(paymentProofUrl, amount);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'No se pudo copiar');
    }
  };

  return (
    <Modal
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      transparent={true}
    >
      {/* Semi-transparent background */}
      <View className="flex-1 justify-center gap-10 items-center bg-violet-primary/60">
        {/* Modal Content */}
        <View className="flex flex-col gap-4 m-5 rounded-xl p-6 items-center max-w-[90%] bg-white">
          <Ionicons
            name="card-outline"
            size={32}
            color={Colors.bluePrimary}
          />
          <Text className="text-blue-primary font-libre-bold text-base text-center">
            Detalles de pago
          </Text>
          {/* Amount Section */}
          <View className="w-full bg-blue-50 rounded-xl p-4 mb-2">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-libre-regular">Monto a pagar: </Text>
              <Text className="text-blue-primary font-libre-bold text-lg">
                ${formatColombianPesos(amount)} COP
              </Text>
            </View>
          </View>

          <View className="w-full bg-white rounded-xl border border-gray-200 p-6 space-y-4 mb-4">
            <View className="items-center mb-4">
              <Text className="text-blue-primary font-libre-bold text-base mb-2">
                {BRICKLE_BANK_INFO.bankName}
              </Text>
              <TouchableOpacity
                className="bg-gray-100 p-4 rounded-lg items-center"
                onPress={() => setShowFullscreenQR(true)}
              >
                <Image source={require("@/assets/images/recharge/qr.jpeg")} className='w-16 h-16' />
                <Text className="text-sm text-gray-600 mt-2 text-center font-libre-regular">
                  Toca para ampliar QR
                </Text>
              </TouchableOpacity>
            </View>

            <View className="space-y-3 relative">
              <View className="flex-row justify-between items-center bg-blue-50 px-3 py-2 rounded-md">
                <Text className="text-gray-600 font-libre-regular">Tipo de cuenta:</Text>
                <Text className="text-blue-primary font-libre-bold">
                  {BRICKLE_BANK_INFO.type}
                </Text>
              </View>

              <View className="flex-row justify-between items-center bg-blue-50 px-3 py-2 rounded-md">
                <Text className="text-gray-600 font-libre-regular">Número:</Text>
                <View className="flex-row items-center">
                  <Text className="text-blue-primary font-libre-bold mr-2">
                    {BRICKLE_BANK_INFO.accountNumber}
                  </Text>
                  <TouchableOpacity onPress={() => copyToClipboard(BRICKLE_BANK_INFO.accountNumber)}>
                    <MaterialIcons name="content-copy" size={18} color={Colors.bluePrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View className="flex-row justify-between items-center bg-blue-50 px-3 py-2 rounded-md">
                <Text className="text-gray-600 font-libre-regular">Breb-B:</Text>
                <View className="flex-row items-center">
                  <Text className="text-blue-primary font-libre-bold mr-2">
                    {BRICKLE_BANK_INFO.keyBreb}
                  </Text>
                  <TouchableOpacity onPress={() => copyToClipboard(BRICKLE_BANK_INFO.keyBreb)}>
                    <MaterialIcons name="content-copy" size={18} color={Colors.bluePrimary} />
                  </TouchableOpacity>
                </View>
              </View>

              {showCopyFeedback && (
                <View className="absolute -bottom-8 right-2 bg-green-500 px-3 py-1 rounded-full z-10">
                  <Text className="text-white text-xs font-libre-medium">¡Copiado!</Text>
                </View>
              )}
            </View>
          </View>

          {/* Upload Section */}
          <View className="w-full bg-orange-50 rounded-xl p-4 mb-6">
            <Text className="text-orange-800 font-libre-bold text-center mb-4">
              Subir Comprobante de Pago
            </Text>

            <TouchableOpacity
              className="border-2 border-dashed border-orange-300 bg-white rounded-lg p-3 items-center"
              onPress={pickImage}
              disabled={isUploading}
            >
              {uploadedImage ? (
                <View className="items-center">
                  <Image
                    source={{ uri: uploadedImage.uri }}
                    className="w-16 h-16 rounded-lg mb-3"
                  />
                  <Ionicons name="checkmark-circle" size={16} color={Colors.greenPrimary} />
                  <Text className="text-green-600 font-libre-bold mt-1">
                    Comprobante cargado
                  </Text>
                </View>
              ) : (
                <View className="items-center">
                  <Ionicons name="cloud-upload-outline" size={40} color={Colors.orangePrimary} />
                  <Text className="text-orange-700 font-libre-regular mt-2 text-center">
                    {isUploading ? 'Subiendo...' : 'Toca para subir\ntu comprobante'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Action Buttons */}
          <View className="flex flex-row gap-4 w-full">
            <TouchableOpacity
              className="py-3 w-1/2 rounded-full border border-gray-300 bg-gray-100"
              onPress={onClose}
            >
              <Text className="text-gray-700 font-libre-bold text-center">
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className={`py-3 w-1/2 rounded-full ${paymentProofUrl && !isUploading
                ? 'bg-green-primary'
                : 'bg-gray-300'
                }`}
              disabled={!paymentProofUrl || isUploading}
              onPress={handleConfirmTransaction}
            >
              <Text className={`font-libre-bold text-center ${paymentProofUrl && !isUploading
                ? 'text-blue-primary'
                : 'text-gray-500'
                }`}>
                {isUploading ? 'Procesando...' : 'Confirmar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Fullscreen QR Modal */}
      <Modal
        animationType="fade"
        visible={showFullscreenQR}
        onRequestClose={() => setShowFullscreenQR(false)}
        transparent={true}
      >
        <View className="flex-1 justify-center items-center bg-black/90">
          <View className="w-full h-full justify-center items-center p-8">
            <TouchableOpacity
              className="absolute top-12 right-6 z-10"
              onPress={() => setShowFullscreenQR(false)}
            >
              <Ionicons name="close-circle" size={40} color="white" />
            </TouchableOpacity>

            <View className="bg-white p-6 rounded-xl items-center max-w-sm w-full">
              <Text className="text-blue-primary font-libre-bold text-lg mb-4 text-center">
                Código QR para pago
              </Text>
              <Image
                source={require("@/assets/images/recharge/qr.jpeg")}
                className='w-80 h-80 mb-4'
                resizeMode="contain"
              />
              <Text className="text-gray-600 font-libre-regular text-center text-sm">
                Escanea este código QR con tu app bancaria
              </Text>
              <Text className="text-blue-primary font-libre-bold text-center mt-2">
                {BRICKLE_BANK_INFO.bankName}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </Modal>
  );
};