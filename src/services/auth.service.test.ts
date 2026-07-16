import {
  buildGoogleAuthRequestConfig,
  getGoogleAuthBackendClientId,
  getGoogleAuthResultStatus,
  getPrivateKey,
  restoreSessionFromRefreshToken,
} from "./auth.service";
import * as SecureStore from "expo-secure-store";
import { authStore } from "../store/auth.store";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    multiRemove: jest.fn(),
  },
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("expo-web-browser", () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

describe("buildGoogleAuthRequestConfig", () => {
  it("uses the native iOS client ID and reversed-client redirect on iOS", () => {
    const createRedirectUri = jest.fn(() => "unused");
    const config = buildGoogleAuthRequestConfig(
      {
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "web-client.apps.googleusercontent.com",
        EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "ios-client.apps.googleusercontent.com",
        EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: "android-client.apps.googleusercontent.com",
      },
      createRedirectUri,
      "ios"
    );

    expect(config.clientId).toBe("ios-client.apps.googleusercontent.com");
    expect(config.webClientId).toBe("web-client.apps.googleusercontent.com");
    expect(config.iosClientId).toBe("ios-client.apps.googleusercontent.com");
    expect(config.redirectUri).toBe(
      "com.googleusercontent.apps.ios-client:/oauthredirect"
    );
    expect(createRedirectUri).not.toHaveBeenCalled();
  });

  it("uses a missing-client placeholder instead of silently using a web client on iOS", () => {
    const config = buildGoogleAuthRequestConfig(
      {
        EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "web-client.apps.googleusercontent.com",
      },
      jest.fn(() => "com.brickle.app:/oauthredirect"),
      "ios"
    );

    expect(config.clientId).toBe("missing-google-client-id");
    expect(config.webClientId).toBe("web-client.apps.googleusercontent.com");
    expect(config.iosClientId).toBe("missing-google-client-id");
  });

  it("uses a non-empty placeholder when Google client IDs are missing", () => {
    const config = buildGoogleAuthRequestConfig(
      {},
      jest.fn(() => "com.brickle.app:/oauthredirect"),
      "ios"
    );

    expect(config.clientId).toBe("missing-google-client-id");
    expect(config.webClientId).toBe("missing-google-client-id");
    expect(config.iosClientId).toBe("missing-google-client-id");
  });
});

describe("getGoogleAuthResultStatus", () => {
  it("waits for native code exchange when Google returns only an authorization code", () => {
    const status = getGoogleAuthResultStatus({
      type: "success",
      params: {
        code: "authorization-code",
      },
    });

    expect(status).toEqual({ type: "pending_token_exchange" });
  });
});

describe("getGoogleAuthBackendClientId", () => {
  const env = {
    EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "web-client.apps.googleusercontent.com",
    EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: "ios-client.apps.googleusercontent.com",
    EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: "android-client.apps.googleusercontent.com",
  };

  it("uses the iOS client ID for backend token audience validation on iOS", () => {
    expect(getGoogleAuthBackendClientId(env, "ios")).toBe(
      "ios-client.apps.googleusercontent.com"
    );
  });

  it("does not silently validate an iOS token against the web audience", () => {
    expect(
      getGoogleAuthBackendClientId(
        {
          EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: "web-client.apps.googleusercontent.com",
        },
        "ios"
      )
    ).toBeUndefined();
  });
});

describe("restoreSessionFromRefreshToken", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStore.setState({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      tokenExpiration: 0,
    });
  });

  it("refreshes and restores in-memory auth before protected requests", async () => {
    jest.spyOn(global, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        accessToken: "new-access-token",
        refreshToken: "new-refresh-token",
        user: {
          id: "user-1",
          firstName: "Ada",
          lastName: "Lovelace",
          email: "ada@example.com",
          profilePictureUrl: null,
          walletAddress: "0xabc",
          phoneNumber: "3000000000",
          termsAccepted: true,
          createdAt: "2026-01-01T00:00:00Z",
          isBasicProfileComplete: true,
          isFullProfileComplete: true,
        },
      }),
    } as Response);
    jest.mocked(SecureStore.getItemAsync).mockResolvedValueOnce("stored-refresh-token");

    const result = await restoreSessionFromRefreshToken();

    expect(result).toBe(true);
    expect(authStore.getState().accessToken).toBe("new-access-token");
    expect(authStore.getState().isAuthenticated).toBe(true);
    expect(authStore.getState().user?.email).toBe("ada@example.com");
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      "brickle_refresh_token",
      "new-refresh-token"
    );
  });
});

describe("getPrivateKey", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStore.setState({ privateKey: null });
  });

  it("returns only the in-memory private key and never reads SecureStore", async () => {
    await expect(getPrivateKey()).resolves.toBeNull();
    expect(SecureStore.getItemAsync).not.toHaveBeenCalledWith("brickle_private_key");

    authStore.setState({ privateKey: "0xprivate" });

    await expect(getPrivateKey()).resolves.toBe("0xprivate");
    expect(SecureStore.getItemAsync).not.toHaveBeenCalledWith("brickle_private_key");
  });
});
