import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ViewProps } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";
import { SelectOption } from "./SelectField";
import { BottomSheetModal } from "./BottomSheetModal";

export interface SelectBottomSheetProps extends ViewProps {
  label?: string;
  description?: string;
  value: string | number;
  options: SelectOption[];
  onValueChange: (value: string | number) => void;
  error?: string;
  containerClassName?: string;
  disabled?: boolean;
  placeholder?: string;
  searchable?: boolean;
  /** Lista vacía (p. ej. sin cuentas): botón secundario. */
  emptyListAction?: {
    label: string;
    onPress: () => void;
  };
}

export const SelectBottomSheet: React.FC<SelectBottomSheetProps> = ({
  label,
  description,
  value,
  options,
  onValueChange,
  error,
  containerClassName = "",
  disabled,
  placeholder = "Seleccionar opción",
  searchable = true,
  emptyListAction,
  ...props
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const selectedOption = options.find((option) => option.value === value);
  const displayText = selectedOption?.label || placeholder;
  const isPlaceholder = !selectedOption;

  const handlePress = () => {
    if (!disabled) {
      setIsModalVisible(true);
    }
  };

  const handleSelect = useCallback((option: SelectOption) => {
    onValueChange(option.value);
    setIsModalVisible(false);
  }, [onValueChange]);

  const handleClose = useCallback(() => {
    setIsModalVisible(false);
  }, []);

  return (
    <View className={`flex flex-col gap-2 ${containerClassName}`} {...props}>
      {label && (
        <Text className="text-text-primary font-libre-bold text-sm">{label}</Text>
      )}

      {description && (
        <Text className="text-xs text-gray-500 mb-2">{description}</Text>
      )}

      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        className={`
          flex-row items-center justify-between
          bg-background border border-secondary rounded-full
          px-4 py-3 h-[50px]
          ${error ? 'border-red-500' : ''}
          ${disabled ? 'bg-gray-100 opacity-60' : ''}
        `}
      >
        <Text
          className={`flex-1 text-base ${isPlaceholder
            ? 'text-gray-400'
            : 'text-text-primary font-libre-regular'
            }`}
          numberOfLines={1}
        >
          {displayText}
        </Text>

        <Ionicons
          name="chevron-down"
          size={20}
          color={disabled ? Colors.gray : Colors.bluePrimary}
        />
      </TouchableOpacity>

      {error && <Text className="text-error text-xs px-1">{error}</Text>}

      <BottomSheetModal
        visible={isModalVisible}
        onClose={handleClose}
        title={label || "Seleccionar opción"}
        options={options}
        selectedValue={value}
        onSelect={handleSelect}
        searchable={searchable}
        emptyListAction={emptyListAction}
      />
    </View>
  );
};