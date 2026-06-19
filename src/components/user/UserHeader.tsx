import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { ManageImageModal } from "../ui/modal/ManageImageModal";
import { BrickleUser } from "@/src/types/user.types";
import { authStore } from "@/src/store/auth.store";

interface UserHeaderProps {
  user: BrickleUser;
}

const UserHeader = ({ user }: UserHeaderProps) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const setUser = authStore((state) => state.setUser);

  return (
    <View className="mb-4 mt-4 h-[100px] flex-row items-center rounded-[10px] bg-blue-primary p-4">
      <View className="flex-row items-center">
        <TouchableOpacity onPress={() => setIsModalVisible(true)} className="mr-4 h-20 w-20 rounded-[10px] overflow-hidden">
          {user.profilePictureUrl ? (
            <Image
              source={{ uri: user.profilePictureUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <View className="h-full w-full bg-gray-400 items-center justify-center">
              <Text className="text-white text-lg font-libre-bold">
                {user.firstName?.charAt(0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <View className="flex-col flex gap-4">
          <Text className="text-white font-libre-bold text-base">{user.firstName}</Text>
          <Text className="text-gray-300 text-sm">{user.email}</Text>
        </View>
      </View>
      <ManageImageModal
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        user={user}
        setUser={setUser}
      />
    </View>
  );
};

export default UserHeader;
