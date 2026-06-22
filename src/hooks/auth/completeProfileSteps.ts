import { step1Schema, step2Schema } from "@/src/schemes/complete-profile-scheme";

export const completeProfileSteps = [
  {
    id: 1,
    fields: ["firstName", "lastName", "phoneNumber", "birthDate"],
    schema: step1Schema,
  },
  {
    id: 2,
    fields: ["nationality", "residenceCountry", "documentType", "documentNumber"],
    schema: step2Schema,
  },
] as const;
