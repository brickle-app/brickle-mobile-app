import React from "react";
import { View, Text } from "react-native";
import LinkItem from "./LinkItem";
import UserIcon from "@/assets/icons/SVG/User.svg";
import DocumentIcon from "@/assets/icons/SVG/Documento.svg";
import ShieldIcon from "@/assets/icons/SVG/Seguridad.svg";
import SettingsIcon from "@/assets/icons/SVG/Configuracin.svg";

interface AccountLinksProps {
  title: string;
}

const AccountLinks = ({ title }: AccountLinksProps) => {
  return (
    <View className="mb-4 ">
      <Text className="text-dark-blue font-libre-bold text-lg mb-2">{title}</Text>
      <View className="bg-white rounded-lg overflow-hidden">
        <LinkItem
          icon={<UserIcon />}
          label="Detalles personales"
          route="/profile/personal-details"
        />
        <LinkItem
          icon={<DocumentIcon />}
          label="Documentos legales"
          route="/profile/legal-documents"
        />
        <LinkItem
          icon={<ShieldIcon />}
          label="Seguridad"
          route="/profile/security"
        />
        <LinkItem
          icon={<SettingsIcon />}
          label="Configuración"
          route="/profile/settings"
          isLast={true}
        />
      </View>
    </View>
  );
};

export default AccountLinks;
