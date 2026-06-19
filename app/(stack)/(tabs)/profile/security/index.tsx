import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import { router } from "expo-router";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import { UserHeader } from "@/src/components/user";

import LockIcon from "@/assets/icons/SVG/Candado.svg";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { BrickleUser } from "@/src/types/user.types";
import { authStore } from "@/src/store/auth.store";
import { BiometricSetup } from "@/src/components/auth/BiometricSetup";

interface SecurityOptionProps {
  title: string;
  isToggle: boolean;
  isEnabled?: boolean;
  onToggle?: (value: boolean) => void;
  onPress?: () => void;
}

const SecurityOption = ({
  title,
  isToggle,
  isEnabled = false,
  onToggle,
  onPress,
}: SecurityOptionProps) => {
  return (
    <View className="bg-white p-4 mb-3 rounded-lg shadow-sm">
      <View className="flex-row justify-between items-center mb-2">
        <View className="flex-row items-center gap-2">
          <View className="border-gray-200 border rounded-xl p-2">
            <LockIcon height={32} width={32} />
          </View>

          <Text className="text-dark-blue font-libre-regular">{title}</Text>
        </View>

        <TouchableOpacity onPress={onPress}>
          <Ionicons
            name="arrow-forward-circle"
            size={28}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SecurityScreen = () => {
  // State for toggles
  const user = authStore((state) => state.user);
  const [isEmailNotificationEnabled, setIsEmailNotificationEnabled] =
    useState(true);

  // Handlers

  return (
    <View className="flex-1">
      <BackGroundGradient />

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="mb-4">
          <UserHeader
            user={user as BrickleUser}
          />
        </View>
        <View className="mb-4">
          <Text className="text-dark-blue font-libre-bold text-xl mb-4">
            Seguridad
          </Text>

          {/* Biometric Authentication Setup */}
          <BiometricSetup
            className="mb-4"
            onSetupComplete={(enabled) => {
              console.log('Biometric setup completed:', enabled);
            }}
          />

          <SecurityOption
            title="Crea tu PIN"
            isToggle={false}
            onPress={() => router.push('/settings/pin-setup')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default SecurityScreen;
