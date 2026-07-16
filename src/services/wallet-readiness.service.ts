export type WalletBackupStatus = "missing" | "legacy" | "backupCode" | "unknown";

export type WalletReadinessStatus =
  | "profileRequired"
  | "documentReview"
  | "activationRequired"
  | "restoreRequired"
  | "ready";

export type WalletReadinessInput = {
  isFullProfileComplete?: boolean | null;
  isProfileUnderReview?: boolean | null;
  hasWalletAddress: boolean;
  backupStatus: WalletBackupStatus;
  hasPrivateKey: boolean;
};

export function getWalletReadiness(input: WalletReadinessInput): WalletReadinessStatus {
  if (input.isProfileUnderReview) return "documentReview";
  if (!input.isFullProfileComplete) return "profileRequired";
  if (!input.hasWalletAddress) return "activationRequired";
  if (input.backupStatus !== "backupCode") return "activationRequired";
  if (!input.hasPrivateKey) return "restoreRequired";

  return "ready";
}
