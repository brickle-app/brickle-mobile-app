import { ethers } from "ethers";

export function normalizeWalletBackupCode(backupCode: string) {
  return backupCode.trim().toLowerCase().replace(/\s+/g, " ");
}

export function generateWalletBackupCode() {
  const phrase = ethers.Wallet.createRandom().mnemonic?.phrase;
  if (!phrase) {
    throw new Error("No se pudo generar la seed phrase de la wallet");
  }

  return normalizeWalletBackupCode(phrase);
}
