import { needsIdentityDocument } from "./profileVerification";

describe("needsIdentityDocument", () => {
  it("is true after basic profile completion before review starts", () => {
    expect(
      needsIdentityDocument({
        isBasicProfileComplete: true,
        isFullProfileComplete: false,
        isProfileUnderReview: false,
      })
    ).toBe(true);
  });

  it("is false for users already under review", () => {
    expect(
      needsIdentityDocument({
        isBasicProfileComplete: true,
        isFullProfileComplete: false,
        isProfileUnderReview: true,
      })
    ).toBe(false);
  });

  it("is false for fully verified users", () => {
    expect(
      needsIdentityDocument({
        isBasicProfileComplete: true,
        isFullProfileComplete: true,
        isProfileUnderReview: false,
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
