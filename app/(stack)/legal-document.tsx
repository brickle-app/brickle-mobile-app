import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/assets/Colors";
import { LEGAL_DOCUMENTS } from "@/src/constants/legal-documents";
import { authStore } from "@/src/store/auth.store";
import { documentSignatureStore } from "@/src/store/documentSignature.store";
import SignaturePad from "@/src/components/legal/SignaturePad";
import { signUserDocument } from "@/src/services/brickle.service";
import Logo from "@/assets/logos/simple-logo-red.svg";

const DOCUMENT_VERSION = "2026-09-02";

function normalizeParam(value: string | string[] | undefined): string | undefined {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value[0] : value;
}

const LegalDocumentScreen = () => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ documentId?: string }>();
  const documentId = normalizeParam(params.documentId);
  const user = authStore((state) => state.user);
  const existingSignature = documentSignatureStore((state) =>
    documentId ? state.signatures[documentId] : undefined
  );
  const saveSignature = documentSignatureStore((state) => state.saveSignature);

  const document = useMemo(
    () => LEGAL_DOCUMENTS.find((doc) => doc.id === documentId),
    [documentId]
  );

  const [hasReadToEnd, setHasReadToEnd] = useState(Boolean(existingSignature));
  const [svgPaths, setSvgPaths] = useState<string[]>(
    existingSignature?.svgPaths ?? []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!document || !document.content) {
    return (
      <View className="flex-1 bg-white items-center justify-center px-6" style={{ paddingTop: insets.top }}>
        <Text className="font-libre-regular text-text-secondary text-center">
          Documento no disponible.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="font-libre-bold text-text-primary underline">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isEmptySignature = svgPaths.length === 0;
  const canConfirm = hasReadToEnd && !isEmptySignature;
  const signerName = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

  async function handleConfirm() {
    if (!canConfirm || isSubmitting) return;
    const finalSignerName = signerName || "Usuario Brickle";
    const signedAt = new Date().toISOString();

    setIsSubmitting(true);
    try {
      if (user?.id) {
        await signUserDocument(
          {
            userId: user.id,
            documentType: document!.id,
            documentVersion: DOCUMENT_VERSION,
            signaturePaths: svgPaths,
            signerName: finalSignerName,
          },
          user.email
        );
      }

      saveSignature({
        documentId: document!.id,
        svgPaths,
        signedAt,
        signerName: finalSignerName,
      });

      Alert.alert("Documento firmado", `Has firmado "${document!.title}" correctamente.`, [
        { text: "Continuar", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "No se pudo registrar la firma",
        error?.message ?? "Intenta nuevamente en unos segundos."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
        <View className="flex flex-row items-center border-b border-gray-100 px-4 py-3">
          <TouchableOpacity className="mr-3" onPress={() => router.back()}>
            <Ionicons name="arrow-back-circle" size={28} color={Colors.primary} />
          </TouchableOpacity>
          <Text className="flex-1 font-libre-bold text-base text-gray-800" numberOfLines={1}>
            {document.title}
          </Text>
        </View>

        <View className="items-center py-4">
          <Logo height={40} width={40} />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
          onScroll={({ nativeEvent }) => {
            const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
            const reachedBottom =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
            if (reachedBottom && !hasReadToEnd) setHasReadToEnd(true);
          }}
          scrollEventThrottle={100}
        >
          <Text className="font-libre-regular text-sm text-text-primary leading-6">
            {document.content}
          </Text>

          {existingSignature && (
            <View className="mt-6 rounded-xl bg-green-50 border border-green-200 p-3">
              <Text className="font-libre-bold text-xs text-green-700">
                Firmado el{" "}
                {new Date(existingSignature.signedAt).toLocaleString("es-CO")} por{" "}
                {existingSignature.signerName}
              </Text>
            </View>
          )}

          {!existingSignature && (
            <View className="mt-8">
              <Text className="font-libre-bold text-sm text-text-primary mb-2">
                {hasReadToEnd
                  ? "Firma en el recuadro para aceptar este documento"
                  : "Desplázate hasta el final del documento para poder firmar"}
              </Text>
              {hasReadToEnd ? (
                <SignaturePad onChange={setSvgPaths} />
              ) : (
                <View className="w-full h-[180px] rounded-xl border border-gray-200 bg-gray-50 items-center justify-center">
                  <Text className="text-text-secondary font-libre-regular text-xs">
                    Termina de leer el documento para habilitar la firma
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {!existingSignature && (
          <View className="px-5 pb-6 pt-3 border-t border-gray-100">
            <TouchableOpacity
              disabled={!canConfirm || isSubmitting}
              onPress={handleConfirm}
              className={`w-full rounded-full py-4 items-center ${
                canConfirm && !isSubmitting ? "bg-primary" : "bg-gray-200"
              }`}
            >
              <Text
                className={`font-libre-bold text-sm ${
                  canConfirm && !isSubmitting ? "text-white" : "text-gray-400"
                }`}
              >
                {isSubmitting ? "Guardando firma..." : "Firmar y aceptar"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

export default LegalDocumentScreen;
