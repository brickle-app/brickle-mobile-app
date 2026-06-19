import React from "react";
import { Pressable, Text, View, ViewStyle } from "react-native";

interface IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  className?: string;
  classNameView?: string;
  labelClassName?: string;
  iconClassName?: string;
  disabled?: boolean;
}

/**
 * Componente de botón con icono y texto para acciones.
 */
export const IconButton = ({
  icon,
  label,
  onPress,
  className = "",
  classNameView = "",
  labelClassName = "text-primary",
  iconClassName = "",
  disabled = false,
}: IconButtonProps) => {
  return (
    <Pressable
      className={`justify-center items-center ${className} ${disabled ? 'opacity-30' : ''}`}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
    >
      <View className={`rounded-2xl justify-center items-center p-2 ${classNameView}`}>
        <View className={`${iconClassName}`}>
          {icon}
        </View>
        <Text
          className={`text-center font-libre-regular text-xs ${labelClassName}`}
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}; 