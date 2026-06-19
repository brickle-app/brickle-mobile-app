import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Colors } from "@/assets/Colors";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Href } from "expo-router";

interface CustomHeaderProps {
  title?: string;
  backDestination?: Href;
  /** When provided, used instead of router (avoids needing navigation context in callers) */
  onBackPress?: () => void;
}

function StandaloneHeaderContent({
  title,
  onBackPress,
}: {
  title?: string;
  onBackPress: () => void;
}) {
  return (
    <View className="bg-primary-white flex-row items-center justify-between p-4 mt-12">
      <View className="flex gap-4 items-center flex-row">
        <TouchableOpacity onPress={onBackPress}>
          <Ionicons name="arrow-back-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
        <Text className="text-xl font-libre-bold text-gray-800">{title}</Text>
      </View>
    </View>
  );
}

/** Solo se monta cuando no hay onBackPress; centraliza useRouter aquí para no llamarlo en pantallas sin contexto. */
function StandaloneHeaderWithRouter({
  title,
  backDestination,
}: {
  title?: string;
  backDestination?: Href;
}) {
  const router = useRouter();
  const handleBackPress = () => {
    if (backDestination) {
      router.push(backDestination);
    } else {
      router.back();
    }
  };
  return (
    <StandaloneHeaderContent title={title} onBackPress={handleBackPress} />
  );
}

export default function StandaloneHeader({
  title,
  backDestination,
  onBackPress: onBackPressProp,
}: CustomHeaderProps) {
  if (onBackPressProp != null) {
    return (
      <StandaloneHeaderContent title={title} onBackPress={onBackPressProp} />
    );
  }
  return (
    <StandaloneHeaderWithRouter title={title} backDestination={backDestination} />
  );
}
