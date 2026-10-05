import "@/src/utils/crypto-get-random-values";
import * as SecureStore from "expo-secure-store";
import { ethers } from "ethers";

/**
 * Device storage for the wallet signing key.
 *
 * - When the device has biometrics, the key is stored behind Face ID / fingerprint
 *   (Keychain / Android Keystore enforce it; the app cannot read it without the user).
 * - Otherwise it falls back to a device-only SecureStore entry.
 * - A public metadata entry (wallet address + protection) lets the app know which wallet
 *   the device can sign for without prompting biometrics.
 *
 * The key is kept across app backgrounding and session expiry; it is only removed on an
 * explicit logout or when replaced by another wallet.
 */

const LEGACY_KEY = "brickle_private_key";
const SIGNING_KEY = "brickle_wallet_signing_key";
const METADATA_KEY = "brickle_wallet_signing_key_meta";

const UNLOCK_PROMPT = "Confirma tu identidad para firmar la transacción";

type WalletKeyProtection = "biometric" | "device";

interface WalletKeyMetadata {
  walletAddress: string;
  protection: WalletKeyProtection;
}

export class WalletKeyUnlockError extends Error {
  override readonly cause: unknown;

  constructor(cause: unknown) {
    super("No se pudo confirmar tu identidad para usar la wallet.");
    this.name = "WalletKeyUnlockError";
    this.cause = cause;
  }
}

function secureOptions(protection: WalletKeyProtection): SecureStore.SecureStoreOptions {
  return protection === "biometric"
    ? {
        requireAuthentication: true,
        authenticationPrompt: UNLOCK_PROMPT,
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      }
    : { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
}

function canUseBiometrics() {
  try {
    return SecureStore.canUseBiometricAuthentication();
  } catch {
    return false;
  }
}

async function readMetadata(): Promise<WalletKeyMetadata | null> {
  const raw = await SecureStore.getItemAsync(METADATA_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as WalletKeyMetadata;
    return parsed.walletAddress && parsed.protection ? parsed : null;
  } catch {
    return null;
  }
}

async function deleteQuietly(key: string) {
  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn(`[wallet-key-storage] could not delete ${key}`, error);
  }
}

export async function saveWalletSigningKey(privateKey: string): Promise<void> {
  const walletAddress = new ethers.Wallet(privateKey).address;

  // Delete first: on iOS, updating a biometric-protected item would prompt the user.
  await deleteQuietly(SIGNING_KEY);
  await deleteQuietly(METADATA_KEY);

  let protection: WalletKeyProtection = "device";
  if (canUseBiometrics()) {
    try {
      await SecureStore.setItemAsync(SIGNING_KEY, privateKey, secureOptions("biometric"));
      protection = "biometric";
    } catch (error) {
      console.warn("[wallet-key-storage] biometric storage unavailable, using device storage", error);
    }
  }

  if (protection === "device") {
    await SecureStore.setItemAsync(SIGNING_KEY, privateKey, secureOptions("device"));
  }

  const metadata: WalletKeyMetadata = { walletAddress, protection };
  await SecureStore.setItemAsync(METADATA_KEY, JSON.stringify(metadata));
  await deleteQuietly(LEGACY_KEY);
}

/** Moves a key saved by older app versions (plain SecureStore) into the protected storage. */
async function migrateLegacyKey(): Promise<WalletKeyMetadata | null> {
  const legacyKey = await SecureStore.getItemAsync(LEGACY_KEY);
  if (!legacyKey) return null;

  try {
    await saveWalletSigningKey(legacyKey);
  } catch (error) {
    console.warn("[wallet-key-storage] legacy key migration failed", error);
    return null;
  }

  return readMetadata();
}

/** Wallet address this device can sign for. Never prompts biometrics. */
export async function getStoredWalletKeyAddress(): Promise<string | null> {
  try {
    const metadata = (await readMetadata()) ?? (await migrateLegacyKey());
    return metadata?.walletAddress ?? null;
  } catch (error) {
    console.warn("[wallet-key-storage] could not read key metadata", error);
    return null;
  }
}

export async function hasWalletSigningKeyFor(walletAddress: string | null | undefined) {
  if (!walletAddress) return false;
  const storedAddress = await getStoredWalletKeyAddress();
  return storedAddress?.toLowerCase() === walletAddress.toLowerCase();
}

/**
 * Reads the signing key, prompting biometrics when it is protected.
 * Returns null when there is no usable key (never stored, or invalidated because the
 * device biometrics changed) → wallet restore is required.
 * Throws WalletKeyUnlockError when the user cancels or fails the biometric prompt.
 */
export async function loadWalletSigningKey(): Promise<string | null> {
  const metadata = (await readMetadata()) ?? (await migrateLegacyKey());
  if (!metadata) return null;

  let privateKey: string | null;
  try {
    privateKey = await SecureStore.getItemAsync(SIGNING_KEY, secureOptions(metadata.protection));
  } catch (error) {
    throw new WalletKeyUnlockError(error);
  }

  if (!privateKey) {
    // Key invalidated by the OS (e.g. biometrics re-enrolled): drop stale metadata.
    await deleteQuietly(METADATA_KEY);
    return null;
  }

  return privateKey;
}

export async function deleteWalletSigningKey(): Promise<void> {
  await Promise.all([
    deleteQuietly(SIGNING_KEY),
    deleteQuietly(METADATA_KEY),
    deleteQuietly(LEGACY_KEY),
  ]);
}
