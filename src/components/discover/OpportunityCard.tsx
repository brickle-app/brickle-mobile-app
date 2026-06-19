import { View, Text, TouchableOpacity } from "react-native";
import TopOpportunityIcon from "@/assets/icons/SVG/Top-oportunidades.svg";

import RecommendationsIcon from "@/assets/icons/SVG/Recomendacion.svg";

import ExpiringIcon from "@/assets/icons/SVG/Proximos-agotarse.svg";

import React from "react";
import { Colors } from "@/assets/Colors";

interface OpportunityCardProps {
  type: "expiring" | "top" | "recommendations";
  onPress?: () => void;
}

const OpportunityCard: React.FC<OpportunityCardProps> = ({ type, onPress }) => {
  const iconSize = 58;
  const getCardConfig = () => {
    switch (type) {
      case "expiring":
        return {
          title: "Próximas a\nagotarse",
          bgColor: "bg-[#EDA98C]",
          icon: (
            <ExpiringIcon
              width={iconSize}
              height={iconSize}
              color={Colors.violetPrimary}
            />
          ),
        };
      case "top":
        return {
          title: "Top\noportunidades",
          bgColor: "bg-[#CFF3B8]",
          icon: (
            <TopOpportunityIcon
              width={iconSize}
              height={iconSize}
              color={Colors.violetPrimary}
            />
          ),
        };
      case "recommendations":
        return {
          title: "Recomendados\nde expertos",
          bgColor: "bg-[#996FE9]",
          icon: (
            <RecommendationsIcon
              width={iconSize}
              height={iconSize}
              color={Colors.violetPrimary}
            />
          ),
        };
    }
  };

  const config = getCardConfig();

  return (
    <TouchableOpacity
      className={`${config.bgColor} flex flex-col  rounded-2xl   h-28 w-28 justify-center items-center`}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View className="flex flex-col justify-center items-center">
        {config.icon}
        <Text className="text-violet-primary text-xs text-center font-libre-bold ">
          {config.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default OpportunityCard;
