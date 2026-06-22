type DashboardProfileUser = {
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
  if (!user?.isBasicProfileComplete) return "complete-profile";
  return "upload-document";
}
