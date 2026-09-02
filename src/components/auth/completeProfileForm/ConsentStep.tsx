import React, { useCallback } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "@/assets/Colors";
import { CompleteProfileFormData } from "@/src/schemes/complete-profile-scheme";
import { PROFILE_CONSENT_DOCUMENTS } from "@/src/constants/legal-documents";
import { documentSignatureStore } from "@/src/store/documentSignature.store";

type ConsentFieldKey =
  | "acceptsTermsAndConditions"
  | "acceptsBusinessCollaborationContract"
  | "acceptsOriginOfFundsDeclaration";

const CONSENT_ITEMS: { field: ConsentFieldKey; documentId: string; label: string }[] = [
  {
    field: "acceptsTermsAndConditions",
    documentId: "terms",
    label: "He leído y acepto los",
  },
  {
    field: "acceptsBusinessCollaborationContract",
    documentId: "business-collaboration-contract",
    label: "He leído y acepto el",
  },
  {
    field: "acceptsOriginOfFundsDeclaration",
    documentId: "origin-of-funds-declaration",
    label: "He leído y acepto la",
  },
];

interface ConsentStepProps {
  formData: CompleteProfileFormData;
  errors: Partial<Record<keyof CompleteProfileFormData, string>>;
  onChange: (field: ConsentFieldKey, value: boolean) => void;
}

const ConsentStep = ({ formData, errors, onChange }: ConsentStepProps) => {
  const isSigned = documentSignatureStore((state) => state.isSigned);

  // When returning from the in-app document/signature screen, sync the
  // checkbox with whatever was actually signed there.
  useFocusEffect(
    useCallback(() => {
      CONSENT_ITEMS.forEach(({ field, documentId }) => {
        const document = PROFILE_CONSENT_DOCUMENTS.find((doc) => doc.id === documentId);
        if (document?.requiresSignature && isSigned(documentId) && !formData[field]) {
          onChange(field, true);
        }
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData])
  );

  function openDocument(documentId: string, url: string, title: string) {
    const document = PROFILE_CONSENT_DOCUMENTS.find((doc) => doc.id === documentId);
    if (document?.requiresSignature) {
      router.push({ pathname: "/legal-document", params: { documentId } });
      return;
    }
    router.push({ pathname: "/webview", params: { url, title } });
  }

  return (
    <View className="flex w-full flex-col gap-5">
      <Text className="text-text-primary font-libre-regular text-center text-sm">
        Antes de continuar con la verificación de tu identidad, confirma que
        aceptas los siguientes documentos.
      </Text>

      {CONSENT_ITEMS.map(({ field, documentId, label }) => {
        const document = PROFILE_CONSENT_DOCUMENTS.find((doc) => doc.id === documentId)!;
        const checked = Boolean(formData[field]);
        const error = errors[field];
        const requiresSignature = Boolean(document.requiresSignature);

        return (
          <View key={field} className="w-full">
            <TouchableOpacity
              className="flex-row items-start gap-3"
              activeOpacity={0.7}
              onPress={() =>
                requiresSignature
                  ? openDocument(documentId, document.url, document.title)
                  : onChange(field, !checked)
              }
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
            >
              <Ionicons
                name={checked ? "checkbox" : "square-outline"}
                size={24}
                color={checked ? Colors.textPrimary : Colors.textPrimary}
              />
              <Text className="flex-1 text-text-primary font-libre-regular text-sm">
                {label}{" "}
                <Text
                  className="font-libre-bold underline"
                  onPress={() => openDocument(documentId, document.url, document.title)}
                >
                  {document.title}
                </Text>
                {requiresSignature && checked ? (
                  <Text className="text-green-600 font-libre-bold text-xs"> (firmado)</Text>
                ) : null}
              </Text>
            </TouchableOpacity>
            {error && (
              <Text className="text-red-500 font-libre-regular text-xs mt-1 ml-9">
                {error}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default ConsentStep;
