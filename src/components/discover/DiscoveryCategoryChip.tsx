import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { Category } from "@/src/data/mock-categories";

interface DiscoveryCategoryChipProps {
  category: Category;
  selected?: boolean;
  onPress?: () => void;
  onClear?: () => void;
  className?: string;
}

export function DiscoveryCategoryChip({
  category,
  selected = false,
  onPress,
  onClear,
  className = "",
}: DiscoveryCategoryChipProps) {
  const content = (
    <>
      {category.icon}
      <Text
        style={{ color: selected ? Colors.white : category.textColor }}
        className="text-sm font-libre-bold"
      >
        {category.text}
      </Text>
      {selected && onClear ? (
        <TouchableOpacity
          onPress={onClear}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Ionicons name="close-circle" size={16} color={Colors.white} />
        </TouchableOpacity>
      ) : null}
    </>
  );

  const style = {
    backgroundColor: selected ? Colors.bluePrimary : category.bgColor,
    borderWidth: selected ? 2 : 0,
    borderColor: selected ? Colors.bluePrimary : "transparent",
  };

  if (!onPress) {
    return (
      <View
        style={style}
        className={`rounded-full py-1 pl-0.5 pr-4 flex-row items-center gap-2 ${className}`}
      >
        {content}
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={style}
      className={`rounded-full py-1 pl-0.5 pr-4 flex-row items-center gap-2 ${className}`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {content}
    </TouchableOpacity>
  );
}
