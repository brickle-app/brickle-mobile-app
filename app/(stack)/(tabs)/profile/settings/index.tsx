import { View, Text, ScrollView, Switch } from "react-native";
import React, { useState } from "react";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import UserHeader from "@/src/components/user/UserHeader";
import { Colors } from "@/assets/Colors";

import NotificationIcon from "@/assets/icons/SVG/Notificaciones.svg";
import { authStore } from "@/src/store/auth.store";
import { BrickleUser } from "@/src/types/user.types";
import { NotificationsPushModal } from "@/src/components/settings/modals/NotificationsPushModal";
import { registerForPushNotificationsAsync } from "@/src/utils/notifications";
import { updateUser } from "@/src/services/brickle.service";

interface SettingItemProps {
  title: string;
  isEnabled: boolean;
  onToggle: (value: boolean) => void;
}

const SettingItem = ({ title, isEnabled, onToggle }: SettingItemProps) => (
  <View className="bg-white p-4 mb-3 rounded-lg shadow-sm">
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center gap-2">
        <View className="border-gray-200 border rounded-xl ">
          <NotificationIcon height={32} width={32} />
        </View>

        <Text className="text-dark-blue font-libre-bold">{title}</Text>
      </View>
      <Switch
        value={isEnabled}
        onValueChange={onToggle}
        trackColor={{ false: Colors.accentPrimary, true: Colors.greenPrimary }}
        thumbColor={Colors.bluePrimary}
      />
    </View>
  </View>
);

const SettingsScreen = () => {
  // State for settings
  const user = authStore((state) => state.user);
  const setUser = authStore((state) => state.setUser);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(user?.pushNotificationToken !== null);
  const [notificationsPushModalVisible, setNotificationsPushModalVisible] =
    useState(false);
  //const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
  //  useState(true);
  //const [smsNotificationsEnabled, setSmsNotificationsEnabled] = useState(false);

  const handleTogglePushNotificationsModal = () => {
    if (!pushNotificationsEnabled) {
      setNotificationsPushModalVisible(true);
    } else {
      setPushNotificationsEnabled(false);
    }
  }

  const handleNotificationsToken = async () => {
    const token = await registerForPushNotificationsAsync();
    if (token) {
      setPushNotificationsEnabled(true);
      await updateUser({
        ...user,
        pushNotificationToken: token,
      });
      setNotificationsPushModalVisible(false);
      setUser({
        ...user,
        pushNotificationToken: token,
      });
    }
  }


  return (
    <View className="flex-1">
      <BackGroundGradient />

      <ScrollView
        className="flex-1 px-3 pt-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        <View className="mb-4">
          <UserHeader
            user={user as BrickleUser}
          />
        </View>
        <View className="mb-4">
          <Text className="text-dark-blue font-libre-bold text-xl mb-4">
            Notificaciones
          </Text>

          <View className="mb-6">
            <SettingItem
              title="Notificaciones push"
              isEnabled={pushNotificationsEnabled}
              onToggle={handleTogglePushNotificationsModal}
            />
            {/*<SettingItem
              title="Notificaciones por email"
              isEnabled={emailNotificationsEnabled}
              onToggle={setEmailNotificationsEnabled}
            />
            <SettingItem
              title="Notificaciones SMS"
              isEnabled={smsNotificationsEnabled}
              onToggle={setSmsNotificationsEnabled}
            />*/}
          </View>
        </View>
      </ScrollView>

      <NotificationsPushModal
        visible={notificationsPushModalVisible}
        onRequestClose={() => setNotificationsPushModalVisible(false)}
        title="Notificaciones push"
        description="Notificaciones push"
        handelAction={handleNotificationsToken}
        isLoading={false}
      />
    </View>
  );
};

export default SettingsScreen;