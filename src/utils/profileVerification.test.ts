import { needsIdentityDocument, shouldShowCompleteProfileWarning } from "./profileVerification";

describe("shouldShowCompleteProfileWarning", () => {
  it("is false for fully verified users even when local profile details are incomplete", () => {
    expect(
      shouldShowCompleteProfileWarning({
        isBasicProfileComplete: true,
        isFullProfileComplete: true,
        isProfileUnderReview: false,
        firstName: "hijap71603",
        lastName: "",
        phoneNumber: "",
      })
    ).toBe(false);
  });

  it("is false while documentation is under review", () => {
    expect(
      shouldShowCompleteProfileWarning({
        isBasicProfileComplete: true,
        isFullProfileComplete: false,
        isProfileUnderReview: true,
      })
    ).toBe(false);
  });

  it("is true when the profile is missing required details before review", () => {
    expect(
      shouldShowCompleteProfileWarning({
        isBasicProfileComplete: true,
        isFullProfileComplete: false,
        isProfileUnderReview: false,
        firstName: "hijap71603",
        lastName: "",
      })
    ).toBe(true);
  });
});

describe("needsIdentityDocument", () => {
  it("is true after basic profile completion before review starts", () => {
    expect(
      needsIdentityDocument({
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
    ).toBe(true);
  });

  it("is false when the completion flag is stale but required profile fields are missing", () => {
    expect(
      needsIdentityDocument({
        isBasicProfileComplete: true,
        isFullProfileComplete: false,
        isProfileUnderReview: false,
        firstName: "hijap71603",
        lastName: "",
        phoneNumber: "",
      })
    ).toBe(false);
  });

  it("is false for users already under review", () => {
    expect(
      needsIdentityDocument({
        isBasicProfileComplete: true,
        isFullProfileComplete: false,
        isProfileUnderReview: true,
        firstName: "Ada",
        lastName: "Lovelace",
        phoneNumber: "3001234567",
        dateOfBirth: new Date("1990-01-01T00:00:00Z"),
        nationality: "CO",
        countryOfResidence: "CO",
        documentType: 1,
        documentNumber: "123456789",
      })
    ).toBe(false);
  });

  it("is false for fully verified users", () => {
    expect(
      needsIdentityDocument({
        isBasicProfileComplete: true,
        isFullProfileComplete: true,
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
    ).toBe(false);
  });

  it("is false before basic profile completion", () => {
    expect(
      needsIdentityDocument({
        isBasicProfileComplete: false,
        isFullProfileComplete: false,
        isProfileUnderReview: false,
      })
    ).toBe(false);
    expect(needsIdentityDocument(null)).toBe(false);
  });
});
