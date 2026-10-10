import * as SecureStore from "expo-secure-store";
import { usePinStore } from "./pin.store";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), multiRemove: jest.fn() },
}));

const reset = () =>
  usePinStore.setState({ hasPin: false, isLocked: false, lastActivity: null, ownerEmail: null });

describe("pin owner", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    reset();
  });

  it("remembers which account a PIN belongs to", async () => {
    await usePinStore.getState().setPin("1234", "Ada@Example.com");

    expect(usePinStore.getState().hasPin).toBe(true);
    expect(usePinStore.getState().ownerEmail).toBe("ada@example.com");
  });

  it("keeps the PIN when the same account signs in again, ignoring email casing", async () => {
    await usePinStore.getState().setPin("1234", "ada@example.com");

    await usePinStore.getState().reconcileOwner("ADA@example.com");

    expect(usePinStore.getState().hasPin).toBe(true);
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
  });

  it("discards the PIN when a different account signs in", async () => {
    await usePinStore.getState().setPin("1234", "ada@example.com");

    await usePinStore.getState().reconcileOwner("grace@example.com");

    expect(usePinStore.getState().hasPin).toBe(false);
    expect(usePinStore.getState().ownerEmail).toBeNull();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
  });

  it("adopts a PIN created before owners were tracked instead of deleting it", async () => {
    usePinStore.setState({ hasPin: true, ownerEmail: null });

    await usePinStore.getState().reconcileOwner("ada@example.com");

    expect(usePinStore.getState().hasPin).toBe(true);
    expect(usePinStore.getState().ownerEmail).toBe("ada@example.com");
  });

  it("does nothing when there is no PIN", async () => {
    await usePinStore.getState().reconcileOwner("ada@example.com");

    expect(usePinStore.getState().hasPin).toBe(false);
    expect(usePinStore.getState().ownerEmail).toBeNull();
  });
});
