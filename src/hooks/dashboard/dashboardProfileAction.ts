import { hasRequiredProfileInfo } from "@/src/utils/profileVerification";

type DashboardProfileUser = {
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  dateOfBirth?: Date | string | null;
  nationality?: string | null;
  countryOfResidence?: string | null;
  documentType?: number | null;
  documentNumber?: string | null;
  isBasicProfileComplete?: boolean | null;
  isFullProfileComplete?: boolean | null;
  isProfileUnderReview?: boolean | null;
};

export type DashboardProfileAction =
  | "discover"
  | "review"
  | "complete-profile"
  | "upload-document";

export function getDashboardProfileAction(
  user?: DashboardProfileUser | null
): DashboardProfileAction {
  if (user?.isFullProfileComplete) return "discover";
  if (user?.isProfileUnderReview) return "review";
  if (!hasRequiredProfileInfo(user)) return "complete-profile";
  return "upload-document";
}
