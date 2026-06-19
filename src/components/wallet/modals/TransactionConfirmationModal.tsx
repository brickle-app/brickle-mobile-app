import React from 'react';
import { View, Text, TouchableOpacity, Linking, Modal } from 'react-native';
import { Card } from '@/src/components/ui/card/Card';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Colors } from '@/assets/Colors';

interface TransactionConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onNavigateToMovements?: () => void;
}

const SUPPORT_EMAIL = 'admin@brickle.app';

export const TransactionConfirmationModal: React.FC<TransactionConfirmationModalProps> = ({
  visible,
  onClose,
  onNavigateToMovements,
}) => {
  const handleContactSupport = () => {
    const subject = encodeURIComponent('Consulta sobre transacción de recarga');
    const body = encodeURIComponent('Hola, tengo una consulta sobre mi transacción de recarga...');
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    Linking.openURL(mailtoUrl).catch(() => {
      console.error('Cannot open email client');
    });
  };

  return (
    <Modal
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
      transparent={true}
    >
      <View className="flex-1 justify-center items-center bg-violet-primary/80">
        <TouchableOpacity className='self-end bg-primary-white rounded-full mx-5 mb-4' onPress={onClose}>
          <MaterialIcons name="close" size={24} color={Colors.secondary} />
        </TouchableOpacity>
        <View className="bg-white rounded-xl m-4 max-w-[90%] w-full max-h-[90%]">
          <View className="p-4">
            <Card className="mb-6 p-6 items-center bg-green-50">
              <Ionicons name='checkmark-circle' color={Colors.bluePrimary} size={24} />
              <Text className="text-xl font-libre-bold text-blue-primary mt-4 text-center">
                ¡Transacción en proceso!
              </Text>
            </Card>

            <Card className="p-4">
              <Text className="text-base text-secondary mb-4 text-center leading-6">
                Tu solicitud de recarga ha sido enviada exitosamente. Nuestro equipo está procesando
                tu transacción.
              </Text>

              <View className="bg-blue-50 p-4 rounded-lg mb-4">
                <Text className="text-base font-libre-bold text-blue-primary mb-2">
                  ⏱️ Tiempo estimado de procesamiento:
                </Text>
                <Text className="text-base text-blue-primary">
                  Aproximadamente 1 hora
                </Text>
              </View>

              <Text className="text-sm text-secondary font-libre-regular text-center">
                Una vez confirmada tu transacción, los tokens se reflejarán automáticamente en tu cuenta.
              </Text>
            </Card>

            <Card className="mb-6 bg-orange-50">
              <Text className="text-base font-libre-bold text-blue-primary mb-2 text-center">
                ¿Necesitas ayuda?
              </Text>
              <Text className="text-sm text-secondary font-libre-regular text-center mb-4">
                Si tienes alguna pregunta sobre tu transacción, nuestro equipo de soporte está aquí para ayudarte.
              </Text>

              <TouchableOpacity
                className="border border-orange-primary bg-transparent py-3 px-4 rounded-full flex-row items-center justify-center"
                onPress={handleContactSupport}
              >
                <MaterialIcons name="email" size={20} color={Colors.orangePrimary} />
                <Text className="text-orange-primary font-libre-regular ml-2">
                  Contactar Soporte
                </Text>
              </TouchableOpacity>

              <Text className="text-xs text-blue-primary font-libre-bold text-center mt-2">
                {SUPPORT_EMAIL}
              </Text>
            </Card>

            <View className="flex-row space-x-4 gap-4">
              <TouchableOpacity
                className="flex-1 py-3 bg-blue-100 rounded-full"
                onPress={() => {
                  onNavigateToMovements?.();
                  onClose();
                }}
              >
                <Text className="text-center font-libre-bold text-blue-primary">
                  Ver Movimientos
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 py-3 bg-green-primary rounded-full"
                onPress={onClose}
              >
                <Text className="text-center font-libre-bold text-blue-primary">
                  Entendido
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};