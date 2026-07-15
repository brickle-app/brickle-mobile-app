import * as SecureStore from "expo-secure-store";
import { authStore } from "@/src/store/auth.store";
import { purchaseLeasingAsset } from "./leasingPurchase";
import { ensureWalletReadyForSigning } from "@/src/services/wallet-security-gate.service";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

jest.mock("@/src/services/wallet-security-gate.service", () => ({
  ensureWalletReadyForSigning: jest.fn(),
}));

describe("purchaseLeasingAsset", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStore.setState({ privateKey: null });
    jest.mocked(ensureWalletReadyForSigning).mockResolvedValue({ status: "ready", privateKey: "0xprivate-key" });
  });

  it("restores the private key from secure storage before committing funds", async () => {
    const handleBuyAsset = jest.fn().mockResolvedValue({ success: true });
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce("0xprivate-key");

    const result = await purchaseLeasingAsset({
      user: {
        email: "ada@example.com",
        walletAddress: "0xabc",
      },
      tokens: 2,
      pricePerToken: 100,
      handleBuyAsset,
      onMissingPrivateKey: jest.fn(),
      onWalletUpgradeRequired: jest.fn(),
    });

    expect(result).toBe(true);
    expect(ensureWalletReadyForSigning).toHaveBeenCalledWith();
    expect(handleBuyAsset).toHaveBeenCalledWith("ada@example.com", "0xabc", 2, 200);
  });

  it("asks for wallet recovery without triggering a redbox when no private key exists", async () => {
    const handleBuyAsset = jest.fn();
    const onMissingPrivateKey = jest.fn();
    jest.mocked(ensureWalletReadyForSigning).mockResolvedValueOnce({ status: "restoreRequired" });
    const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
    const consoleWarn = jest.spyOn(console, "warn").mockImplementation(() => {});
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce(null);

    const result = await purchaseLeasingAsset({
      user: {
        email: "ada@example.com",
        walletAddress: "0xabc",
      },
      tokens: 2,
      pricePerToken: 100,
      handleBuyAsset,
      onMissingPrivateKey,
      onWalletUpgradeRequired: jest.fn(),
    });

    expect(result).toBe(false);
    expect(onMissingPrivateKey).toHaveBeenCalledWith();
    expect(handleBuyAsset).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });

  it("requires wallet upgrade before purchase when the user has no secure backup", async () => {
    const handleBuyAsset = jest.fn();
    const onWalletUpgradeRequired = jest.fn();
    jest.mocked(ensureWalletReadyForSigning).mockResolvedValueOnce({ status: "upgradeRequired" });

    const result = await purchaseLeasingAsset({
      user: {
        email: "ada@example.com",
        walletAddress: "0xabc",
      },
      tokens: 2,
      pricePerToken: 100,
      handleBuyAsset,
      onMissingPrivateKey: jest.fn(),
      onWalletUpgradeRequired,
    });

    expect(result).toBe(false);
    expect(onWalletUpgradeRequired).toHaveBeenCalledWith();
    expect(handleBuyAsset).not.toHaveBeenCalled();
  });
});
