import { ethers } from "ethers";
import { WalletBackupPayload } from "@/src/types/walletBackup.types";

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
}

function readKeystoreKdfParams(encryptedJson: string) {
  const parsed = JSON.parse(encryptedJson);
  return parsed.crypto?.kdfparams ?? parsed.Crypto?.kdfparams ?? {};
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

  const encryptedPrivateKey = await wallet.encrypt(recoveryPassword);

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
}: RestorePrivateKeyParams) {
  try {
    const wallet = await ethers.Wallet.fromEncryptedJson(
      backup.encryptedPrivateKey,
      recoveryPassword
    );

    if (wallet.address.toLowerCase() !== backup.walletAddress.toLowerCase()) {
      throw new Error("Wallet address mismatch");
    }

    return wallet.privateKey;
  } catch {
    throw new Error("No se pudo restaurar la wallet. Revisa tu contraseña de recuperación.");
  }
}
