import { ethers } from "ethers";
import { getPrivateKey } from "./auth.service";
import { getWalletBackup } from "./wallet-backup.service";
import { hasWalletSigningKeyFor, WalletKeyUnlockError } from "./wallet-key-storage.service";

type WalletSigningReadiness =
  | { status: "ready"; privateKey: string }
  | { status: "restoreRequired" }
  | { status: "upgradeRequired" }
  | { status: "unlockCancelled" };

function isBackupMissing(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { status?: number } }).response === "object" &&
    (error as { response?: { status?: number } }).response?.status === 404;
}

function privateKeyMatchesAddress(privateKey: string, walletAddress: string) {
  try {
    return new ethers.Wallet(privateKey).address.toLowerCase() === walletAddress.toLowerCase();
  } catch {
    return false;
  }
}

export async function ensureWalletReadyForSigning(): Promise<WalletSigningReadiness> {
  let backupWalletAddress: string;
  try {
    const backup = await getWalletBackup();
    if (backup.encryptionVersion !== "ethers-keystore-v1-backup-code") {
      return { status: "upgradeRequired" };
    }
    backupWalletAddress = backup.walletAddress;
  } catch (error) {
    if (isBackupMissing(error)) {
      return { status: "upgradeRequired" };
    }

    throw error;
  }

  // Cheap check (no biometric prompt): does this device hold the key for the account wallet?
  if (!(await hasWalletSigningKeyFor(backupWalletAddress))) {
    return { status: "restoreRequired" };
  }

  let privateKey: string | null;
  try {
    privateKey = await getPrivateKey();
  } catch (error) {
    if (error instanceof WalletKeyUnlockError) {
      return { status: "unlockCancelled" };
    }
    throw error;
  }

  if (!privateKey) {
    return { status: "restoreRequired" };
  }

  // A key left on the device by another wallet (previous wallet, other user) must never sign.
  if (!privateKeyMatchesAddress(privateKey, backupWalletAddress)) {
    console.warn("[wallet-security-gate] local signing key does not match backup wallet", {
      backupWalletAddress,
    });
    return { status: "restoreRequired" };
  }

  return { status: "ready", privateKey };
}
