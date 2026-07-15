import { ethers } from "ethers";
import { authStore } from "@/src/store/auth.store";
import { createSecureWalletUpgrade } from "./wallet-upgrade.service";
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
});
