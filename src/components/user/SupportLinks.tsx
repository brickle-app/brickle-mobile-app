import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import LinkItem from "./LinkItem";
import { Colors } from "@/assets/Colors";

import HelpIcon from "@/assets/icons/SVG/Ayuda.svg";
import LogoutIcon from "@/assets/icons/SVG/Salir.svg";

const MENU_ICON_SIZE = 32;

interface SupportLinksProps {
  title: string;
  onLogout?: () => void;
}

const SupportLinks = ({ title, onLogout }: SupportLinksProps) => {
  return (
    <View className="mb-4">
      <Text className="text-dark-blue font-libre-bold text-lg mb-2">{title}</Text>
      <View className="bg-white rounded-lg overflow-hidden">
        <LinkItem
          icon={<HelpIcon />}
          label="Centro de ayuda"
          route="/support/help"
        />
        <TouchableOpacity onPress={onLogout}>
          <View className="p-4 flex-row items-center">
            <View className="mr-3 items-center justify-center border border-gray-200 rounded-xl p-1.5">
              <LogoutIcon
                width={MENU_ICON_SIZE}
                height={MENU_ICON_SIZE}
                color={Colors.bluePrimary}
              />
            </View>
            <Text className="text-base">Cerrar sesión</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SupportLinks;
