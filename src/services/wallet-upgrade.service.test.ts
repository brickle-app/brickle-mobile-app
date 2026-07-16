import { ethers } from "ethers";
import { authStore } from "@/src/store/auth.store";
import {
  createSecureWalletUpgrade,
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

  it("creates a new wallet, keeps the signing key in memory, and uploads encrypted backup", async () => {
    jest.mocked(upgradeWalletBackup).mockImplementationOnce(async (payload) => payload);

    const result = await createSecureWalletUpgrade();

    expect(result.backupCode.split(" ")).toHaveLength(12);
    expect(result.backupCode).toBe(result.backupCode.toLowerCase());
    expect(ethers.Wallet.fromPhrase(result.backupCode).address).toBe(result.walletAddress);
    expect(result.walletAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
    expect(upgradeWalletBackup).toHaveBeenCalledWith(expect.objectContaining({ walletAddress: result.walletAddress }));
    expect(JSON.stringify(jest.mocked(upgradeWalletBackup).mock.calls[0][0])).not.toContain(result.privateKey);
    expect(authStore.getState().privateKey).toBe(result.privateKey);
    expect(authStore.getState().user?.walletAddress).toBe(result.walletAddress);
  }, 30000);

  it("wraps upload failures with the wallet activation stage", async () => {
    jest.mocked(upgradeWalletBackup).mockRejectedValueOnce(new Error("Network request failed"));

    await expect(createSecureWalletUpgrade()).rejects.toMatchObject({
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
