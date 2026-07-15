import { brickleClient } from "@/src/lib/api/axios-brickle.client";
import { WalletBackupPayload } from "@/src/types/walletBackup.types";

export async function saveWalletBackup(payload: WalletBackupPayload) {
  const response = await brickleClient.post<WalletBackupPayload>("/api/wallet/backup", payload);
  return response.data;
}

export async function upgradeWalletBackup(payload: WalletBackupPayload) {
  const response = await brickleClient.post<WalletBackupPayload>("/api/wallet/backup/upgrade", payload);
  return response.data;
}

export async function getWalletBackup() {
  const response = await brickleClient.get<WalletBackupPayload>("/api/wallet/backup");
  return response.data;
}
