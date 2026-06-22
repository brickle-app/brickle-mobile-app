import { step1Schema } from "./complete-profile-scheme";
import { personalDetailsSchema } from "./personal-details-scheme";

describe("birth date validation", () => {
  const validStep1 = {
    firstName: "Ada",
    lastName: "Lovelace",
    phoneNumber: "3000000000",
    birthDate: "02/04/1998",
    nationality: "CO",
    residenceCountry: "CO",
  };

  it("requires personal fields before completing profile", () => {
    const result = step1Schema.safeParse({
      ...validStep1,
      lastName: "",
      phoneNumber: "",
    });

    expect(result.success).toBe(false);
  });

  it("rejects two-digit years in complete profile", () => {
    const result = step1Schema.safeParse({
      ...validStep1,
      birthDate: "02/04/98",
    });

    expect(result.success).toBe(false);
  });

  it("rejects underage users in personal details", () => {
    jest.useFakeTimers().setSystemTime(new Date(2026, 5, 21));

    const result = personalDetailsSchema.safeParse({
      firstName: "Ada",
      lastName: "Lovelace",
      email: "ada@example.com",
      phoneNumber: "3000000000",
      dateOfBirth: "22/06/2008",
      nationality: "CO",
      countryOfResidence: "CO",
      documentType: 1,
      documentNumber: "123456",
    });

    expect(result.success).toBe(false);
    jest.useRealTimers();
  });
});
