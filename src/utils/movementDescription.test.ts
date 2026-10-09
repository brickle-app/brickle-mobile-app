import { formatMovementDescription } from "./movementDescription";

describe("formatMovementDescription", () => {
  it("shows tokens as bricks with the right singular/plural", () => {
    expect(formatMovementDescription("Compra de Separador Trifasico en Skid - 1 tokens")).toBe(
      "Compra de Separador Trifasico en Skid - 1 brick"
    );
    expect(formatMovementDescription("Compra de Lote 300 - 3 tokens")).toBe("Compra de Lote 300 - 3 bricks");
  });

  it("keeps the existing wording replacements", () => {
    expect(formatMovementDescription("Inversión en Generador")).toBe("Compra de Generador");
    expect(formatMovementDescription("Pago [Intereses] cuota 2")).toBe("Pago [Rendimiento] cuota 2");
  });

  it("does not alter asset names that merely contain the word", () => {
    expect(formatMovementDescription("Compra de Tokens Energy S.A.")).toBe("Compra de Tokens Energy S.A.");
  });
});
