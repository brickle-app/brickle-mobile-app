import { z } from "zod";
import { DocumentTypeEnum } from "../types/user.types";
import { isAdultDisplayDate } from "../utils/datePicker";

const dateValidation = z
  .string()
  .min(1, "Fecha de nacimiento es requerida")
  .refine(
    (date) => isAdultDisplayDate(date),
    "Debes seleccionar una fecha válida y ser mayor de 18 años"
  );

export const personalDetailsSchema = z.object({
  firstName: z.string().min(1, "Nombre es requerido"),
  lastName: z.string().min(1, "Apellido es requerido"),
  email: z.string().email("Email inválido"),
  phoneNumber: z
    .string()
    .min(10, "Número de teléfono debe tener al menos 10 dígitos"),
  dateOfBirth: dateValidation,
  nationality: z.string().min(1, "Nacionalidad es requerida"),
  countryOfResidence: z.string().min(1, "País de residencia es requerido"),
  documentType: z.nativeEnum(DocumentTypeEnum, {
    errorMap: () => ({ message: "Tipo de documento es requerido" }),
  }),
  documentNumber: z.string().min(1, "Número de documento es requerido"),
});

export type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;
