import { View, Text, TouchableOpacity, TextInput, ScrollView, Linking } from "react-native";
import React, { useState } from "react";
import BackGroundGradient from "@/src/components/ui/backgroundGradient/BackGroundGradient";

const HelpCenterScreen = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const createMailtoUrl = () => {
    const encodedSubject = encodeURIComponent(subject || "Solicitud de soporte");
    const encodedBody = encodeURIComponent(message || "Describe tu problema aquí...");
    const mailtoUrl = `mailto:admin@brickle.app?subject=${encodedSubject}&body=${encodedBody}`;

    Linking.openURL(mailtoUrl).catch(() => {
      console.error('Cannot open email client');
    });
  };

  return (
    <View className="flex-1 bg-primary-white">
      <BackGroundGradient />
      <ScrollView className="flex-1 px-6 pt-8">
        <View className="items-center mb-8">
          <Text className="text-xl font-libre-bold mb-4">Centro de Ayuda</Text>
          <Text className="text-gray-500 text-center">
            Completa el formulario para contactar con soporte técnico
          </Text>
        </View>

        <View className="mb-6">
          <Text className="text-base font-libre-medium mb-2">Motivo</Text>
          <View className="border border-gray-300 rounded-lg px-4 py-3">
            <TextInput
              placeholder="Ingresa el motivo de tu consulta"
              value={subject}
              onChangeText={setSubject}
              className="text-base"
            />
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-base font-libre-medium mb-2">Mensaje</Text>
          <View className="border border-gray-300 rounded-lg px-4 py-3 h-32">
            <TextInput
              placeholder="Describe tu problema o consulta detalladamente..."
              value={message}
              onChangeText={setMessage}
              multiline
              textAlignVertical="top"
              className="text-base flex-1"
            />
          </View>
        </View>


        <TouchableOpacity className="bg-primary py-4 px-6 rounded-full mb-8" onPress={createMailtoUrl}>
          <Text className="text-blue-primary font-libre-medium text-center text-base">
            Enviar email a admin@brickle.app
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default HelpCenterScreen;
