import { z } from "zod";
import { DocumentTypeEnum } from "../types/user.types";
import { isAdultDisplayDate } from "../utils/datePicker";

const birthDateValidation = z
  .string()
  .min(1, "Fecha de nacimiento es requerida")
  .refine(
    (date) => isAdultDisplayDate(date),
    "Debes seleccionar una fecha válida y ser mayor de 18 años"
  );

export const step1Schema = z.object({
  firstName: z.string().trim().min(2, "Nombre debe tener al menos 2 caracteres"),
  lastName: z.string().trim().min(2, "Apellido debe tener al menos 2 caracteres"),
  phoneNumber: z
    .string()
    .trim()
    .regex(/^3\d{9}$/, "El teléfono debe ser un número móvil colombiano válido"),
  birthDate: birthDateValidation,
});

export const step2Schema = z.object({
  nationality: z.string().min(1, "Nacionalidad es requerida"),
  residenceCountry: z.string().min(1, "País de residencia es requerido"),
  documentType: z.nativeEnum(DocumentTypeEnum),
  documentNumber: z
    .string()
    .min(1, "Número de documento es requerido")
    .regex(/^\d+$/, "Número de documento debe ser numérico"), // Added regex for numeric check
});

export const consentSchema = z.object({
  acceptsTermsAndConditions: z.literal<boolean>(true, {
    errorMap: () => ({ message: "Debes aceptar los Términos y condiciones" }),
  }),
  acceptsBusinessCollaborationContract: z.literal<boolean>(true, {
    errorMap: () => ({
      message: "Debes aceptar el Contrato de colaboración empresarial",
    }),
  }),
  acceptsOriginOfFundsDeclaration: z.literal<boolean>(true, {
    errorMap: () => ({
      message: "Debes aceptar la Declaración de origen de fondos",
    }),
  }),
});

export const completeProfileSchema = step1Schema
  .merge(step2Schema)
  .merge(consentSchema);

export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

// Define a type for step-specific schemas for easier use in the hook
export type StepSchema = typeof step1Schema | typeof step2Schema | typeof consentSchema;
