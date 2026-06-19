import { View, Text, ViewProps, Platform, StyleSheet } from "react-native";
import React from "react";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/assets/Colors";

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface SelectFieldProps extends ViewProps {
  label?: string;
  description?: string;
  value: string | number;
  options: SelectOption[];
  onValueChange: (value: string | number) => void;
  error?: string;
  containerClassName?: string;
  selectWrapperClassName?: string;
  disabled?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  description,
  value,
  options,
  onValueChange,
  error,
  containerClassName = "",
  selectWrapperClassName = "",
  disabled,
  ...props
}) => {
  const pickerWrapperStyles = [
    styles.pickerWrapper,
    Platform.OS === "android" && styles.pickerWrapperAndroid,
    error && styles.errorBorder,
    disabled && styles.disabledBackground,
  ];

  return (
    <View className={`flex flex-col gap-2 ${containerClassName}`} {...props}>
      {label && (
        <Text className="text-text-primary font-libre-bold text-sm">{label}</Text>
      )}

      {description && (
        <Text className="text-xs text-gray-500 mb-2">{description}</Text>
      )}

      <View style={pickerWrapperStyles} className={`ios:shadow-sm ios:shadow-black/5 border-background bg-background rounded-md border ${selectWrapperClassName}`}>
        <Picker
          mode="dropdown"
          selectedValue={value}
          onValueChange={onValueChange}
          enabled={!disabled}
          style={styles.picker}
          dropdownIconColor="black"
          dropdownIconRippleColor="black"
        >
          {options.map((option) => (
            <Picker.Item
              key={option.value.toString()}
              label={option.label}
              value={option.value}
              style={{ color: Colors.bluePrimary, backgroundColor: "transparent" }}
            />
          ))}
        </Picker>
      </View>

      {error && <Text className="text-error text-xs px-1">{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 25,
    overflow: "hidden",
    justifyContent: "center",
    height: 50,
  },
  pickerWrapperAndroid: {
    justifyContent: "center",
  },
  picker: {
    color: Colors.bluePrimary,
    backgroundColor: "transparent",
    marginLeft: Platform.OS === "android" ? 8 : 0,
  },
  errorBorder: {
    borderColor: "red",
  },
  disabledBackground: {
    backgroundColor: "#f0f0f0",
  },
});
