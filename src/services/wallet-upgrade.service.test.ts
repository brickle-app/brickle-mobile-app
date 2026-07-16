import { ethers } from "ethers";
import { authStore } from "@/src/store/auth.store";
import {
  activateSecureWalletUpgrade,
  generateSecureWalletUpgradeBackupCode,
  getWalletActivationUserMessage,
  WalletActivationError,
} from "./wallet-upgrade.service";
import { upgradeWalletBackup } from "./wallet-backup.service";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

jest.mock("./wallet-backup.service", () => ({
  upgradeWalletBackup: jest.fn(),
}));

describe("wallet upgrade service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStore.setState({ privateKey: null, user: { email: "ada@example.com", walletAddress: "0xold" } });
  });

  it("generates backup code without activating or uploading the wallet", async () => {
    const backupCode = await generateSecureWalletUpgradeBackupCode();

    expect(backupCode.split(" ")).toHaveLength(12);
    expect(backupCode).toBe(backupCode.toLowerCase());
    expect(upgradeWalletBackup).not.toHaveBeenCalled();
    expect(authStore.getState().privateKey).toBeNull();
    expect(authStore.getState().user?.walletAddress).toBe("0xold");
  }, 30000);

  it("activates a confirmed backup code, keeps the signing key in memory, and uploads encrypted backup", async () => {
    jest.mocked(upgradeWalletBackup).mockImplementationOnce(async (payload) => payload);
    const backupCode = await generateSecureWalletUpgradeBackupCode();

    const result = await activateSecureWalletUpgrade(backupCode);

    expect(ethers.Wallet.fromPhrase(backupCode).address).toBe(result.walletAddress);
    expect(result.walletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(upgradeWalletBackup).toHaveBeenCalledWith(expect.objectContaining({ walletAddress: result.walletAddress }));
    expect(result).not.toHaveProperty("privateKey");
    expect(JSON.stringify(jest.mocked(upgradeWalletBackup).mock.calls[0][0])).not.toContain(authStore.getState().privateKey);
    expect(authStore.getState().privateKey).toBe(ethers.Wallet.fromPhrase(backupCode).privateKey);
    expect(authStore.getState().user?.walletAddress).toBe(result.walletAddress);
  }, 30000);

  it("wraps upload failures with the wallet activation stage", async () => {
    jest.mocked(upgradeWalletBackup).mockRejectedValueOnce(new Error("Network request failed"));

    await expect(activateSecureWalletUpgrade(await generateSecureWalletUpgradeBackupCode())).rejects.toMatchObject({
      name: "WalletActivationError",
      stage: "upload-backup",
      message: "No se pudo activar tu cuenta en este paso: upload-backup. Network request failed",
    });
  }, 30000);

  it("exposes the original error through WalletActivationError", () => {
    const cause = new Error("Missing crypto.getRandomValues");
    const error = new WalletActivationError("generate-backup-code", cause);

    expect(error.stage).toBe("generate-backup-code");
    expect(error.cause).toBe(cause);
    expect(error.message).toContain("Missing crypto.getRandomValues");
  });

  it("returns the staged activation error message in dev", () => {
    const error = new WalletActivationError("encrypt-backup", new Error("Cannot read property randomBytes"));

    expect(getWalletActivationUserMessage(error)).toBe(
      "No se pudo activar tu cuenta en este paso: encrypt-backup. Cannot read property randomBytes"
    );
  });
});
