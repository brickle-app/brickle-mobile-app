import { View, TextInputProps, TextInput } from "react-native";
import React from "react";

interface Props extends TextInputProps {
  placeholder: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
  onChangeText: (text: string) => void;
}

export const Input = ({
  placeholder,
  value,
  onChangeText,
  icon,
  className,
  keyboardType,
}: Props) => {
  return (
    <View
      className={`flex border h-primary-height w-primary-width py-1 px-6 border-secondary border-1 rounded-primary-radius flex-row items-center gap-2 ${className}`}
    >
      {icon}
      <TextInput
        keyboardType={keyboardType}
        placeholder={placeholder}
        value={value}
      />
    </View>
  );
};
