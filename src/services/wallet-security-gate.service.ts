import { getPrivateKey } from "./auth.service";
import { getWalletBackup } from "./wallet-backup.service";

type WalletSigningReadiness =
  | { status: "ready"; privateKey: string }
  | { status: "restoreRequired" }
  | { status: "upgradeRequired" };

function isBackupMissing(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { status?: number } }).response === "object" &&
    (error as { response?: { status?: number } }).response?.status === 404;
}

export async function ensureWalletReadyForSigning(): Promise<WalletSigningReadiness> {
  try {
    const backup = await getWalletBackup();
    if (backup.encryptionVersion !== "ethers-keystore-v1-backup-code") {
      return { status: "upgradeRequired" };
    }
  } catch (error) {
    if (isBackupMissing(error)) {
      return { status: "upgradeRequired" };
    }

    throw error;
  }

  const privateKey = await getPrivateKey();
  if (!privateKey) {
    return { status: "restoreRequired" };
  }

  return { status: "ready", privateKey };
}
