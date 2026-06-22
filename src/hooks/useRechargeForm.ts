import { useState } from "react";
import { RechargeFormData } from "@/src/types/forms";
import { useFormValidation } from "@/src/hooks/useFormValidation";
import { RampifyService } from "@/src/services/rampify.service";
import { authStore } from "@/src/store/auth.store";
import { Onramp, Quote } from "../components/wallet/interfaces/RechargeModule";
import {
  PAYMENT_METHODS,
  PaymentMethodType,
  PAYMENT_CURRENCY,
} from "../components/wallet/constants/payment";

const initialFormState: RechargeFormData = {
  amount: "",
  paymentMethod: PAYMENT_METHODS[0].value as PaymentMethodType,
};

/**
 * Validation rules for the recharge form
 */
const validationRules = {
  amount: (value: string) => {
    if (!value.trim()) return "El monto es requerido";

    // Remove any non-numeric characters except decimal point
    const numericValue = value.replace(/[^\d.]/g, "");

    if (!/^\d+(\.\d{1,2})?$/.test(numericValue)) {
      return "Ingrese un monto válido";
    }

    const amount = parseFloat(numericValue);

    if (amount <= 0) return "El monto debe ser mayor a 0";
    if (amount < 100000) return "El monto mínimo de recarga es de 100,000 COP";

    return null;
  },
  paymentMethod: (value: string) => {
    if (!value.trim()) return "El método de pago es requerido";
    if (
      !PAYMENT_METHODS.map((method) => method.value).includes(
        value as PaymentMethodType
      )
    ) {
      return "Método de pago no válido";
    }
    return null;
  },
};

export const useRechargeForm = () => {
  const [formData, setFormData] = useState<RechargeFormData>(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const validation = useFormValidation(validationRules);
  const { user } = authStore();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [onramp, setOnramp] = useState<Onramp | null>(null);

  /**
   * Handles changes in form fields
   * @param field - Field to update
   * @param value - New value
   */
  const handleChange = (field: keyof RechargeFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Trigger validation on change
    validation.handleChange(field, value);

    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError(null);
    }
  };

  /**
   * Handles field blur events
   * @param field - Field that lost focus
   */
  const handleBlur = (field: keyof RechargeFormData) => {
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
   * Handles form submission
   * @returns Promise with the onramp result or null if failed
   */
  const handleSubmit = async () => {
    setSubmitError(null);

    // Validate form before submission
    if (!validateForm()) {
      return null;
    }

    if (!user?.id) {
      setSubmitError("Usuario no autenticado");
      return null;
    }

    setIsLoading(true);

    try {
      const rampify = new RampifyService();
      // Parse amount to number
      const numericAmount = parseFloat(formData.amount.replace(/[^\d.]/g, ""));

      // Create quote
      const quote = await rampify.createQuote({
        userId: user.id,
        type: "onramp",
        amount: numericAmount,
        fiat: PAYMENT_CURRENCY,
        // TODO: Change to COP$ when available
        crypto: "USDC",
        payment: formData.paymentMethod,
        chain: "",
      });

      if (!quote) {
        setSubmitError("Error al crear la cotización");
        return null;
      }

      setQuote(quote as unknown as Quote);
    } catch {
      setSubmitError("Error inesperado. Por favor intente nuevamente.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyAsset = async () => {
    if (!user?.id) {
      setSubmitError("Usuario no autenticado");
      return null;
    }

    if (!quote) {
      setSubmitError("No hay cotización para procesar");
      return null;
    }

    setIsLoading(true);
    try {
      const rampify = new RampifyService();
      const numericAmount = parseFloat(formData.amount.replace(/[^\d.]/g, ""));

      // Buy asset
      const onramp = await rampify.buyAsset({
        quoteId: quote.quoteId,
        fromCurrency: PAYMENT_CURRENCY,
        // TODO: Change to COP$ when available
        toCurrency: "USDC",
        amount: String(numericAmount),
        paymentMethodType: formData.paymentMethod,
        depositAddress: user.walletAddress || "",
        customerId: user.kycCustomerId || "",
        successUrl:
          "https://brickle-web-app.vercel.app/redirect-brickle-mobile?success=true&page=onramp/success",
        cancelUrl:
          "https://brickle-web-app.vercel.app/redirect-brickle-mobile?success=false&page=onramp/failed",
        idempotencyKey: quote.quoteId,
        chain: "",
      });

      if (!onramp) {
        setSubmitError("Error al procesar la recarga");
        return null;
      }
      setQuote(null);
      setIsLoading(false);
      setOnramp(onramp as unknown as Onramp);
    } catch {
      setSubmitError("Error inesperado. Por favor intente nuevamente.");
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
      formData.amount.trim() !== "" &&
      formData.paymentMethod.trim() !== "" &&
      Object.keys(validation.errors).length === 0
    );
  };

  return {
    formData,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    resetForm,
    isFormValid,
    isLoading,
    submitError,
    touched: validation.touched,
    errors: validation.errors,
    quote,
    setQuote,
    handleBuyAsset,
    onramp,
    setOnramp,
  };
};
