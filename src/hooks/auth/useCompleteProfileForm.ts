import { useState } from "react";
import { completeProfileInputs } from "@/src/constants/auth/complete-profile.inputs";
import {
  CompleteProfileFormData,
  StepSchema,
} from "@/src/schemes/complete-profile-scheme";
import { completeProfileSteps } from "./completeProfileSteps";
import { updateUser } from "@/src/services/brickle.service";
import { authStore } from "@/src/store/auth.store";
import { DocumentTypeEnum } from "@/src/types/user.types";
import { parseDateToISO } from "@/src/utils/date.utility";
import { router } from "expo-router";
import { Alert } from "react-native";
import { buildCompleteProfileUpdate } from "./completeProfileSubmission";

const initialFormData: CompleteProfileFormData = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  birthDate: "",
  nationality: "",
  residenceCountry: "CO", // Colombia is the only supported residence country
  documentType: DocumentTypeEnum.CC,
  documentNumber: "",
};

export function useCompleteProfileForm() {
  const user = authStore((state) => state.user);
  const setUser = authStore((state) => state.setUser);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] =
    useState<CompleteProfileFormData>({
      ...initialFormData,
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      phoneNumber: user?.phoneNumber ?? "",
    });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CompleteProfileFormData, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const totalSteps = completeProfileSteps.length;
  const isLastStep = currentStep === totalSteps;

  const currentStepConfig = completeProfileSteps.find((step) => step.id === currentStep);
  const currentFields = completeProfileInputs.filter((input) =>
    (currentStepConfig?.fields as readonly string[] | undefined)?.includes(input.id)
  );

  function handleChange<K extends keyof CompleteProfileFormData>(
    field: K,
    value: CompleteProfileFormData[K]
  ) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validateStep(schema: StepSchema): boolean {
    const currentData: Partial<CompleteProfileFormData> = {};
    // Ensure only fields relevant to the current step's schema are validated
    Object.keys(schema.shape).forEach((key) => {
      const fieldKey = key as keyof CompleteProfileFormData;
      if (formData.hasOwnProperty(fieldKey)) {
        currentData[fieldKey] = formData[fieldKey] as any;
      }
    });

    const result = schema.safeParse(currentData);
    if (!result.success) {
      const fieldErrors: Partial<
        Record<keyof CompleteProfileFormData, string>
      > = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof CompleteProfileFormData] =
            err.message;
        }
      });
      // Preserve existing errors for other steps if necessary, or clear selectively
      setErrors(fieldErrors);
      return false;
    }
    // Clear errors only for the fields validated in this step upon success
    const validatedFields = Object.keys(
      schema.shape
    ) as (keyof CompleteProfileFormData)[];
    const updatedErrors = { ...errors };
    validatedFields.forEach((field) => {
      delete updatedErrors[field];
    });
    setErrors(updatedErrors);
    return true;
  }

  async function nextStep() {
    console.log("Next step triggered. Current:", currentStep);
    if (!currentStepConfig) {
      console.error("No step config found for step:", currentStep);
      return;
    }

    const isValid = validateStep(currentStepConfig.schema as StepSchema); // Cast schema type
    console.log("Validation result:", isValid, "Is Last Step:", isLastStep);
    if (isValid && !isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else if (isValid && isLastStep) {
      setIsLoading(true);
      try {
        console.log("Saving user profile to Brickle backend...");

        if (!user) {
          throw new Error("User not found via authStore");
        }

        let dateOfBirth: string;
        try {
          dateOfBirth = parseDateToISO(formData.birthDate);
        } catch {
          Alert.alert(
            "Error",
            "La fecha de nacimiento no es válida. Usa el formato DD/MM/AAAA."
          );
          return;
        }

        const dateForState = new Date(`${dateOfBirth}T12:00:00`);
        if (Number.isNaN(dateForState.getTime())) {
          Alert.alert("Error", "La fecha de nacimiento no es válida.");
          return;
        }

        // Update user via Brickle service. Review begins only after document upload.
        await updateUser(
          buildCompleteProfileUpdate({
            ...formData,
            id: user.id,
            email: user.email,
          })
        );

        // Update local state to reflect basic profile complete
        setUser({
          ...user,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          phoneNumber: formData.phoneNumber.trim(),
          dateOfBirth: dateForState,
          nationality: formData.nationality,
          countryOfResidence: formData.residenceCountry,
          documentType: formData.documentType,
          documentNumber: formData.documentNumber,
          isBasicProfileComplete: true,
          isProfileUnderReview: false,
        });

        // Navigate back (dashboard/wallet will handle next step)
        router.back();

      } catch (error: any) {
        console.error("Error updating user profile:", error);
        const errorMessage = error.message?.includes("Brickle API Error")
          ? error.message
          : "No se pudo actualizar el perfil. Por favor intenta de nuevo.";
        Alert.alert("Error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else if (!isValid) {
      Alert.alert("Error", "Por favor revisa los campos marcados en rojo.");
    }
  }

  function prevStep() {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      // Optionally clear errors when going back, or keep them if you want the user to see previous issues
      setErrors({}); // Clears all errors when going back
    }
  }

  return {
    currentStep,
    totalSteps,
    formData,
    errors,
    currentFields,
    isLastStep,
    isLoading,
    handleChange,
    nextStep,
    prevStep,
  };
}
