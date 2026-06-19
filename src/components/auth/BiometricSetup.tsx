import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/assets/Colors';
import { useBiometricAuth } from '@/src/hooks/auth/useBiometricAuth';
import { authStore } from '@/src/store/auth.store';

interface BiometricSetupProps {
  className?: string;
  onSetupComplete?: (enabled: boolean) => void;
}

export const BiometricSetup: React.FC<BiometricSetupProps> = ({
  className = '',
  onSetupComplete,
}) => {
  const { user, accessToken } = authStore();
  const {
    capabilities,
    isBiometricEnabled,
    biometricTypeName,
    canUseBiometrics,
    enableBiometric,
    disableBiometric,
    isLoading,
  } = useBiometricAuth();

  const handleToggleBiometric = async () => {
    if (!user?.email || !accessToken) {
      Alert.alert('Error', 'No se encontró la información de autenticación');
      return;
    }

    if (isBiometricEnabled) {
      Alert.alert(
        'Desactivar autenticación biométrica',
        `¿Estás seguro de que deseas desactivar ${biometricTypeName}?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Desactivar',
            style: 'destructive',
            onPress: async () => {
              await disableBiometric();
              onSetupComplete?.(false);
            },
          },
        ]
      );
    } else {
      const success = await enableBiometric(user.email, accessToken);
      if (success) {
        onSetupComplete?.(true);
      }
    }
  };

  const renderUnavailableReason = () => {
    if (!capabilities.hasHardware) {
      return 'Este dispositivo no tiene hardware biométrico';
    }
    if (!capabilities.isEnrolled) {
      return `No tienes ${biometricTypeName} configurado en tu dispositivo`;
    }
    return 'Autenticación biométrica no disponible';
  };

  const getBiometricIcon = () => {
    if (biometricTypeName === 'Face ID') {
      return 'scan-outline' as const;
    }
    if (biometricTypeName === 'Touch ID') {
      return 'finger-print-outline' as const;
    }
    return 'shield-checkmark-outline' as const;
  };

  if (isLoading) {
    return (
      <View className={`p-4 ${className}`}>
        <Text className="text-gray-500 text-center">
          Verificando capacidades biométricas...
        </Text>
      </View>
    );
  }

  return (
    <View className={`bg-white rounded-lg p-4 border border-gray-200 ${className}`}>
      <View className="flex-row items-center mb-3">
        <Ionicons
          name={getBiometricIcon()}
          size={24}
          color={canUseBiometrics ? Colors.bluePrimary : Colors.gray}
        />
        <Text className="ml-3 text-lg font-libre-bold text-text-primary">
          Autenticación {biometricTypeName}
        </Text>
      </View>

      {canUseBiometrics ? (
        <>
          <Text className="text-gray-600 mb-4 font-libre-regular">
            {isBiometricEnabled
              ? `Puedes iniciar sesión rápidamente usando ${biometricTypeName}`
              : `Habilita ${biometricTypeName} para iniciar sesión de forma rápida y segura`
            }
          </Text>

          <TouchableOpacity
            onPress={handleToggleBiometric}
            className={`
              flex-row items-center justify-center
              px-4 py-3 rounded-lg
              ${isBiometricEnabled 
                ? 'bg-red-50 border border-red-200' 
                : 'bg-blue-50 border border-blue-200'
              }
            `}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isBiometricEnabled ? 'close-circle-outline' : 'checkmark-circle-outline'}
              size={20}
              color={isBiometricEnabled ? Colors.red : Colors.bluePrimary}
            />
            <Text
              className={`
                ml-2 font-libre-medium
                ${isBiometricEnabled ? 'text-red-600' : 'text-blue-primary'}
              `}
            >
              {isBiometricEnabled ? 'Desactivar' : 'Activar'} {biometricTypeName}
            </Text>
          </TouchableOpacity>

          {isBiometricEnabled && (
            <View className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle" size={16} color={Colors.greenTertiary} />
                <Text className="ml-2 text-sm font-libre-medium text-green-700">
                  {biometricTypeName} activado
                </Text>
              </View>
            </View>
          )}
        </>
      ) : (
        <View className="p-3 bg-gray-50 rounded-lg border border-gray-200">
          <View className="flex-row items-center mb-2">
            <Ionicons name="information-circle-outline" size={20} color={Colors.gray} />
            <Text className="ml-2 font-libre-medium text-gray-600">
              No disponible
            </Text>
          </View>
          <Text className="text-sm text-gray-500 font-libre-regular">
            {renderUnavailableReason()}
          </Text>
          {!capabilities.isEnrolled && (
            <Text className="text-xs text-gray-400 mt-2 font-libre-light">
              Ve a Configuración del dispositivo para configurar {biometricTypeName}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};