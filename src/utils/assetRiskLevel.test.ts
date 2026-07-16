import { getAssetRiskLevel } from "./assetRiskLevel";
import { RISK_LEVELS } from "./riskLevel";

describe("getAssetRiskLevel", () => {
  it("uses the asset agreement riskLevel when it is camelCase", () => {
    const risk = getAssetRiskLevel({ agreement: { riskLevel: 9 } });

    expect(risk.level).toBe(RISK_LEVELS.HIGH);
  });

  it("uses the asset agreement RiskLevel when the API returns PascalCase", () => {
    const risk = getAssetRiskLevel({ agreement: { RiskLevel: 2 } });

    expect(risk.level).toBe(RISK_LEVELS.LOW);
  });

  it("falls back to low risk only when the asset has no risk level", () => {
    const risk = getAssetRiskLevel({ agreement: null });

    expect(risk.level).toBe(RISK_LEVELS.LOW);
  });
});
