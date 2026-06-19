import { Colors } from "@/assets/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Modal, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { Text } from "react-native";
import { CountdownTimer } from "../..";
import { Quote } from "../interfaces/RechargeModule";

export const QuotationModal = ({
  quote,
  setQuote,
  isLoading,
  handleBuyAsset
}: {
  quote: Quote | null,
  setQuote: (quote: Quote | null) => void,
  isLoading: boolean,
  handleBuyAsset: () => void
}) => {

  return (
    <Modal
      animationType="fade"
      visible={!!quote}
      onRequestClose={() => setQuote(null)}
      transparent={true}
    >
      {/* Semi-transparent background */}
      <View className={`flex-1 justify-center gap-10 items-center bg-violet-primary/60`}>
        {/* Modal Content */}

        <View className="flex flex-col gap-4 m-5  rounded-xl p-8 items-center  max-w-[90%] bg-white">
          <Ionicons
            name="checkmark-circle-outline"
            size={80}
            color={Colors.bluePrimary}
          />
          <Text className="text-blue-primary font-libre-bold text-3xl">
            Cotización exitosa
          </Text>
          <Text className="text-text-primary font-libre-bold text-base">
            Tu cotización se ha realizado correctamente
          </Text>

          <View className="flex flex-row gap-4">
            {quote?.expiration && (
              <View className="flex flex-row items-center gap-2">
                <Ionicons name="time-outline" size={20} color={Colors.bluePrimary} />
                <CountdownTimer
                  expirationDate={new Date(quote.expiration)}
                  onExpire={() => setQuote(null)}
                  className="text-blue-primary font-libre-bold text-base"
                />
              </View>
            )}
          </View>

          <View className="w-full bg-white rounded-xl p-6 space-y-4">
            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-libre-regular">Monto a pagar:</Text>
              <Text className="text-blue-primary font-libre-bold">
                ${Number(quote?.fromAmount).toLocaleString('es-CO')} {quote?.fromCurrency}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-libre-regular">Recibirás:</Text>
              <Text className="text-blue-primary font-libre-bold">
                {Number(quote?.toAmount).toFixed(4)} {quote?.toCurrency}
              </Text>
            </View>

            <View className="flex-row justify-between items-center">
              <Text className="text-gray-600 font-libre-regular">Tasa de cambio:</Text>
              <Text className="text-blue-primary font-libre-bold">
                1 {quote?.toCurrency} = ${Number(quote?.rate).toLocaleString('es-CO')} {quote?.fromCurrency}
              </Text>
            </View>

            <View className="space-y-2">
              <Text className="text-gray-600 font-libre-regular">Comisiones:</Text>
              {quote?.fees.map((fee: { amount: string; currency: string; type: string }, index: number) => (
                <View key={index} className="flex-row justify-between items-center pl-4">
                  <Text className="text-gray-500">
                    {fee.type === 'processingFee' && 'Procesamiento'}
                    {fee.type === 'networkFee' && 'Red'}
                    {fee.type === 'markupFee' && 'Markup'}:
                  </Text>
                  <Text className="text-blue-primary">
                    ${Number(fee.amount).toLocaleString('es-CO')} {fee.currency}
                  </Text>
                </View>
              ))}
            </View>


          </View>
          <View className="flex flex-row gap-4 w-full mt-4">
            <TouchableOpacity className="py-3 w-1/2 rounded-full border  border-green-primary" onPress={() => setQuote(null)}>
              <Text className="text-blue-primary font-libre-bold text-center">
                Cerrar
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className={`py-3 w-1/2 rounded-full ${isLoading ? 'bg-gray-300' : 'bg-green-primary'}`}
              disabled={isLoading}
              onPress={handleBuyAsset}
            >
              <Text className="text-blue-primary font-libre-bold text-center">
                {isLoading ? 'Procesando...' : 'Confirmar compra'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
};