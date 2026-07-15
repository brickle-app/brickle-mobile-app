import { createAndSaveWalletBackup } from "./wallet-backup-registration.service";
import { createWalletBackupWithBackupCode } from "./wallet-backup-crypto.service";
import { saveWalletBackup } from "./wallet-backup.service";

jest.mock("./wallet-backup-crypto.service", () => ({
  createWalletBackupWithBackupCode: jest.fn(),
}));

jest.mock("./wallet-backup.service", () => ({
  saveWalletBackup: jest.fn(),
}));

describe("createAndSaveWalletBackup", () => {
  it("encrypts the private key locally before sending the backup to the API", async () => {
    const backup = {
      walletAddress: "0xabc",
      encryptedPrivateKey: "encrypted-json",
      encryptionVersion: "ethers-keystore-v1" as const,
      cipher: "ethers-json-keystore" as const,
      kdf: "scrypt" as const,
      kdfParams: {},
    };
    jest.mocked(createWalletBackupWithBackupCode).mockResolvedValueOnce(backup);
    jest.mocked(saveWalletBackup).mockResolvedValueOnce(backup);

    await createAndSaveWalletBackup({
      privateKey: "0xprivate",
      backupCode: "BRICKLE-ABCD-EFGH-IJKL-MNPQ-RSTU-VWXY-Z234-567A",
      walletAddress: "0xabc",
    });

    expect(createWalletBackupWithBackupCode).toHaveBeenCalledWith({
      privateKey: "0xprivate",
      backupCode: "BRICKLE-ABCD-EFGH-IJKL-MNPQ-RSTU-VWXY-Z234-567A",
      walletAddress: "0xabc",
    });
    expect(saveWalletBackup).toHaveBeenCalledWith(backup);
    expect(JSON.stringify(jest.mocked(saveWalletBackup).mock.calls[0][0])).not.toContain("0xprivate");
  });
});
