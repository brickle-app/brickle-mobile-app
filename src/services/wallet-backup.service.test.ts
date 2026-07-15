import { getWalletBackup, saveWalletBackup, upgradeWalletBackup } from "./wallet-backup.service";
import { brickleClient } from "@/src/lib/api/axios-brickle.client";
import { WalletBackupPayload } from "@/src/types/walletBackup.types";

jest.mock("@/src/lib/api/axios-brickle.client", () => ({
  brickleClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const backup: WalletBackupPayload = {
  walletAddress: "0x1111111111111111111111111111111111111111",
  encryptedPrivateKey: "{\"crypto\":{}}",
  encryptionVersion: "ethers-keystore-v1",
  cipher: "ethers-json-keystore",
  kdf: "scrypt",
  kdfParams: { n: 131072, r: 8, p: 1 },
};

describe("wallet backup API service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("saves encrypted wallet backup without plaintext private key fields", async () => {
    jest.mocked(brickleClient.post).mockResolvedValueOnce({ data: backup });

    const result = await saveWalletBackup(backup);

    expect(brickleClient.post).toHaveBeenCalledWith("/api/wallet/backup", backup);
    expect(JSON.stringify(jest.mocked(brickleClient.post).mock.calls[0][1])).not.toContain("privateKey");
    expect(result).toEqual(backup);
  });

  it("fetches the encrypted wallet backup for the authenticated user", async () => {
    jest.mocked(brickleClient.get).mockResolvedValueOnce({ data: backup });

    const result = await getWalletBackup();

    expect(brickleClient.get).toHaveBeenCalledWith("/api/wallet/backup");
    expect(result).toEqual(backup);
  });

  it("upgrades the authenticated user active wallet with encrypted backup only", async () => {
    jest.mocked(brickleClient.post).mockResolvedValueOnce({ data: backup });

    const result = await upgradeWalletBackup(backup);

    expect(brickleClient.post).toHaveBeenCalledWith("/api/wallet/backup/upgrade", backup);
    expect(JSON.stringify(jest.mocked(brickleClient.post).mock.calls[0][1])).not.toContain("privateKey");
    expect(result).toEqual(backup);
  });
});
