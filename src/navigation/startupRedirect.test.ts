import { getStartupRedirectPath } from "./startupRedirect";

describe("getStartupRedirectPath", () => {
  it("does not redirect unauthenticated users already on login", () => {
    expect(
      getStartupRedirectPath({
        appIsReady: true,
        hasUser: false,
        hasPin: false,
        isLocked: false,
        pathname: "/login",
      })
    ).toBeNull();
  });

  it("does not redirect unauthenticated users while entering OTP", () => {
    expect(
      getStartupRedirectPath({
        appIsReady: true,
        hasUser: false,
        hasPin: false,
        isLocked: false,
        pathname: "/verify-otp",
      })
    ).toBeNull();
  });

  it("redirects unauthenticated users to login", () => {
    expect(
      getStartupRedirectPath({
        appIsReady: true,
        hasUser: false,
        hasPin: true,
        isLocked: true,
        pathname: "/dashboard",
      })
    ).toBe("/(stack)/(auth)/login");
  });

  it("redirects authenticated users without PIN to setup", () => {
    expect(
      getStartupRedirectPath({
        appIsReady: true,
        hasUser: true,
        hasPin: false,
        isLocked: false,
        pathname: "/dashboard",
      })
    ).toBe("/(stack)/pin-setup");
  });

  it("redirects authenticated users with incomplete basic profile to complete profile before dashboard", () => {
    expect(
      getStartupRedirectPath({
        appIsReady: true,
        hasUser: true,
        hasPin: true,
        isLocked: false,
        isBasicProfileComplete: false,
        pathname: "/dashboard",
      })
    ).toBe("/(stack)/(auth)/complete-profile");
  });

  it("redirects incomplete users to complete profile before PIN setup", () => {
    expect(
      getStartupRedirectPath({
        appIsReady: true,
        hasUser: true,
        hasPin: false,
        isLocked: false,
        isBasicProfileComplete: false,
        pathname: "/dashboard",
      })
    ).toBe("/(stack)/(auth)/complete-profile");
  });

  it("does not redirect incomplete users already completing profile", () => {
    expect(
      getStartupRedirectPath({
        appIsReady: true,
        hasUser: true,
        hasPin: true,
        isLocked: false,
        isBasicProfileComplete: false,
        pathname: "/complete-profile",
      })
    ).toBeNull();
  });

  it("redirects locked authenticated users to pin lock", () => {
    expect(
      getStartupRedirectPath({
        appIsReady: true,
        hasUser: true,
        hasPin: true,
        isLocked: true,
        pathname: "/dashboard",
      })
    ).toBe("/(stack)/pin-lock");
  });

  it("does not redirect authenticated users already in app routes", () => {
    expect(
      getStartupRedirectPath({
        appIsReady: true,
        hasUser: true,
        hasPin: true,
        isLocked: false,
        pathname: "/portfolio",
      })
    ).toBeNull();
  });

  it("does not redirect to dashboard when already there", () => {
    expect(
      getStartupRedirectPath({
        appIsReady: true,
        hasUser: true,
        hasPin: true,
        isLocked: false,
        pathname: "/dashboard",
      })
    ).toBeNull();
  });
});
