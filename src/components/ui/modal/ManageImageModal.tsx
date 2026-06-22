import React, { useState } from "react";
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Alert,
  Modal
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Colors } from "@/assets/Colors";
import { uploadUserProfileImage } from "@/src/services/brickle.service";
import { Ionicons } from "@expo/vector-icons";
import { BrickleUser } from "@/src/types/user.types";

export const ManageImageModal = ({ visible, onRequestClose, user, setUser }: { visible: boolean, onRequestClose: () => void, user: BrickleUser, setUser: (user: BrickleUser) => void }) => {

  const [selectedImage, setSelectedImage] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permiso denegado",
        "Necesitamos permiso para acceder a la galería de imágenes."
      );
    } else {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setSelectedImage(asset);
        setError(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    try {
      setError(null);
      const response = await uploadUserProfileImage(user, selectedImage);
      setUser({ ...user, profilePictureUrl: response });
      onRequestClose();
    } catch {
      setError("Error al subir la imagen. Por favor, intenta nuevamente.");
    }
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.container}>
        <View className="flex-row justify-start items-start w-full px-6 absolute top-14 left-0">
          <TouchableOpacity className="flex-row items-center justify-center gap-2" onPress={onRequestClose}>
            <Ionicons
              name="arrow-back-circle"
              size={28}
              color={Colors.white}
            />
            <Text className="text-white font-libre-bold text-center text-xl">
              Regresar
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.header}>
          Agregar imagen
        </Text>

        {!selectedImage && <TouchableOpacity style={styles.button}
          onPress={pickImage}>
          <Text style={styles.buttonText}>
            Escoger imagen
          </Text>
        </TouchableOpacity>}

        {selectedImage ? (
          <View className="flex flex-col gap-12 items-center justify-center">
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.image}
              />
            </View>
            <View className="flex flex-row gap-4 w-full justify-center">
              <TouchableOpacity style={styles.buttonSecondary}
                onPress={() => setSelectedImage(null)}>
                <Text style={styles.buttonText}>
                  Eliminar imagen
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.button}
                onPress={handleUpload}>
                <Text style={styles.buttonText}>
                  Subir imagen
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    position: "relative",
    backgroundColor: Colors.violetPrimary,
    opacity: 0.9,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  closeButtonText: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 48,
    fontFamily: "own-font",
    color: Colors.white,
  },
  button: {
    backgroundColor: Colors.greenPrimary,
    padding: 10,
    borderRadius: 35,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    width: "50%",
  },
  buttonSecondary: {
    backgroundColor: Colors.white,
    padding: 10,
    borderRadius: 35,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.greenPrimary,
    color: Colors.bluePrimary,
    width: "50%",
  },
  buttonText: {
    color: Colors.bluePrimary,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  imageContainer: {
    borderRadius: 10,
    marginBottom: 24,
    marginTop: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
    width: 200,
    height: 200,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 8,
  },
  errorText: {
    color: Colors.red,
    marginTop: 16,
  },
});
