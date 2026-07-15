import { createWalletBackupWithBackupCode } from "./wallet-backup-crypto.service";
import { saveWalletBackup } from "./wallet-backup.service";

interface CreateAndSaveWalletBackupParams {
  privateKey: string;
  backupCode: string;
  walletAddress: string;
}

export async function createAndSaveWalletBackup(params: CreateAndSaveWalletBackupParams) {
  const backup = await createWalletBackupWithBackupCode(params);
  return saveWalletBackup(backup);
}
