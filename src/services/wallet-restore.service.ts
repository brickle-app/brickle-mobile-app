import { authStore, persistPrivateKeyToSecureStore } from "@/src/store/auth.store";
import { getWalletBackup } from "./wallet-backup.service";
import { restorePrivateKeyFromBackup } from "./wallet-backup-crypto.service";
import { normalizeWalletBackupCode } from "./wallet-backup-code.service";
import { WalletActivationStep } from "@/src/utils/walletActivation";

interface RestoreCallbacks {
  /** Fired as each real phase of the activation starts. */
  onStep?: (step: WalletActivationStep) => void;
  /** 0..1 progress of the scrypt key derivation. */
  onProgress?: (progress: number) => void;
}

export async function restoreWalletBackupToDevice(
  recoveryPassword: string,
  { onStep, onProgress }: RestoreCallbacks = {}
) {
  onStep?.("fetching");
  const backup = await getWalletBackup();

  onStep?.("deriving");
  const privateKey = await restorePrivateKeyFromBackup({
    backup,
    recoveryPassword: normalizeWalletBackupCode(recoveryPassword),
    onProgress: (progress) => {
      onProgress?.(progress);
      // scrypt is done; what remains is decrypting and checking the address matches the account.
      if (progress >= 1) onStep?.("verifying");
    },
  });

  onStep?.("securing");
  authStore.getState().setPrivateKey(privateKey);
  await persistPrivateKeyToSecureStore(privateKey);

  onStep?.("done");
  return { walletAddress: backup.walletAddress };
}
