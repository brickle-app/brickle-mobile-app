import { DocumentTypeEnum } from "@/src/types/user.types";
import { buildCompleteProfileUpdate } from "./completeProfileSubmission";

describe("buildCompleteProfileUpdate", () => {
  it("keeps the profile out of review until an identity document is uploaded", () => {
    const payload = buildCompleteProfileUpdate(
      {
        id: "user-1",
        email: "karen18e@gmail.com",
        firstName: "Karen",
        lastName: "Diaz",
        phoneNumber: "3001234567",
        birthDate: "18/06/1990",
        nationality: "CO",
        residenceCountry: "CO",
        documentType: DocumentTypeEnum.CC,
        documentNumber: "123456789",
      }
    );

    expect(payload).toMatchObject({
      isBasicProfileComplete: true,
      isProfileUnderReview: false,
      termsAccepted: true,
    });
  });
});
