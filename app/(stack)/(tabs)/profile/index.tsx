import Constants from "expo-constants";
import { View, ScrollView, Text } from "react-native";
import React, { useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
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
import { shouldShowCompleteProfileWarning as getShouldShowCompleteProfileWarning } from "@/src/utils/profileVerification";
import { BrickleService } from "@/src/services/brickle.service";
import { refreshAuthenticatedUser } from "@/src/services/refresh-authenticated-user";

const ProfileScreen = () => {
  const router = useRouter();
  const user = authStore((state) => state.user);
  const setUser = authStore((state) => state.setUser);
  const logout = authStore((state) => state.logout);
  const shouldShowCompleteProfileWarning = getShouldShowCompleteProfileWarning(user);
  const currentYear = new Date().getFullYear();
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  // Mock data for demonstration purposes

  useFocusEffect(
    useCallback(() => {
      void refreshAuthenticatedUser({
        email: user?.email,
        getUserByEmail: BrickleService.getUserByEmail,
        setUser,
      });
    }, [setUser, user?.email])
  );

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
        {shouldShowCompleteProfileWarning && (
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
