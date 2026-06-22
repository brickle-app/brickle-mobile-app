import React from 'react';
import { Modal, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/assets/Colors';
import useChangeStatusBarColor from '@/src/hooks/ui/useChangeStatusBarColor';

interface DeleteConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export const DeleteConfirmationModal = ({
  isVisible,
  onClose,
  onConfirm,
  title = "Eliminar cuenta",
  message = "¿Estás seguro de que deseas eliminar esta cuenta bancaria? Esta acción no se puede deshacer.",
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isLoading = false,
}: DeleteConfirmationModalProps) => {
  useChangeStatusBarColor({ isVisible, color: Colors.violetPrimary });

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white rounded-xl p-6 mx-4 w-[90%] max-w-sm">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-4">
            <View className="flex-row items-center">
              <Ionicons
                name="warning"
                size={24}
                color={Colors.red}
                style={{ marginRight: 8 }}
              />
              <Text className="text-lg font-libre-bold text-gray-900">
                {title}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Ionicons name="close" size={24} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Message */}
          <Text className="text-gray-700 text-base leading-6 mb-6">
            {message}
          </Text>

          {/* Buttons */}
          <View className="flex flex-row gap-4 w-full">
            <TouchableOpacity
              onPress={onClose}
              disabled={isLoading}
              className="bg-gray-200 py-3 rounded-full w-1/2"
            >
              <Text className="text-gray-700 text-center font-libre-bold">
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              disabled={isLoading}
              className="bg-red-500 w-1/2 rounded-full py-3"
            >
              <Text className="text-white text-center font-libre-bold">
                {isLoading ? "Eliminando..." : confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};
