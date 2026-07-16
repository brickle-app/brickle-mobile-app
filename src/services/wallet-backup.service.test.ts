import { getWalletBackup, saveWalletBackup, upgradeWalletBackup } from "./wallet-backup.service";
import { brickleClient } from "@/src/lib/api/axios-brickle.client";
import { WalletBackupPayload } from "@/src/types/walletBackup.types";
import { refreshToken } from "./auth.service";

jest.mock("@/src/lib/api/axios-brickle.client", () => ({
  brickleClient: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

jest.mock("./auth.service", () => ({
  refreshToken: jest.fn(),
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
    jest.resetAllMocks();
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

  it("refreshes the access token and retries wallet upgrade once after a 401", async () => {
    jest.mocked(brickleClient.post)
      .mockRejectedValueOnce({ response: { status: 401 } })
      .mockResolvedValueOnce({ data: backup });
    jest.mocked(refreshToken).mockResolvedValueOnce({ success: true, newToken: "fresh-token" });

    const result = await upgradeWalletBackup(backup);

    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(brickleClient.post).toHaveBeenCalledTimes(2);
    expect(brickleClient.post).toHaveBeenNthCalledWith(1, "/api/wallet/backup/upgrade", backup);
    expect(brickleClient.post).toHaveBeenNthCalledWith(2, "/api/wallet/backup/upgrade", backup);
    expect(result).toEqual(backup);
  });

  it("does not retry wallet upgrade when token refresh fails", async () => {
    const unauthorized = { response: { status: 401 } };
    jest.mocked(brickleClient.post).mockRejectedValueOnce(unauthorized);
    jest.mocked(refreshToken).mockResolvedValueOnce({ success: false });

    await expect(upgradeWalletBackup(backup)).rejects.toBe(unauthorized);

    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(brickleClient.post).toHaveBeenCalledTimes(1);
  });

  it("preserves the original 401 when token refresh throws", async () => {
    const unauthorized = { response: { status: 401 } };
    jest.mocked(brickleClient.post).mockRejectedValueOnce(unauthorized);
    jest.mocked(refreshToken).mockRejectedValueOnce(new Error("refresh failed"));

    await expect(upgradeWalletBackup(backup)).rejects.toBe(unauthorized);

    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(brickleClient.post).toHaveBeenCalledTimes(1);
  });
});
