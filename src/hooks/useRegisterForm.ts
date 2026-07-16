import { useState } from "react";
import { RegisterFormData } from "@/src/types/forms";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { BrickleService } from "@/src/services/brickle.service";
import { ethers } from "ethers";
import uuid from "react-native-uuid";

import { authStore } from "@/src/store/auth.store";
import { usePinStore } from "@/src/store/pin.store";
import { createAndSaveWalletBackup } from "@/src/services/wallet-backup-registration.service";
import { generateWalletBackupCode, normalizeWalletBackupCode } from "@/src/services/wallet-backup-code.service";
import { getBackupCodeConfirmationError } from "@/src/utils/registerBackupCodeValidation";

/**
 * Validation rules for the register form
 */
const validationRules = {
  firstName: (value: string) => {
    if (!value.trim()) return "El nombre es requerido";
    if (value.trim().length < 2)
      return "El nombre debe tener al menos 2 caracteres";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value))
      return "El nombre solo puede contener letras";
    return null;
  },
  lastName: (value: string) => {
    if (!value.trim()) return "El apellido es requerido";
    if (value.trim().length < 2)
      return "El apellido debe tener al menos 2 caracteres";
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value))
      return "El apellido solo puede contener letras";
    return null;
  },
  email: (value: string) => {
    if (!value.trim()) return "El email es requerido";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Ingrese un email válido";
    return null;
  },
  phone: (value: string) => {
    if (!value.trim()) return "El teléfono es requerido";
    // Remove any non-numeric characters for validation
    const numericPhone = value.replace(/\D/g, "");
    if (numericPhone.length < 10)
      return "El teléfono debe tener al menos 10 dígitos";
    if (numericPhone.length > 10)
      return "El teléfono no puede tener más de 10 dígitos";
    if (!/^3\d{9}$/.test(numericPhone))
      return "El teléfono debe ser un número móvil válido (empezar con 3)";
    return null;
  },
  backupCodeConfirmation: (value: string) => {
    if (!value.trim()) return "Confirma tu backup code";
    return null;
  },
};

/**
 * Custom hook for handling register form
 * @returns Object with form state, handling functions, validation and submit
 */
export const useRegisterForm = () => {
  const { userEmail, setUser, setIsAuthenticated } = authStore();
  // Initialize form with email from auth store if available
  const [backupCode] = useState(() => generateWalletBackupCode());
  const initialFormState: RegisterFormData = {
    firstName: "",
    lastName: "",
    email: userEmail || "",
    phone: "",
    backupCodeConfirmation: "",
    termsAccepted: false,
  };
  const currentSession = authStore((state) => state.accessToken);
  const [formData, setFormData] = useState<RegisterFormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const validation = useFormValidation(validationRules);

  /**
   * Handles changes in form fields
   * @param field - Field to update
   * @param value - New value
   */
  const handleChange = (
    field: keyof RegisterFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  /**
   * Handles field blur events
   * @param field - Field that lost focus
   */
  const handleBlur = (field: keyof RegisterFormData) => {
    validation.handleBlur(field, formData[field] as string);
  };

  /**
   * Validates the entire form
   * @returns true if the form is valid
   */
  const validateForm = () => {
    const isValid = validation.validateForm(
      formData as unknown as Record<string, string>
    );
    const backupCodeError = getBackupCodeConfirmationError(
      formData.backupCodeConfirmation,
      backupCode
    );
    if (backupCodeError) {
      validation.handleChange("backupCodeConfirmation", formData.backupCodeConfirmation);
      setSubmitError(backupCodeError);
      return false;
    }
    return isValid;
  };

  /**
   * Handles form submission
   * @returns Promise with the registration result or null if failed
   */
  const handleSubmit = async () => {
    setSubmitError(null);

    // Step 1: Validate form before submission
    if (!validateForm()) {
      return null;
    }

    setIsLoading(true);

    try {
      // Step 2: Create wallet locally with ethers
      const wallet = ethers.Wallet.fromPhrase(backupCode);
      const privateKey = wallet.privateKey;
      const walletAddress = wallet.address;

      authStore.getState().setPrivateKey(privateKey);

      // Step 3: Create user in Brickle database
      const brickle = new BrickleService();

      const brickleUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phoneNumber: formData.phone,
        termsAccepted: formData.termsAccepted,
        walletAddress,
        nationality: "CO",
        countryOfResidence: "CO",
        kycCustomerId: `internal-${uuid.v4()}`,
        currentSession: currentSession,
      };

      const brickleUser = await brickle.createUser(brickleUserData);

      if (!brickleUser) {
        setSubmitError("Error al crear el usuario en Brickle");
        return null;
      }

      await createAndSaveWalletBackup({
        privateKey,
        backupCode,
        walletAddress,
      });

      // Step 4: Update in-memory authenticated user
      const userData = {
        ...brickleUser,
      };

      // Cuenta nueva: quitar PIN persistido de otra sesión (evita ir al dashboard sin crear PIN)
      await usePinStore.getState().removePin();

      // Update auth store
      setUser(userData);
      setIsAuthenticated(true);

      return {
        user: userData,
        brickleUser,
      };
    } catch (error) {
      // Handle specific error types
      if (error instanceof Error) {
        let errorMessage = error.message;
        console.log(errorMessage);

        // Check for specific error patterns
        if (
          errorMessage.includes("email") ||
          (errorMessage.toLowerCase().includes("duplicate") &&
            errorMessage.includes("email"))
        ) {
          setSubmitError("El email ya está registrado");
        } else if (
          errorMessage.includes("phone") ||
          (errorMessage.toLowerCase().includes("duplicate") &&
            errorMessage.includes("phone"))
        ) {
          setSubmitError("El teléfono ya está registrado");
        } else if (errorMessage.includes("Brickle API Error")) {
          // Extract the actual API error message
          const apiError = errorMessage.replace("Brickle API Error: ", "");
          setSubmitError(`Error del servidor: ${apiError}`);
        } else if (
          errorMessage.includes("Failed to fetch") ||
          errorMessage.includes("Network")
        ) {
          setSubmitError(
            "Error de conexión. Verifica tu internet e intenta nuevamente."
          );
        } else {
          setSubmitError(errorMessage);
        }
      } else {
        setSubmitError("Error inesperado. Por favor intente nuevamente.");
      }

      return null;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Resets the form to its initial state
   */
  const resetForm = () => {
    setFormData(initialFormState);
    validation.resetValidation();
    setSubmitError(null);
  };

  /**
   * Checks if the form is valid for submission
   */
  const isFormValid = () => {
    return (
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.phone.trim() !== "" &&
      normalizeWalletBackupCode(formData.backupCodeConfirmation) === backupCode &&
      formData.termsAccepted &&
      Object.keys(validation.errors).length === 0
    );
  };

  /**
   * Checks if email is pre-populated from authentication
   */
  const isEmailFromAuth = () => {
    return !!userEmail && formData.email === userEmail;
  };

  return {
    formData,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    isFormValid,
    isEmailFromAuth,
    isLoading,
    submitError,
    touched: validation.touched,
    errors: validation.errors,
    backupCode,
  };
};
