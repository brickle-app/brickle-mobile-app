import { ethers } from "ethers";
import { authStore } from "@/src/store/auth.store";
import { generateWalletBackupCode } from "./wallet-backup-code.service";
import { createWalletBackupWithBackupCode } from "./wallet-backup-crypto.service";
import { upgradeWalletBackup } from "./wallet-backup.service";

export async function createSecureWalletUpgrade() {
  const backupCode = generateWalletBackupCode();
  const wallet = ethers.Wallet.fromPhrase(backupCode);
  const backup = await createWalletBackupWithBackupCode({
    privateKey: wallet.privateKey,
    backupCode,
    walletAddress: wallet.address,
  });

  await upgradeWalletBackup(backup);

  const state = authStore.getState();
  state.setPrivateKey(wallet.privateKey);
  if (state.user) {
    state.setUser({ ...state.user, walletAddress: wallet.address });
  }

  return {
    walletAddress: wallet.address,
    backupCode,
    privateKey: wallet.privateKey,
  };
}
