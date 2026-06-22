import { isPaymentProofReady } from "./paymentDetailsModal.logic";

describe("isPaymentProofReady", () => {
  it("does not mark a selected local image as ready until the API returns a proof URL", () => {
    expect(isPaymentProofReady({ uri: "file:///proof.jpg" }, null, false)).toBe(false);
  });

  it("marks the proof as ready only when upload finished with a URL", () => {
    expect(isPaymentProofReady({ uri: "file:///proof.jpg" }, "https://cdn/proof.jpg", false)).toBe(true);
  });
});
