import { completeProfileSteps } from "./completeProfileSteps";

describe("completeProfileSteps", () => {
  it("splits the profile wizard into personal data, identification and consent", () => {
    expect(completeProfileSteps).toHaveLength(3);
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
    expect(completeProfileSteps[2].fields).toEqual([
      "acceptsTermsAndConditions",
      "acceptsBusinessCollaborationContract",
      "acceptsOriginOfFundsDeclaration",
    ]);
  });
});
