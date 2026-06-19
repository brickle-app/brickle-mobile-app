import { z } from "zod";
import { DocumentTypeEnum } from "../types/user.types";

export const step1Schema = z.object({
  birthDate: z.string().min(1, "Fecha de nacimiento es requerida"),
  nationality: z.string().min(1, "Nacionalidad es requerida"),
  residenceCountry: z.string().min(1, "País de residencia es requerido"),
});

export const step2Schema = z.object({
  documentType: z.nativeEnum(DocumentTypeEnum),
  documentNumber: z
    .string()
    .min(1, "Número de documento es requerido")
    .regex(/^\d+$/, "Número de documento debe ser numérico"), // Added regex for numeric check
});

export const completeProfileSchema = step1Schema.merge(step2Schema);

export type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

// Define a type for step-specific schemas for easier use in the hook
export type StepSchema = typeof step1Schema | typeof step2Schema;
