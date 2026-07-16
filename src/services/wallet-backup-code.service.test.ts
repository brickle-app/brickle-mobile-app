import {
  generateWalletBackupCode,
  normalizeWalletBackupCode,
} from "./wallet-backup-code.service";
import { ethers } from "ethers";

describe("wallet backup code service", () => {
  it("generates 12-word backup codes for manual recovery", () => {
    const code = generateWalletBackupCode();
    const words = code.split(" ");

    expect(words).toHaveLength(12);
    expect(words.every((word) => /^[a-z]+$/.test(word))).toBe(true);
  });

  it("generates different backup codes", () => {
    expect(generateWalletBackupCode()).not.toBe(generateWalletBackupCode());
  });

  it("normalizes backup code whitespace and case", () => {
    expect(normalizeWalletBackupCode("  Uno   DOS tres  ")).toBe("uno dos tres");
  });

  it("can generate backup codes from injected entropy", () => {
    const entropy = new Uint8Array(16).fill(7);
    const code = generateWalletBackupCode(() => entropy);

    expect(code).toBe(ethers.Mnemonic.fromEntropy(entropy).phrase);
  });
});
