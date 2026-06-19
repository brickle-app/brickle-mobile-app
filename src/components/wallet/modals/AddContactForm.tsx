import { Colors } from "@/assets/Colors";
import { Ionicons } from "@expo/vector-icons";
import { Image, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useContactDirectory } from "../hooks/useContactDirectory";
import { authStore } from "@/src/store/auth.store";

export const AddContactForm = ({ visible, onRequestClose, onSuccess }: { visible: boolean, onRequestClose: () => void, searchTerm: string, setSearchTerm: (text: string) => void, onSuccess: () => void }) => {
  const { searchTerm, setSearchTerm, contact, searchContact, addContact, isLoading, userNotFound } = useContactDirectory();
  const user = authStore((state) => state.user);

  const handleAddContact = async (userId: string, userEmail: string, contactId: string) => {
    await addContact(userId, userEmail, contactId);
    onSuccess();
    onRequestClose();
  };

  return (
    <Modal
      visible={visible}
      onRequestClose={onRequestClose}
      transparent={true}
      animationType="fade"
    >
      <View className="flex-1 justify-center items-center bg-violet-primary/60 relative">
        <View className="flex-row justify-end items-start w-full px-5">
          <TouchableOpacity className="flex-row items-center justify-center gap-2" onPress={onRequestClose}>
            <Ionicons
              name="close-circle"
              size={28}
              color={Colors.white}
            />
          </TouchableOpacity>
        </View>
        <View className="bg-white rounded-xl m-5 max-w-[90%] w-full max-h-[80%] p-11">
          <View className="flex items-center justify-between p-6 mb-4">
            <Ionicons name="person" size={32} color={Colors.bluePrimary} className="mb-4" />
            <Text className="text-blue-primary font-libre-bold text-2xl">Agregar contacto Brickle</Text>
          </View>

          <TextInput
            className="border border-text-primary rounded-full p-3 bg-white"
            placeholder="Buscar por email o celular"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {!contact && !isLoading && userNotFound && (
            <View className="flex-row items-center justify-center mt-1">
              <Ionicons name="alert-circle" size={24} color={Colors.orangePrimary} />
              <Text className="text-orange-primary">Usuario no encontrado. Intenta nuevamente.</Text>
            </View>
          )}

          {contact ? (
            <View className="flex items-center justify-center mt-7">
              <TouchableOpacity
                className="bg-green-primary rounded-full p-3 w-3/4"
                onPress={() => handleAddContact(user?.id || "", user?.email || "", contact.id)}
              >
                <Text className="text-blue-primary font-libre-bold text-center">Agregar contacto</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex items-center justify-center mt-7">
              <TouchableOpacity onPress={() => searchContact(user?.id || "", user?.email || "", searchTerm)} disabled={isLoading} className={`bg-green-primary rounded-full p-3 w-3/4 ${isLoading ? "opacity-50" : ""}`}>
                <Text className="text-blue-primary font-libre-bold text-center">{isLoading ? "Buscando..." : "Buscar contacto"}</Text>
              </TouchableOpacity>
            </View>
          )}

          {contact && (
            <View className="flex-row items-center justify-center mt-7 gap-2">
              <View className="mb-2 h-14 w-14 rounded-full overflow-hidden">
                {contact.profilePictureUrl ? (
                  <Image
                    source={{ uri: contact.profilePictureUrl }}
                    className="h-full w-full"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="h-full w-full bg-gray-400 items-center justify-center">
                    <Text className="text-white text-lg font-libre-bold">
                      {contact.firstName.charAt(0)}
                    </Text>
                  </View>
                )}
              </View>
              <View className="flex-col">
                <Text className="text-blue-primary font-libre-bold ml-2">{contact.firstName} {contact.lastName}</Text>
                <Text className="text-blue-primary font-libre-bold ml-2">{contact.email}</Text>
              </View>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
};