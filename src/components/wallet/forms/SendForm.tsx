import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Card } from '@/src/components/ui/card/Card';
import { BankAccountForm } from './BankAccountForm';
import { BrickleContactForm } from './BrickleContactForm';
import { useBankAccountForm } from '@/src/hooks/useBankAccountForm';
import { useContactForm } from '@/src/hooks/useContactForm';
import { transferToContact, ContactTransferData } from '@/src/services/transaction.service';
import { TransactionModal, TransactionData } from '@/src/components/wallet/TransactionModal';
import OperationStatusModal from '@/src/components/wallet/OperationStatusModal';
// import { SelectBottomSheet } from '@/src/components/ui/input';

type TransactionType = 'bancaria' | 'contacto';

export const SendForm = ({ setIsModalVisible }: { setIsModalVisible: (visible: boolean) => void }) => {
  const [typeOfTransaction, setTypeOfTransaction] = useState<TransactionType>('contacto');
  const [isLoading, setIsLoading] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const bankAccountForm = useBankAccountForm();
  const contactForm = useContactForm();

  const handleSend = () => {
    if (typeOfTransaction === 'bancaria') {
      if (bankAccountForm.validateForm()) {
        console.log('Enviando transferencia bancaria:', bankAccountForm.formData);
        setIsModalVisible(true);
      } else {
        Alert.alert('Error', 'Por favor, complete todos los campos correctamente');
      }
    } else {
      if (contactForm.validateForm()) {
        const { selectedContact, amount } = contactForm.formData;

        if (!selectedContact) {
          Alert.alert('Error', 'Por favor, seleccione un contacto');
          return;
        }

        // Prepare transaction data
        const txData: TransactionData = {
          destinationType: 'Contacto Brickle',
          amount: amount,
          recipientName: `${selectedContact.firstName} ${selectedContact.lastName}`,
          recipientIdentifier: selectedContact.walletAddress
        };

        setTransactionData(txData);
        // Use setTimeout to ensure state update completes before showing modal
        setTimeout(() => {
          setShowTransactionModal(true);
        }, 0);
      } else {
        Alert.alert('Error', 'Por favor, seleccione un contacto y especifique el monto');
      }
    }
  };

  const handleConfirmTransfer = async () => {
    const { selectedContact, amount } = contactForm.formData;

    if (!selectedContact) return;

    setIsLoading(true);
    try {
      const transferData: ContactTransferData = {
        recipientAddress: selectedContact.walletAddress,
        amount: amount
      };

      const result = await transferToContact(transferData);

      if (result.success) {
        setShowTransactionModal(false);
        setTransactionData(null); // Clear transaction data
        setShowConfirmationModal(true);
      } else {
        Alert.alert('Error en transferencia', result.error || 'Error desconocido');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar la transferencia');
      console.error('Transfer error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mb-6 py-4 bg-transparent" style={{ backgroundColor: 'transparent' }}>
      <Text className="text-xl text-blue-primary font-libre-bold mb-4">Enviar</Text>

      <View className="bg-white rounded-lg p-4">
        {/*<SelectBottomSheet
          label="Tipo de destino"
          value={typeOfTransaction}
          options={[
            { label: "Contacto Brickle", value: "contacto" },
            { label: "Cuenta bancaria", value: "bancaria" },
          ]}
          onValueChange={(value) => handleTransactionTypeChange(value as TransactionType)}
        />*/}

        {typeOfTransaction === 'bancaria' && (
          <BankAccountForm
            formData={bankAccountForm.formData}
            onFieldChange={bankAccountForm.handleChange}
            onFieldBlur={bankAccountForm.handleBlur}
            touched={bankAccountForm.touched}
            errors={bankAccountForm.errors}
          />
        )}

        {typeOfTransaction === 'contacto' && <BrickleContactForm contactForm={contactForm} />}

        <TouchableOpacity
          className={`py-3 rounded-full ${(typeOfTransaction === 'bancaria' && Object.keys(bankAccountForm.errors).length > 0) ||
            (typeOfTransaction === 'contacto' && Object.keys(contactForm.errors).length > 0)
            ? 'bg-gray-300'
            : 'bg-green-primary'
            }`}
          onPress={handleSend}
        >
          <Text className="text-blue-primary text-center font-libre-bold">
            Continuar
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transaction Confirmation Modal */}
      {transactionData && showTransactionModal && (
        <TransactionModal
          isVisible={showTransactionModal}
          onClose={() => {
            setShowTransactionModal(false);
            setTransactionData(null); // Clear transaction data when closing
          }}
          nextStep={handleConfirmTransfer}
          transactionData={transactionData}
          isLoading={isLoading}
        />
      )}

      {/* Success Status Modal */}
      <OperationStatusModal
        isVisible={showConfirmationModal}
        onClose={() => {
          setShowConfirmationModal(false);
          setIsModalVisible(true);
          contactForm?.resetForm()
        }}
        title="¡Dinero enviado exitosamente!"
        description="La transferencia se ha completado correctamente"
        type="success"
      />
    </Card>
  );
}; 