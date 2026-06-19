import React from 'react';
import { Modal, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/assets/Colors';
import { handleSessionExpiry } from '@/src/utils/sessionManager';

interface SessionExpiredModalProps {
  visible: boolean;
}

export const SessionExpiredModal: React.FC<SessionExpiredModalProps> = ({
  visible
}) => {
  const handleConfirm = () => {
    handleSessionExpiry();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <SafeAreaView className="flex-1 bg-violet-primary/80 justify-center items-center px-6">
        <View className="bg-white rounded-3xl p-8 max-w-sm w-full">
          {/* Icon */}
          <View className="items-center mb-6">
            <View className="bg-red-100 rounded-full p-4 mb-6">
              <Ionicons
                name="time-outline"
                size={24}
                color={Colors.red}
              />
            </View>

            <Text className="text-blue-primary font-libre-bold text-base text-center mb-2">
              Sesión Expirada
            </Text>

            <Text className="text-text-primary font-libre-regular text-sm text-center">
              Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente para continuar.
            </Text>
          </View>

          {/* Action Button */}
          <TouchableOpacity
            className="bg-primary rounded-full py-4 px-6"
            onPress={handleConfirm}
            activeOpacity={0.8}
          >
            <Text className="text-blue-primary font-libre-bold text-base text-center">
              Iniciar Sesión
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Modal>
  );
};