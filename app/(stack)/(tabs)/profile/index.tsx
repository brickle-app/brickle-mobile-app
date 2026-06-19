import Constants from "expo-constants";
import { View, ScrollView, Text } from "react-native";
import React from "react";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import {
  UserHeader,
  UserWarning,
  AccountLinks,
  SupportLinks,
} from "@/src/components/user";
import { useRouter } from "expo-router";
import { authStore } from "@/src/store/auth.store";
import { BrickleUser } from "@/src/types/user.types";

const ProfileScreen = () => {
  const router = useRouter();
  const user = authStore((state) => state.user);
  const logout = authStore((state) => state.logout);
  const currentYear = new Date().getFullYear();
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  // Mock data for demonstration purposes

  // Mock logout function
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <View className="flex-1">
      <BackGroundGradient />

      <ScrollView
        className="flex-1 px-3"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* User Profile Header */}
        <View className="mb-4">
          <UserHeader
            user={user as BrickleUser}
          />
        </View>


        {/* Warning if profile is incomplete */}
        {!user?.isFullProfileComplete && (
          <View className="mb-6">
            <UserWarning
              warningMessage="Completa tu perfil"
              linkText="Para usar todas las funciones de la app"
            />
          </View>
        )}

        {/* Account Links Section */}
        <View className="mb-6">
          <AccountLinks title="Mi cuenta" />
        </View>

        {/* Support Links Section */}
        <View className="mb-6">
          <SupportLinks title="Soporte" onLogout={handleLogout} />
        </View>

        {/* Footer text */}
        <View className="items-center mt-auto pt-4">
          <Text className="text-neutral-400 text-sm">
            ©{currentYear} Brickle. Todos los derechos reservados
          </Text>
          <Text className="text-neutral-400 text-sm mt-1">Brickle v{appVersion}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
