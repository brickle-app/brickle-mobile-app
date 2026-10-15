import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/assets/Colors";

interface ProfileDocumentCtaProps {
  onPress: () => void;
  /** Documents already sent and waiting for an admin: show the review step instead of the upload button. */
  underReview?: boolean;
}

export function ProfileDocumentCta({
  onPress,
  underReview = false,
}: ProfileDocumentCtaProps) {
  return (
    <View className="w-full overflow-hidden rounded-3xl border border-orange-primary/30 bg-white shadow-sm">
      <View className="h-2 flex-row">
        <View className="flex-1 bg-green-primary" />
        <View className="flex-1 bg-orange-primary" />
        <View className="flex-1 bg-blue-primary" />
      </View>

      <View className="p-5">
        <View className="flex-row items-start gap-3">
          <View className="rounded-2xl bg-orange-primary/15 p-3">
            <Ionicons
              name={underReview ? "time-outline" : "id-card-outline"}
              size={26}
              color={Colors.orangePrimary}
            />
          </View>

          <View className="min-w-0 flex-1">
            <Text className="font-libre-bold text-lg text-text-primary">
              {underReview
                ? "Estamos revisando tus documentos"
                : "Sube tu documento"}
            </Text>
            <Text className="mt-1 font-libre-regular text-sm leading-5 text-gray-600">
              {underReview
                ? "Te avisaremos cuando tu perfil esté verificado. Mientras tanto puedes explorar los activos."
                : "Tus datos ya están listos. Falta una foto clara de tu documento para que podamos validar tu perfil."}
            </Text>
          </View>
        </View>

        <View className="mt-4 flex-row items-center gap-2 rounded-2xl bg-orange-primary/10 px-3 py-2">
          <Text className="font-libre-bold text-xs text-text-primary">
            Datos listos
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={Colors.textPrimary}
          />
          <Text
            className={`font-libre-bold text-xs ${underReview ? "text-text-primary" : "text-orange-primary"}`}
          >
            {underReview ? "Documento enviado" : "Documento pendiente"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={14}
            color={Colors.textPrimary}
          />
          <Text
            className={`font-libre-bold text-xs ${underReview ? "text-orange-primary" : "text-gray-500"}`}
          >
            Revisión
          </Text>
        </View>

        {!underReview && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Subir documento de identidad"
            onPress={onPress}
            className="mt-4 flex-row items-center justify-center gap-2 rounded-2xl bg-blue-primary px-4 py-3"
          >
            <Text className="font-libre-bold text-sm text-white">
              Subir documento
            </Text>
            <Ionicons
              name="cloud-upload-outline"
              size={18}
              color={Colors.white}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}
