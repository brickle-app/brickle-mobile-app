export enum NotificationType {
  TODAS = "TODAS",
  ASSET = "ASSET",
  MOVEMENT = "MOVEMENT",
  INVESTMENT = "INVESTMENT",
  INVESTMENT_RETURN = "INVESTMENT-RETURN",
  WITHDRAW = "WITHDRAW",
  RECHARGE = "RECHARGE",
  /** Perfil / identidad aprobada desde admin */
  PROFILE = "PROFILE",
}

export enum NotificationStatus {
  READ = "READ",
  UNREAD = "UNREAD",
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  status: NotificationStatus;
  icon: string;
  createdAt: string;
  type?: NotificationType;
}

export interface NotificationTab {
  id: NotificationType;
  label: string;
  count: number;
}

export interface NotificationItemProps {
  notification: Notification;
  onPress: (notification: Notification) => void;
  onMarkAsRead?: (id: string) => void;
}

export interface NotificationTabsProps {
  tabs: NotificationTab[];
  activeTab: NotificationType;
  onTabChange: (tab: NotificationType) => void;
}

export interface NotificationsListProps {
  notifications: Notification[];
  maxItems?: number;
  onNotificationPress: (notification: Notification) => void;
}

export interface NotificationsStore {
  // State
  isModalOpen: boolean;
  activeTab: NotificationType;
  notifications: Notification[];

  // Computed
  unreadCount: number;

  // Actions
  openModal: () => void;
  closeModal: () => void;
  setActiveTab: (tab: NotificationType) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  removeNotifications: (ids: string[]) => void;
  addNotification: (notification: Notification) => void;
}
