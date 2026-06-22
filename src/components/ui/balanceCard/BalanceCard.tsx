import React, { useState } from "react";
import { Text, TouchableOpacity, View, Alert } from "react-native";
import { Card } from "../card/Card";
import { formatCurrency } from "@/src/utils/formatCurrency";
import { truncateAddress } from "@/src/utils/truncateAddress";
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Colors } from '@/assets/Colors';

interface BalanceCardProps {
  title: string;
  balance: string | number;
  walletAddress?: string;
}

/**
 * Componente para mostrar el saldo disponible en la wallet
 */
export const BalanceCard = ({ title, balance, walletAddress }: BalanceCardProps) => {
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  const copyToClipboard = async () => {
    if (!walletAddress) return;

    try {
      await Clipboard.setStringAsync(walletAddress);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch {
      Alert.alert('Error', 'No se pudo copiar la dirección');
    }
  };

  return (
    <Card variant="dark" className="mb-4 bg-green-primary h-32">
      <Text className="text-blue-primary text-sm mb-1 font-libre-medium">{title}</Text>
      <Text className="text-blue-primary text-2xl font-libre-bold">{formatCurrency(parseFloat(balance.toString()))} cop</Text>
      {walletAddress && (
        <View className="flex-row items-center justify-between mt-4">
          <Text className="text-blue-primary text-xs font-libre-medium flex-1">Billetera: {truncateAddress(walletAddress)}</Text>
          <TouchableOpacity onPress={copyToClipboard} className="ml-2 p-1">
            <MaterialIcons
              name="content-copy"
              size={16}
              color={Colors.bluePrimary}
            />
          </TouchableOpacity>
        </View>
      )}

      {showCopyFeedback && (
        <View className="absolute bottom-11 right-2 bg-blue-primary px-3 py-1 rounded-full">
          <Text className="text-white text-xs font-libre-medium">¡Copiado!</Text>
        </View>
      )}
    </Card>
  );
};
