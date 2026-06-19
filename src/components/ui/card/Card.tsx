import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  variant?: "default" | "dark" | "bordered";
  children: React.ReactNode;
  className?: string;
}

/**
 * Componente Card reutilizable para mostrar información en formato de tarjeta.
 */
export const Card = ({
  variant = "default",
  children,
  className = "",
  ...props
}: CardProps) => {
  const variantClasses = {
    default: "bg-white",
    dark: "bg-gray-800",
    bordered: "bg-white border border-gray-200",
  };

  return (
    <View
      className={`rounded-xl p-4 w-full ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </View>
  );
}; 