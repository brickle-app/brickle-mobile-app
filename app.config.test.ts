import appConfig from "./app.json";

describe("iOS status bar configuration", () => {
  it("disables view-controller based status bar appearance for React Native StatusBar", () => {
    expect(
      appConfig.expo.ios.infoPlist.UIViewControllerBasedStatusBarAppearance
    ).toBe(false);
  });
});
