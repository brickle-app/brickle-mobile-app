import React from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import InfoIcon from "@/assets/icons/SVG/Info.svg";
import { Colors } from "@/assets/Colors";

interface UserWarningProps {
  warningMessage: string;
  linkText: string;
}

const UserWarning = ({ warningMessage, linkText }: UserWarningProps) => {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push("/complete-profile")}
      className="mb-4  p-4 bg-white   rounded-lg flex-row items-center"
    >
      <View className="flex-1">
        <Text className="text-orange-primary text-base font-libre-bold">
          {warningMessage}
        </Text>
        <Text className="text-text-primary  text-sm">{linkText}</Text>
      </View>
      <View className="ml-2  rounded-full">
        <InfoIcon color={Colors.orangePrimary} width={52} height={52} />
      </View>
    </Pressable>
  );
};

export default UserWarning;
