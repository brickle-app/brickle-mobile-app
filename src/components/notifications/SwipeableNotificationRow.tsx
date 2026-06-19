import React, { useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { Notification, NotificationStatus } from "@/src/types/notifications.types";
import { getTimeAgo } from "@/src/utils/dateUtils";

import MonedaIcon from "@/assets/icons/SVG/Moneda.svg";
import ChartIcon from "@/assets/icons/SVG/Chart.svg";
import EnviarIcon from "@/assets/icons/SVG/Enviar.svg";

const DELETE_WIDTH = 76;

function getNotificationIcon(item: Notification) {
  let icon;
  let iconColor = Colors.bluePrimary;

  if (item.icon === "INVESTMENT-RETURN") {
    icon = <MonedaIcon width={24} height={24} color={Colors.greenPrimary} />;
    iconColor = Colors.greenPrimary;
  } else if (item.icon === "INVESTMENT") {
    icon = <ChartIcon width={24} height={24} color={Colors.bluePrimary} />;
  } else if (item.icon === "WITHDRAW") {
    icon = <EnviarIcon width={24} height={24} color={Colors.orangePrimary} />;
    iconColor = Colors.orangePrimary;
  } else if (item.icon === "RECHARGE") {
    icon = <EnviarIcon width={24} height={24} color={Colors.greenPrimary} />;
    iconColor = Colors.greenPrimary;
  } else {
    icon = <Ionicons name="notifications" size={24} color={Colors.bluePrimary} />;
  }

  return { icon, iconColor };
}

export interface SwipeableNotificationRowProps {
  item: Notification;
  selectionMode: boolean;
  selected: boolean;
  onPress: (notification: Notification) => void;
  onLongPress: (notification: Notification) => void;
  onToggleSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export function SwipeableNotificationRow({
  item,
  selectionMode,
  selected,
  onPress,
  onLongPress,
  onToggleSelect,
  onDelete,
}: SwipeableNotificationRowProps) {
  const swipeRef = useRef<Swipeable>(null);
  const { icon, iconColor } = getNotificationIcon(item);
  const isUnread = item.status === NotificationStatus.UNREAD;

  const card = (
    <TouchableOpacity
      style={[
        styles.container,
        isUnread && { backgroundColor: "#F0F9FF" },
        selectionMode && selected && styles.containerSelected,
      ]}
      className="flex-row items-center py-4 px-4 mx-4 mb-3"
      activeOpacity={0.7}
      onPress={() => {
        if (selectionMode) onToggleSelect(item.id);
        else onPress(item);
      }}
      onLongPress={() => {
        if (!selectionMode) onLongPress(item);
      }}
      delayLongPress={450}
    >
      {selectionMode && (
        <View className="mr-3 pl-0">
          <Ionicons
            name={selected ? "checkbox" : "square-outline"}
            size={26}
            color={selected ? Colors.bluePrimary : Colors.secondary}
          />
        </View>
      )}
      <View
        className="h-12 w-12 rounded-full items-center justify-center mr-4"
        style={{ backgroundColor: `${iconColor}15` }}
      >
        {icon}
      </View>
      <View className="flex-1">
        <View className="flex-row items-center">
          <Text
            className={`font-libre-medium text-base text-text-primary flex-1 ${isUnread ? "font-libre-bold" : ""}`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {isUnread && !selectionMode && (
            <View className="ml-2 h-2 w-2 rounded-full bg-orange-primary" />
          )}
        </View>
        <Text
          className="mt-1 font-libre-regular text-sm text-gray-600"
          numberOfLines={2}
        >
          {item.message}
        </Text>
      </View>
      <Text className="font-libre-regular text-xs text-gray-500">
        {getTimeAgo(new Date(item.createdAt))}
      </Text>
    </TouchableOpacity>
  );

  if (selectionMode) {
    return card;
  }

  const renderRightActions = () => (
    <RectButton
      style={styles.deleteAction}
      onPress={() => {
        swipeRef.current?.close();
        onDelete(item.id);
      }}
    >
      <Ionicons name="trash-outline" size={26} color={Colors.white} />
      <Text style={styles.deleteLabel}>Eliminar</Text>
    </RectButton>
  );

  return (
    <Swipeable
      ref={swipeRef}
      friction={2}
      overshootRight={false}
      renderRightActions={renderRightActions}
      rightThreshold={DELETE_WIDTH / 2}
    >
      {card}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F6F6F6",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.05)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  containerSelected: {
    borderColor: Colors.bluePrimary,
    borderWidth: 2,
  },
  deleteAction: {
    width: DELETE_WIDTH,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#DC2626",
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    marginRight: 16,
    marginBottom: 12,
  },
  deleteLabel: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});
