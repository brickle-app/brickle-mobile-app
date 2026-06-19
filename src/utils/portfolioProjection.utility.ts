/** Meses de proyección usados en cartera / wallet (debe coincidir con el request al API). */
export const PORTFOLIO_PROJECTION_MONTHS = 6;

export interface ProjectionMonthCashflowPoint {
  capital?: number;
  capitalReturned?: number;
  interest?: number;
}

/**
 * Promedio mensual (interés + capital) que recibe el usuario según los puntos de proyección del API.
 * @returns `null` si no hay datos o la suma es ≤ 0.
 */
export function averageMonthlyCashflowFromProjectionPoints(
  points: ProjectionMonthCashflowPoint[] | undefined | null
): number | null {
  if (!points?.length) return null;
  let sum = 0;
  for (const p of points) {
    const capitalMonth = p.capital ?? p.capitalReturned ?? 0;
    const interestMonth = p.interest ?? 0;
    sum += capitalMonth + interestMonth;
  }
  if (sum <= 0) return null;
  return sum / points.length;
}
