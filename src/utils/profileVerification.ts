import { PartialBrickleUser } from "../types/user.types";

type VerificationFlags = {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: Date | string | null;
  nationality?: string | null;
  countryOfResidence?: string | null;
  documentType?: PartialBrickleUser["documentType"] | null;
  documentNumber?: string | null;
  isBasicProfileComplete?: boolean | null;
  isFullProfileComplete?: boolean | null;
  isProfileUnderReview?: boolean | null;
};

export function hasRequiredProfileInfo(user?: VerificationFlags | null): boolean {
  return Boolean(
    user &&
      user.isBasicProfileComplete &&
      user.firstName?.trim() &&
      user.lastName?.trim() &&
      user.phoneNumber?.trim() &&
      user.dateOfBirth &&
      user.nationality?.trim() &&
      user.countryOfResidence?.trim() &&
      user.documentType &&
      user.documentNumber?.trim()
  );
}

export function needsIdentityDocument(user?: VerificationFlags | null): boolean {
  return Boolean(
    hasRequiredProfileInfo(user) &&
      !user?.isFullProfileComplete &&
      !user?.isProfileUnderReview
  );
}

export function shouldShowCompleteProfileWarning(user?: VerificationFlags | null): boolean {
  return Boolean(
    user &&
      !user.isFullProfileComplete &&
      !user.isProfileUnderReview &&
      !hasRequiredProfileInfo(user)
  );
}
