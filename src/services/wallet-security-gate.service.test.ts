import { ensureWalletReadyForSigning } from "./wallet-security-gate.service";
import { ethers } from "ethers";
import { getPrivateKey } from "./auth.service";
import { getWalletBackup } from "./wallet-backup.service";
import { hasWalletSigningKeyFor, WalletKeyUnlockError } from "./wallet-key-storage.service";

const DEVICE_PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const DEVICE_WALLET_ADDRESS = new ethers.Wallet(DEVICE_PRIVATE_KEY).address;

jest.mock("./auth.service", () => ({
  getPrivateKey: jest.fn(),
}));

jest.mock("./wallet-backup.service", () => ({
  getWalletBackup: jest.fn(),
}));

jest.mock("./wallet-key-storage.service", () => {
  class WalletKeyUnlockError extends Error {}
  return { hasWalletSigningKeyFor: jest.fn(), WalletKeyUnlockError };
});

describe("wallet security gate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(hasWalletSigningKeyFor).mockResolvedValue(true);
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
    jest.mocked(getWalletBackup).mockResolvedValueOnce({ walletAddress: DEVICE_WALLET_ADDRESS.toLowerCase(), encryptionVersion: "ethers-keystore-v1-backup-code" } as never);
    jest.mocked(getPrivateKey).mockResolvedValueOnce(DEVICE_PRIVATE_KEY);

    await expect(ensureWalletReadyForSigning()).resolves.toEqual({ status: "ready", privateKey: DEVICE_PRIVATE_KEY });
  });

  it("requires restore when the local signing key belongs to a different wallet", async () => {
    jest.mocked(getWalletBackup).mockResolvedValueOnce({ walletAddress: "0x22eC8E487c655E1fA92e584Ae01d9713D51BE525", encryptionVersion: "ethers-keystore-v1-backup-code" } as never);
    jest.mocked(getPrivateKey).mockResolvedValueOnce(DEVICE_PRIVATE_KEY);

    await expect(ensureWalletReadyForSigning()).resolves.toEqual({ status: "restoreRequired" });
  });

  it("requires wallet upgrade when the backup was created with the phase-1 password flow", async () => {
    jest.mocked(getWalletBackup).mockResolvedValueOnce({ walletAddress: "0xabc", encryptionVersion: "ethers-keystore-v1" } as never);

    await expect(ensureWalletReadyForSigning()).resolves.toEqual({ status: "upgradeRequired" });
    expect(getPrivateKey).not.toHaveBeenCalled();
  });

  it("requires restore without prompting biometrics when the device holds no key for the backup wallet", async () => {
    jest.mocked(getWalletBackup).mockResolvedValueOnce({ walletAddress: DEVICE_WALLET_ADDRESS, encryptionVersion: "ethers-keystore-v1-backup-code" } as never);
    jest.mocked(hasWalletSigningKeyFor).mockResolvedValueOnce(false);

    await expect(ensureWalletReadyForSigning()).resolves.toEqual({ status: "restoreRequired" });
    expect(getPrivateKey).not.toHaveBeenCalled();
  });

  it("does not ask for a wallet restore when the user cancels the biometric prompt", async () => {
    jest.mocked(getWalletBackup).mockResolvedValueOnce({ walletAddress: DEVICE_WALLET_ADDRESS, encryptionVersion: "ethers-keystore-v1-backup-code" } as never);
    jest.mocked(getPrivateKey).mockRejectedValueOnce(new WalletKeyUnlockError(new Error("cancel")));

    await expect(ensureWalletReadyForSigning()).resolves.toEqual({ status: "unlockCancelled" });
  });
});
