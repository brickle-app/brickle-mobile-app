import { formatCopBalance, formatColombianPesos } from "./formatCurrency";

describe("formatCopBalance", () => {
  it("keeps the magnitude of a decimal balance instead of dropping the decimal point", () => {
    // formatColombianPesos strips non-digits, so the decimal point turned 993455630.55 into 99345563055
    expect(formatColombianPesos("993455630.55")).toBe("99.345.563.055");
    expect(formatCopBalance("993455630.55")).toBe("993.455.631");
  });

  it("handles integers, numbers and empty values", () => {
    expect(formatCopBalance("1500000")).toBe("1.500.000");
    expect(formatCopBalance(250000)).toBe("250.000");
    expect(formatCopBalance(null)).toBe("0");
    expect(formatCopBalance("")).toBe("0");
  });
});
