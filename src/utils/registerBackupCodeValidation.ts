import { normalizeWalletBackupCode } from "@/src/services/wallet-backup-code.service";

export function getBackupCodeConfirmationError(confirmation: string, backupCode: string) {
  return normalizeWalletBackupCode(confirmation) === backupCode
    ? null
    : "Los códigos de respaldo no coinciden.";
}
