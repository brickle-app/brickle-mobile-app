import { TouchableOpacity } from "react-native";

import { Colors } from "@/assets/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Modal } from "react-native";
import InfoIcon from "@/assets/icons/SVG/Info.svg"
import { router } from "expo-router";

export const ProcessPurchaseModal = ({ onramp, setOnramp }: { onramp: any, setOnramp: (onramp: any) => void }) => {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={!!onramp}
      onRequestClose={() => setOnramp(null)}
    >
      <View className="flex-1 justify-center items-center bg-green-primary/60">
        <View className="bg-white p-6 rounded-2xl w-11/12 max-w-md">
          <View className="items-center mb-6">
            <Ionicons name="time-outline" size={64} color={Colors.gray} />
            <Text className="text-xl font-libre-bold text-blue-primary mt-4">Procesando tu compra</Text>
          </View>

          <View className="space-y-4 mb-6">
            <View className="bg-gray-50 p-4 rounded-lg">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">ID de Transacción:</Text>
                <Text className="text-blue-primary font-libre-regular">{onramp?.metadata?.buyResponse?.transaction?.transactionId?.slice(0, 8)}...</Text>
              </View>

              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Monto:</Text>
                <Text className="text-blue-primary font-libre-regular">
                  ${Number(onramp?.metadata?.buyResponse?.transaction?.fromAmount).toLocaleString('es-CO')} {onramp?.metadata?.buyResponse?.transaction?.fromCurrency}
                </Text>
              </View>

              <View className="flex-row justify-between">
                <Text className="text-gray-600">Recibirás:</Text>
                <Text className="text-blue-primary font-libre-regular">
                  {Number(onramp?.metadata?.buyResponse?.transaction?.toAmount).toLocaleString('es-CO')} {onramp?.metadata?.buyResponse?.transaction?.toCurrency}
                </Text>
              </View>
            </View>

            <View className="bg-blue-50 p-4 rounded-lg">
              <View className="flex-row items-center mb-2">
                <InfoIcon width={20} height={20} fill={Colors.bluePrimary} />
                <Text className="text-blue-primary font-libre-regular ml-2">Información importante</Text>
              </View>
              <Text className="text-gray-600">
                La transacción está siendo procesada. Recibirás una notificación cuando los fondos estén disponibles en tu cuenta.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="bg-green-primary py-3 rounded-full"
            onPress={() => {
              setOnramp(null);
              router.push({
                pathname: "/webview",
                params: { url: onramp?.metadata?.buyResponse?.checkoutUrl },
              });
            }}
          >
            <Text className="text-blue-primary font-libre-bold text-center">Ir al portal de pagos</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  )
};