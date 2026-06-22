import React, { useState, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, SafeAreaView, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/assets/Colors';
import { FormField, SelectBottomSheet } from '@/src/components/ui/input';
import { UserAccount } from '@/src/types/user-account';
import { authStore } from '@/src/store/auth.store';
import useChangeStatusBarColor from '@/src/hooks/ui/useChangeStatusBarColor';
import { createBankAccount } from '@/src/services/account.service';
import Tarjeta from "@/assets/icons/SVG/Tarjeta.svg";
import { COLOMBIAN_BANKS, ACCOUNT_TYPES } from '@/src/data/colombian-banks';

interface AddAccountModalProps {
  isVisible: boolean;
  onClose: () => void;
  onAccountAdded?: (account: UserAccount) => void;
}

export const AddAccountModal = ({
  isVisible,
  onClose,
  onAccountAdded,
}: AddAccountModalProps) => {
  const [formData, setFormData] = useState<UserAccount>({
    userId: '',
    bankName: '',
    accountType: 'ahorros',
    accountNumber: '',
    accountHolder: '',
    accountDocument: '',
    accountImage: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const { user } = authStore();
  const scrollViewRef = useRef<ScrollView>(null);

  useChangeStatusBarColor({ isVisible, color: Colors.violetPrimary });

  const handleInputChange = (field: keyof UserAccount, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    const requiredFields: (keyof UserAccount)[] = ['bankName', 'accountType', 'accountNumber', 'accountHolder', 'accountDocument'];

    for (const field of requiredFields) {
      if (!formData[field]) {
        Alert.alert('Error', `Por favor completa el campo ${field}`);
        return;
      }
    }

    if (!user?.email) {
      Alert.alert('Error', 'No se encontró información del usuario. Por favor inicia sesión nuevamente.');
      return;
    }

    setIsLoading(true);

    try {
      // Add userId from auth store
      const accountData: UserAccount = {
        ...formData,
        userId: user.id || '',
      };

      // Call the createBankAccount service
      const response = await createBankAccount(user.email, accountData);

      if (response) {
        console.log('Account created successfully:', response);
        onAccountAdded?.(accountData);

        // Reset form
        setFormData({
          userId: '',
          bankName: '',
          accountType: 'ahorros',
          accountNumber: '',
          accountHolder: '',
          accountDocument: '',
          accountImage: '',
        });

        onClose();
      } else {
        throw new Error('No response from server');
      }
    } catch (error) {
      console.error('Error adding account:', error);
      Alert.alert('Error', 'No se pudo agregar la cuenta. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      userId: '',
      bankName: '',
      accountType: 'ahorros',
      accountNumber: '',
      accountHolder: '',
      accountDocument: '',
      accountImage: '',
    });
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <SafeAreaView className="flex-1 justify-center items-center bg-violet-primary/80">
          <TouchableOpacity className='bg-primary-white self-end p-1 mx-5 rounded-full mb-4' onPress={handleClose}>
            <Ionicons name="close" size={16} color={Colors.violetPrimary} className='opacity-80' />
          </TouchableOpacity>

          <ScrollView
            ref={scrollViewRef}
            className="flex-1 w-full"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-white rounded-xl p-6 w-[90%] shadow-lg">
              {/* Header */}
              <View className="flex-col justify- items-center mb-6">
                <View className='mb-6'>
                  <Tarjeta width={37} height={27} color={Colors.bluePrimary} />
                </View>
                <Text className="text-xl font-libre-bold text-blue-primary text-center">
                  Agregar cuenta de banco
                </Text>
              </View>

              {/* Form Fields */}
              <View className="mx-3 flex flex-col" style={{ gap: 22 }}>
                <SelectBottomSheet
                  label="Nombre del banco"
                  placeholder="Selecciona el banco"
                  value={formData.bankName}
                  options={COLOMBIAN_BANKS}
                  onValueChange={(value) => handleInputChange('bankName', String(value))}
                  containerClassName="w-full"
                  searchable={true}
                />

                <SelectBottomSheet
                  label="Tipo de cuenta"
                  placeholder="Selecciona el tipo de cuenta"
                  value={formData.accountType}
                  options={ACCOUNT_TYPES}
                  onValueChange={(value) => handleInputChange('accountType', String(value))}
                  containerClassName="w-full"
                  searchable={false}
                />

                <FormField
                  width="w-full"
                  label="Número de cuenta"
                  placeholder="Ingresa el número de cuenta"
                  value={formData.accountNumber}
                  onChangeText={(value) => handleInputChange('accountNumber', value)}
                  containerClassName="w-full"
                  keyboardType="numeric"
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 160, animated: true });
                    }, 100);
                  }}
                />

                <FormField
                  width="w-full"
                  label="Titular de la cuenta"
                  placeholder="Nombre completo del titular"
                  value={formData.accountHolder}
                  onChangeText={(value) => handleInputChange('accountHolder', value)}
                  containerClassName="w-full"
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 240, animated: true });
                    }, 100);
                  }}
                />

                <FormField
                  width="w-full"
                  label="Documento del titular"
                  placeholder="Cédula o documento de identidad"
                  value={formData.accountDocument}
                  onChangeText={(value) => handleInputChange('accountDocument', value)}
                  containerClassName="w-full"
                  onFocus={() => {
                    setTimeout(() => {
                      scrollViewRef.current?.scrollTo({ y: 320, animated: true });
                    }, 100);
                  }}
                />
              </View>

              {/* Buttons */}
              <View className="flex-row space-x-3 mt-10 gap-4">
                <TouchableOpacity
                  onPress={handleClose}
                  className="flex-1 bg-gray-200 py-3 rounded-full w-1/2"
                >
                  <Text className="text-gray-700 text-center font-libre-bold">
                    Cancelar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isLoading}
                  className={`bg-primary py-3 rounded-full w-1/2 ${isLoading ? 'opacity-50' : ''}`}
                >
                  <Text className="text-blue-primary text-center font-libre-bold">
                    {isLoading ? "Guardando..." : "Agregar Cuenta"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};
