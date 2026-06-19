import { useState, useEffect, useMemo } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BIOMETRIC_STORAGE_KEY = 'biometric_enabled';
const STORED_CREDENTIALS_KEY = 'stored_credentials';

interface BiometricCapabilities {
  isAvailable: boolean;
  hasHardware: boolean;
  isEnrolled: boolean;
  supportedTypes: LocalAuthentication.AuthenticationType[];
}

interface StoredCredentials {
  email: string;
  accessToken: string;
  lastLoginTime: number;
}

export const useBiometricAuth = () => {
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [capabilities, setCapabilities] = useState<BiometricCapabilities>({
    isAvailable: false,
    hasHardware: false,
    isEnrolled: false,
    supportedTypes: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check device biometric capabilities
  const checkBiometricCapabilities = async (): Promise<BiometricCapabilities> => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      const isAvailable = hasHardware && isEnrolled && supportedTypes.length > 0;

      return {
        isAvailable,
        hasHardware,
        isEnrolled,
        supportedTypes,
      };
    } catch (error) {
      console.error('Error checking biometric capabilities:', error);
      return {
        isAvailable: false,
        hasHardware: false,
        isEnrolled: false,
        supportedTypes: [],
      };
    }
  };

  // Get biometric type name for UI
  const getBiometricTypeName = (types: LocalAuthentication.AuthenticationType[]): string => {
    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'Face ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'Touch ID';
    }
    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'Iris';
    }
    return 'Biométrico';
  };

  // Check if biometric is enabled for this user
  const checkBiometricEnabled = async (): Promise<boolean> => {
    try {
      const enabled = await AsyncStorage.getItem(BIOMETRIC_STORAGE_KEY);
      return enabled === 'true';
    } catch (error) {
      console.error('Error checking biometric enabled status:', error);
      return false;
    }
  };

  // Enable biometric authentication
  const enableBiometric = async (email: string, accessToken: string): Promise<boolean> => {
    try {
      if (!capabilities.isAvailable) {
        Alert.alert(
          'No disponible',
          'La autenticación biométrica no está disponible en este dispositivo'
        );
        return false;
      }

      // Test biometric authentication first
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Habilita la autenticación biométrica',
        fallbackLabel: 'Usar contraseña del dispositivo',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Store biometric preference and credentials
        await AsyncStorage.multiSet([
          [BIOMETRIC_STORAGE_KEY, 'true'],
          [STORED_CREDENTIALS_KEY, JSON.stringify({
            email,
            accessToken,
            lastLoginTime: Date.now(),
          } as StoredCredentials)],
        ]);

        setIsBiometricEnabled(true);
        Alert.alert(
          'Activado',
          'La autenticación biométrica ha sido activada exitosamente'
        );
        return true;
      } else {
        Alert.alert(
          'Error',
          result.error || 'No se pudo verificar la identidad biométrica'
        );
        return false;
      }
    } catch (error) {
      console.error('Error enabling biometric:', error);
      Alert.alert('Error', 'Ocurrió un error al habilitar la autenticación biométrica');
      return false;
    }
  };

  // Disable biometric authentication
  const disableBiometric = async (): Promise<void> => {
    try {
      await AsyncStorage.multiRemove([BIOMETRIC_STORAGE_KEY, STORED_CREDENTIALS_KEY]);
      setIsBiometricEnabled(false);
      Alert.alert(
        'Desactivado',
        'La autenticación biométrica ha sido desactivada'
      );
    } catch (error) {
      console.error('Error disabling biometric:', error);
      Alert.alert('Error', 'Ocurrió un error al desactivar la autenticación biométrica');
    }
  };

  // Authenticate with biometrics
  const authenticateWithBiometrics = async (): Promise<StoredCredentials | null> => {
    try {
      if (!capabilities.isAvailable || !isBiometricEnabled) {
        return null;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Inicia sesión con tu biometría',
        fallbackLabel: 'Usar contraseña del dispositivo',
        disableDeviceFallback: false,
      });

      if (result.success) {
        // Get stored credentials
        const credentialsData = await AsyncStorage.getItem(STORED_CREDENTIALS_KEY);
        if (credentialsData) {
          return JSON.parse(credentialsData) as StoredCredentials;
        }
      } else {
        console.log('Biometric authentication failed:', result.error);
      }

      return null;
    } catch (error) {
      console.error('Error during biometric authentication:', error);
      return null;
    }
  };

  // Initialize hook
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      const caps = await checkBiometricCapabilities();
      const enabled = await checkBiometricEnabled();
      
      setCapabilities(caps);
      setIsBiometricEnabled(enabled && caps.isAvailable);
      setIsLoading(false);
    };

    initialize();
  }, []);

  const biometricTypeName = useMemo(
    () => getBiometricTypeName(capabilities.supportedTypes),
    [capabilities.supportedTypes]
  );

  return {
    // State
    capabilities,
    isBiometricEnabled,
    isLoading,
    
    // Computed
    biometricTypeName,
    canUseBiometrics: capabilities.isAvailable,
    
    // Actions
    enableBiometric,
    disableBiometric,
    authenticateWithBiometrics,
    checkBiometricCapabilities,
  };
};