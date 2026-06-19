import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { TabType } from "../../types/leasing.types";
import { Colors } from "@/assets/Colors";

interface LeasingTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  children: React.ReactNode;
  theme: {
    mainColor: string;
    secondaryColor: string;
  };
  soldOut?: boolean;
}

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.04,
  shadowRadius: 3,
  elevation: 2,
};

export const LeasingTabs = ({ activeTab, onTabChange, children, theme, soldOut }: LeasingTabsProps) => {
  return (
    <View style={soldOut ? { opacity: 0.88 } : undefined}>
      <View className="flex-row mx-4 gap-2 mt-4">
        <TouchableOpacity
          onPress={() => onTabChange("finances")}
          className="flex-1 py-3.5 rounded-xl"
          accessibilityRole="button"
          accessibilityLabel="Ver números del activo"
          style={[
            { backgroundColor: activeTab === "finances" ? theme.mainColor : Colors.white },
            activeTab !== "finances" && { borderWidth: 1, borderColor: "#E5E5E5" },
            cardShadow,
          ]}
        >
          <Text
            className="text-center font-libre-bold text-base"
            style={{
              color: activeTab === "finances" ? Colors.white : Colors.textPrimary,
            }}
          >
            Números
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onTabChange("details")}
          className="flex-1 py-3.5 rounded-xl"
          accessibilityRole="button"
          accessibilityLabel="Ver detalles del activo"
          style={[
            { backgroundColor: activeTab === "details" ? theme.mainColor : Colors.white },
            activeTab !== "details" && { borderWidth: 1, borderColor: "#E5E5E5" },
            cardShadow,
          ]}
        >
          <Text
            className="text-center font-libre-bold text-base"
            style={{
              color: activeTab === "details" ? Colors.white : Colors.textPrimary,
            }}
          >
            Detalles
          </Text>
        </TouchableOpacity>
      </View>
      <View className="bg-white mx-4 rounded-2xl my-4 p-4" style={cardShadow}>
        {children}
      </View>
    </View>
  );
}; 