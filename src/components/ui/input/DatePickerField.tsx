import React, { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import {
  formatDateForDisplay,
  getAdultMaximumDate,
  parseDisplayDate,
} from "@/src/utils/datePicker";

interface DatePickerFieldProps {
  label?: string;
  placeholder?: string;
  value?: string;
  error?: string;
  icon?: React.ReactNode;
  containerClassName?: string;
  inputWrapperClassName?: string;
  width?: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
}

const MINIMUM_BIRTH_DATE = new Date(1900, 0, 1);

export function DatePickerField({
  label,
  placeholder = "DD/MM/AAAA",
  value,
  error,
  icon,
  containerClassName = "",
  inputWrapperClassName = "",
  width = "w-primary-width",
  onChangeText,
  onBlur,
}: DatePickerFieldProps) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const maximumDate = getAdultMaximumDate();
  const selectedDate = parseDisplayDate(value) ?? maximumDate;

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setIsPickerVisible(false);
    }

    if (event.type === "dismissed") {
      onBlur?.();
      return;
    }

    if (!date) return;

    onChangeText(formatDateForDisplay(date));
    onBlur?.();

    if (Platform.OS === "ios") {
      setIsPickerVisible(false);
    }
  };

  return (
    <View className={`flex flex-col gap-2 ${containerClassName}`}>
      {label ? (
        <Text className="text-text-primary font-libre-bold text-sm">{label}</Text>
      ) : null}

      <Pressable
        accessibilityRole="button"
        onPress={() => setIsPickerVisible(true)}
        className={`flex border h-primary-height ${width} py-1 px-6 border-secondary border-1 rounded-primary-radius flex-row items-center gap-2 ${
          error ? "border-red-600" : ""
        } ${inputWrapperClassName}`}
      >
        {icon ? <View className="flex justify-center items-center">{icon}</View> : null}
        <Text className={`flex-1 ${value ? "text-text-primary" : "text-gray-400"}`}>
          {value || placeholder}
        </Text>
      </Pressable>

      {isPickerVisible ? (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "compact" : "default"}
          minimumDate={MINIMUM_BIRTH_DATE}
          maximumDate={maximumDate}
          onChange={handleChange}
        />
      ) : null}

      {error ? (
        <Text
          className="mt-2 text-red-600 text-xs px-0.5 leading-snug"
          accessibilityRole="alert"
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
