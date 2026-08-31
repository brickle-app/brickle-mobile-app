import { Modal, View, Text, TouchableOpacity, SafeAreaView, Alert, Image, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { Button } from "../button/Button";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import * as ImagePicker from 'expo-image-picker';
import {
  uploadUserDocument,
  updateUser,
  getUserDocuments,
  UserDocumentDto,
  UserDocumentType,
  USER_DOCUMENT_TYPE_LABELS,
} from '@/src/services/brickle.service';
import { toBrickleUserUpdatePayload } from '@/src/utils/brickle-user-payload';
import { authStore } from '@/src/store/auth.store';

interface ProfileCompletionModalProps {
  isVisible: boolean;
  onClose: () => void;
  onCompleteProfile: () => void;
}

const REQUIRED_DOCUMENT_TYPES: UserDocumentType[] = ["IDENTITY", "BANK_CERTIFICATE"];

type DocumentSlotState = {
  pickedImage: ImagePicker.ImagePickerAsset | null;
  documentUrl: string | null;
};

const emptySlot: DocumentSlotState = { pickedImage: null, documentUrl: null };

export const ProfileCompletionModal = ({
  isVisible,
  onClose,
  onCompleteProfile,
}: ProfileCompletionModalProps) => {
  const { user } = authStore();
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [existingDocuments, setExistingDocuments] = useState<UserDocumentDto[]>([]);
  const [slots, setSlots] = useState<Record<UserDocumentType, DocumentSlotState>>({
    IDENTITY: emptySlot,
    BANK_CERTIFICATE: emptySlot,
  });

  useEffect(() => {
    if (!isVisible || !user) return;

    let cancelled = false;
    setIsCheckingStatus(true);
    getUserDocuments(user as any)
      .then((docs) => {
        if (!cancelled) setExistingDocuments(docs);
      })
      .finally(() => {
        if (!cancelled) setIsCheckingStatus(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isVisible, user]);

  if (!isVisible) return null;

  const getExistingDocument = (documentType: UserDocumentType) =>
    existingDocuments.find((d) => d.documentType === documentType) ?? null;

  // El backend es la fuente de verdad: si ya existe un documento pendiente o aprobado
  // para ese tipo, se bloquea una nueva carga para evitar duplicados en la tabla de validaciones.
  const isSlotBlocked = (documentType: UserDocumentType) => {
    const existing = getExistingDocument(documentType);
    return existing?.status === "PENDING" || existing?.status === "APPROVED";
  };

  const isSlotReady = (documentType: UserDocumentType) =>
    isSlotBlocked(documentType) || Boolean(slots[documentType].documentUrl);

  const allDocumentsReady = REQUIRED_DOCUMENT_TYPES.every(isSlotReady);

  const refreshDocumentStatus = async () => {
    if (!user) return;
    const latest = await getUserDocuments(user as any);
    setExistingDocuments(latest);
  };

  const pickImage = async (documentType: UserDocumentType) => {
    if (isSlotBlocked(documentType)) return;
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
        const image = result.assets[0];
        setSlots((prev) => ({ ...prev, [documentType]: { pickedImage: image, documentUrl: null } }));
        await handleUploadDocument(documentType, image);
      }
    } catch (e) {
      console.error('pickImage', e);
      Alert.alert(
        'Error',
        'No se pudo abrir la galería. Cierra la app y vuelve a intentar o revisa los permisos en Ajustes.'
      );
    }
  };

  const handleUploadDocument = async (
    documentType: UserDocumentType,
    image: ImagePicker.ImagePickerAsset
  ) => {
    if (!user || isSlotBlocked(documentType)) return;

    setIsUploading(true);
    try {
      const fileUrl = await uploadUserDocument(user as any, image, documentType);
      setSlots((prev) => ({ ...prev, [documentType]: { pickedImage: image, documentUrl: fileUrl } }));
    } catch (error) {
      const rawMessage =
        error instanceof Error && error.message.includes('Brickle API Error')
          ? error.message.replace(/^Brickle API Error:\s*/i, '').trim()
          : 'No se pudo subir el documento. Comprueba tu conexión e inténtalo de nuevo.';

      if (rawMessage.startsWith('DUPLICATE_DOCUMENT:')) {
        // El backend ya tiene un documento PENDING/APPROVED de este tipo: re-sincronizamos
        // el estado real en vez de dejar reintentar, para no volver a chocar con el mismo error.
        setSlots((prev) => ({ ...prev, [documentType]: emptySlot }));
        await refreshDocumentStatus();
        Alert.alert('Documento ya registrado', rawMessage.replace(/^DUPLICATE_DOCUMENT:\s*/, ''));
      } else {
        Alert.alert('Error', rawMessage || 'Error al subir el documento');
      }
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!allDocumentsReady) return;
    if (!user?.isBasicProfileComplete) {
      Alert.alert('Error', 'Debes completar tu información básica antes de subir el documento.');
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
      Alert.alert('Éxito', 'Tus documentos han sido enviados y están en revisión.');
      onClose();
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes('Brickle API Error')
          ? error.message.replace(/^Brickle API Error:\s*/i, '').trim()
          : 'No se pudo confirmar la verificación. Tus archivos pueden haberse subido; inténtalo de nuevo en unos minutos.';
      Alert.alert('Error', message);
      console.error('handleConfirmUpload', error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderDocumentSlot = (documentType: UserDocumentType) => {
    const existing = getExistingDocument(documentType);
    const blocked = isSlotBlocked(documentType);
    const slot = slots[documentType];

    return (
      <View className="w-full bg-orange-50 rounded-xl p-4 mb-4" key={documentType}>
        <Text className="text-orange-800 font-libre-bold text-center mb-4">
          {USER_DOCUMENT_TYPE_LABELS[documentType]}
        </Text>

        {isCheckingStatus ? (
          <View className="items-center p-3">
            <ActivityIndicator color={Colors.orangePrimary} />
          </View>
        ) : blocked ? (
          <View className="items-center p-3">
            <Ionicons
              name={existing?.status === 'APPROVED' ? 'checkmark-circle' : 'time'}
              size={40}
              color={existing?.status === 'APPROVED' ? Colors.greenPrimary : Colors.orangePrimary}
            />
            <Text className="text-orange-700 font-libre-bold mt-2 text-center">
              {existing?.status === 'APPROVED' ? 'Documento aprobado' : 'En revisión'}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            className="border-2 border-dashed border-orange-300 bg-white rounded-lg p-3 items-center"
            onPress={() => pickImage(documentType)}
            disabled={isUploading}
          >
            {slot.pickedImage?.uri ? (
              <View className="items-center">
                <Image
                  source={{ uri: slot.pickedImage.uri }}
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
        )}
      </View>
    );
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
            Para completar tu perfil y usar todas las funciones de la app, necesitamos verificar tu identidad. Por favor sube tu documento de identidad y tu certificado bancario.
          </Text>

          {REQUIRED_DOCUMENT_TYPES.map(renderDocumentSlot)}

          {!allDocumentsReady ? null : (
            <Button
              label={isUploading ? "Procesando..." : "Verificar identidad"}
              onPress={handleConfirmUpload}
              width="w-[250px]"
              textClassName="!text-base"
              className={`h-12 ${isUploading ? 'opacity-50' : ''}`}
              disabled={isUploading}
            />
          )}
        </View>

      </SafeAreaView>
    </Modal>
  );
};
