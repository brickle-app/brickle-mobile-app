import React, { useState } from "react";
import { Modal, View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { UserLeasing } from "@/src/types/portfolio.types";
import useChangeStatusBarColor from "@/src/hooks/ui/useChangeStatusBarColor";
import MontoIcon from "@/assets/icons/SVG/Monto.svg";
import InfoIcon from "@/assets/icons/SVG/Info.svg";
import { Button } from "@/src/components/ui/button/Button";
import { InfoCard } from "@/src/components/wallet/InfoCard";

interface LeasingPaymentModalProps {
  isVisible: boolean;
  leasing: UserLeasing | null;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

type PaymentStep = 'confirm' | 'processing' | 'success' | 'error';

export const LeasingPaymentModal: React.FC<LeasingPaymentModalProps> = ({
  isVisible,
  leasing,
  onClose,
  onPaymentSuccess,
}) => {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('confirm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useChangeStatusBarColor({
    isVisible,
    color: Colors.violetPrimary,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const simulatePayment = async () => {
    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Simular llamada a API
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          // Simular 80% de éxito
          if (Math.random() > 0.2) {
            resolve(true);
          } else {
            reject(new Error('Error de conexión con el banco'));
          }
        }, 2000);
      });

      setPaymentStep('success');
      setTimeout(() => {
        onPaymentSuccess();
        handleClose();
      }, 2000);

    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Error procesando el pago');
      setPaymentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setPaymentStep('confirm');
    setErrorMessage('');
    setIsProcessing(false);
    onClose();
  };

  const handleRetry = () => {
    setPaymentStep('confirm');
    setErrorMessage('');
  };

  if (!leasing) return null;

  const renderConfirmationStep = () => (
    <View className="flex flex-col gap-4 m-5 bg-white rounded-xl p-8 items-center shadow-lg max-w-[95%]">
      <MontoIcon color={Colors.bluePrimary} width={46} height={46} />
      <Text className="text-blue-primary font-libre-bold text-xl text-center">
        Confirmar pago de leasing
      </Text>

      <Text className="mb-4 text-center text-base leading-6 text-text-primary">
        Verifica los datos del pago
      </Text>

      <View className="w-full gap-3">
        <View className="flex flex-row justify-between">
          <Text className="text-text-primary font-libre-bold text-base">Activo:</Text>
          <Text className="text-text-primary text-base flex-1 text-right">
            {leasing.assetName}
          </Text>
        </View>

        <View className="flex flex-row justify-between">
          <Text className="text-text-primary font-libre-bold text-base">Monto:</Text>
          <Text className="text-text-primary text-base">
            {formatCurrency(leasing.monthlyPayment)}
          </Text>
        </View>

        <View className="flex flex-row justify-between">
          <Text className="text-text-primary font-libre-bold text-base">Fecha vencimiento:</Text>
          <Text className="text-text-primary text-base">
            {formatDate(leasing.nextPaymentDate)}
          </Text>
        </View>

        <View className="flex flex-row justify-between">
          <Text className="text-text-primary font-libre-bold text-base">Progreso:</Text>
          <Text className="text-text-primary text-base">
            {leasing.paymentsCompleted + 1}/{leasing.totalPayments} pagos
          </Text>
        </View>
      </View>

      <InfoCard
        text="El pago se procesará inmediatamente y se actualizará tu estado de leasing"
        icon={<InfoIcon color={Colors.orangePrimary} width={24} height={24} />}
      />

      <Button
        label="Pagar ahora"
        onPress={simulatePayment}
        width="w-[250px]"
        textClassName="!text-base"
        disabled={isProcessing}
      />

      <Button
        label="Cancelar"
        variant="secondary"
        onPress={handleClose}
        width="w-[250px]"
        textClassName="!text-base"
      />
    </View>
  );

  const renderProcessingStep = () => (
    <View className="flex flex-col gap-4 m-5 bg-white rounded-xl p-8 items-center shadow-lg max-w-[95%]">
      <Ionicons
        name="card"
        size={46}
        color={Colors.bluePrimary}
      />
      <Text className="text-blue-primary font-libre-bold text-xl text-center">
        Procesando pago...
      </Text>
      <Text className="text-center text-base leading-6 text-text-primary">
        Por favor espera mientras procesamos tu pago
      </Text>
      <View className="w-6 h-6 border-2 border-blue-primary border-t-transparent rounded-full animate-spin" />
    </View>
  );

  const renderSuccessStep = () => (
    <View className="flex flex-col gap-4 m-5 bg-white rounded-xl p-8 items-center shadow-lg max-w-[95%]">
      <Ionicons
        name="checkmark-circle-outline"
        size={80}
        color={Colors.greenPrimary}
      />
      <Text className="text-green-600 font-libre-bold text-2xl text-center">
        ¡Pago exitoso!
      </Text>
      <Text className="text-center text-base leading-6 text-text-primary">
        Tu pago de {formatCurrency(leasing.monthlyPayment)} ha sido procesado correctamente
      </Text>
    </View>
  );

  const renderErrorStep = () => (
    <View className="flex flex-col gap-4 m-5 bg-white rounded-xl p-8 items-center shadow-lg max-w-[95%]">
      <Ionicons
        name="close-circle-outline"
        size={80}
        color="#ef4444"
      />
      <Text className="text-red-600 font-libre-bold text-xl text-center">
        Error en el pago
      </Text>
      <Text className="text-center text-base leading-6 text-text-primary mb-4">
        {errorMessage}
      </Text>

      <Button
        label="Reintentar pago"
        onPress={handleRetry}
        width="w-[250px]"
        textClassName="!text-base"
      />

      <Button
        label="Cerrar"
        variant="secondary"
        onPress={handleClose}
        width="w-[250px]"
        textClassName="!text-base"
      />
    </View>
  );

  const renderStep = () => {
    switch (paymentStep) {
      case 'confirm':
        return renderConfirmationStep();
      case 'processing':
        return renderProcessingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderConfirmationStep();
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-center items-center bg-violet-primary/60">
        {renderStep()}
      </View>
    </Modal>
  );
}; 