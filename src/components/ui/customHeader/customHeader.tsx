import React from "react";
import { View, Text, TouchableOpacity, Image, Platform, StyleSheet } from "react-native";
import UserIcon from "@/assets/icons/SVG/User.svg";
import SearchIcon from "@/assets/icons/SVG/Buscar.svg";
import BellIcon from "@/assets/icons/SVG/Notificaciones.svg";
import HelpIcon from "@/assets/icons/SVG/Ayuda.svg";
import { Colors } from "@/assets/Colors";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Href } from "expo-router";
import { authStore } from "@/src/store/auth.store";
import { searchStore } from "@/src/store/search.store";
import { notificationsStore } from "@/src/store/notifications.store";

interface CustomHeaderProps {
  userName?: string;
  variant?: "profile" | "dashboard";
  title?: string;
  backDestination?: Href;
}

const ICON_CONTAINER_SIZE = 46;

function CustomHeader({
  userName = "Usuario",
  variant = "dashboard",
  title,
  backDestination,
}: CustomHeaderProps) {
  const router = useRouter();
  const user = authStore((state) => state.user);
  const isFullProfileComplete = authStore(
    (state) => state.user?.isFullProfileComplete
  );
  const openSearchModal = searchStore((state) => state.openModal);
  const { unreadCount } = notificationsStore();

  const handleBackPress = () => {
    if (backDestination) {
      router.push(backDestination);
    } else {
      router.back();
    }
  };

  const handleSearchPress = () => {
    openSearchModal();
  };

  const handleHelpPress = () => {
    router.push("/(stack)/support/help");
  };

  const handleNotificationsPress = () => {
    router.push("/(stack)/(tabs)/notifications");
  };

  const headerContent = (
    <>
      {variant === "dashboard" && (
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.push("/profile")}
            style={{ width: ICON_CONTAINER_SIZE, height: ICON_CONTAINER_SIZE, backgroundColor: Colors.bluePrimary }}
            className="relative rounded-full items-center justify-center"
          >
            {user?.profilePictureUrl ? (
              <Image source={{ uri: user.profilePictureUrl }} className="rounded-full w-full h-full" resizeMode="cover" />
            ) : (
              <UserIcon width={28} height={28} color={Colors.greenPrimary} />
            )}
            {!isFullProfileComplete && !user?.isProfileUnderReview && (
              <View className="absolute top-0 right-1 bg-orange-primary rounded-full w-2 h-2" />
            )}
          </TouchableOpacity>
          <Text className="text-xl font-libre-bold text-text-primary">Hola {user?.firstName}</Text>
        </View>
      )}

      {variant === "profile" && (
        <View className="flex gap-4 items-center flex-row">
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons
              name="arrow-back-circle"
              size={28}
              color={Colors.bluePrimary}
            />
          </TouchableOpacity>
          <Text className="text-xl font-libre-bold text-text-primary">
            {title}
          </Text>
        </View>
      )}

      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={handleHelpPress}
          className="rounded-full items-center justify-center"
          style={{ width: ICON_CONTAINER_SIZE, height: ICON_CONTAINER_SIZE, backgroundColor: Colors.greenPrimary }}
          accessibilityLabel="Help"
        >
          <HelpIcon width={32} height={32} color={Colors.bluePrimary} />
        </TouchableOpacity>
        {variant === "dashboard" && (
          <TouchableOpacity
            onPress={handleSearchPress}
            className="rounded-full items-center justify-center"
            style={{ width: ICON_CONTAINER_SIZE, height: ICON_CONTAINER_SIZE, backgroundColor: Colors.greenPrimary }}
            accessibilityLabel="Search"
          >
            <SearchIcon width={32} height={32} color={Colors.bluePrimary} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={handleNotificationsPress}
          className="rounded-full items-center justify-center"
          style={{ width: ICON_CONTAINER_SIZE, height: ICON_CONTAINER_SIZE, backgroundColor: Colors.greenPrimary }}
          accessibilityLabel="Notifications"
        >
          <BellIcon width={32} height={32} color={Colors.bluePrimary} />
          {unreadCount > 0 && (
            <View className="absolute -top-1 -right-1 bg-orange-primary rounded-full min-w-[18px] h-[18px] items-center justify-center">
              <Text className="text-[10px] font-libre-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </>
  );

  if (variant === "dashboard") {
    return (
      <View style={[styles.container, styles.dashboardHeaderWrap, { backgroundColor: "#E8F5E9" }]}>
        <View style={styles.dashboardHeader}>
          {headerContent}
        </View>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, styles.profileHeader, { backgroundColor: "#E8F5E9" }]}
      className="flex-row items-center justify-between p-4"
    >
      {headerContent}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: { marginTop: 48 },
      android: { marginTop: 0 },
    }),
  },
  dashboardHeaderWrap: {
    flexDirection: "row",
    alignItems: "center",
  },
  dashboardHeader: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});

export default CustomHeader;
