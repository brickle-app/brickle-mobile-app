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
    termsAccepted: true,
  };
}
