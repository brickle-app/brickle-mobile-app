import "@/src/utils/crypto-get-random-values";
import * as ExpoCrypto from "expo-crypto";
import { ethers } from "ethers";
import { WalletBackupPayload } from "@/src/types/walletBackup.types";

type RandomBytesSource = (byteCount: number) => Uint8Array;

/**
 * ethers derives the keystore key with scrypt from @noble/hashes. Its async version yields between
 * chunks with a resolved promise (a microtask), which never lets React Native render: the restore
 * overlay froze for the whole derivation. Yielding with setTimeout(0) on every chunk is not enough
 * either, because the timers saturate the JS thread and React never gets a turn.
 *
 * Metro resolves ethers to its ESM build, whose copy of noble can't be patched, so we register our own
 * scrypt in ethers backed by noble's CommonJS copy and replace its `nextTick`: cheap microtask yields
 * while working, and every ~120ms one real frame so React can commit the progress UI (~12% overhead).
 */
const SCRYPT_WORK_SLICE_MS = 120;
const SCRYPT_FRAME_YIELD_MS = 16;

function registerFrameFriendlyScrypt() {
  try {
    let lastFrameYield = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nobleUtils = require("@noble/hashes/utils");
    nobleUtils.nextTick = async () => {
      if (Date.now() - lastFrameYield < SCRYPT_WORK_SLICE_MS) return;
      await new Promise<void>((resolve) => setTimeout(resolve, SCRYPT_FRAME_YIELD_MS));
      lastFrameYield = Date.now();
    };

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { scryptAsync } = require("@noble/hashes/scrypt");
    ethers.scrypt.register(
      (
        passwd: Uint8Array,
        salt: Uint8Array,
        N: number,
        r: number,
        p: number,
        dkLen: number,
        onProgress?: (progress: number) => void
      ) => scryptAsync(passwd, salt, { N, r, p, dkLen, onProgress })
    );
  } catch (error) {
    console.warn("[wallet] Could not register frame-friendly scrypt:", error);
  }
}

registerFrameFriendlyScrypt();

/** scrypt reports ~10,000 times per derivation; only forward when the whole percent changes. */
function throttleToWholePercent(onProgress: (progress: number) => void) {
  let lastPercent = -1;
  return (progress: number) => {
    const percent = Math.floor(progress * 100);
    if (percent !== lastPercent) {
      lastPercent = percent;
      onProgress(percent / 100);
    }
  };
}

interface CreateWalletBackupParams {
  privateKey: string;
  recoveryPassword: string;
  walletAddress: string;
}

interface CreateWalletBackupWithBackupCodeParams {
  privateKey: string;
  backupCode: string;
  walletAddress: string;
}

interface RestorePrivateKeyParams {
  backup: WalletBackupPayload;
  recoveryPassword: string;
  /** Called with a 0..1 fraction while the (slow) scrypt key derivation runs. */
  onProgress?: (progress: number) => void;
}

function readKeystoreKdfParams(encryptedJson: string) {
  const parsed = JSON.parse(encryptedJson);
  return parsed.crypto?.kdfparams ?? parsed.Crypto?.kdfparams ?? {};
}

export function createKeystoreEncryptOptions(getRandomBytes: RandomBytesSource = ExpoCrypto.getRandomBytes) {
  return {
    iv: getRandomBytes(16),
    salt: getRandomBytes(32),
    entropy: getRandomBytes(16),
    uuid: ethers.hexlify(getRandomBytes(16)),
  };
}

export async function createWalletBackup({
  privateKey,
  recoveryPassword,
  walletAddress,
}: CreateWalletBackupParams): Promise<WalletBackupPayload> {
  const wallet = new ethers.Wallet(privateKey);
  if (wallet.address.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error("La clave privada no corresponde a la wallet del usuario");
  }

  const encryptedPrivateKey = await ethers.encryptKeystoreJson(
    {
      address: wallet.address,
      privateKey: wallet.privateKey,
    },
    recoveryPassword,
    createKeystoreEncryptOptions()
  );

  return {
    walletAddress,
    encryptedPrivateKey,
    encryptionVersion: "ethers-keystore-v1",
    cipher: "ethers-json-keystore",
    kdf: "scrypt",
    kdfParams: readKeystoreKdfParams(encryptedPrivateKey),
  };
}

export async function createWalletBackupWithBackupCode({
  privateKey,
  backupCode,
  walletAddress,
}: CreateWalletBackupWithBackupCodeParams): Promise<WalletBackupPayload> {
  const backup = await createWalletBackup({
    privateKey,
    recoveryPassword: backupCode,
    walletAddress,
  });

  return {
    ...backup,
    encryptionVersion: "ethers-keystore-v1-backup-code",
  };
}

export async function restorePrivateKeyFromBackup({
  backup,
  recoveryPassword,
  onProgress,
}: RestorePrivateKeyParams) {
  try {
    const wallet = await ethers.Wallet.fromEncryptedJson(
      backup.encryptedPrivateKey,
      recoveryPassword,
      onProgress && throttleToWholePercent(onProgress)
    );

    if (wallet.address.toLowerCase() !== backup.walletAddress.toLowerCase()) {
      throw new Error("Wallet address mismatch");
    }

    return wallet.privateKey;
  } catch {
    throw new Error("No se pudo restaurar la wallet. Revisa tus códigos de respaldo.");
  }
}
