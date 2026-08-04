import { authStore, persistPrivateKeyToSecureStore } from "@/src/store/auth.store";
import { getWalletBackup } from "./wallet-backup.service";
import { restorePrivateKeyFromBackup } from "./wallet-backup-crypto.service";
import { normalizeWalletBackupCode } from "./wallet-backup-code.service";

export async function restoreWalletBackupToDevice(recoveryPassword: string) {
  const backup = await getWalletBackup();
  const privateKey = await restorePrivateKeyFromBackup({
    backup,
    recoveryPassword: normalizeWalletBackupCode(recoveryPassword),
  });

  authStore.getState().setPrivateKey(privateKey);
  await persistPrivateKeyToSecureStore(privateKey);

  return { walletAddress: backup.walletAddress };
}
