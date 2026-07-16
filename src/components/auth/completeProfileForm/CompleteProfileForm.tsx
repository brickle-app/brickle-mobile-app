import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useCompleteProfileForm } from "@/src/hooks/auth/useCompleteProfileForm";
import { Ionicons } from "@expo/vector-icons";
import StepIndicator from "./StepIndicator";
import { DatePickerField, FormField, SelectBottomSheet } from "../../ui/input";
import { CompleteProfileFormData } from "@/src/schemes/complete-profile-scheme";
import { Button } from "../../ui/button/Button";
import { useRouter } from "expo-router";
import { Colors } from "@/assets/Colors";
import { DocumentTypeEnum } from "@/src/types/user.types";

const CompleteProfileForm = () => {
  const router = useRouter();
  const goBackOrDashboard = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/(stack)/(tabs)/dashboard");
  };
  const {
    currentStep,
    totalSteps,
    formData,
    errors,
    currentFields,
    isLastStep,
    handleChange,
    nextStep,
    isLoading,
  } = useCompleteProfileForm();

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row justify-start items-start w-full px-6">
          <TouchableOpacity className="flex-row items-center justify-center gap-2" onPress={goBackOrDashboard}>
            <Ionicons
              name="arrow-back-circle"
              size={28}
              color={Colors.textPrimary}
            />
            <Text className="text-text-primary font-libre-bold text-center text-xl">
              Regresar
            </Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 flex justify-around items-center p-6">
          <View className="flex flex-col justify-center items-center w-full gap-4">
            {/* Header and Step Indicator */}
            <View className="items-center mb-6">
              <Ionicons
                name="person-circle-outline"
                size={64}
                color={Colors.textPrimary}
              />
              <Text className="text-3xl font-libre-bold text-text-primary mt-2">
                Completar perfil
              </Text>
            </View>
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

            {/* Form Fields */}
            <View className="flex w-full flex-col justify-center items-center gap-4">
              {currentFields.map((field) => {
                if (field.type === "select" && field.options) {
                  return (
                    <SelectBottomSheet
                      key={field.id}
                      value={String(formData[field.id as keyof CompleteProfileFormData])}
                      options={field.options.map((option) => ({
                        label: option.label,
                        value: option.value.toString(),
                      }))}
                      onValueChange={(value) => {
                        const fieldKey = field.id as keyof CompleteProfileFormData;
                        if (fieldKey === 'documentType') {
                          handleChange('documentType', Number(value) as DocumentTypeEnum);
                        } else {
                          handleChange(fieldKey, String(value) as CompleteProfileFormData[typeof fieldKey]);
                        }
                      }}
                      error={errors[field.id as keyof CompleteProfileFormData]}
                      containerClassName="w-full"
                    />
                  );
                }

                if (field.type === "date") {
                  const fieldKey = field.id as keyof CompleteProfileFormData;
                  return (
                    <DatePickerField
                      key={field.id}
                      label={field.label}
                      placeholder={field.placeholder}
                      icon={field.icon}
                      value={String(formData[fieldKey])}
                      onChangeText={(text) => handleChange(fieldKey, text)}
                      error={errors[fieldKey]}
                      containerClassName="w-full"
                      inputWrapperClassName="!w-full"
                    />
                  );
                }

                return (
                  <FormField
                    key={field.id}
                    label={field.label}
                    placeholder={field.placeholder}
                    icon={field.icon}
                    keyboardType={
                      field.type !== "select" ? field.type : undefined
                    }
                    value={String(
                      formData[field.id as keyof CompleteProfileFormData]
                    )}
                    onChangeText={(text) =>
                      handleChange(
                        field.id as keyof CompleteProfileFormData,
                        text
                      )
                    }
                    error={errors[field.id as keyof CompleteProfileFormData]}
                    containerClassName="w-full"
                    inputWrapperClassName="!w-full"
                  />
                );
              })}
            </View>
          </View>

          {/* Navigation Buttons */}
          <View className="flex-row justify-between items-center mt-8">
            {currentStep === 1 && <View />}

            <Button
              onPress={nextStep}
              style={{ maxWidth: "70%" }}
              disabled={isLoading}
            >
              <Text className="text-text-primary font-libre-bold text-center">
                {isLoading
                  ? "Procesando..."
                  : isLastStep
                    ? "Finalizar"
                    : "Continuar"}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CompleteProfileForm;
