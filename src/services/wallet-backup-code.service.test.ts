import { generateWalletBackupCode } from "./wallet-backup-code.service";

describe("wallet backup code service", () => {
  it("generates a 12-word seed phrase for manual backup", () => {
    const code = generateWalletBackupCode();
    const words = code.split(" ");

    expect(words).toHaveLength(12);
    expect(words.every((word) => /^[a-z]+$/.test(word))).toBe(true);
  });

  it("generates different seed phrases", () => {
    expect(generateWalletBackupCode()).not.toBe(generateWalletBackupCode());
  });
});
