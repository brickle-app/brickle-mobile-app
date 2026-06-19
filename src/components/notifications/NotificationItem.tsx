import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/assets/Colors";
import { NotificationItemProps, NotificationStatus } from "@/src/types/notifications.types";
import { formatNotificationTime } from "@/src/utils/dateUtils";

// Icons
import MontoIcon from "@/assets/icons/SVG/Monto.svg";
import UserIcon from "@/assets/icons/SVG/User.svg";
import { Ionicons } from "@expo/vector-icons";

export const NotificationItem = ({ notification, onPress, onMarkAsRead }: NotificationItemProps) => {
  const isUnread = notification.status === NotificationStatus.UNREAD;

  const getIcon = () => {
    switch (notification.icon) {
      case "portfolio":
        return <UserIcon width={24} height={24} color={Colors.bluePrimary} />;
      case "investment":
        return <Ionicons name="trending-up" size={24} color={Colors.bluePrimary} />;
      case "money":
        return <MontoIcon width={24} height={24} color={Colors.bluePrimary} />;
      default:
        return <Ionicons name="notifications" size={24} color={Colors.bluePrimary} />;
    }
  };

  return (
    <TouchableOpacity
      onPress={() => onPress(notification)}
      className={`flex-row items-center p-4 ${isUnread ? 'bg-blue-50' : 'bg-white'}`}
    >
      {/* Icon Container */}
      <View className="w-12 h-12 bg-green-secondary rounded-full items-center justify-center mr-3">
        {getIcon()}
      </View>

      {/* Content */}
      <View className="flex-1">
        <Text className={`text-base ${isUnread ? 'font-libre-bold' : 'font-libre-regular'} text-text-primary`}>
          {notification.title}
        </Text>
        <Text className="text-sm text-gray-600 mt-1" numberOfLines={1}>
          {notification.message}
        </Text>
      </View>

      {/* Time and Status */}
      <View className="items-end">
        <Text className="text-xs text-gray-500 mb-1">
          {formatNotificationTime(new Date(notification.createdAt))}
        </Text>
        {isUnread && (
          <View className="w-2 h-2 bg-green-primary rounded-full" />
        )}
      </View>
    </TouchableOpacity>
  );
}
