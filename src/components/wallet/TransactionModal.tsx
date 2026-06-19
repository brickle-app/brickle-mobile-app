import { Colors } from "@/assets/Colors"
import { Modal, Text, View } from "react-native"
import { Button } from "@/src/components/ui/button/Button"
import { InfoCard } from "@/src/components/wallet/InfoCard"
import MontoIcon from "@/assets/icons/SVG/Monto.svg"
import InfoIcon from "@/assets/icons/SVG/Info.svg"
import { formatColombianPesos } from "@/src/utils/formatCurrency"
import { truncateAddress } from "@/src/utils/truncateAddress"

export interface TransactionData {
  destinationType: string;
  amount: string;
  recipientName: string;
  recipientIdentifier: string;
}

interface TransactionModalProps {
  isVisible: boolean;
  onClose: () => void;
  nextStep: () => void;
  transactionData: TransactionData;
  isLoading?: boolean;
}

export const TransactionModal = ({ isVisible, onClose, nextStep, transactionData, isLoading = false }: TransactionModalProps) => {
  // Safety check for required properties
  if (!transactionData?.destinationType || !transactionData?.amount || !transactionData?.recipientName) {
    return null;
  }

  return <Modal
    animationType="fade"
    transparent={true}
    visible={isVisible}
    onRequestClose={onClose}
  >
    {/* Semi-transparent background */}
    <View className="flex-1 justify-center gap-10 items-center bg-violet-primary/80">
      {/* Modal Content */}

      <View className="flex flex-col gap-4 m-5 bg-white rounded-xl p-8 items-center shadow-lg max-w-[95%]">
        <MontoIcon color={Colors.bluePrimary} width={46} height={46} />
        <Text className="text-blue-primary font-libre-bold text-xl">
          Confirmar transacción
        </Text>

        <Text className="mb-4 text-center text-base leading-6 text-text-primary">
          Verifica los datos
        </Text>

        <View className="flex flex-col gap-4">
          <View className="flex flex-row gap-2">
            <Text className="text-text-primary font-libre-bold text-base">
              Destino seleccionado
            </Text>
            <Text className="text-text-primary font-libre-bold text-base">
              {transactionData.destinationType}
            </Text>
          </View>

          <View className="flex flex-row gap-2">
            <Text className="text-text-primary font-libre-bold text-base">
              Valor de transacción
            </Text>
            <Text className="text-text-primary font-libre-bold text-base">
              ${formatColombianPesos(transactionData.amount)}
            </Text>
          </View>

          <View className="flex flex-row gap-2">
            <Text className="text-text-primary font-libre-bold text-base">
              Destinatario
            </Text>
            <Text className="text-text-primary font-libre-bold text-base">
              {transactionData.recipientName}
            </Text>
          </View>

          <View className="flex flex-row gap-2">
            <Text className="text-text-primary font-libre-bold text-base">
              {transactionData.destinationType === 'Contacto Brickle' ? 'Wallet destino' : 'Cuenta destino'}
            </Text>
            <Text className="text-text-primary font-libre-bold text-base">
              {truncateAddress(transactionData.recipientIdentifier)}
            </Text>
          </View>
        </View>

        <InfoCard
          text={transactionData.destinationType === 'Contacto Brickle'
            ? "El dinero se verá reflejado inmediatamente en la wallet del destinatario"
            : "El dinero se verá reflejado entre 5 y 10 minutos, dependiendo del Banco de destino"}
          icon={<InfoIcon color={Colors.orangePrimary} width={24} height={24} />}
        />

        {/* Complete Profile Button */}
        <Button
          label={isLoading ? "Procesando..." : "Enviar dinero"}
          onPress={nextStep}
          width="w-[250px]"
          textClassName="!text-base"
          disabled={isLoading}
        />

        {/* Optional Close Button - Example using Button component */}
      </View>
    </View>
  </Modal>
};
