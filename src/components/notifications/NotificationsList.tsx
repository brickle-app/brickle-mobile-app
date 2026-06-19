import React from "react";
import { View, Text, ScrollView } from "react-native";
import { NotificationsListProps } from "@/src/types/notifications.types";
import { NotificationItem } from "./NotificationItem";

export const NotificationsList = ({
  notifications,
  maxItems = 4,
  onNotificationPress
}: NotificationsListProps) => {

  const displayNotifications = maxItems ? notifications.slice(0, maxItems) : notifications;

  if (notifications.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-gray-500 text-base">No hay notificaciones</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      {displayNotifications.map((notification, index) => (
        <View key={notification.id}>
          <NotificationItem
            notification={notification}
            onPress={onNotificationPress}
          />
          {index < displayNotifications.length - 1 && (
            <View className="h-px bg-gray-200 mx-4" />
          )}
        </View>
      ))}
    </ScrollView>
  );
}