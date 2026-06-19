import { Modal, View, Text, TouchableOpacity, SafeAreaView, Alert, Image } from "react-native";
import { useState } from "react";
import { Button } from "../button/Button";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import * as ImagePicker from 'expo-image-picker';
import { uploadIdentityDocument, updateUser } from '@/src/services/brickle.service';
import { toBrickleUserUpdatePayload } from '@/src/utils/brickle-user-payload';
import { authStore } from '@/src/store/auth.store';

interface ProfileCompletionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCompleteProfile: () => void;
}

export const ProfileCompletionModal = ({
  isVisible,
  onClose,
  onCompleteProfile,
}: ProfileCompletionModalProps) => {
  const { user } = authStore();
  const [uploadedImage, setUploadedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  if (!isVisible) return null;

  const pickImage = async () => {
    try {
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

      if (!result.canceled && result.assets[0]?.uri) {
        setUploadedImage(result.assets[0]);
        await handleUploadDocument(result.assets[0]);
      }
    } catch (e) {
      console.error('pickImage', e);
      Alert.alert(
        'Error',
        'No se pudo abrir la galería. Cierra la app y vuelve a intentar o revisa los permisos en Ajustes.'
      );
    }
  };

  const handleUploadDocument = async (image: ImagePicker.ImagePickerAsset) => {
    if (!user) return;

    setIsUploading(true);
    try {
      const fileUrl = await uploadIdentityDocument(user as any, image);
      setDocumentUrl(fileUrl);
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes('Brickle API Error')
          ? error.message.replace(/^Brickle API Error:\s*/i, '').trim()
          : 'No se pudo subir el documento. Comprueba tu conexión e inténtalo de nuevo.';
      Alert.alert('Error', message || 'Error al subir el documento de identidad');
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!user?.isBasicProfileComplete) {
      Alert.alert('Error', 'Debes completar tu información básica antes de subir el documento.');
      return;
    }
    if (!documentUrl) {
      Alert.alert('Error', 'Debes subir tu documento de identidad primero');
      return;
    }

    const payload = toBrickleUserUpdatePayload(user);
    if (!payload) {
      Alert.alert('Error', 'No se pudo sincronizar tu sesión. Vuelve a iniciar sesión.');
      return;
    }

    setIsUploading(true);
    try {
      await updateUser({
        ...payload,
        isProfileUnderReview: true,
      });
      authStore.getState().setUser({
        ...user,
        isProfileUnderReview: true,
      });
      Alert.alert('Éxito', 'Tu documento ha sido enviado y está en revisión.');
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes('Brickle API Error')
          ? error.message.replace(/^Brickle API Error:\s*/i, '').trim()
          : 'No se pudo confirmar la verificación. Tu archivo puede haberse subido; inténtalo de nuevo en unos minutos.';
      Alert.alert('Error', message);
      console.error('handleConfirmUpload', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <SafeAreaView
        className="flex-1 justify-center items-center bg-violet-primary/80"
      >
        <View className="flex-row justify-end items-end w-full px-5">
          <TouchableOpacity className="flex-row items-center justify-center" onPress={onClose}>
            <Ionicons
              name="close-circle"
              size={26}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
        <View className="flex flex-col gap-6 m-5 bg-white rounded-xl p-11 items-center shadow-lg max-w-[90%]">
          <Ionicons
            name="document-text"
            size={32}
            color={Colors.bluePrimary}
          />
          <Text className="text-blue-primary font-libre-bold text-xl">
            Verifica tu identidad
          </Text>

          <Text className="mb-4 text-center text-sm leading-6 text-text-primary">
            Para completar tu perfil y usar todas las funciones de la app, necesitamos verificar tu identidad. Por favor sube una foto de tu documento.
          </Text>

          {/* Upload Section */}
          <View className="w-full bg-orange-50 rounded-xl p-4 mb-4">
            <Text className="text-orange-800 font-libre-bold text-center mb-4">
              Documento de Identidad
            </Text>

            <TouchableOpacity
              className="border-2 border-dashed border-orange-300 bg-white rounded-lg p-3 items-center"
              onPress={pickImage}
              disabled={isUploading}
            >
              {uploadedImage?.uri ? (
                <View className="items-center">
                  <Image
                    source={{ uri: uploadedImage.uri }}
                    className="w-16 h-16 rounded-lg mb-3"
                  />
                  <Ionicons name="checkmark-circle" size={16} color={Colors.greenPrimary} />
                  <Text className="text-green-600 font-libre-bold mt-1">
                    Documento cargado
                  </Text>
                </View>
              ) : (
                <View className="items-center">
                  <Ionicons name="cloud-upload-outline" size={40} color={Colors.orangePrimary} />
                  <Text className="text-orange-700 font-libre-regular mt-2 text-center">
                    {isUploading ? 'Subiendo...' : 'Toca para subir\ntu documento'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Button
            label={isUploading ? "Procesando..." : "Verificar identidad"}
            onPress={handleConfirmUpload}
            width="w-[250px]"
            textClassName="!text-base"
            className={`h-12 ${!documentUrl || isUploading ? 'opacity-50' : ''}`}
            disabled={!documentUrl || isUploading}
          />
        </View>

      </SafeAreaView>
    </Modal>
  );
};
