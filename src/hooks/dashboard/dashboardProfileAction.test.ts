import { getDashboardProfileAction } from "./dashboardProfileAction";

describe("getDashboardProfileAction", () => {
  it("opens the identity document modal when basic info is complete and document is pending", () => {
    expect(
      getDashboardProfileAction({
        isBasicProfileComplete: true,
        isFullProfileComplete: false,
        isProfileUnderReview: false,
      })
    ).toBe("upload-document");
  });
});
