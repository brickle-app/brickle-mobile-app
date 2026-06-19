export const LIQUIDITY_LEVELS = {
  LOW: "Bajo",
  MEDIUM: "Medio",
  HIGH: "Alto",
};
export type LiquidityLevel = "Low" | "Medium" | "High";
export const getLiquidity = (liquidity: LiquidityLevel) => {
  switch (liquidity) {
    case "Low":
      return LIQUIDITY_LEVELS.LOW;
    case "Medium":
      return LIQUIDITY_LEVELS.MEDIUM;
    case "High":
      return LIQUIDITY_LEVELS.HIGH;
    default:
      return LIQUIDITY_LEVELS.LOW;
  }
};
