import { computeActivationProgress, getActivationStepIndex, WALLET_ACTIVATION_STEPS } from "./walletActivation";

describe("walletActivation", () => {
  it("orders the steps from fetching to done", () => {
    expect(getActivationStepIndex("fetching")).toBeLessThan(getActivationStepIndex("deriving"));
    expect(getActivationStepIndex("securing")).toBeLessThan(getActivationStepIndex("done"));
    expect(WALLET_ACTIVATION_STEPS.map((step) => step.id)).toEqual(["fetching", "deriving", "verifying", "securing"]);
  });

  it("maps key derivation progress into the bulk of the overall bar", () => {
    expect(computeActivationProgress("deriving", 0)).toBeCloseTo(0.06);
    expect(computeActivationProgress("deriving", 0.5)).toBeCloseTo(0.48);
    expect(computeActivationProgress("deriving", 1)).toBeCloseTo(0.9);
  });

  it("clamps derivation progress and never moves backwards between phases", () => {
    expect(computeActivationProgress("deriving", 5)).toBeCloseTo(0.9);
    expect(computeActivationProgress("deriving", -1)).toBeCloseTo(0.06);

    const sequence = [
      computeActivationProgress("fetching", 0),
      computeActivationProgress("deriving", 1),
      computeActivationProgress("verifying", 1),
      computeActivationProgress("securing", 1),
      computeActivationProgress("done", 1),
    ];
    expect([...sequence].sort((a, b) => a - b)).toEqual(sequence);
    expect(sequence[sequence.length - 1]).toBe(1);
  });
});
