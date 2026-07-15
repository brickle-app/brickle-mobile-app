import { restoreWalletBackupToDevice } from "./wallet-restore.service";
import { getWalletBackup } from "./wallet-backup.service";
import { restorePrivateKeyFromBackup } from "./wallet-backup-crypto.service";
import { authStore } from "@/src/store/auth.store";

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
  getWalletBackup: jest.fn(),
}));

jest.mock("./wallet-backup-crypto.service", () => ({
  restorePrivateKeyFromBackup: jest.fn(),
}));

describe("restoreWalletBackupToDevice", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStore.setState({ privateKey: null });
  });

  it("keeps the restored private key in memory without receiving it from the backend", async () => {
    const backup = {
      walletAddress: "0xabc",
      encryptedPrivateKey: "encrypted-json",
      encryptionVersion: "ethers-keystore-v1" as const,
      cipher: "ethers-json-keystore" as const,
      kdf: "scrypt" as const,
      kdfParams: {},
    };
    jest.mocked(getWalletBackup).mockResolvedValueOnce(backup);
    jest.mocked(restorePrivateKeyFromBackup).mockResolvedValueOnce("0xprivate");

    const result = await restoreWalletBackupToDevice("recovery password");

    expect(getWalletBackup).toHaveBeenCalledWith();
    expect(restorePrivateKeyFromBackup).toHaveBeenCalledWith({
      backup,
      recoveryPassword: "recovery password",
    });
    expect(authStore.getState().privateKey).toBe("0xprivate");
    expect(result.walletAddress).toBe("0xabc");
  });
});
