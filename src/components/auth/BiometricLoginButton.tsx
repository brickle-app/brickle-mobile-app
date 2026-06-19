import React from 'react';
import { TouchableOpacity, Text, View, Alert, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/assets/Colors';
import { useBiometricAuth } from '@/src/hooks/auth/useBiometricAuth';
import { authStore } from '@/src/store/auth.store';
import { BrickleService } from '@/src/services/brickle.service';
import { useRouter } from 'expo-router';

interface BiometricLoginButtonProps {
  onSuccess?: () => void;
  className?: string;
}

export const BiometricLoginButton: React.FC<BiometricLoginButtonProps> = ({
  onSuccess,
  className = '',
}) => {
  const router = useRouter();
  const { setAccessToken, setUser, setUserEmail, setIsAuthenticated } = authStore();
  const {
    canUseBiometrics,
    isBiometricEnabled,
    biometricTypeName,
    authenticateWithBiometrics,
    isLoading
  } = useBiometricAuth();

  const handleBiometricLogin = async () => {
    try {
      const credentials = await authenticateWithBiometrics();

      if (credentials) {
        // Directly authenticate user with stored credentials (bypass OTP)
        setAccessToken(credentials.accessToken);
        setUserEmail(credentials.email);
        setIsAuthenticated(true);

        // Fetch and set user data
        const user = await BrickleService.getUserByEmail(credentials.email);

        if (user) {
          setUser(user);
          onSuccess?.();

          // Navigate directly to dashboard
          router.push('/dashboard');
          console.log('✅ Biometric login successful - bypassed OTP');
        } else {
          // User not found, redirect to registration
          router.push('/register');
        }
      } else {
        console.log('❌ Biometric authentication failed or cancelled');
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error durante la autenticación biométrica'
      );
    }
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

  // Don't render if biometrics aren't available or enabled
  if (!canUseBiometrics || !isBiometricEnabled || isLoading) {
    return null;
  }

  return (
    <TouchableOpacity
      onPress={handleBiometricLogin}
      className={`
        flex items-center justify-center rounded-lg
        px-6 py-4 min-h-[56px] elevation-md
        ${className}
      `}
      activeOpacity={0.8}
      style={styles.container}
    >
      <View className='flex-col justify-center items-center'>
        <Ionicons
          name={getBiometricIcon()}
          size={32}
          color={Colors.bluePrimary}
        />
        <Text className="text-blue-primary font-libre-bold text-base mt-2">
          Iniciar con {biometricTypeName}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F6F6F6',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',

    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  }
})