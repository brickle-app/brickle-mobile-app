import { completeProfileSteps } from "./completeProfileSteps";

describe("completeProfileSteps", () => {
  it("splits the profile wizard into personal data and identification", () => {
    expect(completeProfileSteps).toHaveLength(2);
    expect(completeProfileSteps[0].fields).toEqual([
      "firstName",
      "lastName",
      "phoneNumber",
      "birthDate",
    ]);
    expect(completeProfileSteps[1].fields).toEqual([
      "nationality",
      "residenceCountry",
      "documentType",
      "documentNumber",
    ]);
  });
});
