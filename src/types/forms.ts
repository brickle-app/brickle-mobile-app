import { PaymentMethodType } from "../components/wallet/constants/payment";

/**
 * Type for form errors
 * @key string - Field name
 * @value string - Error message
 */
export type FormErrors = Record<string, string>;

/**
 * Supported document types
 */
export type DocumentType = "cc" | "ce" | "pa";

/**
 * Bank account types
 */
export type AccountType = "ahorros" | "corriente";

/**
 * Contact data
 */
export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  walletAddress: string;
  profilePictureUrl: string;
}

/**
 * Contact form data
 */
export interface ContactFormData {
  selectedContact: Contact | null;
  amount: string;
}

/**
 * Bank account form data
 */
export interface BankAccountFormData {
  accountHolderName: string;
  documentType: DocumentType;
  documentNumber: string;
  bankName: string;
  accountNumber: string;
  amount: string;
  accountType: AccountType;
}

/**
 * Form validation state
 */
export interface FormValidationState {
  touched: Record<string, boolean>;
  errors: FormErrors;
}

/**
 * Validation rules for forms
 */
export type ValidationRules<T> = {
  [K in keyof T]: (value: string) => string | null;
};

/**
 * Specific validation rules for bank account form
 */
export type BankAccountValidationRules = ValidationRules<BankAccountFormData>;

/**
 * Specific validation rules for contact form
 */
export type ContactValidationRules = ValidationRules<ContactFormData>;

/**
 * Payment method types for recharge
 */

/**
 * Recharge form data
 */
export interface RechargeFormData {
  amount: string;
  paymentMethod: PaymentMethodType;
}

/**
 * Specific validation rules for recharge form
 */
export type RechargeValidationRules = ValidationRules<RechargeFormData>;

/**
 * Register form data
 */
export interface RegisterFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  backupCodeConfirmation: string;
  termsAccepted: boolean;
}

/**
 * Specific validation rules for register form
 */
export type RegisterValidationRules = ValidationRules<RegisterFormData>;
