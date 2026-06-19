import React, { ReactNode, cloneElement, isValidElement } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";

const MENU_ICON_SIZE = 32;

interface LinkItemProps {
  icon: ReactNode;
  label: string;
  route: string;
  isLast?: boolean;
  /** Tinte para SVG con `fill="currentColor"` (react-native-svg). */
  iconColor?: string;
}

const LinkItem = ({
  icon,
  label,
  route,
  isLast = false,
  iconColor = Colors.bluePrimary,
}: LinkItemProps) => {
  const iconWithTint =
    isValidElement<{ color?: string; width?: number; height?: number }>(icon)
      ? cloneElement(icon, {
          color: iconColor,
          width: MENU_ICON_SIZE,
          height: MENU_ICON_SIZE,
        })
      : icon;

  return (
    <Link href={route as any} asChild>
      <TouchableOpacity>
        <View className={`p-4 flex-row items-center justify-between`}>
          <View className="flex-row items-center">
            <View className="mr-3 items-center justify-center border border-gray-200 rounded-xl p-1.5">
              {iconWithTint}
            </View>
            <Text className="text-gray-800 text-base">{label}</Text>
          </View>
          <Ionicons
            name="chevron-forward-circle"
            size={24}
            color={Colors.textPrimary}
          />
        </View>
      </TouchableOpacity>
    </Link>
  );
};

export default LinkItem;
