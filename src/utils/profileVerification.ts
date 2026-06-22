import { PartialBrickleUser } from "../types/user.types";

type VerificationFlags = Pick<
  PartialBrickleUser,
  "isBasicProfileComplete" | "isFullProfileComplete" | "isProfileUnderReview"
>;

export function needsIdentityDocument(user?: VerificationFlags | null): boolean {
  return Boolean(
    user?.isBasicProfileComplete &&
      !user?.isFullProfileComplete &&
      !user?.isProfileUnderReview
  );
}
