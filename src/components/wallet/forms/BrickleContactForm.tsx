import { useState } from "react"
import { View, Text, TextInput, FlatList, TouchableOpacity, Image, ActivityIndicator } from "react-native"
import { useContactForm } from "@/src/hooks/useContactForm"
import { FormField } from "@/src/components/ui/input"
import { useContacts } from "../hooks/useContacts"
import { AddContactForm } from "../modals/AddContactForm"
import OperationStatusModal from "../OperationStatusModal"
import { Colors } from "@/assets/Colors"
import { formatColombianPesos, unformatColombianPesos } from '@/src/utils/formatCurrency';

interface BrickleContactFormProps {
  contactForm?: ReturnType<typeof useContactForm>;
}

export const BrickleContactForm = ({ contactForm: externalContactForm }: BrickleContactFormProps) => {
  const internalContactForm = useContactForm();
  const contactForm = externalContactForm || internalContactForm;
  const { contacts, searchTerm, setSearchTerm, isLoading, refreshContacts } = useContacts();
  const [visible, setVisible] = useState(false);
  const [isOperationStatusModalVisible, setIsOperationStatusModalVisible] = useState(false);

  const handleContactAdded = () => {
    setIsOperationStatusModalVisible(true);
    refreshContacts();
  };

  const handleAmountChange = (value: string) => {
    const unformatted = unformatColombianPesos(value);
    contactForm.handleAmountChange(unformatted);
  };

  return (
    <View className="my-6">
      <View className="mb-6">
        <Text className="mb-2 text-sm text-text-primary font-libre-bold">Selecciona el contacto</Text>
        <TextInput
          className="border border-secondary rounded-full p-3 bg-white h-14"
          placeholder="Buscar por nombre"
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {!contactForm.formData.selectedContact ? (
        <View className="mb-6">
          <View>
            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color={Colors.bluePrimary} />
              </View>
            ) : (
              <FlatList
                data={[...(contacts || []).slice(0, 5), { id: 'add-contact', isAddButton: true }]}
                keyExtractor={(item) => item.id}
                numColumns={3}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                columnWrapperStyle={{
                  justifyContent: 'flex-start',
                  marginBottom: 24,
                }}
                renderItem={({ item }) => {
                  if ('isAddButton' in item) {
                    return (
                      <TouchableOpacity
                        className="flex-col items-center"
                        style={{ width: '31%' }}
                        onPress={() => setVisible(true)}
                      >
                        <View className="mb-2 h-14 w-14 rounded-full bg-purple-500 items-center justify-center">
                          <Text className="text-white text-2xl font-libre-light">+</Text>
                        </View>
                        <Text className="text-center font-libre-regular text-xs text-text-primary">Agregar</Text>
                        <Text className="text-center text-xs text-gray-500">contacto</Text>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      className="flex-col items-center"
                      style={{ width: '31%' }}
                      onPress={() => contactForm.handleSelectContact(item)}
                    >
                      <View className="mb-2 h-14 w-14 rounded-full overflow-hidden">
                        {item.profilePictureUrl ? (
                          <Image
                            source={{ uri: item.profilePictureUrl }}
                            className="h-full w-full"
                            resizeMode="cover"
                          />
                        ) : (
                          <View className="h-full w-full bg-gray-400 items-center justify-center">
                            <Text className="text-white text-lg font-libre-bold">
                              {item.firstName.charAt(0)}
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text className="text-center font-libre-regular text-xs text-text-primary">{item.firstName} {item.lastName}</Text>
                    </TouchableOpacity>
                  );
                }}
                contentContainerStyle={{
                  paddingHorizontal: 0,
                }}
              />
            )}
          </View>
        </View>
      ) : (
        <View className="mb-6">
          <Text className="mb-2 text-sm text-text-primary font-libre-bold">Contacto seleccionado</Text>
          <View className="border border-green-300 bg-green-50 rounded-lg p-3 mb-4 flex-row items-center">
            <View className="h-14 w-14 rounded-full overflow-hidden mr-4">
              {contactForm.formData.selectedContact.profilePictureUrl ? (
                <Image
                  source={{ uri: contactForm.formData.selectedContact.profilePictureUrl }}
                  className="h-full w-full"
                  resizeMode="cover"
                />
              ) : (
                <View className="h-full w-full bg-gray-400 items-center justify-center">
                  <Text className="text-white text-lg font-libre-bold">
                    {contactForm.formData.selectedContact.firstName.charAt(0)}
                  </Text>
                </View>
              )}
            </View>
            <View>
              <Text className="font-libre-bold text-text-primary">{contactForm.formData.selectedContact.firstName}</Text>
            </View>
            <TouchableOpacity
              className="ml-auto"
              onPress={() => contactForm.handleSelectContact(null)}
            >
              <Text className="text-blue-primary">Cambiar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View className="mb-6 h-12">
        <FormField
          width="w-full"
          label="Monto a enviar"
          placeholder="0.00"
          value={formatColombianPesos(contactForm.formData.amount)}
          onChangeText={handleAmountChange}
          onBlur={contactForm.handleAmountBlur}
          error={contactForm.errors.amount}
          keyboardType="numeric"
          containerClassName="w-full"
        />
      </View>
      <AddContactForm
        visible={visible}
        onRequestClose={() => setVisible(false)}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSuccess={handleContactAdded}
      />
      <OperationStatusModal
        isVisible={isOperationStatusModalVisible}
        onClose={() => setIsOperationStatusModalVisible(false)}
        title="Contacto agregado exitosamente"
        type="success"
      />
    </View>
  )
}