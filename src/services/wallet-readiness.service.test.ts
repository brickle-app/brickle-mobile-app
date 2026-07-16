import { getWalletReadiness } from "./wallet-readiness.service";

describe("getWalletReadiness", () => {
  it("requires activation for verified users without a backup", () => {
    expect(
      getWalletReadiness({
        isFullProfileComplete: true,
        isProfileUnderReview: false,
        hasWalletAddress: true,
        backupStatus: "missing",
        hasPrivateKey: false,
      })
    ).toBe("activationRequired");
  });

  it("requires activation for verified users without a wallet address", () => {
    expect(
      getWalletReadiness({
        isFullProfileComplete: true,
        isProfileUnderReview: false,
        hasWalletAddress: false,
        backupStatus: "backupCode",
        hasPrivateKey: true,
      })
    ).toBe("activationRequired");
  });

  it("requires activation for verified users without a wallet address even before backup lookup finishes", () => {
    expect(
      getWalletReadiness({
        isFullProfileComplete: true,
        isProfileUnderReview: false,
        hasWalletAddress: false,
        backupStatus: "unknown",
        hasPrivateKey: false,
      })
    ).toBe("activationRequired");
  });

  it("routes existing backup-code wallets without local key to restore", () => {
    expect(
      getWalletReadiness({
        isFullProfileComplete: true,
        isProfileUnderReview: false,
        hasWalletAddress: true,
        backupStatus: "backupCode",
        hasPrivateKey: false,
      })
    ).toBe("restoreRequired");
  });

  it("is ready when profile, backup, wallet address, and local key are present", () => {
    expect(
      getWalletReadiness({
        isFullProfileComplete: true,
        isProfileUnderReview: false,
        hasWalletAddress: true,
        backupStatus: "backupCode",
        hasPrivateKey: true,
      })
    ).toBe("ready");
  });
});
