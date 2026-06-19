import { View, Text } from "react-native";
import React from "react";
interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}
const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <View className="flex-row justify-center items-center my-6  w-full gap-4">
      <View className="border-b mb-8 border-tertiary-icons flex-1 h-10"></View>

      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep; // Or based on validation status if needed

        return (
          <View
            key={stepNumber}
            className={`w-8 h-8 rounded-full justify-center items-center ${isActive
                ? "bg-primary"
                : isCompleted
                  ? "bg-green-300"
                  : "bg-gray-300"
              }`}
          >
            <Text
              className={`font-libre-bold ${isActive || isCompleted ? "text-white" : "text-gray-600"
                }`}
            >
              {stepNumber}
            </Text>
          </View>
        );
      })}
      <View className="border-b mb-8 border-tertiary-icons  flex-1 h-10"></View>
    </View>
  );
};

export default StepIndicator;
