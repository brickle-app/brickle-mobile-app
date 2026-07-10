/* eslint-env jest */
import { getPermitValue } from "./generatePermit";

jest.mock("../store/auth.store", () => ({
  authStore: {
    getState: jest.fn(() => ({ privateKey: "0xabc" })),
  },
}));

jest.mock("../components/wallet/contracts/config/clients/polygon", () => ({
  provider: {},
}));

describe("getPermitValue", () => {
  it("uses amount plus relayer fee for commitFunds permits", () => {
    expect(getPermitValue({ operation: "commitFunds", amount: 25 }).toString()).toBe("25100000");
  });

  it("uses amount plus relayer fee for receivePaymentSponsored permits when amount is already in token units", () => {
    expect(getPermitValue({ operation: "receivePaymentSponsored", amount: "25000000", amountIsBaseUnits: true }).toString()).toBe("25100000");
  });

  it("uses only relayer fee for claimRent permits", () => {
    expect(getPermitValue({ operation: "claimRent", amount: 999999999 }).toString()).toBe("100000");
  });
});
