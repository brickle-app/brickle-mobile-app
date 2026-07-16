import { brickleClient } from "@/src/lib/api/axios-brickle.client";
import { WalletBackupPayload } from "@/src/types/walletBackup.types";
import { refreshToken } from "./auth.service";

function isUnauthorized(error: unknown) {
  return typeof error === "object" &&
    error !== null &&
    "response" in error &&
    (error as { response?: { status?: number } }).response?.status === 401;
}

async function withAuthRefreshRetry<T>(request: () => Promise<T>) {
  try {
    return await request();
  } catch (error) {
    if (!isUnauthorized(error)) throw error;

    const refresh = await refreshToken();
    if (!refresh.success) throw error;

    return request();
  }
}

export async function saveWalletBackup(payload: WalletBackupPayload) {
  const response = await withAuthRefreshRetry(() =>
    brickleClient.post<WalletBackupPayload>("/api/wallet/backup", payload)
  );
  return response.data;
}

export async function upgradeWalletBackup(payload: WalletBackupPayload) {
  const response = await withAuthRefreshRetry(() =>
    brickleClient.post<WalletBackupPayload>("/api/wallet/backup/upgrade", payload)
  );
  return response.data;
}

export async function getWalletBackup() {
  const response = await withAuthRefreshRetry(() =>
    brickleClient.get<WalletBackupPayload>("/api/wallet/backup")
  );
  return response.data;
}
