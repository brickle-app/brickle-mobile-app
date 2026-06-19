import { useState } from "react";
import { BankAccountFormData, DocumentType } from "@/src/types/forms";
import { useFormValidation } from "@/src/hooks/useFormValidation";

const initialFormState: BankAccountFormData = {
  accountHolderName: "",
  documentType: "cc",
  documentNumber: "",
  bankName: "",
  accountNumber: "",
  amount: "",
  accountType: "ahorros",
};

/**
 * Validation rules for the bank account form
 */
const validationRules = {
  accountHolderName: (value: string) => {
    if (!value.trim()) return "El nombre del titular es requerido";
    if (value.trim().length < 3)
      return "El nombre debe tener al menos 3 caracteres";
    return null;
  },
  documentType: (value: string) => {
    if (!value.trim()) return "El tipo de documento es requerido";
    if (!["cc", "ce", "pa"].includes(value as DocumentType))
      return "Tipo de documento no válido";
    return null;
  },
  documentNumber: (value: string) => {
    if (!value.trim()) return "El número de documento es requerido";
    if (!/^\d+$/.test(value))
      return "El número de documento debe contener solo números";
    if (value.length < 5) return "El número de documento es muy corto";
    return null;
  },
  bankName: (value: string) => {
    if (!value.trim()) return "El nombre del banco es requerido";
    return null;
  },
  accountNumber: (value: string) => {
    if (!value.trim()) return "El número de cuenta es requerido";
    if (!/^[\d-]+$/.test(value))
      return "El número de cuenta debe contener solo números y guiones";
    if (value.replace(/-/g, "").length < 8)
      return "El número de cuenta es muy corto";
    return null;
  },
  amount: (value: string) => {
    if (!value.trim()) return "El monto es requerido";
    if (!/^\d+(\.\d{1,2})?$/.test(value)) return "Ingrese un monto válido";
    if (parseFloat(value) <= 0) return "El monto debe ser mayor a 0";
    return null;
  },
  accountType: (value: string) => null, // No validation needed for account type as it's controlled
};

/**
 * Custom hook for handling bank account form
 * @returns Object with form state, handling functions and validation
 */
export const useBankAccountForm = () => {
  const [formData, setFormData] =
    useState<BankAccountFormData>(initialFormState);
  const validation = useFormValidation(validationRules);

  /**
   * Handles changes in form fields
   * @param field - Field to update
   * @param value - New value
   */
  const handleChange = (field: keyof BankAccountFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Handles field blur events
   * @param field - Field that lost focus
   */
  const handleBlur = (field: keyof BankAccountFormData) => {
    validation.handleBlur(field, formData[field]);
  };

  /**
   * Validates the entire form
   * @returns true if the form is valid
   */
  const validateForm = () => {
    return validation.validateForm(
      formData as unknown as Record<string, string>
    );
  };

  /**
   * Resets the form to its initial state
   */
  const resetForm = () => {
    setFormData(initialFormState);
    validation.resetValidation();
  };

  return {
    formData,
    handleChange,
    handleBlur,
    validateForm,
    resetForm,
    touched: validation.touched,
    errors: validation.errors,
  };
};
