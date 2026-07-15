import { ensureWalletReadyForSigning } from "./wallet-security-gate.service";
import { getPrivateKey } from "./auth.service";
import { getWalletBackup } from "./wallet-backup.service";

jest.mock("./auth.service", () => ({
  getPrivateKey: jest.fn(),
}));

jest.mock("./wallet-backup.service", () => ({
  getWalletBackup: jest.fn(),
}));

describe("wallet security gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requires wallet upgrade when no encrypted backup exists", async () => {
    jest.mocked(getWalletBackup).mockRejectedValueOnce({ response: { status: 404 } });

    await expect(ensureWalletReadyForSigning()).resolves.toEqual({ status: "upgradeRequired" });
  });

  it("requires restore when backup exists but local signing key is missing", async () => {
    jest.mocked(getWalletBackup).mockResolvedValueOnce({ walletAddress: "0xabc", encryptionVersion: "ethers-keystore-v1-backup-code" } as never);
    jest.mocked(getPrivateKey).mockResolvedValueOnce(null);

    await expect(ensureWalletReadyForSigning()).resolves.toEqual({ status: "restoreRequired" });
  });

  it("allows signing when encrypted backup and local signing key exist", async () => {
    jest.mocked(getWalletBackup).mockResolvedValueOnce({ walletAddress: "0xabc", encryptionVersion: "ethers-keystore-v1-backup-code" } as never);
    jest.mocked(getPrivateKey).mockResolvedValueOnce("0xprivate");

    await expect(ensureWalletReadyForSigning()).resolves.toEqual({ status: "ready", privateKey: "0xprivate" });
  });

  it("requires wallet upgrade when the backup was created with the phase-1 password flow", async () => {
    jest.mocked(getWalletBackup).mockResolvedValueOnce({ walletAddress: "0xabc", encryptionVersion: "ethers-keystore-v1" } as never);

    await expect(ensureWalletReadyForSigning()).resolves.toEqual({ status: "upgradeRequired" });
    expect(getPrivateKey).not.toHaveBeenCalled();
  });
});
