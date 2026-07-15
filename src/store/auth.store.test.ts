import * as SecureStore from "expo-secure-store";
import { authStore } from "./auth.store";

jest.mock("expo-secure-store", () => ({
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

describe("authStore private key lifecycle", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStore.setState({ privateKey: null });
  });

  it("clears the in-memory private key without writing it to storage", () => {
    authStore.getState().setPrivateKey("0xprivate");

    authStore.getState().clearPrivateKey();

    expect(authStore.getState().privateKey).toBeNull();
    expect(SecureStore.deleteItemAsync).not.toHaveBeenCalledWith("brickle_private_key");
  });
});
