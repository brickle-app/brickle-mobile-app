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
