import { getDashboardProfileAction } from "./dashboardProfileAction";

describe("getDashboardProfileAction", () => {
  it("opens the identity document modal when basic info is complete and document is pending", () => {
    expect(
      getDashboardProfileAction({
        isBasicProfileComplete: true,
        isFullProfileComplete: false,
        isProfileUnderReview: false,
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "3001234567",
        dateOfBirth: new Date("1990-01-01T00:00:00Z"),
        nationality: "CO",
        countryOfResidence: "CO",
        documentType: 1,
        documentNumber: "123456789",
      })
    ).toBe("upload-document");
  });

  it("sends users to complete profile when required profile data is missing despite a stale complete flag", () => {
    expect(
      getDashboardProfileAction({
        isBasicProfileComplete: true,
        isFullProfileComplete: false,
        isProfileUnderReview: false,
        firstName: "hijap71603",
        lastName: "",
        phoneNumber: "",
      })
    ).toBe("complete-profile");
  });
});
