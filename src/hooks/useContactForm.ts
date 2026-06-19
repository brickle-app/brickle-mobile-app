import { useState } from "react";
import { Contact, ContactFormData } from "../types/forms";
import { useFormValidation } from "./useFormValidation";

const initialFormState: ContactFormData = {
  selectedContact: null,
  amount: "",
};

/**
 * Validation rules for the contact form
 */
const validationRules = {
  selectedContact: (value: string) => {
    if (!value || value === "null") return "Debe seleccionar un contacto";
    return null;
  },
  amount: (value: string) => {
    if (!value.trim()) return "El monto es requerido";
    if (!/^\d+(\.\d{1,2})?$/.test(value)) return "Ingrese un monto válido";
    if (parseFloat(value) <= 0) return "El monto debe ser mayor a 0";
    return null;
  },
};

/**
 * Custom hook for handling contact form
 * @returns Object with form state, handling functions and validation
 */
export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>(initialFormState);
  const validation = useFormValidation(validationRules);

  /**
   * Handles contact selection
   * @param contact - Selected contact
   */
  const handleSelectContact = (contact: Contact | null) => {
    setFormData((prev) => ({
      ...prev,
      selectedContact: contact,
    }));
    validation.handleBlur(
      "selectedContact",
      contact ? JSON.stringify(contact) : "null"
    );
  };

  /**
   * Handles amount field change
   * @param value - New amount value
   */
  const handleAmountChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      amount: value,
    }));
  };

  /**
   * Handles amount field blur event
   */
  const handleAmountBlur = () => {
    validation.handleBlur("amount", formData.amount);
  };

  /**
   * Validates the entire form
   * @returns true if the form is valid
   */
  const validateForm = () => {
    return validation.validateForm({
      selectedContact: formData.selectedContact
        ? JSON.stringify(formData.selectedContact)
        : "null",
      amount: formData.amount,
    });
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
    handleSelectContact,
    handleAmountChange,
    handleAmountBlur,
    validateForm,
    resetForm,
    touched: validation.touched,
    errors: validation.errors,
  };
};
