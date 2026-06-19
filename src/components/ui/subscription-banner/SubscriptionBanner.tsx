import { Colors } from "@/assets/Colors";
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import RecargarIcon from "@/assets/icons/SVG/Recargar.svg";
import FlechaDerIcon from "@/assets/icons/SVG/Flecha-der.svg";

interface SubscriptionBannerProps {
  title: string;
  description: string;
  onPress?: () => void;
}

export const SubscriptionBanner = ({
  title,
  description,
  onPress,
}: SubscriptionBannerProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress}
      className="mb-4 w-full"
    >
      <View
        className="w-full flex-row items-stretch overflow-hidden px-4 py-[10px] shadow-md"
        style={{
          backgroundColor: Colors.violetPrimary,
          borderRadius: 18,
        }}
      >
        <View className="mr-3 justify-center">
          <RecargarIcon width={40} height={40} color={Colors.walletIconGreen} />
        </View>
        <View className="min-w-0 flex-1 justify-center pr-1">
          <Text
            className="font-libre-bold text-lg text-white"
            style={{ lineHeight: 22, marginBottom: 2 }}
          >
            {title}
          </Text>
          <Text className="font-libre-regular text-sm leading-[18px] text-white">{description}</Text>
        </View>
        <View className="w-[30px] shrink-0 items-end justify-end self-stretch pl-2">
          <FlechaDerIcon width={28} height={28} color={Colors.walletIconGreen} />
        </View>
      </View>
    </TouchableOpacity>
  );
};
