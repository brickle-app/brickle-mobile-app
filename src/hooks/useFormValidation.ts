import { useState } from "react";
import {
  FormErrors,
  FormValidationState,
  ValidationRules,
} from "@/src/types/forms";

/**
 * Custom hook for handling form validation
 * @param validationRules - Validation rules for each field
 * @returns Object with validation state and helper functions
 */
export const useFormValidation = <T extends Record<string, string>>(
  validationRules: ValidationRules<T>
) => {
  const [validationState, setValidationState] = useState<FormValidationState>({
    touched: {},
    errors: {},
  });

  /**
   * Validates a specific form field
   * @param field - Field name to validate
   * @param value - Field value
   * @returns Error message or null if valid
   */
  const validateField = (field: keyof T, value: string): string | null => {
    const validateFn = validationRules[field];
    if (!validateFn) {
      console.warn(`No validation rule found for field: ${String(field)}`);
      return null;
    }

    return validateFn(value);
  };

  /**
   * Handles the change event of a field (validates immediately)
   * @param field - Field name
   * @param value - Field value
   */
  const handleChange = (field: keyof T, value: string): void => {
    setValidationState((prev) => {
      // Only validate if field has been touched before
      if (!prev.touched[String(field)]) {
        return prev;
      }

      const error = validateField(field, value);
      const newErrors = { ...prev.errors };

      if (error) {
        newErrors[String(field)] = error;
      } else {
        delete newErrors[String(field)];
      }

      return {
        ...prev,
        errors: newErrors,
      };
    });
  };

  /**
   * Handles the blur event of a field
   * @param field - Field name
   * @param value - Field value
   */
  const handleBlur = (field: keyof T, value: string): void => {
    setValidationState((prev) => {
      const error = validateField(field, value);
      const newErrors = { ...prev.errors };

      if (error) {
        newErrors[String(field)] = error;
      } else {
        delete newErrors[String(field)];
      }

      return {
        touched: { ...prev.touched, [String(field)]: true },
        errors: newErrors,
      };
    });
  };

  /**
   * Validates the entire form
   * @param formData - Form data to validate
   * @returns true if form is valid, false if there are errors
   */
  const validateForm = (formData: T): boolean => {
    const newTouched: Record<string, boolean> = {};
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as (keyof T)[]).forEach((field) => {
      newTouched[String(field)] = true;
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[String(field)] = error;
        isValid = false;
      }
    });

    setValidationState({
      touched: newTouched,
      errors: newErrors,
    });

    return isValid;
  };

  /**
   * Resets the validation state
   */
  const resetValidation = (): void => {
    setValidationState({
      touched: {},
      errors: {},
    });
  };

  return {
    ...validationState,
    handleChange,
    handleBlur,
    validateForm,
    resetValidation,
  };
};
