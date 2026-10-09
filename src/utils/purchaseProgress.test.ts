import { PURCHASE_STEPS, getPurchaseStepIndex } from "./purchaseProgress";

describe("purchaseProgress", () => {
  it("orders the purchase phases and ends in done", () => {
    expect(PURCHASE_STEPS.map((step) => step.id)).toEqual(["authorizing", "signing", "confirming"]);
    expect(getPurchaseStepIndex("authorizing")).toBeLessThan(getPurchaseStepIndex("signing"));
    expect(getPurchaseStepIndex("confirming")).toBeLessThan(getPurchaseStepIndex("done"));
  });
});
