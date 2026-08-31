import { consentSchema, step1Schema, step2Schema } from "@/src/schemes/complete-profile-scheme";

export const completeProfileSteps = [
  {
    id: 1,
    kind: "fields",
    fields: ["firstName", "lastName", "phoneNumber", "birthDate"],
    schema: step1Schema,
  },
  {
    id: 2,
    kind: "fields",
    fields: ["nationality", "residenceCountry", "documentType", "documentNumber"],
    schema: step2Schema,
  },
  {
    id: 3,
    kind: "consent",
    fields: [
      "acceptsTermsAndConditions",
      "acceptsBusinessCollaborationContract",
      "acceptsOriginOfFundsDeclaration",
    ],
    schema: consentSchema,
  },
] as const;
