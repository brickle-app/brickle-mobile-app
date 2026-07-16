import * as ExpoCrypto from "expo-crypto";

type RandomBytesSource = (byteCount: number) => Uint8Array;

export function fillRandomValues<T extends ArrayBufferView>(
  array: T,
  getRandomBytes: RandomBytesSource = ExpoCrypto.getRandomBytes
): T {
  const bytes = getRandomBytes(array.byteLength);
  new Uint8Array(array.buffer, array.byteOffset, array.byteLength).set(bytes);
  return array;
}

export function installCryptoGetRandomValues() {
  const globalObject = globalThis as typeof globalThis & { crypto?: any };

  globalObject.crypto ??= {};
  globalObject.crypto.getRandomValues ??= fillRandomValues;
}

installCryptoGetRandomValues();
