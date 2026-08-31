import { CompleteProfileFormData } from "@/src/schemes/complete-profile-scheme";
import { BrickleUserUpdateRequest } from "@/src/types/user.types";
import { parseDateToISO } from "@/src/utils/date.utility";

type CompleteProfileSubmissionInput = CompleteProfileFormData & {
  id: string;
  email: string;
};

export function buildCompleteProfileUpdate(
  formData: CompleteProfileSubmissionInput
): BrickleUserUpdateRequest {
  return {
    id: formData.id,
    email: formData.email,
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    phoneNumber: formData.phoneNumber.trim(),
    dateOfBirth: parseDateToISO(formData.birthDate),
    nationality: formData.nationality,
    countryOfResidence: formData.residenceCountry,
    documentType: formData.documentType,
    documentNumber: formData.documentNumber,
    isBasicProfileComplete: true,
    isProfileUnderReview: false,
    // Consentimiento explícito capturado en el paso 3 del formulario: Términos y
    // condiciones, Contrato de colaboración empresarial y Declaración de origen de
    // fondos deben haberse aceptado (validado por `consentSchema`) antes de llegar aquí.
    termsAccepted:
      formData.acceptsTermsAndConditions &&
      formData.acceptsBusinessCollaborationContract &&
      formData.acceptsOriginOfFundsDeclaration,
  };
}
