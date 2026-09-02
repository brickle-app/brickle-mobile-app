import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import React from "react";
import { router } from "expo-router";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";
import UserHeader from "@/src/components/user/UserHeader";

import EyeIcon from "@/assets/icons/SVG/Ojo.svg";
import DownloadIcon from "@/assets/icons/SVG/Documento.svg";
import { authStore } from "@/src/store/auth.store";
import { BrickleUser } from "@/src/types/user.types";
import { LEGAL_DOCUMENTS } from "@/src/constants/legal-documents";

interface DocumentItemProps {
  title: string;
  onView: () => void;
  onDownload?: () => void;
}

const DocumentItem = ({ title, onView, onDownload }: DocumentItemProps) => (
  <View className="border border-secondary/70 h-[50px] rounded-xl px-3 mb-4 flex-row items-center justify-between">
    <Text className="text-dark-blue font-libre-regular text-sm flex-1 pr-2">
      {title}
    </Text>
    <View className="flex-row items-center gap-1">
      <TouchableOpacity onPress={onView} activeOpacity={0.7} hitSlop={8}>
        <EyeIcon height={32} width={32} />
      </TouchableOpacity>
      {onDownload && (
        <TouchableOpacity onPress={onDownload} activeOpacity={0.7} hitSlop={8}>
          <DownloadIcon height={32} width={32} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const LegalDocumentsScreen = () => {
  const user = authStore((state) => state.user);

  function openInAppViewer(url: string, title: string) {
    router.push({
      pathname: "/webview",
      params: { url, title },
    });
  }

  function openSignedDocument(documentId: string) {
    router.push({
      pathname: "/legal-document",
      params: { documentId },
    });
  }

  async function openExternally(url: string) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        Alert.alert(
          "No se puede abrir",
          "Este enlace no está disponible en el dispositivo."
        );
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert("Error", "No se pudo abrir el documento.");
    }
  }

  return (
    <View className="flex-1 bg-[#F8FAF0]">
      <StatusBar barStyle="dark-content" />
      <BackGroundGradient />

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6">
          <UserHeader user={user as BrickleUser} />
        </View>

        <View>
          <Text className="text-[#14181F] font-libre-bold text-2xl mb-6 ">
            Documentos legales
          </Text>

          <View className="bg-white rounded-lg flex flex-col gap-4 p-6">
            {LEGAL_DOCUMENTS.map((doc) => (
              <DocumentItem
                key={doc.id}
                title={doc.title}
                onView={() =>
                  doc.requiresSignature
                    ? openSignedDocument(doc.id)
                    : openInAppViewer(doc.url, doc.title)
                }
                onDownload={
                  doc.requiresSignature
                    ? undefined
                    : () => openExternally(doc.url)
                }
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default LegalDocumentsScreen;
