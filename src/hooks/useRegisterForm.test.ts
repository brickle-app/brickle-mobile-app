import { getBackupCodeConfirmationError } from "@/src/utils/registerBackupCodeValidation";

describe("getBackupCodeConfirmationError", () => {
  it("returns a specific mismatch error when backup codes do not match", () => {
    const error = getBackupCodeConfirmationError("alpha beta", "alpha gamma");

    expect(error).toBe("Los códigos de respaldo no coinciden.");
  });

  it("accepts matching backup codes after normalization", () => {
    const error = getBackupCodeConfirmationError("Alpha   Beta", "alpha beta");

    expect(error).toBeNull();
  });
});
