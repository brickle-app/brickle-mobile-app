import {
  formatDateForDisplay,
  getAdultMaximumDate,
  getDaysInMonth,
  isAdultDisplayDate,
  parseDisplayDate,
  updateDatePart,
} from "./datePicker";

describe("datePicker helpers", () => {
  it("formats selected dates as DD/MM/YYYY", () => {
    expect(formatDateForDisplay(new Date(1998, 3, 2))).toBe("02/04/1998");
  });

  it("parses DD/MM/YYYY display dates without accepting two-digit years", () => {
    expect(parseDisplayDate("02/04/1998")?.toISOString().slice(0, 10)).toBe(
      "1998-04-02"
    );
    expect(parseDisplayDate("02/04/98")).toBeUndefined();
  });

  it("uses today minus 18 years as the maximum selectable date", () => {
    expect(getAdultMaximumDate(new Date(2026, 5, 21)).toISOString().slice(0, 10)).toBe(
      "2008-06-21"
    );
  });

  it("rejects dates younger than 18 years old", () => {
    const today = new Date(2026, 5, 21);

    expect(isAdultDisplayDate("21/06/2008", today)).toBe(true);
    expect(isAdultDisplayDate("22/06/2008", today)).toBe(false);
  });

  it("returns the number of days in the selected month", () => {
    expect(getDaysInMonth(2024, 1)).toBe(29);
    expect(getDaysInMonth(2023, 1)).toBe(28);
  });

  it("clamps the day when changing to a shorter month", () => {
    const result = updateDatePart(
      new Date(2000, 0, 31),
      "month",
      1,
      new Date(1900, 0, 1),
      new Date(2008, 6, 16)
    );

    expect(formatDateForDisplay(result)).toBe("29/02/2000");
  });

  it("keeps picker changes inside the birth-date range", () => {
    const maximumDate = new Date(2008, 6, 16);
    const result = updateDatePart(
      new Date(2007, 11, 31),
      "year",
      2008,
      new Date(1900, 0, 1),
      maximumDate
    );

    expect(result).toEqual(maximumDate);
  });
});
