import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

interface LeasingHeaderProps {
  onBackPress: () => void;
  title?: string;
}

export const LeasingHeader = ({
  onBackPress,
  title = "Detalle de inversión"
}: LeasingHeaderProps) => {
  return (
    <SafeAreaView className="bg-white">
      <View className="flex flex-row justify-between items-center px-4 py-3">
        <TouchableOpacity
          onPress={onBackPress}
          className="flex flex-row items-center gap-2"
          accessibilityRole="button"
          accessibilityLabel="Volver atrás"
        >
          <View className="bg-gray-100 rounded-full p-2">
            <Ionicons name="arrow-back" size={20} color="#000" />
          </View>
          <Text className="text-lg font-libre-regular">{title}</Text>
        </TouchableOpacity>

        <View className="flex flex-row gap-3">
          <TouchableOpacity
            className="bg-gray-100 rounded-full p-2"
            accessibilityRole="button"
            accessibilityLabel="Centro de ayuda"
          >
            <Ionicons name="help-circle-outline" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-100 rounded-full p-2"
            accessibilityRole="button"
            accessibilityLabel="Notificaciones"
          >
            <Ionicons name="notifications-outline" size={20} color="#000" />
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-100 rounded-full p-2"
            accessibilityRole="button"
            accessibilityLabel="Perfil de usuario"
          >
            <Ionicons name="person-outline" size={20} color="#000" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}; 