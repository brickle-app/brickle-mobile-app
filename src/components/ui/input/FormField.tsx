import { View, TextInput, TextInputProps, Text } from "react-native";
import React, { forwardRef } from "react";
import MaskInput, { Mask } from "react-native-mask-input";

export interface FormFieldProps extends TextInputProps {
  /**
   * Label text for the input
   */
  label?: string;

  /**
   * Description text for the input
   */
  description?: string;

  mask?: Mask;

  /**
   * Width of the input
   */
  width?: string;

  /**
   * Icon element to show inside the input
   */
  icon?: React.ReactNode;

  /**
   * Position of the icon (left or right)
   */
  iconPosition?: "left" | "right";

  /**
   * Error message to display
   */
  error?: string;

  /**
   * Additional class names for the container
   */
  containerClassName?: string;

  /**
   * Additional class names for the input wrapper
   */
  inputWrapperClassName?: string;

  /**
   * Whether the input is disabled
   */
  disabled?: boolean;
}

/**
 * A reusable form field component with built-in label, input and error message
 */
export const FormField = forwardRef<TextInput, FormFieldProps>(
  (
    {
      label,
      description,
      icon,
      mask,
      iconPosition = "left",
      error,
      containerClassName = "",
      inputWrapperClassName = "",
      disabled,
      width = "w-primary-width",
      ...props
    },
    ref
  ) => {
    return (
      <View className={`flex flex-col gap-2 ${containerClassName}`}>
        {label && (
          <Text className="text-text-primary font-libre-bold text-sm">{label}</Text>
        )}

        {description && (
          <Text className="text-xs text-gray-500 mb-2">{description}</Text>
        )}

        <View
          className={`flex border h-primary-height ${width} py-1 px-6 border-secondary border-1 rounded-primary-radius flex-row items-center gap-2 ${error ? "border-red-600" : ""
            } ${disabled ? "bg-gray-100" : ""} ${inputWrapperClassName}`}
        >
          {icon && iconPosition === "left" && (
            <View className="flex justify-center items-center">{icon}</View>
          )}
          {mask ? (
            <MaskInput
              ref={ref}
              className="flex-1"
              placeholderTextColor="#9CA3AF"
              editable={!disabled}
              {...props}
              mask={mask}
            />
          ) : (
            <TextInput
              ref={ref}
              className="flex-1"
              placeholderTextColor="#9CA3AF"
              editable={!disabled}
              {...props}
            />
          )}

          {icon && iconPosition === "right" && (
            <View className="flex justify-center items-center">{icon}</View>
          )}
        </View>

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
);

FormField.displayName = "FormField";
