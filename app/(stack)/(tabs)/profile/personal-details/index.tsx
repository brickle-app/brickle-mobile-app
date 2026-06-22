import {
  View,
  ScrollView,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  BackGroundGradient,
  DatePickerField,
  FormField,
  SelectBottomSheet,
  UserHeader,
} from "@/src/components";
import { authStore } from "@/src/store/auth.store";
import {
  personalDetailsSchema,
  PersonalDetailsFormData,
} from "@/src/schemes/personal-details-scheme";
import useUpdateUserProfile from "@/src/hooks/auth/useUpdateUserProfile";
import { formatDateForInput } from "@/src/utils/date.utility";
import { BrickleUser, DocumentTypeEnum } from "@/src/types/user.types";

const documentTypeOptions = [
  { label: "Selecciona tu tipo de documento", value: "" },
  { label: "Cédula de ciudadanía", value: DocumentTypeEnum.CC.toString() },
  { label: "Cédula de extranjería", value: DocumentTypeEnum.CE.toString() },
  { label: "Pasaporte", value: DocumentTypeEnum.Pasaporte.toString() },
];

const nationalityOptions = [
  { label: "Selecciona tu nacionalidad", value: "" },
  { label: "Colombia", value: "CO" },
  { label: "Perú", value: "PE" },
  { label: "Ecuador", value: "EC" },
  { label: "Chile", value: "CL" },
  { label: "Brasil", value: "BR" },
  { label: "México", value: "MX" },
  { label: "Uruguay", value: "UY" },
  { label: "Paraguay", value: "PY" },
  { label: "Costa Rica", value: "CR" },
  { label: "Honduras", value: "HN" },
  { label: "Panamá", value: "PA" },
  { label: "El Salvador", value: "SV" },
  { label: "Guatemala", value: "GT" }
];

const residenceCountryOptions = [
  { label: "Selecciona tu país de residencia", value: "" },
  { label: "Colombia", value: "CO" },
  { label: "Perú", value: "PE" },
  { label: "Ecuador", value: "EC" },
  { label: "Chile", value: "CL" },
  { label: "Brasil", value: "BR" },
  { label: "México", value: "MX" },
  { label: "Uruguay", value: "UY" },
  { label: "Paraguay", value: "PY" },
  { label: "Costa Rica", value: "CR" },
  { label: "Honduras", value: "HN" },
  { label: "Panamá", value: "PA" },
  { label: "El Salvador", value: "SV" },
  { label: "Guatemala", value: "GT" }
];

const PersonalDetailsScreen = () => {
  const user = authStore((state) => state.user);
  const { updatePersonalDetails, isLoading } = useUpdateUserProfile();

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PersonalDetailsFormData>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      dateOfBirth: formatDateForInput(user?.dateOfBirth) || "",
      nationality: user?.nationality || "",
      countryOfResidence: user?.countryOfResidence || "",
      documentType: user?.documentType || DocumentTypeEnum.CC,
      documentNumber: user?.documentNumber || "",
    },
  });

  const formValues = watch();

  const onSubmit = async (data: PersonalDetailsFormData) => {
    const result = await updatePersonalDetails(data);
    if (result.success) {
      Alert.alert("Éxito", "Datos actualizados correctamente");
    } else {
      Alert.alert("Error", result.error ?? "No se pudieron actualizar los datos");
    }
  };

  if (!user) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Usuario no encontrado</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      <BackGroundGradient />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
      >
        <ScrollView
          className="flex-1 px-3"
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* User Header */}
          <View className="mb-4">
            <UserHeader
              user={user as BrickleUser}
            />
          </View>

          <Text className="text-dark-blue px-3 font-libre-bold text-xl mb-2">
            Datos personales
          </Text>

          {/* Card Form */}
          <View className="bg-white items-center justify-center flex flex-col rounded-2xl shadow-lg p-6 mb-10">
            <Controller
              control={control}
              name="firstName"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  width="w-full"
                  label="Nombre"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Nombre"
                  autoCapitalize="words"
                  containerClassName="mb-4"
                  error={errors.firstName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="lastName"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  width="w-full"
                  label="Apellido"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Apellido"
                  autoCapitalize="words"
                  containerClassName="mb-4"
                  error={errors.lastName?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  width="w-full"
                  label="Correo electrónico"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Correo electrónico"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  containerClassName="mb-4"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  width="w-full"
                  label="Número de teléfono"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Número de teléfono"
                  keyboardType="phone-pad"
                  containerClassName="mb-4"
                  error={errors.phoneNumber?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="dateOfBirth"
              render={({ field: { onChange, onBlur, value } }) => (
                <DatePickerField
                  width="w-full"
                  label="Fecha de nacimiento"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="DD/MM/AAAA"
                  containerClassName="mb-4"
                  error={errors.dateOfBirth?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="nationality"
              render={({ field: { onChange, value } }) => (
                <SelectBottomSheet
                  label="Nacionalidad"
                  value={value}
                  options={nationalityOptions}
                  onValueChange={onChange}
                  containerClassName="w-full mb-4"
                  error={errors.nationality?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="countryOfResidence"
              render={({ field: { onChange, value } }) => (
                <SelectBottomSheet
                  label="País de residencia"
                  value={value}
                  options={residenceCountryOptions}
                  onValueChange={onChange}
                  containerClassName="w-full mb-4"
                  error={errors.countryOfResidence?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="documentType"
              render={({ field: { onChange, value } }) => (
                <SelectBottomSheet
                  label="Tipo de documento"
                  value={value.toString()}
                  options={documentTypeOptions}
                  onValueChange={(val) => onChange(val === "" ? DocumentTypeEnum.CC : Number(val) as DocumentTypeEnum)}
                  containerClassName="w-full mb-4"
                  error={errors.documentType?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="documentNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  width="w-full"
                  label="Número de identificación"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Número de identificación"
                  containerClassName="mb-4"
                  error={errors.documentNumber?.message}
                />
              )}
            />

            {/* Save Button */}
            <Button
              onPress={handleSubmit(onSubmit)}
              label={isLoading ? "Guardando..." : "Modificar datos"}
              disabled={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default PersonalDetailsScreen;
