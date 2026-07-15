import {
  createWalletBackup,
  createWalletBackupWithBackupCode,
  restorePrivateKeyFromBackup,
} from "./wallet-backup-crypto.service";

const privateKey = "0x0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
const walletAddress = "0xFCAd0B19bB29D4674531d6f115237E16AfCE377c";

describe("wallet backup crypto service", () => {
  it("creates an encrypted backup and restores the original private key locally", async () => {
    const backup = await createWalletBackup({
      privateKey,
      recoveryPassword: "correct horse battery staple",
      walletAddress,
    });

    expect(backup.walletAddress).toBe(walletAddress);
    expect(backup.encryptedPrivateKey).not.toContain(privateKey.slice(2));
    expect(backup.encryptionVersion).toBe("ethers-keystore-v1");
    expect(backup.cipher).toBe("ethers-json-keystore");

    await expect(
      restorePrivateKeyFromBackup({
        backup,
        recoveryPassword: "correct horse battery staple",
      })
    ).resolves.toBe(privateKey);
  }, 30000);

  it("rejects an incorrect recovery password", async () => {
    const backup = await createWalletBackup({
      privateKey,
      recoveryPassword: "correct horse battery staple",
      walletAddress,
    });

    await expect(
      restorePrivateKeyFromBackup({
        backup,
        recoveryPassword: "wrong password",
      })
    ).rejects.toThrow("No se pudo restaurar la wallet");
  }, 30000);

  it("creates a backup encrypted with a backup code instead of a user password", async () => {
    const backupCode = "test test test test test test test test test test test junk";
    const backup = await createWalletBackupWithBackupCode({
      privateKey,
      backupCode,
      walletAddress,
    });

    expect(backup.encryptionVersion).toBe("ethers-keystore-v1-backup-code");

    await expect(
      restorePrivateKeyFromBackup({
        backup,
        recoveryPassword: backupCode,
      })
    ).resolves.toBe(privateKey);
  }, 30000);
});
