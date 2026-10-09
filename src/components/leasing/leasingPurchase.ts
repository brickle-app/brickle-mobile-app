import { ensureWalletReadyForSigning } from "@/src/services/wallet-security-gate.service";
import { PartialBrickleUser } from "@/src/types/user.types";
import { PurchaseStep } from "@/src/utils/purchaseProgress";

type HandleBuyAsset = (
  email: string,
  walletAddress: string,
  tokens: number,
  amount: number,
  onStep?: (step: PurchaseStep) => void
) => Promise<{ success: boolean }>;

interface PurchaseLeasingAssetParams {
  user: PartialBrickleUser | null | undefined;
  tokens: number;
  pricePerToken: number;
  handleBuyAsset: HandleBuyAsset;
  onMissingPrivateKey: () => void;
  onWalletUpgradeRequired: () => void;
  /** Reports the real phase of the purchase so the UI can show where it is. */
  onStep?: (step: PurchaseStep) => void;
}

export async function purchaseLeasingAsset({
  user,
  tokens,
  pricePerToken,
  handleBuyAsset,
  onMissingPrivateKey,
  onWalletUpgradeRequired,
  onStep,
}: PurchaseLeasingAssetParams) {
  if (!user) {
    console.error("❌ No user data available for purchase");
    return false;
  }

  if (!user.walletAddress) {
    console.error("❌ No wallet address available for purchase - user may need to complete profile");
    return false;
  }

  if (!user.email) {
    console.error("❌ No email available for purchase");
    return false;
  }

  onStep?.("authorizing");
  const readiness = await ensureWalletReadyForSigning();
  if (readiness.status === "upgradeRequired") {
    console.warn("Secure wallet backup not found. Wallet upgrade is required.");
    onWalletUpgradeRequired();
    return false;
  }

  if (readiness.status === "unlockCancelled") {
    // User dismissed Face ID / fingerprint: nothing to fix, they can tap buy again.
    console.warn("Wallet unlock was cancelled by the user.");
    return false;
  }

  if (readiness.status === "restoreRequired") {
    console.warn("Private key not found in auth store. Wallet recovery is required.");
    onMissingPrivateKey();
    return false;
  }

  const { success } = await handleBuyAsset(
    user.email,
    user.walletAddress,
    tokens,
    tokens * pricePerToken,
    onStep
  );
  onStep?.("done");
  return success;
}
