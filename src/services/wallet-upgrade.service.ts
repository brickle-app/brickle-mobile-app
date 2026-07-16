import "@/src/utils/crypto-get-random-values";
import { ethers } from "ethers";
import { authStore } from "@/src/store/auth.store";
import { generateWalletBackupCode } from "./wallet-backup-code.service";
import { createWalletBackupWithBackupCode } from "./wallet-backup-crypto.service";
import { upgradeWalletBackup } from "./wallet-backup.service";

type WalletActivationStage =
  | "generate-backup-code"
  | "derive-wallet"
  | "encrypt-backup"
  | "upload-backup"
  | "update-local-session";

export class WalletActivationError extends Error {
  readonly stage: WalletActivationStage;
  override readonly cause: unknown;

  constructor(stage: WalletActivationStage, cause: unknown) {
    const causeMessage = cause instanceof Error ? cause.message : String(cause);
    super(`No se pudo activar tu cuenta en este paso: ${stage}. ${causeMessage}`);
    this.name = "WalletActivationError";
    this.stage = stage;
    this.cause = cause;
  }
}

export function getWalletActivationUserMessage(error: unknown) {
  if (error instanceof WalletActivationError) {
    return __DEV__
      ? error.message
      : "No pudimos activar tu cuenta. Intenta de nuevo.";
  }

  return "No pudimos activar tu cuenta. Intenta de nuevo.";
}

function logWalletActivationStage(stage: WalletActivationStage, data?: Record<string, unknown>) {
  if (__DEV__) console.log(`[wallet-activation] ${stage}`, data ?? {});
}

function logWalletActivationFailure(error: WalletActivationError) {
  if (__DEV__) {
    console.warn("[wallet-activation] failed", {
      stage: error.stage,
      message: error.message,
      cause: error.cause,
    });
  }
}

async function runWalletActivationStage<T>(stage: WalletActivationStage, action: () => T | Promise<T>) {
  try {
    logWalletActivationStage(stage);
    return await action();
  } catch (error) {
    throw new WalletActivationError(stage, error);
  }
}

export async function generateSecureWalletUpgradeBackupCode() {
  return runWalletActivationStage("generate-backup-code", () => generateWalletBackupCode());
}

export async function activateSecureWalletUpgrade(backupCode: string) {
  try {
    const wallet = await runWalletActivationStage("derive-wallet", () => ethers.Wallet.fromPhrase(backupCode));
    const backup = await runWalletActivationStage("encrypt-backup", () => createWalletBackupWithBackupCode({
      privateKey: wallet.privateKey,
      backupCode,
      walletAddress: wallet.address,
    }));

    await runWalletActivationStage("upload-backup", () => upgradeWalletBackup(backup));

    await runWalletActivationStage("update-local-session", () => {
      const state = authStore.getState();
      state.setPrivateKey(wallet.privateKey);
      if (state.user) {
        state.setUser({ ...state.user, walletAddress: wallet.address });
      }
    });

    return {
      walletAddress: wallet.address,
    };
  } catch (error) {
    if (error instanceof WalletActivationError) {
      logWalletActivationFailure(error);
    }
    throw error;
  }
}
