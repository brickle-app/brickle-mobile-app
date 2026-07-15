import { getWalletVerificationNotice } from "./walletFeatureAccess";

describe("getWalletVerificationNotice", () => {
  it("shows a documentation review notice when profile is under review", () => {
    expect(
      getWalletVerificationNotice({
        isBasicProfileComplete: true,
        isFullProfileComplete: false,
        isProfileUnderReview: true,
      })
    ).toEqual({
      title: "Documentación en validación",
      message: "Las funciones de recargar y retirar estarán disponibles cuando validemos tu documentación.",
    });
  });

  it("shows no notice when the user is fully verified", () => {
    expect(
      getWalletVerificationNotice({
        isBasicProfileComplete: true,
        isFullProfileComplete: true,
        isProfileUnderReview: false,
      })
    ).toBeNull();
  });

  it("shows no wallet notice before the basic profile is complete", () => {
    expect(
      getWalletVerificationNotice({
        isBasicProfileComplete: false,
        isFullProfileComplete: false,
        isProfileUnderReview: false,
      })
    ).toBeNull();
  });
});
