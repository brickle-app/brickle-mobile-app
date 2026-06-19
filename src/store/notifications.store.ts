import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  NotificationType,
  NotificationStatus,
  Notification,
  NotificationsStore,
} from "../types/notifications.types";

export const notificationsStore = create<NotificationsStore>()(
  persist(
    (set, get) => ({
      // State
      isModalOpen: false,
      activeTab: NotificationType.TODAS,
      notifications: [],

      // Computed
      get unreadCount() {
        return get().notifications.filter(
          (n) => n.status === NotificationStatus.UNREAD
        ).length;
      },

      // Actions
      openModal: () => set({ isModalOpen: true }),

      closeModal: () => set({ isModalOpen: false }),

      setActiveTab: (tab: NotificationType) => set({ activeTab: tab }),

      markAsRead: (id: string) => {
        const notifications = get().notifications.map((notification) =>
          notification.id === id
            ? {
              ...notification,
              status: NotificationStatus.READ,
            }
            : notification
        );
        set({ notifications });
      },

      markAllAsRead: () => {
        const notifications = get().notifications.map((notification) => ({
          ...notification,
          status: NotificationStatus.READ,
        }));
        set({ notifications });
      },

      removeNotification: (id: string) => {
        set({
          notifications: get().notifications.filter((n) => n.id !== id),
        });
      },

      removeNotifications: (ids: string[]) => {
        const idSet = new Set(ids);
        set({
          notifications: get().notifications.filter((n) => !idSet.has(n.id)),
        });
      },

      addNotification: (notification: Notification) => {
        const notifications = [notification, ...get().notifications];
        set({ notifications });
      },
    }),
    {
      name: "notifications-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
