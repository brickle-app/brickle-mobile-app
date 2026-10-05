import * as SecureStore from "expo-secure-store";
import { ethers } from "ethers";
import {
  deleteWalletSigningKey,
  getStoredWalletKeyAddress,
  hasWalletSigningKeyFor,
  loadWalletSigningKey,
  saveWalletSigningKey,
  WalletKeyUnlockError,
} from "./wallet-key-storage.service";

jest.mock("@/src/utils/crypto-get-random-values", () => ({}));

jest.mock("expo-secure-store", () => {
  const store = new Map<string, string>();
  return {
    __store: store,
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 5,
    canUseBiometricAuthentication: jest.fn(() => true),
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => {
      store.set(key, value);
    }),
    deleteItemAsync: jest.fn(async (key: string) => {
      store.delete(key);
    }),
  };
});

const store = (SecureStore as unknown as { __store: Map<string, string> }).__store;
const PRIVATE_KEY = "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d";
const WALLET_ADDRESS = new ethers.Wallet(PRIVATE_KEY).address;

describe("wallet key storage", () => {
  beforeEach(() => {
    store.clear();
    jest.clearAllMocks();
    jest.mocked(SecureStore.canUseBiometricAuthentication).mockReturnValue(true);
    jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key: string) => store.get(key) ?? null);
  });

  it("stores the key behind biometrics when the device supports it", async () => {
    await saveWalletSigningKey(PRIVATE_KEY);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "brickle_wallet_signing_key",
      PRIVATE_KEY,
      expect.objectContaining({ requireAuthentication: true })
    );
    await expect(getStoredWalletKeyAddress()).resolves.toBe(WALLET_ADDRESS);
  });

  it("falls back to device-only storage when biometrics are unavailable", async () => {
    jest.mocked(SecureStore.canUseBiometricAuthentication).mockReturnValue(false);

    await saveWalletSigningKey(PRIVATE_KEY);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "brickle_wallet_signing_key",
      PRIVATE_KEY,
      expect.not.objectContaining({ requireAuthentication: true })
    );
    await expect(loadWalletSigningKey()).resolves.toBe(PRIVATE_KEY);
  });

  it("knows which wallet the device can sign for without reading the key", async () => {
    await saveWalletSigningKey(PRIVATE_KEY);
    jest.mocked(SecureStore.getItemAsync).mockClear();

    await expect(hasWalletSigningKeyFor(WALLET_ADDRESS.toLowerCase())).resolves.toBe(true);
    await expect(hasWalletSigningKeyFor("0x22eC8E487c655E1fA92e584Ae01d9713D51BE525")).resolves.toBe(false);
    expect(SecureStore.getItemAsync).not.toHaveBeenCalledWith("brickle_wallet_signing_key", expect.anything());
  });

  it("migrates a key saved by previous app versions", async () => {
    store.set("brickle_private_key", PRIVATE_KEY);

    await expect(loadWalletSigningKey()).resolves.toBe(PRIVATE_KEY);
    expect(store.has("brickle_private_key")).toBe(false);
    await expect(getStoredWalletKeyAddress()).resolves.toBe(WALLET_ADDRESS);
  });

  it("reports a cancelled biometric prompt as an unlock error, not a missing key", async () => {
    await saveWalletSigningKey(PRIVATE_KEY);
    jest.mocked(SecureStore.getItemAsync).mockImplementation(async (key: string) => {
      if (key === "brickle_wallet_signing_key") throw new Error("User canceled");
      return store.get(key) ?? null;
    });

    await expect(loadWalletSigningKey()).rejects.toBeInstanceOf(WalletKeyUnlockError);
  });

  it("returns null when the OS invalidated the key (biometrics changed)", async () => {
    await saveWalletSigningKey(PRIVATE_KEY);
    store.delete("brickle_wallet_signing_key");

    await expect(loadWalletSigningKey()).resolves.toBeNull();
    await expect(getStoredWalletKeyAddress()).resolves.toBeNull();
  });

  it("removes every copy of the key", async () => {
    await saveWalletSigningKey(PRIVATE_KEY);
    store.set("brickle_private_key", PRIVATE_KEY);

    await deleteWalletSigningKey();

    expect(store.size).toBe(0);
  });
});
