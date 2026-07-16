import "@/src/utils/crypto-get-random-values";
import * as ExpoCrypto from "expo-crypto";
import { ethers } from "ethers";

type EntropySource = (byteCount: number) => Uint8Array;

export function normalizeWalletBackupCode(backupCode: string) {
  return backupCode.trim().toLowerCase().replace(/\s+/g, " ");
}

export function generateWalletBackupCode(getRandomBytes: EntropySource = ExpoCrypto.getRandomBytes) {
  const entropy = getRandomBytes(16);
  const phrase = ethers.Mnemonic.fromEntropy(entropy).phrase;

  return normalizeWalletBackupCode(phrase);
}
