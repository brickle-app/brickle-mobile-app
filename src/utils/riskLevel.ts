import { Colors } from "@/assets/Colors";

export const RISK_LEVELS = {
  LOW: "Bajo",
  MEDIUM: "Medio",
  HIGH: "Alto",
};
export type RiskLevel = "Low" | "Medium" | "High";
export const getRiskLevel = (riskLevel: number) => {
  if (riskLevel >= 1 && riskLevel <= 4) {
    return {
      level: RISK_LEVELS.LOW,
      color: Colors.greenPrimary,
    };
  } else if (riskLevel >= 5 && riskLevel <= 7) {
    return {
      level: RISK_LEVELS.MEDIUM,
      color: Colors.orangePrimary,
    };
  } else if (riskLevel >= 8 && riskLevel <= 10) {
    return {
      level: RISK_LEVELS.HIGH,
      color: Colors.red,
    };
  } else {
    return {
      level: RISK_LEVELS.LOW,
      color: Colors.greenPrimary,
    };
  }
};
