import appConfig from "./app.json";

describe("iOS status bar configuration", () => {
  it("disables view-controller based status bar appearance for React Native StatusBar", () => {
    expect(
      appConfig.expo.ios.infoPlist.UIViewControllerBasedStatusBarAppearance
    ).toBe(false);
  });

  it("registers the reversed Google iOS OAuth client URL scheme", () => {
    expect(appConfig.expo.scheme).toContain(
      "com.googleusercontent.apps.611045847930-ndmsssr9tal67bp68mf6d994eqe7gm6b"
    );
  });
});
