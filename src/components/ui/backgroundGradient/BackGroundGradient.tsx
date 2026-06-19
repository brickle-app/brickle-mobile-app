import { View } from "react-native";
import React from "react";
import { RadialGradient } from "react-native-gradients";
import { LinearGradient } from "expo-linear-gradient";

type Variant = "default" | "discover";

interface BackGroundGradientProps {
  variant?: Variant;
}

const BackGroundGradient = ({ variant = "default" }: BackGroundGradientProps) => {
  if (variant === "discover") {
    return (
      <LinearGradient
        colors={["#E8F5E9", "#F1F8E9", "#F8F6F0"]}
        locations={[0, 0.5, 1]}
        style={{ position: "absolute", width: "100%", height: "100%" }}
      />
    );
  }
  const colorList = [
    { offset: "0%", color: "#F9FFE5", opacity: "1" },
    { offset: "100%", color: "#F4F6F8", opacity: "1" },
  ];
  return (
    <View className="w-screen h-screen absolute ">
      <RadialGradient
        x="50%"
        y="49.41%"
        rx="214.49%"
        ry="49.41%"
        colorList={colorList}
      />
    </View>
  );
};

export default BackGroundGradient;
