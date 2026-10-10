import { authStore } from "./auth.store";
import { usePinStore } from "./pin.store";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  getItemAsync: jest.fn().mockResolvedValue(null),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn().mockResolvedValue(undefined),
  },
}));

describe("logout and the PIN", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    usePinStore.setState({ hasPin: true, isLocked: true, lastActivity: 1, ownerEmail: "ada@example.com" });
  });

  it("keeps the PIN so the user does not have to create it again, and leaves the app unlocked for the login screen", async () => {
    await authStore.getState().logout();

    expect(usePinStore.getState().hasPin).toBe(true);
    expect(usePinStore.getState().ownerEmail).toBe("ada@example.com");
    expect(usePinStore.getState().isLocked).toBe(false);
  });

  it("also keeps the PIN when the session just expired", async () => {
    await authStore.getState().logout({ preserveWalletKey: true });

    expect(usePinStore.getState().hasPin).toBe(true);
  });

  it("a full reset still removes the PIN", async () => {
    await authStore.getState().reset();

    expect(usePinStore.getState().hasPin).toBe(false);
  });

  it("drops the PIN as soon as a different account becomes the current user", async () => {
    authStore.getState().setUser({ id: "2", email: "grace@example.com" } as any);
    await new Promise((resolve) => setImmediate(resolve));

    expect(usePinStore.getState().hasPin).toBe(false);
  });
});
