import { Colors } from "@/assets/Colors";
import { getRiskLevel, RISK_LEVELS } from "./riskLevel";

type AssetRiskSource = {
  agreement?: {
    riskLevel?: number | null;
    RiskLevel?: number | null;
  } | null;
};

export function readAssetRiskLevel(asset?: AssetRiskSource | null) {
  return asset?.agreement?.riskLevel ?? asset?.agreement?.RiskLevel ?? null;
}

export function getAssetRiskLevel(asset?: AssetRiskSource | null) {
  const riskLevel = readAssetRiskLevel(asset);
  return typeof riskLevel === "number"
    ? getRiskLevel(riskLevel)
    : { level: RISK_LEVELS.LOW, color: Colors.greenPrimary };
}
