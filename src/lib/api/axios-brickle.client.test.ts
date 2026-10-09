import type { InternalAxiosRequestConfig } from "axios";
import { brickleClient } from "./axios-brickle.client";
import { BRICKLE_SOURCE } from "@/src/utils/constants";

jest.mock("@react-native-async-storage/async-storage", () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn(), removeItem: jest.fn(), multiRemove: jest.fn() },
}));
jest.mock("@/src/store/auth.store", () => ({
  authStore: { getState: () => ({ accessToken: "token-123" }) },
}));

const runRequestInterceptor = (config: Partial<InternalAxiosRequestConfig>) => {
  const handler = (brickleClient.interceptors.request as any).handlers[0].fulfilled;
  return handler({ headers: {}, ...config }) as InternalAxiosRequestConfig;
};

describe("brickleClient request interceptor", () => {
  it("adds the bearer token and the common API headers", () => {
    const config = runRequestInterceptor({});

    expect(config.headers.Authorization).toBe("Bearer token-123");
    expect(config.headers.source).toBe(BRICKLE_SOURCE);
    expect(config.headers.correlationId).toMatch(/^[0-9a-f-]{36}$/i);
    expect(new Date(config.headers.RequestDate as string).toString()).not.toBe("Invalid Date");
  });

  it("generates a fresh correlation id for every request", () => {
    const first = runRequestInterceptor({}).headers.correlationId;
    const second = runRequestInterceptor({}).headers.correlationId;
    expect(first).not.toBe(second);
  });

  it("never overrides headers a caller set explicitly", () => {
    const config = runRequestInterceptor({
      headers: { correlationId: "fixed-id", source: "custom", user: "ada@example.com" } as any,
    });

    expect(config.headers.correlationId).toBe("fixed-id");
    expect(config.headers.source).toBe("custom");
    expect(config.headers.user).toBe("ada@example.com");
  });
});
