import { getDayLabel, groupTransactionsByDay } from "./transactionGroups";

const now = new Date(2026, 9, 9, 15, 0, 0); // 9 Oct 2026, local time

describe("getDayLabel", () => {
  it("labels today and yesterday", () => {
    expect(getDayLabel(new Date(2026, 9, 9, 1, 0), now)).toBe("Hoy");
    expect(getDayLabel(new Date(2026, 9, 8, 23, 59), now)).toBe("Ayer");
  });

  it("omits the year inside the current year and includes it otherwise", () => {
    expect(getDayLabel(new Date(2026, 6, 3), now)).toBe("3 jul");
    expect(getDayLabel(new Date(2025, 11, 31), now)).toBe("31 dic 2025");
  });
});

describe("groupTransactionsByDay", () => {
  it("groups by calendar day keeping the incoming order", () => {
    const items = [
      { id: "a", occurredAt: new Date(2026, 9, 9, 14).toISOString() },
      { id: "b", occurredAt: new Date(2026, 9, 9, 9).toISOString() },
      { id: "c", occurredAt: new Date(2026, 9, 8, 20).toISOString() },
    ];
    const sections = groupTransactionsByDay(items, now);

    expect(sections.map((section) => section.title)).toEqual(["Hoy", "Ayer"]);
    expect(sections[0].data.map((item) => item.id)).toEqual(["a", "b"]);
    expect(sections[1].data.map((item) => item.id)).toEqual(["c"]);
  });

  it("puts movements with a missing or invalid date under 'Sin fecha'", () => {
    const sections = groupTransactionsByDay([{ id: "a" }, { id: "b", occurredAt: "not-a-date" }], now);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("Sin fecha");
    expect(sections[0].data).toHaveLength(2);
  });

  it("returns no sections for an empty list", () => {
    expect(groupTransactionsByDay([], now)).toEqual([]);
  });
});
