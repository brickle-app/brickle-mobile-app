import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Card } from '@/src/components/ui/card/Card';
import { MaterialIcons } from '@expo/vector-icons';
import { InfoCard } from '@/src/components/wallet/InfoCard';
import InfoIcon from "@/assets/icons/SVG/Info.svg"
import { Colors } from '@/assets/Colors';
import { FormField } from '@/src/components/ui/input';
import { useRechargeForm } from '@/src/hooks/useRechargeForm';
import { authStore } from '@/src/store/auth.store';
import { QuotationModal } from '../modals/QuotationModal';
import { ProcessPurchaseModal } from '../modals/ProcessPurchaseModal';
import { rechargeAccount } from '@/src/services/finance.service';
import { CreateRechargeDto } from '@/src/types/finance.types';
import { formatColombianPesos, unformatColombianPesos } from '@/src/utils/formatCurrency';
import { PaymentDetailsModal } from '../modals/PaymentDetailsModal';
import { TransactionConfirmationModal } from '../modals/TransactionConfirmationModal';

/**
 * Formulario para recargar dinero
 */
interface RechargeFormProps {
  onNavigateToMovements?: () => void;
}

export const RechargeForm = ({ onNavigateToMovements }: RechargeFormProps) => {
  const {
    formData,
    handleChange,
    handleBlur,
    isFormValid,
    isLoading,
    submitError,
    errors,
    quote,
    setQuote,
    handleBuyAsset,
    onramp,
    setOnramp,
    resetForm,
  } = useRechargeForm();
  const { user } = authStore();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  const handleAmountChange = (value: string) => {
    const unformatted = unformatColombianPesos(value);
    handleChange('amount', unformatted);
  };

  const handleConfirmTransaction = async (paymentProofUrl: string, amount: string) => {
    if (!user?.id || !user?.email) return;

    try {

      // Create recharge request
      const rechargeData: CreateRechargeDto = {
        userId: user.id,
        amount: parseFloat(amount),
        receipt: paymentProofUrl,
        reference: "Recarga"
      };

      const rechargeResponse = await rechargeAccount(user.email, rechargeData);

      if (rechargeResponse) {
        setShowPaymentModal(false);
        setShowConfirmationModal(true);
      } else {
        Alert.alert('Error', 'No se pudo procesar la recarga. Inténtalo de nuevo.');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al procesar la transacción. Inténtalo de nuevo.');
      console.error('Transaction error:', error);
    }
  };

  const handleTransactionComplete = () => {
    // Reset form values
    resetForm();

    // Close confirmation modal
    setShowConfirmationModal(false);
  };

  return (
    <Card className="mb-6 p-4" style={{ backgroundColor: 'transparent' }}>
      <Text className="text-xl text-blue-primary font-libre-bold mb-4">Recargar</Text>
      <View className="bg-white rounded-lg p-4 mb-4">
        <View className="mb-6">
          <FormField
            width='w-full'
            label="Ingresa el monto"
            description="El monto mínimo de recarga es de $100,000"
            placeholder="0.00"
            value={formatColombianPesos(formData.amount)}
            onChangeText={handleAmountChange}
            onBlur={() => handleBlur('amount')}
            icon={<MaterialIcons name="attach-money" size={24} color="#666" />}
            error={errors.amount}
            keyboardType="numeric"
            containerClassName='w-full'
          />
        </View>

        {submitError && (
          <View className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-red-600 text-sm">{submitError}</Text>
          </View>
        )}

        <TouchableOpacity
          className={`py-3 rounded-full ${isFormValid() && !isLoading
            ? 'bg-green-primary'
            : 'bg-gray-300'
            }`}
          onPress={() => setShowPaymentModal(true)}
          disabled={!isFormValid() || isLoading}
        >
          <Text className={`text-center font-libre-bold ${isFormValid() && !isLoading
            ? 'text-blue-primary'
            : 'text-gray-500'
            }`}>
            {isLoading ? 'Procesando...' : 'Recargar ahora'}
          </Text>
        </TouchableOpacity>
      </View>

      <InfoCard
        text="Tu carga de dinero se verá reflejada en tu saldo en 1 hora apróximadamente"
        icon={<InfoIcon color={Colors.orangePrimary} width={24} height={24} />}
      />

      <QuotationModal
        quote={quote}
        setQuote={setQuote}
        isLoading={isLoading}
        handleBuyAsset={handleBuyAsset}
      />
      <ProcessPurchaseModal onramp={onramp} setOnramp={setOnramp} />

      <PaymentDetailsModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={formData.amount}
        onConfirmTransaction={handleConfirmTransaction}
      />

      <TransactionConfirmationModal
        visible={showConfirmationModal}
        onClose={handleTransactionComplete}
        onNavigateToMovements={onNavigateToMovements}
      />
    </Card>
  );
}; 