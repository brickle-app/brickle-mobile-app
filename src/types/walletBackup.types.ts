export interface WalletBackupPayload {
  walletAddress: string;
  encryptedPrivateKey: string;
  encryptionVersion: "ethers-keystore-v1" | "ethers-keystore-v1-backup-code";
  cipher: "ethers-json-keystore";
  kdf: "scrypt";
  kdfParams: Record<string, number | string>;
}
