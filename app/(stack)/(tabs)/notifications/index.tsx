import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  SafeAreaView,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import { notificationsStore } from "@/src/store/notifications.store";
import { Notification, NotificationStatus } from "@/src/types/notifications.types";
import { SwipeableNotificationRow } from "@/src/components/notifications/SwipeableNotificationRow";

export default function NotificationsScreen() {
  const notifications = notificationsStore((state) => state.notifications);
  const markAsRead = notificationsStore((state) => state.markAsRead);
  const markAllAsRead = notificationsStore((state) => state.markAllAsRead);
  const removeNotification = notificationsStore((state) => state.removeNotification);
  const removeNotifications = notificationsStore((state) => state.removeNotifications);

  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const hasUnread = useMemo(
    () => notifications.some((n) => n.status === NotificationStatus.UNREAD),
    [notifications]
  );

  const exitSelectionMode = useCallback(() => {
    setSelectionMode(false);
    setSelectedIds([]);
  }, []);

  const handleNotificationPress = (notification: Notification) => {
    if (notification.status === NotificationStatus.UNREAD) {
      markAsRead(notification.id);
    }
  };

  const handleLongPress = (notification: Notification) => {
    setSelectionMode(true);
    setSelectedIds([notification.id]);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const confirmDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    Alert.alert(
      "Eliminar notificaciones",
      `¿Eliminar ${selectedIds.length} notificación(es)?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: () => {
            removeNotifications(selectedIds);
            exitSelectionMode();
          },
        },
      ]
    );
  };

  const listHeader = (
    <View className="px-4 pb-2 pt-2">
      {selectionMode ? (
        <View className="rounded-2xl border border-secondary/40 bg-white/90 p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <TouchableOpacity onPress={exitSelectionMode} hitSlop={10}>
              <Text className="font-libre-bold text-base text-blue-primary">
                Cancelar
              </Text>
            </TouchableOpacity>
            <Text className="font-libre-medium text-text-primary">
              {selectedIds.length} seleccionada
              {selectedIds.length === 1 ? "" : "s"}
            </Text>
            <TouchableOpacity onPress={toggleSelectAll} hitSlop={10}>
              <Text className="font-libre-bold text-base text-blue-primary">
                {selectedIds.length === notifications.length
                  ? "Quitar todas"
                  : "Seleccionar todas"}
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-xl py-3"
            style={{
              backgroundColor:
                selectedIds.length > 0 ? "#FEE2E2" : "rgba(0,0,0,0.06)",
            }}
            disabled={selectedIds.length === 0}
            onPress={confirmDeleteSelected}
          >
            <Ionicons
              name="trash-outline"
              size={22}
              color={selectedIds.length > 0 ? "#B91C1C" : Colors.gray}
            />
            <Text
              className="font-libre-bold text-base"
              style={{
                color: selectedIds.length > 0 ? "#B91C1C" : Colors.gray,
              }}
            >
              Eliminar seleccionadas
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View>
          <TouchableOpacity
            className="flex-row items-center justify-center gap-2 rounded-xl border border-blue-primary/30 bg-white py-3.5"
            onPress={markAllAsRead}
            disabled={!hasUnread}
            style={{ opacity: hasUnread ? 1 : 0.45 }}
          >
            <Ionicons
              name="mail-open-outline"
              size={22}
              color={Colors.bluePrimary}
            />
            <Text className="font-libre-bold text-base text-blue-primary">
              Marcar todas como leídas
            </Text>
          </TouchableOpacity>
          <Text className="mt-2 px-1 text-center font-libre-regular text-xs text-gray-500">
            Desliza hacia la izquierda para eliminar. Mantén pulsada una
            notificación para seleccionar varias y borrarlas.
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView className="flex-1">
      <BackGroundGradient />
      <View className="flex-1">
        <FlatList
          data={notifications}
          ListHeaderComponent={listHeader}
          renderItem={({ item }) => (
            <SwipeableNotificationRow
              item={item}
              selectionMode={selectionMode}
              selected={selectedIds.includes(item.id)}
              onPress={handleNotificationPress}
              onLongPress={handleLongPress}
              onToggleSelect={toggleSelect}
              onDelete={removeNotification}
            />
          )}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center px-8 pt-20">
              <Ionicons name="notifications-off" size={64} color={Colors.gray} />
              <Text className="mt-4 text-center font-libre-medium text-lg text-gray-500">
                No hay notificaciones
              </Text>
              <Text className="mt-2 text-center font-libre-regular text-sm text-gray-400">
                Cuando recibas nuevas notificaciones aparecerán aquí
              </Text>
            </View>
          )}
          contentContainerStyle={{
            paddingBottom: 24,
            paddingTop: 4,
            flexGrow: 1,
          }}
          onEndReachedThreshold={0.1}
          onEndReached={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}
